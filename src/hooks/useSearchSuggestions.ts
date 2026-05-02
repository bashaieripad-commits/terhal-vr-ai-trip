import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Suggestions {
  city: string | null;
  season: string;
  personalized: string[];
  seasonal: string[];
  trending: string[];
}

const EMPTY: Suggestions = {
  city: null,
  season: "",
  personalized: [],
  seasonal: [],
  trending: [],
};

// Module-level cache: same data across all GlobalSearch instances on the page,
// refreshed when language changes.
let cache: { key: string; data: Suggestions; ts: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export function useSearchSuggestions(language: "ar" | "en") {
  const [data, setData] = useState<Suggestions>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef<Promise<void> | null>(null);

  const fetchSuggestions = useCallback(async () => {
    const cacheKey = language;
    if (cache && cache.key === cacheKey && Date.now() - cache.ts < TTL_MS) {
      setData(cache.data);
      return;
    }
    if (inFlight.current) return inFlight.current;

    setLoading(true);
    const work = (async () => {
      // Try to get coordinates (best effort, non-blocking).
      let lat: number | undefined;
      let lng: number | undefined;
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 1500,
              maximumAge: 5 * 60 * 1000,
              enableHighAccuracy: false,
            });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // Permission denied or timeout — proceed without coords.
        }
      }

      const { data: result, error } = await supabase.functions.invoke(
        "search-suggestions",
        { body: { language, lat, lng } },
      );
      if (error) {
        console.error("search-suggestions error:", error);
        setData(EMPTY);
        return;
      }
      const next = result as Suggestions;
      cache = { key: cacheKey, data: next, ts: Date.now() };
      setData(next);
    })().finally(() => {
      setLoading(false);
      inFlight.current = null;
    });

    inFlight.current = work;
    return work;
  }, [language]);

  // Reset when language changes.
  useEffect(() => {
    if (cache && cache.key !== language) {
      cache = null;
      setData(EMPTY);
    }
  }, [language]);

  return { data, loading, fetchSuggestions };
}
