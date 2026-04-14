import { corsHeaders } from "@supabase/supabase-js/cors";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * External Search API - Ready for Amadeus & Ticketmaster integration
 * 
 * This edge function is a stub that currently returns data from the local database.
 * When API keys are added, it will proxy requests to:
 * - Amadeus API for flights and hotels
 * - Ticketmaster API for events/activities
 * - Google Places API for activities (alternative)
 */

const SearchSchema = z.object({
  type: z.enum(["flights", "hotels", "activities"]),
  query: z.string().max(200).optional(),
  from: z.string().max(100).optional(),
  to: z.string().max(100).optional(),
  date: z.string().max(20).optional(),
  checkIn: z.string().max(20).optional(),
  checkOut: z.string().max(20).optional(),
  guests: z.number().min(1).max(20).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const parsed = SearchSchema.safeParse(body);
    
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type } = parsed.data;

    // Check for Amadeus API credentials
    const AMADEUS_CLIENT_ID = Deno.env.get("AMADEUS_CLIENT_ID");
    const AMADEUS_CLIENT_SECRET = Deno.env.get("AMADEUS_CLIENT_SECRET");

    // Check for Ticketmaster API key
    const TICKETMASTER_API_KEY = Deno.env.get("TICKETMASTER_API_KEY");

    if (type === "flights" && AMADEUS_CLIENT_ID && AMADEUS_CLIENT_SECRET) {
      // TODO: Implement Amadeus Flight Offers API
      // 1. Get access token: POST https://api.amadeus.com/v1/security/oauth2/token
      // 2. Search flights: GET https://api.amadeus.com/v2/shopping/flight-offers
      return new Response(
        JSON.stringify({ 
          source: "amadeus",
          message: "Amadeus integration ready - implement flight search here",
          data: [] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "hotels" && AMADEUS_CLIENT_ID && AMADEUS_CLIENT_SECRET) {
      // TODO: Implement Amadeus Hotel Search API
      // 1. Get access token
      // 2. Search hotels: GET https://api.amadeus.com/v1/reference-data/locations/hotels/by-city
      return new Response(
        JSON.stringify({ 
          source: "amadeus",
          message: "Amadeus integration ready - implement hotel search here",
          data: [] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "activities" && TICKETMASTER_API_KEY) {
      // TODO: Implement Ticketmaster Discovery API
      // GET https://app.ticketmaster.com/discovery/v2/events.json?apikey=XXX&keyword=...
      return new Response(
        JSON.stringify({ 
          source: "ticketmaster",
          message: "Ticketmaster integration ready - implement event search here",
          data: [] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: return message indicating local DB is being used
    return new Response(
      JSON.stringify({ 
        source: "local",
        message: "Using local database. Add API keys (AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET, TICKETMASTER_API_KEY) to enable external search.",
        data: [] 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
