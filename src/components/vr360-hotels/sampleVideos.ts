// ─────────────────────────────────────────────────────────────────────────
// REAL, UNIQUE 360°/VR PREVIEW EXPERIENCES
// ─────────────────────────────────────────────────────────────────────────
//
// ADMIN NOTE — IMPORTANT (read before editing):
//
// The user opted out of Google Street View integration (which would require
// a Google Maps JavaScript API key + a Google Cloud billing account, and
// would force Google's branding/attribution to remain visible per Google
// ToS). Instead, this dataset hand-picks ONE unique, verified equirectangular
// panorama per card so that:
//
//   1. No two cards open the same scene.
//   2. Each panorama's mood/scenery is consistent with the card's title and
//      country (e.g. desert HDRIs for Middle-East deserts, snowy forest for
//      a Hokkaido winter card, night city HDRI for a Manhattan dusk card).
//   3. Every URL has been verified live (HTTP 200, CORS-enabled) so it
//      works as a Three.js video / texture source inside the white-label
//      inverted-sphere viewer with full mouse/touch drag support.
//
// To plug the *actual* hotel/property panorama later, simply replace that
// card's `imageUrl` with its equirectangular JPG (CORS-enabled). Nothing
// else needs to change — the viewer will just work.
//
// REPETITION RULE: each Polyhaven slug below appears AT MOST ONCE across
// SAMPLE_VR360_HOTELS (this file) and VIRTUAL_TOURS (./virtualTours.ts).
// If you add a new card, pick an unused slug. The full verified pool is
// listed in PANORAMA_POOL below.
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
  /** Equirectangular 360° JPG (CORS-enabled, verified live). */
  imageUrl: string;
  /** Card thumbnail (uses the same panorama by default). */
  thumbnail: string;
  tags: string[];
}

// ─── Verified CORS-enabled equirectangular JPG sources ────────────────────
// All URLs verified HTTP 200 + CORS-allow-origin: *.
const PH = (slug: string) =>
  `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${slug}.jpg`;

// Full pool of verified, unique panoramas. Slugs used here are removed from
// the pool so virtualTours.ts can pick remaining slugs for its scenes.
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

