// Server-side aggregation for the admin Search Trends dashboard.
// Groups by phrase / day / city / language using SQL so the client never
// has to pull thousands of raw rows.
//
// Auth: requires the caller to be an authenticated admin.
// Returns:
//   - kpis: { total, uniquePhrases, truncated }
//   - rows: shape depends on groupBy
//   - filters: distinct cities + languages observed in the last ~90 days

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type GroupBy = "phrase" | "day" | "city" | "language";

interface RequestBody {
  from?: string; // ISO date
  to?: string;   // ISO date
  city?: string | null;     // null/undefined = all
  language?: string | null; // null/undefined = all
  groupBy?: GroupBy;
  search?: string | null;   // free-text filter (matches normalized + display)
  limit?: number;
}

const PHRASE_LIMIT_DEFAULT = 100;
const DIM_LIMIT_DEFAULT = 50;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1. Verify caller is an authenticated admin (using their JWT).
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "unauthenticated" }, 401);
    }
    const { data: roleRow } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return json({ error: "forbidden" }, 403);
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const groupBy: GroupBy = (["phrase", "day", "city", "language"] as const)
      .includes(body.groupBy as GroupBy)
      ? (body.groupBy as GroupBy)
      : "phrase";
    const fromIso = body.from ? new Date(body.from).toISOString() : new Date(Date.now() - 7 * 86400_000).toISOString();
    const toIso = body.to ? new Date(body.to).toISOString() : new Date().toISOString();
    const cityFilter = body.city && body.city !== "" ? body.city : null;
    const langFilter = body.language && body.language !== "" ? body.language : null;
    const search = (body.search ?? "").trim().toLowerCase();
    const limit = Math.max(1, Math.min(500, body.limit ?? (groupBy === "phrase" ? PHRASE_LIMIT_DEFAULT : DIM_LIMIT_DEFAULT)));

    // 2. Use service-role client for fast aggregations (bypasses per-row RLS,
    //    safe because we already verified admin above).
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 3. Build params and SQL via a single RPC. We use a raw SQL call through
    //    a temporary view-like select using PostgREST is not flexible enough
    //    for window aggregation; so call rpc('admin_search_trends', ...).
    const { data, error } = await admin.rpc("admin_search_trends", {
      p_from: fromIso,
      p_to: toIso,
      p_city: cityFilter,
      p_language: langFilter,
      p_search: search.length > 0 ? search : null,
      p_group_by: groupBy,
      p_limit: limit,
    });

    if (error) {
      console.error("admin_search_trends rpc error:", error);
      return json({ error: error.message }, 500);
    }

    // RPC returns a single jsonb object: { kpis, rows, filters }.
    return json(data ?? { kpis: { total: 0, uniquePhrases: 0, truncated: false }, rows: [], filters: { cities: [], languages: [] } }, 200);
  } catch (e) {
    console.error("search-trends error:", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
