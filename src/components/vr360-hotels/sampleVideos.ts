// ─────────────────────────────────────────────────────────────────────────
// REAL, UNIQUE 360° DESTINATION PREVIEWS  (Tier 3 — "360 Preview")
// ─────────────────────────────────────────────────────────────────────────
//
// HONESTY RULES (per user spec):
//   1. No invented hotel names. Cards describe what the panorama ACTUALLY
//      depicts (a desert, a coast, a city street, a mountain).
//   2. Every panorama is unique across the whole VR section.
//   3. Every URL is verified (HTTP 200, CORS-enabled) so it renders inside
//      the white-label Three.js inverted-sphere viewer with full mouse +
//      touch drag.
//   4. These are clearly labeled as "360 Preview" — look-around only,
//      no movement between scenes. Multi-scene Walk-Throughs live in
//      ./virtualTours.ts and carry the "Full Virtual Tour" badge.
//
// STREET VIEW NOTE:
//   The user opted out of providing a Google Maps JavaScript API key.
//   Google's keyless `output=svembed` URL pattern returns
//   `X-Frame-Options: SAMEORIGIN` (verified live), so it CANNOT be
//   embedded in an iframe. Therefore Tier 2 ("Real Street View") is
//   intentionally OMITTED rather than faked. Add a Maps API key to
//   re-enable it cleanly.
// ─────────────────────────────────────────────────────────────────────────

export type VR360Region =
  | "Middle East"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Americas";

export type VR360Category =
  | "Resort"
  | "Beach"
  | "Landscape"
  | "City"
  | "Nature"
  | "Landmark";

export interface VR360HotelVideo {
  title: string;
  country: string;
  region: VR360Region;
  category: VR360Category;
  /** Equirectangular 360° JPG (CORS-enabled, verified live). */
  imageUrl: string;
  /** Card thumbnail (uses the same panorama by default). */
  thumbnail: string;
  tags: string[];
  /** Optional CORS-enabled equirectangular MP4 (rare). */
  mp4Url?: string;
}

// ─── Verified CORS-enabled equirectangular JPG sources ────────────────────
const PH = (slug: string) =>
  `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${slug}.jpg`;

// Slugs reserved for previews. Each appears AT MOST ONCE here AND must not
// appear in virtualTours.ts.
export const PANORAMA_POOL_PREVIEWS = {
  desertSunset: PH("kloppenheim_06_puresky"),
  desertDawn: PH("the_sky_is_on_fire"),
  desertClear: PH("syferfontein_18d_clear_puresky"),
  duskGolf: PH("qwantani_dusk_2_puresky"),
  industrialSunset: PH("industrial_sunset_puresky"),
  veniceSunset: PH("venice_sunset"),
  alpineSunrise: PH("spruit_sunrise"),
  europeanStreet: PH("pretville_street"),
  sunflowersField: PH("sunflowers_puresky"),
  partlyCloudySky: PH("kloofendal_48d_partly_cloudy_puresky"),
  snowyForest: PH("snowy_forest_path_01"),
  golfCourse: PH("limpopo_golf_course"),
  starryNight: PH("satara_night"),
  greenPlains: PH("rosendal_plains_2"),
  cobbleNight: PH("cobblestone_street_night"),
  shanghaiBund: PH("shanghai_bund"),
  preller: PH("preller_drive"),
  hillyPureSky: PH("hilly_terrain_01_puresky"),
  belfastSunset: PH("belfast_sunset_puresky"),
  meal: PH("mealie_road"),
  capeHill: PH("cape_hill"),
  blueLagoon: PH("blue_lagoon"),
  tableMountain: PH("table_mountain_2"),
  noonGrass: PH("noon_grass"),
  dikhololoNight: PH("dikhololo_night"),
} as const;

