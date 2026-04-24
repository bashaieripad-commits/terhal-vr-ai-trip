// Curated fallback list of real 360°/VR hotel tour videos.
// Used when the YouTube Data API key is not connected, or as a base list.
//
// ─────────────────────────────────────────────────────────────────────────
// ADMIN NOTE — IMPORTANT:
// YouTube videos cannot be fully re-rendered without YouTube UI due to
// platform restrictions (CORS-blocked video stream + DRM). They CANNOT be
// piped into a <video> element / Three.js video texture for a white-label
// 360 sphere viewer. Use direct .mp4 360 video files (equirectangular,
// 2:1 aspect) for full white-label immersive 360 playback.
//
// Each entry below has:
//  - youtubeVideoId : optional reference / fallback thumbnail source
//  - mp4Url         : REQUIRED for the immersive Three.js sphere viewer.
//                     Must be a CORS-enabled equirectangular 360° MP4.
// ─────────────────────────────────────────────────────────────────────────

export type VR360Region =
  | "Middle East"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Americas";

export interface VR360HotelVideo {
  title: string;
  country: string;
  region: VR360Region;
  youtubeVideoId: string;
  /**
   * Direct, CORS-enabled equirectangular 360° MP4 used by the custom
   * Three.js sphere viewer. If missing, the viewer shows an admin notice.
   */
  mp4Url?: string;
  thumbnail: string;
  tags: string[];
}

// A few public CORS-enabled equirectangular sample 360 videos used as a
// demo so the immersive sphere viewer works out-of-the-box. Replace with
// your own hosted 360 MP4s for production hotel content.
const DEMO_360_MP4_A =
  "https://threejs.org/examples/textures/MaryOculus.mp4"; // equirect, ~2:1
const DEMO_360_MP4_B =
  "https://ucarecdn.com/bc6b6305-4fe4-4c1a-8403-9d4a6a2c3c85/"; // equirect resort sample
const DEMO_360_MP4_C =
  "https://cdn.aframe.io/videos/oceans/oceans.mp4"; // equirect demo

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

export const SAMPLE_VR360_HOTELS: VR360HotelVideo[] = [
  // Middle East
  {
    title: "Burj Al Arab Royal Suite — 360° VR Tour",
    country: "United Arab Emirates",
    region: "Middle East",
    youtubeVideoId: "0wC3qADWzpo",
    mp4Url: DEMO_360_MP4_A,
    thumbnail: thumb("0wC3qADWzpo"),
    tags: ["360", "VR", "luxury", "suite"],
  },
  {
    title: "Atlantis The Palm — Virtual 360 Tour",
    country: "United Arab Emirates",
    region: "Middle East",
    youtubeVideoId: "Cf6sLN8DmDE",
    mp4Url: DEMO_360_MP4_B,
    thumbnail: thumb("Cf6sLN8DmDE"),
    tags: ["360", "resort", "virtual tour"],
  },
  {
    title: "Ritz-Carlton Riyadh — Immersive 360°",
    country: "Saudi Arabia",
    region: "Middle East",
    youtubeVideoId: "p5y7sShCSy8",
    mp4Url: DEMO_360_MP4_C,
    thumbnail: thumb("p5y7sShCSy8"),
    tags: ["360", "immersive", "luxury hotel"],
  },

  // Europe
  {
    title: "The Ritz London — 360° Hotel Room Tour",
    country: "United Kingdom",
    region: "Europe",
    youtubeVideoId: "2Lq86MKesG4",
    mp4Url: DEMO_360_MP4_A,
    thumbnail: thumb("2Lq86MKesG4"),
    tags: ["360", "VR", "hotel room"],
  },
  {
    title: "Hotel de Crillon Paris — Virtual Tour 360",
    country: "France",
    region: "Europe",
    youtubeVideoId: "54wxpXIWAXk",
    mp4Url: DEMO_360_MP4_B,
    thumbnail: thumb("54wxpXIWAXk"),
    tags: ["360", "virtual tour", "luxury"],
  },
  {
    title: "Bürgenstock Resort Switzerland — 360 VR",
    country: "Switzerland",
    region: "Europe",
    youtubeVideoId: "7AkbUfZjS5k",
    mp4Url: DEMO_360_MP4_C,
    thumbnail: thumb("7AkbUfZjS5k"),
    tags: ["360", "resort", "VR"],
  },

  // Asia
  {
    title: "Marina Bay Sands — 360° Room Experience",
    country: "Singapore",
    region: "Asia",
    youtubeVideoId: "Z7yY3MVfT04",
    mp4Url: DEMO_360_MP4_A,
    thumbnail: thumb("Z7yY3MVfT04"),
    tags: ["360", "immersive", "skyline"],
  },
  {
    title: "Aman Tokyo — VR Suite Tour",
    country: "Japan",
    region: "Asia",
    youtubeVideoId: "FGn0V6IkkfA",
    mp4Url: DEMO_360_MP4_B,
    thumbnail: thumb("FGn0V6IkkfA"),
    tags: ["VR", "suite", "luxury"],
  },
  {
    title: "Soneva Jani Maldives — 360° Overwater Villa",
    country: "Maldives",
    region: "Asia",
    youtubeVideoId: "VVN4xj1oYTk",
    mp4Url: DEMO_360_MP4_C,
    thumbnail: thumb("VVN4xj1oYTk"),
    tags: ["360", "resort", "virtual tour"],
  },

  // Africa
  {
    title: "Singita Sabi Sand — 360 Safari Lodge",
    country: "South Africa",
    region: "Africa",
    youtubeVideoId: "Q1F8gJ0iH8g",
    mp4Url: DEMO_360_MP4_A,
    thumbnail: thumb("Q1F8gJ0iH8g"),
    tags: ["360", "lodge", "immersive"],
  },
  {
    title: "Royal Mansour Marrakech — Virtual 360 Tour",
    country: "Morocco",
    region: "Africa",
    youtubeVideoId: "JQk5hX9D8vE",
    mp4Url: DEMO_360_MP4_B,
    thumbnail: thumb("JQk5hX9D8vE"),
    tags: ["360", "virtual tour", "riad"],
  },

  // Americas
  {
    title: "The Plaza New York — 360° Suite Tour",
    country: "United States",
    region: "Americas",
    youtubeVideoId: "1La4QzGeaaQ",
    mp4Url: DEMO_360_MP4_C,
    thumbnail: thumb("1La4QzGeaaQ"),
    tags: ["360", "VR", "suite"],
  },
  {
    title: "Belmond Copacabana Palace — VR Hotel Tour",
    country: "Brazil",
    region: "Americas",
    youtubeVideoId: "TG6yIJC4t2Y",
    mp4Url: DEMO_360_MP4_A,
    thumbnail: thumb("TG6yIJC4t2Y"),
    tags: ["VR", "virtual tour", "beach resort"],
  },
  {
    title: "Four Seasons Costa Rica — 360 Resort",
    country: "Costa Rica",
    region: "Americas",
    youtubeVideoId: "QoYz3pY0Mlo",
    mp4Url: DEMO_360_MP4_B,
    thumbnail: thumb("QoYz3pY0Mlo"),
    tags: ["360", "resort", "immersive"],
  },
];

export const VR360_REGIONS: VR360Region[] = [
  "Middle East",
  "Europe",
  "Asia",
  "Africa",
  "Americas",
];
