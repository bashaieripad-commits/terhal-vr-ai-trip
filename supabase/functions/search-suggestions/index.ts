// AI-powered search suggestions for the global search bar.
// - Personalized: Lovable AI (Gemini) based on city + season
// - Seasonal: derived from current month
// - Trending: aggregated from search_queries (last 7 days) + curated Saudi list

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SAUDI_CITIES = [
  "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Dhahran",
  "Taif", "Tabuk", "Abha", "Al Ula", "AlUla", "Hail", "Najran", "Yanbu",
];

// Curated trending fallback (real Saudi destinations/activities).
const CURATED_TRENDING_EN = [
  "AlUla heritage tours",
  "Edge of the World hike",
  "Diriyah at night",
  "Red Sea diving",
  "Riyadh Boulevard",
  "Abha mountains escape",
  "Jeddah Corniche walk",
  "Desert camping near Riyadh",
];
const CURATED_TRENDING_AR = [
  "جولات العلا التراثية",
  "رحلة حافة العالم",
  "الدرعية ليلاً",
  "غوص البحر الأحمر",
  "بوليفارد الرياض",
  "جبال أبها",
  "كورنيش جدة",
  "تخييم صحراء الرياض",
];

function currentSeasonForSaudi(date = new Date()): "winter" | "spring" | "summer" | "autumn" {
  const m = date.getMonth() + 1; // 1-12
  if (m === 12 || m <= 2) return "winter";
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 9) return "summer";
  return "autumn";
}

function seasonalBaseline(season: string, language: "ar" | "en"): string[] {
  const ar: Record<string, string[]> = {
    winter: ["تخييم صحراء", "هايكنج العلا", "أبها الباردة", "الرياض في الشتاء"],
    spring: ["مهرجانات الربيع", "أبها الخضراء", "الطائف", "هايكنج جبلي"],
    summer: ["المنتجعات الساحلية", "البحر الأحمر", "أبها المعتدلة", "الفنادق المكيفة"],
    autumn: ["الدرعية", "بوليفارد الرياض", "العلا", "كورنيش جدة"],
  };
  const en: Record<string, string[]> = {
    winter: ["Desert camping", "AlUla hiking", "Cool Abha escapes", "Riyadh in winter"],
    spring: ["Spring festivals", "Green Abha", "Taif gardens", "Mountain hiking"],
    summer: ["Coastal resorts", "Red Sea diving", "Mild Abha", "Air-conditioned hotels"],
    autumn: ["Diriyah at night", "Riyadh Boulevard", "AlUla tours", "Jeddah Corniche"],
  };
  return language === "ar" ? ar[season] : en[season];
}

interface RequestBody {
  city?: string;
  language?: "ar" | "en";
  lat?: number;
  lng?: number;
}

function nearestSaudiCity(lat?: number, lng?: number): string | null {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  // Simple bounding-box mapping for the Saudi market.
  const cities: Array<[string, number, number]> = [
    ["Riyadh", 24.7136, 46.6753],
    ["Jeddah", 21.4858, 39.1925],
    ["Mecca", 21.3891, 39.8579],
    ["Medina", 24.5247, 39.5692],
    ["Dammam", 26.3927, 49.9777],
    ["Abha", 18.2164, 42.5053],
    ["AlUla", 26.6084, 37.9216],
    ["Tabuk", 28.3838, 36.5550],
    ["Taif", 21.2854, 40.4183],
  ];
  let best: { city: string; d: number } | null = null;
  for (const [name, clat, clng] of cities) {
    const d = (clat - lat) ** 2 + (clng - lng) ** 2;
    if (!best || d < best.d) best = { city: name, d };
  }
  // Only return if within ~roughly Saudi Arabia bounds
  return best ? best.city : null;
}

