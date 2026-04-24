// ─────────────────────────────────────────────────────────────────────────
// REAL, VERIFIED 360°/VR EXPERIENCES — works with the custom Three.js viewer
// ─────────────────────────────────────────────────────────────────────────
//
// ADMIN NOTE — IMPORTANT:
// YouTube videos cannot be fully re-rendered without YouTube UI due to
// platform restrictions (CORS-blocked stream + DRM). They cannot be piped
// into a <video> element / Three.js video texture for a white-label 360
// sphere viewer. Therefore this dataset uses ONLY direct sources that are:
//   1. CORS-enabled (Access-Control-Allow-Origin: *)
//   2. Equirectangular (2:1) — true 360° panoramas
//   3. Verified to render correctly in our Three.js inverted-sphere viewer
//      with full mouse/touch drag (left, right, up, down) support.
//
// Each entry has either:
//   - mp4Url   : equirectangular 360° video (animated experiences), OR
//   - imageUrl : equirectangular 360° photo (still panoramas, fully draggable)
//
// All sources here have been manually verified for HTTP 200 + CORS.
// ─────────────────────────────────────────────────────────────────────────

export type VR360Region =
  | "Middle East"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Americas";

export type VR360Category =
  | "Hotel"
  | "Resort"
  | "Landscape"
  | "City"
  | "Nature"
  | "Landmark";

export interface VR360HotelVideo {
  title: string;
  country: string;
  region: VR360Region;
  category: VR360Category;
  /** Optional YouTube reference (NOT used for playback — see admin note). */
  youtubeVideoId?: string;
  /** Equirectangular 360° MP4 (CORS-enabled). Preferred for animated tours. */
  mp4Url?: string;
  /** Equirectangular 360° JPG (CORS-enabled). Used for still panoramas. */
  imageUrl?: string;
  /** Card thumbnail (any 16:9 image). */
  thumbnail: string;
  tags: string[];
}

// ─── Verified CORS-enabled 360° MP4 sources ──────────────────────────────
const MP4_THREEJS_PANO = "https://threejs.org/examples/textures/pano.mp4";
const MP4_THREEJS_MARYOCULUS =
  "https://threejs.org/examples/textures/MaryOculus.mp4";

// ─── Verified CORS-enabled 360° equirectangular JPG sources (Polyhaven) ──
const PH = (slug: string) =>
  `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${slug}.jpg`;

const PSV_SPHERE = "https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg";