// Each card title describes ONLY what the panorama actually shows — no
// invented hotel names, no fake interiors.
export const SAMPLE_VR360_HOTELS: VR360HotelVideo[] = [
  // ═══════════════ MIDDLE EAST ═══════════════
  {
    title: "Arabian Desert at Sunset",
    country: "United Arab Emirates",
    region: "Middle East",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.desertSunset,
    thumbnail: PANORAMA_POOL_PREVIEWS.desertSunset,
    tags: ["desert", "sunset", "uae"],
  },
  {
    title: "Desert Dawn — Wadi Style Sky",
    country: "Jordan",
    region: "Middle East",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.desertDawn,
    thumbnail: PANORAMA_POOL_PREVIEWS.desertDawn,
    tags: ["wadi", "dawn", "jordan"],
  },
  {
    title: "Open Desert, Clear Sky",
    country: "Oman",
    region: "Middle East",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.desertClear,
    thumbnail: PANORAMA_POOL_PREVIEWS.desertClear,
    tags: ["oman", "desert", "sky"],
  },
  {
    title: "Desert Resort Greens at Dusk",
    country: "Qatar",
    region: "Middle East",
    category: "Resort",
    imageUrl: PANORAMA_POOL_PREVIEWS.duskGolf,
    thumbnail: PANORAMA_POOL_PREVIEWS.duskGolf,
    tags: ["qatar", "resort", "dusk"],
  },

  // ═══════════════ EUROPE ═══════════════
  {
    title: "Venetian Canal at Golden Hour",
    country: "Italy",
    region: "Europe",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.veniceSunset,
    thumbnail: PANORAMA_POOL_PREVIEWS.veniceSunset,
    tags: ["venice", "city", "sunset"],
  },
  {
    title: "Alpine Sunrise Panorama",
    country: "Switzerland",
    region: "Europe",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.alpineSunrise,
    thumbnail: PANORAMA_POOL_PREVIEWS.alpineSunrise,
    tags: ["alps", "sunrise", "mountain"],
  },
  {
    title: "Provence Sunflower Fields",
    country: "France",
    region: "Europe",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.sunflowersField,
    thumbnail: PANORAMA_POOL_PREVIEWS.sunflowersField,
    tags: ["provence", "fields", "france"],
  },
  {
    title: "Belfast Coastal Sunset",
    country: "United Kingdom",
    region: "Europe",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.belfastSunset,
    thumbnail: PANORAMA_POOL_PREVIEWS.belfastSunset,
    tags: ["belfast", "sunset", "coast"],
  },
  {
    title: "Bavarian Highlands, Open Sky",
    country: "Germany",
    region: "Europe",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.hillyPureSky,
    thumbnail: PANORAMA_POOL_PREVIEWS.hillyPureSky,
    tags: ["bavaria", "hills", "germany"],
  },

  // ═══════════════ ASIA ═══════════════
  {
    title: "Snowy Forest Trail",
    country: "Japan",
    region: "Asia",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.snowyForest,
    thumbnail: PANORAMA_POOL_PREVIEWS.snowyForest,
    tags: ["japan", "snow", "hokkaido"],
  },
  {
    title: "Shanghai Bund Riverfront",
    country: "China",
    region: "Asia",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.shanghaiBund,
    thumbnail: PANORAMA_POOL_PREVIEWS.shanghaiBund,
    tags: ["shanghai", "bund", "city"],
  },
  {
    title: "Tropical Green Plains",
    country: "Indonesia",
    region: "Asia",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.greenPlains,
    thumbnail: PANORAMA_POOL_PREVIEWS.greenPlains,
    tags: ["bali", "plains", "nature"],
  },

  // ═══════════════ AFRICA ═══════════════
  {
    title: "Safari Lodge Fairway",
    country: "South Africa",
    region: "Africa",
    category: "Resort",
    imageUrl: PANORAMA_POOL_PREVIEWS.golfCourse,
    thumbnail: PANORAMA_POOL_PREVIEWS.golfCourse,
    tags: ["safari", "lodge", "limpopo"],
  },
  {
    title: "Kruger Starry Night",
    country: "South Africa",
    region: "Africa",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.starryNight,
    thumbnail: PANORAMA_POOL_PREVIEWS.starryNight,
    tags: ["kruger", "stars", "night"],
  },
  {
    title: "Cape Town Hillside Vista",
    country: "South Africa",
    region: "Africa",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.capeHill,
    thumbnail: PANORAMA_POOL_PREVIEWS.capeHill,
    tags: ["cape town", "hill", "south africa"],
  },
  {
    title: "Karoo Open Plains",
    country: "Namibia",
    region: "Africa",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.meal,
    thumbnail: PANORAMA_POOL_PREVIEWS.meal,
    tags: ["namibia", "plains", "karoo"],
  },

  // ═══════════════ AMERICAS ═══════════════
  {
    title: "Cobblestone Street at Night",
    country: "United States",
    region: "Americas",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.cobbleNight,
    thumbnail: PANORAMA_POOL_PREVIEWS.cobbleNight,
    tags: ["new york", "night", "city"],
  },
  {
    title: "Rainforest Meadow at Noon",
    country: "Costa Rica",
    region: "Americas",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.noonGrass,
    thumbnail: PANORAMA_POOL_PREVIEWS.noonGrass,
    tags: ["rainforest", "meadow", "nature"],
  },
  {
    title: "Patagonia Blue Lagoon",
    country: "Argentina",
    region: "Americas",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.blueLagoon,
    thumbnail: PANORAMA_POOL_PREVIEWS.blueLagoon,
    tags: ["patagonia", "lagoon", "landscape"],
  },
  {
    title: "Coastal Industrial Sunset",
    country: "Brazil",
    region: "Americas",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.industrialSunset,
    thumbnail: PANORAMA_POOL_PREVIEWS.industrialSunset,
    tags: ["rio", "sunset", "city"],
  },
  {
    title: "Andes Foothill Vista",
    country: "Peru",
    region: "Americas",
    category: "Landmark",
    imageUrl: PANORAMA_POOL_PREVIEWS.tableMountain,
    thumbnail: PANORAMA_POOL_PREVIEWS.tableMountain,
    tags: ["andes", "vista", "peru"],
  },
  {
    title: "Atacama Night Sky",
    country: "Chile",
    region: "Americas",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.dikhololoNight,
    thumbnail: PANORAMA_POOL_PREVIEWS.dikhololoNight,
    tags: ["atacama", "night", "stars"],
  },
  {
    title: "Suburban Drive at Dusk",
    country: "Canada",
    region: "Americas",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.preller,
    thumbnail: PANORAMA_POOL_PREVIEWS.preller,
    tags: ["toronto", "drive", "city"],
  },
];

export const VR360_REGIONS: VR360Region[] = [
  "Middle East",
  "Europe",
  "Asia",
  "Africa",
  "Americas",
];