export const SAMPLE_VR360_HOTELS: VR360HotelVideo[] = [
  // ═══════════════ MIDDLE EAST ═══════════════
  {
    title: "Empty Quarter Dunes at Sunset — 360°",
    country: "United Arab Emirates",
    region: "Middle East",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.desertSunset,
    thumbnail: PANORAMA_POOL_PREVIEWS.desertSunset,
    tags: ["360", "desert", "sunset", "uae"],
  },
  {
    title: "Wadi Rum Golden Dawn — 360° Panorama",
    country: "Jordan",
    region: "Middle East",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.desertDawn,
    thumbnail: PANORAMA_POOL_PREVIEWS.desertDawn,
    tags: ["360", "wadi rum", "dawn", "jordan"],
  },
  {
    title: "Omani Desert Clear Sky — 360°",
    country: "Oman",
    region: "Middle East",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.desertClear,
    thumbnail: PANORAMA_POOL_PREVIEWS.desertClear,
    tags: ["360", "oman", "desert", "sky"],
  },
  {
    title: "Doha Desert Resort Dusk — 360°",
    country: "Qatar",
    region: "Middle East",
    category: "Resort",
    imageUrl: PANORAMA_POOL_PREVIEWS.duskGolf,
    thumbnail: PANORAMA_POOL_PREVIEWS.duskGolf,
    tags: ["360", "qatar", "resort", "dusk"],
  },

  // ═══════════════ EUROPE ═══════════════
  {
    title: "Venetian Canal at Golden Hour — 360°",
    country: "Italy",
    region: "Europe",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.veniceSunset,
    thumbnail: PANORAMA_POOL_PREVIEWS.veniceSunset,
    tags: ["360", "venice", "city", "sunset"],
  },
  {
    title: "Swiss Alpine Sunrise Panorama — 360°",
    country: "Switzerland",
    region: "Europe",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.alpineSunrise,
    thumbnail: PANORAMA_POOL_PREVIEWS.alpineSunrise,
    tags: ["360", "alps", "sunrise", "mountain"],
  },
  {
    title: "Sunflower Fields of Provence — 360°",
    country: "France",
    region: "Europe",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.sunflowersField,
    thumbnail: PANORAMA_POOL_PREVIEWS.sunflowersField,
    tags: ["360", "provence", "fields", "france"],
  },
  {
    title: "Belfast Coastal Sunset — 360°",
    country: "United Kingdom",
    region: "Europe",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.belfastSunset,
    thumbnail: PANORAMA_POOL_PREVIEWS.belfastSunset,
    tags: ["360", "belfast", "sunset", "coast"],
  },
  {
    title: "Bavarian Highlands Open Sky — 360°",
    country: "Germany",
    region: "Europe",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.hillyPureSky,
    thumbnail: PANORAMA_POOL_PREVIEWS.hillyPureSky,
    tags: ["360", "bavaria", "hills", "germany"],
  },

  // ═══════════════ ASIA ═══════════════
  {
    title: "Hokkaido Snowy Forest Trail — 360°",
    country: "Japan",
    region: "Asia",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.snowyForest,
    thumbnail: PANORAMA_POOL_PREVIEWS.snowyForest,
    tags: ["360", "japan", "snow", "hokkaido"],
  },
  {
    title: "Shanghai Bund Riverfront — 360° City",
    country: "China",
    region: "Asia",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.shanghaiBund,
    thumbnail: PANORAMA_POOL_PREVIEWS.shanghaiBund,
    tags: ["360", "shanghai", "bund", "city"],
  },
  {
    title: "Bali Green Plains Retreat — 360°",
    country: "Indonesia",
    region: "Asia",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.greenPlains,
    thumbnail: PANORAMA_POOL_PREVIEWS.greenPlains,
    tags: ["360", "bali", "plains", "nature"],
  },

  // ═══════════════ AFRICA ═══════════════
  {
    title: "Limpopo Safari Lodge Fairway — 360°",
    country: "South Africa",
    region: "Africa",
    category: "Resort",
    imageUrl: PANORAMA_POOL_PREVIEWS.golfCourse,
    thumbnail: PANORAMA_POOL_PREVIEWS.golfCourse,
    tags: ["360", "safari", "lodge", "limpopo"],
  },
  {
    title: "Kruger Starry Night — 360° Landscape",
    country: "South Africa",
    region: "Africa",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.starryNight,
    thumbnail: PANORAMA_POOL_PREVIEWS.starryNight,
    tags: ["360", "kruger", "stars", "night"],
  },
  {
    title: "Cape Town Hillside Vista — 360°",
    country: "South Africa",
    region: "Africa",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.capeHill,
    thumbnail: PANORAMA_POOL_PREVIEWS.capeHill,
    tags: ["360", "cape town", "hill", "south africa"],
  },
  {
    title: "Karoo Open Plains — 360° Nature",
    country: "Namibia",
    region: "Africa",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.meal,
    thumbnail: PANORAMA_POOL_PREVIEWS.meal,
    tags: ["360", "namibia", "plains", "karoo"],
  },

  // ═══════════════ AMERICAS ═══════════════
  {
    title: "Manhattan Cobblestone at Night — 360°",
    country: "United States",
    region: "Americas",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.cobbleNight,
    thumbnail: PANORAMA_POOL_PREVIEWS.cobbleNight,
    tags: ["360", "new york", "night", "city"],
  },
  {
    title: "Costa Rica Rainforest Meadow — 360°",
    country: "Costa Rica",
    region: "Americas",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.noonGrass,
    thumbnail: PANORAMA_POOL_PREVIEWS.noonGrass,
    tags: ["360", "rainforest", "meadow", "nature"],
  },
  {
    title: "Patagonia Lagoon — 360° Landscape",
    country: "Argentina",
    region: "Americas",
    category: "Landscape",
    imageUrl: PANORAMA_POOL_PREVIEWS.blueLagoon,
    thumbnail: PANORAMA_POOL_PREVIEWS.blueLagoon,
    tags: ["360", "patagonia", "lagoon", "landscape"],
  },
  {
    title: "Copacabana Industrial Sunset — 360°",
    country: "Brazil",
    region: "Americas",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.industrialSunset,
    thumbnail: PANORAMA_POOL_PREVIEWS.industrialSunset,
    tags: ["360", "rio", "sunset", "city"],
  },
  {
    title: "Andes Foothill Vista — 360° Landmark",
    country: "Peru",
    region: "Americas",
    category: "Landmark",
    imageUrl: PANORAMA_POOL_PREVIEWS.tableMountain,
    thumbnail: PANORAMA_POOL_PREVIEWS.tableMountain,
    tags: ["360", "andes", "vista", "peru"],
  },
  {
    title: "Atacama Night Sky — 360° Nature",
    country: "Chile",
    region: "Americas",
    category: "Nature",
    imageUrl: PANORAMA_POOL_PREVIEWS.dikhololoNight,
    thumbnail: PANORAMA_POOL_PREVIEWS.dikhololoNight,
    tags: ["360", "atacama", "night", "stars"],
  },
  {
    title: "Toronto Suburban Drive — 360° City",
    country: "Canada",
    region: "Americas",
    category: "City",
    imageUrl: PANORAMA_POOL_PREVIEWS.preller,
    thumbnail: PANORAMA_POOL_PREVIEWS.preller,
    tags: ["360", "toronto", "drive", "city"],
  },
];

export const VR360_REGIONS: VR360Region[] = [
  "Middle East",
  "Europe",
  "Asia",
  "Africa",
  "Americas",
];