async function getTrendingFromDb(): Promise<string[]> {
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  if (!SERVICE_KEY || !SUPABASE_URL) return [];
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  // Pull recent rows with both the normalized form (for de-duped counting)
  // and the original query (for nicer display).
  const { data, error } = await admin
    .from("search_queries")
    .select("query, normalized_query")
    .gte("created_at", sevenDaysAgo)
    .not("normalized_query", "is", null)
    .limit(2000);
  if (error || !data) return [];

  // Aggregate by normalized form so "Riyadh hotels", "riyadh   hotels!",
  // and "the Riyadh hotels" all collapse to a single trending entry.
  // Pick the most common original spelling as the display label.
  const groups = new Map<
    string,
    { count: number; displays: Map<string, number> }
  >();
  for (const row of data) {
    const norm = (row.normalized_query || "").trim();
    if (!norm) continue;
    const display = (row.query || "").trim();
    const g = groups.get(norm) ?? { count: 0, displays: new Map() };
    g.count += 1;
    if (display) g.displays.set(display, (g.displays.get(display) ?? 0) + 1);
    groups.set(norm, g);
  }
  return Array.from(groups.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((g) => {
      let bestDisplay = "";
      let bestCount = -1;
      for (const [d, c] of g.displays) {
        if (c > bestCount) {
          bestDisplay = d;
          bestCount = c;
        }
      }
      return bestDisplay;
    })
    .filter((s) => s.length > 0);
}

async function aiPersonalized(
  city: string | null,
  season: string,
  language: "ar" | "en",
): Promise<string[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return [];

  const sys = language === "ar"
    ? "أنت مساعد سفر سعودي. اقترح عبارات بحث قصيرة جداً (٢-٤ كلمات) لمنصة سفر سعودية. ركّز فقط على وجهات وأنشطة وفنادق ورحلات داخل السعودية. لا تستخدم رموز تعبيرية ولا اقتباسات."
    : "You are a Saudi travel assistant. Suggest very short search phrases (2-4 words) for a Saudi travel platform. Focus ONLY on destinations, hotels, flights and activities INSIDE Saudi Arabia. No emojis, no quotes.";

  const ctx = language === "ar"
    ? `المدينة الحالية للمستخدم: ${city ?? "غير معروفة"}. الموسم الحالي: ${season}.`
    : `User's current city: ${city ?? "unknown"}. Current season: ${season}.`;

  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: ctx },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "return_suggestions",
          description: "Return 5 short search phrases.",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: { type: "string", maxLength: 40 },
                minItems: 4,
                maxItems: 6,
              },
            },
            required: ["suggestions"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "return_suggestions" } },
  };

  try {
    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!resp.ok) {
      console.error("AI gateway non-ok:", resp.status, await resp.text());
      return [];
    }
    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return [];
    const args = JSON.parse(call.function.arguments);
    const list = Array.isArray(args.suggestions) ? args.suggestions : [];
    return list
      .map((s: unknown) => String(s).trim())
      .filter((s: string) => s.length > 0 && s.length <= 60)
      .slice(0, 6);
  } catch (e) {
    console.error("AI personalized error:", e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const language: "ar" | "en" = body.language === "ar" ? "ar" : "en";

    let city: string | null = null;
    if (body.city && SAUDI_CITIES.some((c) =>
      c.toLowerCase() === body.city!.toLowerCase()
    )) {
      city = body.city;
    } else {
      city = nearestSaudiCity(body.lat, body.lng);
    }

    const season = currentSeasonForSaudi();

    const [personalized, trendingDb] = await Promise.all([
      aiPersonalized(city, season, language),
      getTrendingFromDb(),
    ]);

    const curated = language === "ar" ? CURATED_TRENDING_AR : CURATED_TRENDING_EN;
    // Merge DB trending first, then curated, dedupe (case-insensitive).
    const seen = new Set<string>();
    const trending: string[] = [];
    for (const item of [...trendingDb, ...curated]) {
      const k = item.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      trending.push(item);
      if (trending.length >= 6) break;
    }

    const seasonal = seasonalBaseline(season, language);

    return new Response(
      JSON.stringify({
        city,
        season,
        personalized,
        seasonal,
        trending,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (e) {
    console.error("search-suggestions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
