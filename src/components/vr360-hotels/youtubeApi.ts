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

/**
 * NOTE: YouTube videos cannot be rendered inside the custom Three.js 360
 * viewer (CORS + DRM block direct <video> texture access). To keep the
 * section consistent and prevent any non-360 / non-draggable content from
 * appearing, we only return the curated, verified equirectangular dataset.
 *
 * The YouTube API plumbing is preserved below for future use if/when the
 * project hosts its own CORS-enabled MP4 mirrors of YouTube content.
 */
export async function fetchVR360Hotels(): Promise<VR360HotelVideo[]> {
  // Always return the verified curated list — every item works in the
  // immersive Three.js viewer with full drag-to-look 360° support.
  return SAMPLE_VR360_HOTELS;
}

// Keep the search terms exported so future integrations can reuse them.
export const VR360_SEARCH_TERMS = SEARCH_TERMS;
export const VR360_KEYWORDS = VR_KEYWORDS;
export const VR360_REGION_HINTS = REGION_HINTS;
export { guessRegion, isLikely360 };
export type { YouTubeSearchItem };
