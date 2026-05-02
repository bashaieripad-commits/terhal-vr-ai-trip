import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userLocation, language } = await req.json();
    console.log('AI Trip Planner request:', { userLocation, language });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch available content
    const { data: hotels, error: hotelsError } = await supabase
      .from('content')
      .select('id, title, location, price, description')
      .eq('content_type', 'hotel')
      .eq('is_active', true)
      .limit(10);

    const { data: activities, error: activitiesError } = await supabase
      .from('content')
      .select('id, title, location, price, description')
      .eq('content_type', 'activity')
      .eq('is_active', true)
      .limit(10);

    const { data: flights, error: flightsError } = await supabase
      .from('flights')
      .select('id, flight_number, from_city, to_city, base_price, departure_time, arrival_time')
      .eq('status', 'scheduled')
      .limit(10);

    if (hotelsError || activitiesError || flightsError) {
      console.error('Database errors:', { hotelsError, activitiesError, flightsError });
      throw new Error('Failed to fetch available options');
    }

    // Attach review aggregates so AI can prefer higher-rated items
    const allIds = [...(hotels ?? []), ...(activities ?? [])].map((c: any) => c.id);
    const ratingMap: Record<string, { avg: number; count: number }> = {};
    if (allIds.length) {
      const { data: revs } = await supabase
        .from('reviews')
        .select('item_id, rating, is_approved, is_hidden')
        .in('item_id', allIds)
        .eq('is_approved', true)
        .eq('is_hidden', false);
      (revs ?? []).forEach((r: any) => {
        const m = ratingMap[r.item_id] ?? { avg: 0, count: 0 };
        m.avg = (m.avg * m.count + r.rating) / (m.count + 1);
        m.count += 1;
        ratingMap[r.item_id] = m;
      });
    }
    const enrich = (arr: any[] | null) =>
      (arr ?? [])
        .map((c) => ({
          ...c,
          avg_rating: ratingMap[c.id]?.avg ? Number(ratingMap[c.id].avg.toFixed(2)) : null,
          reviews_count: ratingMap[c.id]?.count ?? 0,
        }))
        .sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));

    const hotelsRanked = enrich(hotels);
    const activitiesRanked = enrich(activities);

    const systemPrompt = language === 'ar' 
      ? `أنت مخطط رحلات سياحية ذكي متخصص في السياحة في السعودية. مهمتك هي اقتراح رحلة سياحية كاملة بناءً على موقع المستخدم.

قم بتحليل البيانات المتاحة واقترح:
1. رحلة طيران مناسبة (إذا كانت متوفرة)
2. فندق مناسب في الوجهة
3. فعاليات وأنشطة في المنطقة

يجب أن تكون الاقتراحات مفصلة وجذابة وتشمل الأسعار والتفاصيل المهمة.
قم بالرد بصيغة JSON فقط مع المفاتيح التالية:
- recommendation (نص تفصيلي عن الرحلة المقترحة)
- flight (object: {id, title, price, details})
- hotel (object: {id, title, price, details})
- activities (array of objects: [{id, title, price, details}])

تأكد من أن جميع الأسعار بالريال السعودي وأن التفاصيل باللغة العربية.`
      : `You are a smart travel planner specializing in Saudi Arabia tourism. Your task is to suggest a complete travel package based on the user's location.

Analyze the available data and suggest:
1. A suitable flight (if available)
2. A suitable hotel at the destination
3. Events and activities in the area

Your suggestions should be detailed and attractive, including prices and important details.
Respond in JSON format only with the following keys:
- recommendation (detailed text about the suggested trip)
- flight (object: {id, title, price, details})
- hotel (object: {id, title, price, details})
- activities (array of objects: [{id, title, price, details}])

Ensure all prices are in SAR and details match the requested language.`;

    const userPrompt = language === 'ar'
      ? `المستخدم موجود في: ${userLocation}

الفنادق المتاحة:
${JSON.stringify(hotels, null, 2)}

الفعاليات المتاحة:
${JSON.stringify(activities, null, 2)}

الرحلات المتاحة:
${JSON.stringify(flights, null, 2)}

اقترح رحلة مثالية للمستخدم تتضمن رحلة طيران (إذا كانت متوفرة)، فندق، وفعاليات.`
      : `User is located in: ${userLocation}

Available hotels:
${JSON.stringify(hotels, null, 2)}

Available activities:
${JSON.stringify(activities, null, 2)}

Available flights:
${JSON.stringify(flights, null, 2)}

Suggest an ideal trip for the user including a flight (if available), hotel, and activities.`;

    console.log('Calling Lovable AI...');
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: language === 'ar' ? 'تم تجاوز حد الطلبات. حاول مرة أخرى لاحقاً.' : 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: language === 'ar' ? 'يرجى إضافة رصيد للمتابعة.' : 'Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const content = aiData.choices[0].message.content;
    const parsedResponse = JSON.parse(content);

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in ai-trip-planner:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
