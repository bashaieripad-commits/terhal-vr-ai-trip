// Optional YouTube Data API integration for the VR 360 Hotels section.
// If no API key is present, the section falls back to the curated sample list.
//
// To enable: set VITE_YOUTUBE_API_KEY in your environment, OR add a runtime
// secret named YOUTUBE_API_KEY accessible via an edge function.

import {
  SAMPLE_VR360_HOTELS,
  type VR360HotelVideo,
  type VR360Region,
} from "./sampleVideos";

// Public, client-side key (read-only YouTube search). Empty string disables the
// live fetch and the component uses the curated fallback list instead.
const YOUTUBE_API_KEY: string =
  (import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined) ?? "";

const SEARCH_TERMS = [
  "360 hotel room tour",
  "VR hotel tour",
  "360 resort tour",
  "hotel virtual tour 360",
  "luxury hotel 360 video",
  "360 suite tour",
  "VR room tour hotel",
];

const VR_KEYWORDS = ["360", "vr", "virtual tour", "immersive", "360°"];

const REGION_HINTS: Record<VR360Region, string[]> = {
  "Middle East": ["dubai", "abu dhabi", "saudi", "riyadh", "doha", "qatar", "uae", "oman", "bahrain", "kuwait"],
  Europe: ["paris", "london", "rome", "swiss", "switzerland", "spain", "italy", "france", "uk", "berlin", "amsterdam"],
  Asia: ["tokyo", "japan", "singapore", "bali", "thailand", "maldives", "hong kong", "seoul", "china"],
  Africa: ["morocco", "marrakech", "cape town", "south africa", "kenya", "egypt", "cairo", "safari"],
  Americas: ["new york", "miami", "brazil", "mexico", "costa rica", "los angeles", "vegas", "canada"],
};

const guessRegion = (text: string): VR360Region => {
  const t = text.toLowerCase();
  for (const region of Object.keys(REGION_HINTS) as VR360Region[]) {
    if (REGION_HINTS[region].some((hint) => t.includes(hint))) return region;
  }
  return "Middle East";
};

const isLikely360 = (title: string, description: string): boolean => {
  const blob = `${title} ${description}`.toLowerCase();
  return VR_KEYWORDS.some((kw) => blob.includes(kw));
};

interface YouTubeSearchItem {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { high?: { url: string }; medium?: { url: string } };
    channelTitle: string;
  };
}

export const hasYouTubeApiKey = (): boolean => YOUTUBE_API_KEY.length > 0;

export async function fetchVR360Hotels(): Promise<VR360HotelVideo[]> {
  if (!hasYouTubeApiKey()) return SAMPLE_VR360_HOTELS;

  try {
    const results: VR360HotelVideo[] = [];
    const seen = new Set<string>();

    for (const term of SEARCH_TERMS) {
      const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet&type=video&videoEmbeddable=true&maxResults=6` +
        `&q=${encodeURIComponent(term)}&key=${YOUTUBE_API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as { items?: YouTubeSearchItem[] };
      const items = data.items ?? [];

      for (const item of items) {
        const id = item.id.videoId;
        if (!id || seen.has(id)) continue;
        const { title, description, thumbnails, channelTitle } = item.snippet;
        if (!isLikely360(title, description)) continue;

        seen.add(id);
        const region = guessRegion(`${title} ${description} ${channelTitle}`);
        results.push({
          title,
          country: channelTitle,
          region,
          youtubeVideoId: id,
          thumbnail:
            thumbnails.high?.url ??
            thumbnails.medium?.url ??
            `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          tags: ["360", "VR"],
        });
      }
    }

    // Always merge curated samples as a stability baseline
    const merged = [...results];
    for (const s of SAMPLE_VR360_HOTELS) {
      if (!seen.has(s.youtubeVideoId)) merged.push(s);
    }
    return merged.length > 0 ? merged : SAMPLE_VR360_HOTELS;
  } catch (err) {
    console.warn("[VR360Hotels] YouTube API fetch failed, using fallback:", err);
    return SAMPLE_VR360_HOTELS;
  }
}
