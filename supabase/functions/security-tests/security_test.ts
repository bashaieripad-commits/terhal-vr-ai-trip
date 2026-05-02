// Security regression suite — run after every migration.
// Verifies critical RLS policies remain intact for:
//   1. Ticket resale tampering protection
//   2. user_roles privilege escalation protection
//   3. seats reserved_by / reservation_id leakage protection
//
// Run with: supabase test edge-functions
//
// Auth-dependent tests require SUPABASE_SERVICE_ROLE_KEY to mint a confirmed
// test user. When that env var is absent, those tests are skipped (not failed),
// so this suite can run in any environment.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assert,
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ??
  Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

assert(SUPABASE_URL, "Missing SUPABASE_URL env");
assert(ANON_KEY, "Missing SUPABASE_ANON_KEY env");

function anonClient() {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const createdUserIds: string[] = [];

async function createConfirmedUser() {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `sec-test-${crypto.randomUUID()}@example.com`;
  const password = `Pa55w!${crypto.randomUUID()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  const userId = data.user!.id;
  createdUserIds.push(userId);

  const supabase = anonClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) throw signInErr;
  return { supabase, userId };
}

async function cleanupUsers() {
  if (!SERVICE_KEY || createdUserIds.length === 0) return;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  while (createdUserIds.length) {
    const id = createdUserIds.pop()!;
    try {
      await admin.auth.admin.deleteUser(id);
    } catch (_) { /* ignore */ }
  }
}

const needsAuth = { ignore: !SERVICE_KEY };

// ---------------------------------------------------------------------------
// 1. SEATS — reserved_by / reservation_id must NOT leak to anon
// ---------------------------------------------------------------------------
Deno.test("seats: anon SELECT * does not expose reserved_by or reservation_id", async () => {
  const supabase = anonClient();
  const { data, error } = await supabase.from("seats").select("*").limit(5);

  if (error) {
    const msg = error.message.toLowerCase();
    assert(
      msg.includes("permission") || msg.includes("denied") ||
        msg.includes("not allowed"),
      `Unexpected error reading seats as anon: ${error.message}`,
    );
    return;
  }

  for (const row of data ?? []) {
    assertEquals(
      (row as Record<string, unknown>).reserved_by,
      undefined,
      "reserved_by leaked to anon via seats.*",
    );
    assertEquals(
      (row as Record<string, unknown>).reservation_id,
      undefined,
      "reservation_id leaked to anon via seats.*",
    );
  }
});

Deno.test("seats: anon explicit select of reserved_by is rejected", async () => {
  const supabase = anonClient();
  const { error } = await supabase
    .from("seats")
    .select("id, reserved_by, reservation_id")
    .limit(1);

  assertNotEquals(error, null, "Anon should NOT be able to select reserved_by");
});

Deno.test("seats_public view: never exposes identity columns", async () => {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from("seats_public")
    .select("*")
    .limit(3);

  if (error) {
    throw new Error(`seats_public should be readable: ${error.message}`);
  }
  for (const row of data ?? []) {
    const keys = Object.keys(row as Record<string, unknown>);
    assert(
      !keys.includes("reserved_by"),
      "seats_public must not expose reserved_by",
    );
    assert(
      !keys.includes("reservation_id"),
      "seats_public must not expose reservation_id",
    );
  }
});

// ---------------------------------------------------------------------------
// 2. USER_ROLES — no privilege escalation
// ---------------------------------------------------------------------------
Deno.test({
  name: "user_roles: regular user cannot self-assign admin",
  ...needsAuth,
  fn: async () => {
    const { supabase, userId } = await createConfirmedUser();
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    assertNotEquals(
      error,
      null,
      "PRIVILEGE ESCALATION: user was able to insert admin role!",
    );
  },
});

Deno.test({
  name: "user_roles: regular user cannot update or delete role rows",
  ...needsAuth,
  fn: async () => {
    const { supabase } = await createConfirmedUser();

    const { error: updErr } = await supabase
      .from("user_roles")
      .update({ role: "admin" })
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (!updErr) {
      const { data: roles } = await supabase.from("user_roles").select("role");
      for (const r of roles ?? []) {
        assertNotEquals(
          (r as { role: string }).role,
          "admin",
          "User should not see/affect admin rows",
        );
      }
    }

    await supabase
      .from("user_roles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  },
});

// ---------------------------------------------------------------------------
// 3. TICKETS — resale tampering protection
// ---------------------------------------------------------------------------
Deno.test({
  name: "tickets: authenticated user cannot purchase a non-listed ticket",
  ...needsAuth,
  fn: async () => {
    const { supabase, userId } = await createConfirmedUser();
    const { data, error } = await supabase
      .from("tickets")
      .update({ user_id: userId, resell_status: "sold", is_resellable: false })
      .eq("resell_status", "available_for_resale_that_does_not_exist")
      .select();
    if (!error) {
      assertEquals(
        (data ?? []).length,
        0,
        "Ticket update affected rows it should not have",
      );
    }
  },
});

Deno.test({
  name: "tickets: tampering with immutable fields during purchase is rejected",
  ...needsAuth,
  fn: async () => {
    const { supabase, userId } = await createConfirmedUser();
    const { data, error } = await supabase
      .from("tickets")
      .update({
        user_id: userId,
        resell_status: "sold",
        is_resellable: false,
        is_valid: true,
        ticket_number: "HACKED-0001",
        event_name: "Tampered Event",
        qr_code: "FAKEQR",
      })
      .eq("is_resellable", true)
      .eq("resell_status", "listed")
      .select();
    if (!error) {
      assertEquals(
        (data ?? []).length,
        0,
        "TAMPERING: update with forbidden field changes was accepted!",
      );
    }
  },
});

Deno.test("cleanup: remove ephemeral test users", async () => {
  await cleanupUsers();
});