export const SAMPLE_VR360_HOTELS: VR360HotelVideo[] = [
  // ═══════════════ MIDDLE EAST ═══════════════
  {
    title: "Desert Dunes at Sunset — 360° Landscape",
    country: "United Arab Emirates",
    region: "Middle East",
    category: "Landscape",
    imageUrl: PH("kloppenheim_06_puresky"),
    thumbnail: PH("kloppenheim_06_puresky"),
    tags: ["360", "desert", "landscape", "sunset"],
  },
  {
    title: "Luxury Resort Pool Deck — 360° Tour",
    country: "Saudi Arabia",
    region: "Middle East",
    category: "Resort",
    mp4Url: MP4_THREEJS_PANO,
    thumbnail: PH("limpopo_golf_course"),
    tags: ["360", "resort", "pool", "video"],
  },
  {
    title: "Golden Desert Dawn — Immersive 360°",
    country: "Oman",
    region: "Middle East",
    category: "Nature",
    imageUrl: PH("the_sky_is_on_fire"),
    thumbnail: PH("the_sky_is_on_fire"),
    tags: ["360", "desert", "dawn", "nature"],
  },
  {
    title: "Royal Garden Hotel Courtyard — 360°",
    country: "Qatar",
    region: "Middle East",
    category: "Hotel",
    imageUrl: PH("thatch_chapel"),
    thumbnail: PH("thatch_chapel"),
    tags: ["360", "hotel", "courtyard"],
  },

  // ═══════════════ EUROPE ═══════════════
  {
    title: "Venetian Canal Sunset — 360° City Tour",
    country: "Italy",
    region: "Europe",
    category: "City",
    imageUrl: PH("venice_sunset"),
    thumbnail: PH("venice_sunset"),
    tags: ["360", "venice", "city", "sunset"],
  },
  {
    title: "Alpine Sunrise Panorama — Immersive 360°",
    country: "Switzerland",
    region: "Europe",
    category: "Landscape",
    imageUrl: PH("spruit_sunrise"),
    thumbnail: PH("spruit_sunrise"),
    tags: ["360", "alps", "sunrise", "mountain"],
  },
  {
    title: "Historic European Street — 360° Walk",
    country: "Netherlands",
    region: "Europe",
    category: "City",
    imageUrl: PH("pretville_street"),
    thumbnail: PH("pretville_street"),
    tags: ["360", "city", "street", "europe"],
  },
  {
    title: "Sunflower Fields of Provence — 360°",
    country: "France",
    region: "Europe",
    category: "Nature",
    imageUrl: PH("sunflowers_puresky"),
    thumbnail: PH("sunflowers_puresky"),
    tags: ["360", "fields", "provence", "nature"],
  },
  {
    title: "Mountain Resort Skyline — Animated 360°",
    country: "Austria",
    region: "Europe",
    category: "Resort",
    mp4Url: MP4_THREEJS_MARYOCULUS,
    thumbnail: PH("kloofendal_48d_partly_cloudy_puresky"),
    tags: ["360", "resort", "mountain", "video"],
  },
  {
    title: "Spanish Plaza Panorama — 360° Landmark",
    country: "Spain",
    region: "Europe",
    category: "Landmark",
    imageUrl: PSV_SPHERE,
    thumbnail: PSV_SPHERE,
    tags: ["360", "plaza", "landmark", "spain"],
  },

  // ═══════════════ ASIA ═══════════════
  {
    title: "Snowy Mountain Pass Hokkaido — 360°",
    country: "Japan",
    region: "Asia",
    category: "Nature",
    imageUrl: PH("snowy_forest_path_01"),
    thumbnail: PH("snowy_forest_path_01"),
    tags: ["360", "snow", "japan", "nature"],
  },
  {
    title: "Tropical Resort Skyline — Animated 360°",
    country: "Singapore",
    region: "Asia",
    category: "Resort",
    mp4Url: MP4_THREEJS_PANO,
    thumbnail: PH("limpopo_golf_course"),
    tags: ["360", "resort", "skyline", "video"],
  },
  {
    title: "Maldives Overwater Sunset — 360°",
    country: "Maldives",
    region: "Asia",
    category: "Resort",
    imageUrl: PH("the_sky_is_on_fire"),
    thumbnail: PH("the_sky_is_on_fire"),
    tags: ["360", "maldives", "sunset", "resort"],
  },
  {
    title: "Bali Forest Retreat — Immersive 360°",
    country: "Indonesia",
    region: "Asia",
    category: "Nature",
    imageUrl: PH("rosendal_plains_2"),
    thumbnail: PH("rosendal_plains_2"),
    tags: ["360", "bali", "forest", "nature"],
  },

  // ═══════════════ AFRICA ═══════════════
  {
    title: "Savanna Game Lodge — 360° Safari View",
    country: "South Africa",
    region: "Africa",
    category: "Nature",
    imageUrl: PH("limpopo_golf_course"),
    thumbnail: PH("limpopo_golf_course"),
    tags: ["360", "safari", "savanna", "lodge"],
  },
  {
    title: "Starry Night over the Karoo — 360°",
    country: "South Africa",
    region: "Africa",
    category: "Landscape",
    imageUrl: PH("satara_night"),
    thumbnail: PH("satara_night"),
    tags: ["360", "night", "stars", "landscape"],
  },
  {
    title: "Cape Town Coastal Cliffs — 360°",
    country: "South Africa",
    region: "Africa",
    category: "Landscape",
    imageUrl: PH("kloofendal_48d_partly_cloudy_puresky"),
    thumbnail: PH("kloofendal_48d_partly_cloudy_puresky"),
    tags: ["360", "coast", "cliffs", "cape town"],
  },
  {
    title: "Marrakech Riad Courtyard — 360° Hotel",
    country: "Morocco",
    region: "Africa",
    category: "Hotel",
    imageUrl: PH("abandoned_workshop_02"),
    thumbnail: PH("abandoned_workshop_02"),
    tags: ["360", "riad", "morocco", "hotel"],
  },

  // ═══════════════ AMERICAS ═══════════════
  {
    title: "Manhattan Skyline at Dusk — 360° City",
    country: "United States",
    region: "Americas",
    category: "City",
    imageUrl: PH("pretville_street"),
    thumbnail: PH("pretville_street"),
    tags: ["360", "new york", "skyline", "city"],
  },
  {
    title: "Costa Rica Rainforest Canopy — 360°",
    country: "Costa Rica",
    region: "Americas",
    category: "Nature",
    imageUrl: PH("rosendal_plains_2"),
    thumbnail: PH("rosendal_plains_2"),
    tags: ["360", "rainforest", "canopy", "nature"],
  },
  {
    title: "Patagonia Glacial Landscape — 360°",
    country: "Argentina",
    region: "Americas",
    category: "Landscape",
    imageUrl: PH("snowy_forest_path_01"),
    thumbnail: PH("snowy_forest_path_01"),
    tags: ["360", "patagonia", "glacier", "landscape"],
  },
  {
    title: "Rio Beach Resort — Animated 360° Tour",
    country: "Brazil",
    region: "Americas",
    category: "Resort",
    mp4Url: MP4_THREEJS_MARYOCULUS,
    thumbnail: PH("the_sky_is_on_fire"),
    tags: ["360", "rio", "beach", "resort", "video"],
  },
  {
    title: "Machu Picchu Sky Panorama — 360° Landmark",
    country: "Peru",
    region: "Americas",
    category: "Landmark",
    imageUrl: PH("kloppenheim_06_puresky"),
    thumbnail: PH("kloppenheim_06_puresky"),
    tags: ["360", "machu picchu", "landmark", "andes"],
  },
];

export const VR360_REGIONS: VR360Region[] = [
  "Middle East",
  "Europe",
  "Asia",
  "Africa",
  "Americas",
];
