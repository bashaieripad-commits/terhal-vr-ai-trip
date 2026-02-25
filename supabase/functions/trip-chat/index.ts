import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch available data for context
    const [hotelsRes, activitiesRes, flightsRes] = await Promise.all([
      supabase.from('content').select('id, title, location, price, description').eq('content_type', 'hotel').eq('is_active', true).limit(10),
      supabase.from('content').select('id, title, location, price, description').eq('content_type', 'activity').eq('is_active', true).limit(10),
      supabase.from('flights').select('id, flight_number, from_city, to_city, base_price, departure_time, arrival_time').eq('status', 'scheduled').limit(10),
    ]);

    const hotels = hotelsRes.data || [];
    const activities = activitiesRes.data || [];
    const flights = flightsRes.data || [];

    const isArabic = language === 'ar';

    const systemPrompt = isArabic
      ? `أنت "ترحال" - مساعد سفر ذكي متخصص في السياحة في المملكة العربية السعودية. تتحدث بالعربية بطريقة ودودة وحماسية.

مهامك:
- ساعد المستخدمين في التخطيط لرحلاتهم
- اقترح فنادق، رحلات طيران، وفعاليات بناءً على تفضيلاتهم
- أجب عن أسئلة حول الوجهات السياحية في السعودية
- أنشئ جداول رحلات مفصلة عند الطلب

البيانات المتاحة حالياً:

🏨 الفنادق المتاحة:
${hotels.map(h => `- ${h.title} (${h.location}) - ${h.price} ر.س | ${h.description || ''}`).join('\n')}

✈️ الرحلات المتاحة:
${flights.map(f => `- ${f.flight_number}: ${f.from_city} → ${f.to_city} - ${f.base_price} ر.س`).join('\n')}

🎭 الفعاليات المتاحة:
${activities.map(a => `- ${a.title} (${a.location}) - ${a.price} ر.س | ${a.description || ''}`).join('\n')}

قواعد:
- استخدم إيموجي لجعل الردود حيوية
- نسق الردود بشكل جميل باستخدام markdown
- اذكر الأسعار بالريال السعودي
- إذا سأل المستخدم عن شيء غير متوفر، اعتذر واقترح بدائل
- كن مختصراً ومفيداً`
      : `You are "Terhal" - a smart travel assistant specializing in Saudi Arabia tourism. You're friendly and enthusiastic.

Your tasks:
- Help users plan their trips
- Suggest hotels, flights, and activities based on preferences
- Answer questions about Saudi tourist destinations
- Create detailed itineraries when requested

Available data:

🏨 Available Hotels:
${hotels.map(h => `- ${h.title} (${h.location}) - ${h.price} SAR | ${h.description || ''}`).join('\n')}

✈️ Available Flights:
${flights.map(f => `- ${f.flight_number}: ${f.from_city} → ${f.to_city} - ${f.base_price} SAR`).join('\n')}

🎭 Available Activities:
${activities.map(a => `- ${a.title} (${a.location}) - ${a.price} SAR | ${a.description || ''}`).join('\n')}

Rules:
- Use emojis to make responses lively
- Format responses nicely using markdown
- Mention prices in SAR
- If something isn't available, apologize and suggest alternatives
- Be concise and helpful`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: isArabic ? 'تم تجاوز حد الطلبات. حاول لاحقاً.' : 'Rate limit exceeded. Try again later.' }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: isArabic ? 'يرجى إضافة رصيد.' : 'Please add credits.' }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error('trip-chat error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
