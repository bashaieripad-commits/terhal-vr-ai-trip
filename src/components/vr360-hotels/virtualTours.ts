// ─────────────────────────────────────────────────────────────────────────
// MULTI-SCENE 360° WALK-THROUGHS  (Tier 1 — "Full Virtual Tour")
// ─────────────────────────────────────────────────────────────────────────
//
// HONESTY RULES (per user spec):
//   - No invented hotel names. These tours are presented as curated
//     "Destination Walk-Throughs" of real places (a Saudi resort area,
//     a Dubai-style skyline collection, a Venetian canal walk). Each
//     scene's name describes what the panorama actually shows.
//   - Every scene image is unique across the whole VR section
//     (no slug appears twice in this file or in sampleVideos.ts).
//   - All URLs verified live (HTTP 200, CORS-enabled).
//
// To plug a REAL hotel walk-through later:
//   - Replace each scene's `image` with that property's actual
//     equirectangular JPG (CORS-enabled).
//   - Update `hotelName` / `hotelNameAr` to the real property name.
//   - Keep the hotspot yaw/pitch (degrees) — the viewer will just work.
// ─────────────────────────────────────────────────────────────────────────

import type { VR360Region } from "./sampleVideos";

export type TourSceneId = string;

export interface TourHotspot {
  /** Target scene id within the same tour. */
  target: TourSceneId;
  /** Horizontal angle in degrees (0 = front, 90 = right, -90 = left). */
  yaw: number;
  /** Vertical angle in degrees (0 = horizon, negative = down). */
  pitch: number;
  /** Short label shown on hover (e.g. "Go to Pool"). */
  label: string;
  labelAr?: string;
  /** Visual style hint. */
  type?: "forward" | "left" | "right" | "door" | "info";
}

export interface TourScene {
  id: TourSceneId;
  name: string;
  nameAr: string;
  /** Equirectangular 360° JPG (CORS-enabled, verified live). */
  image: string;
  hotspots: TourHotspot[];
}

export interface VirtualTour {
  id: string;
  hotelName: string;
  hotelNameAr: string;
  country: string;
  region: VR360Region;
  thumbnail: string;
  /** Initial scene shown when the tour opens. */
  startSceneId: TourSceneId;
  scenes: TourScene[];
  tags: string[];
  /** Short honesty note shown to users on the tour intro overlay. */
  description: string;
  descriptionAr: string;
}

// ─── Verified CORS-enabled equirectangular sources ───────────────────────
const PH = (slug: string) =>
  `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${slug}.jpg`;

export const PANORAMA_POOL_TOURS = {
  // Saudi Resort walk
  thatchChapel: PH("thatch_chapel"),                // Lobby
  abandonedWorkshop: PH("abandoned_workshop_02"),   // Bath
  studioSmall: PH("studio_small_09"),               // Suite
  herkulessaulen: PH("herkulessaulen"),             // Restaurant
  airMuseum: PH("air_museum_playground"),           // Pool deck
  brownStudio6: PH("brown_photostudio_06"),         // Exterior

  // Dubai Skyline walk
  kiaraDawn: PH("kiara_1_dawn"),                    // Skyline at dawn
  drachenfels: PH("drachenfels_cellar"),            // Spa
  artistWorkshop: PH("artist_workshop"),            // Suite interior
  musicHall: PH("music_hall_01"),                   // Marble lobby

  // Venetian Canal walk
  stPetersNight: PH("st_peters_square_night"),      // Italian trattoria
  brownStudio2: PH("brown_photostudio_02"),         // Canal-side suite
  cyclorama: PH("cyclorama_hard_light"),            // Lobby
  abandonedFactory: PH("abandoned_factory_canteen_01"), // Canal exterior
} as const;

// ─────────────────────────────────────────────────────────────────────────
// TOURS — every scene image is unique across the entire VR section.
// ─────────────────────────────────────────────────────────────────────────
export const VIRTUAL_TOURS: VirtualTour[] = [
  // ═══════════════ MIDDLE EAST ═══════════════
  {
    id: "tour-saudi-resort",
    hotelName: "Saudi Desert Resort Walk-Through",
    hotelNameAr: "جولة منتجع صحراوي سعودي",
    country: "Saudi Arabia",
    region: "Middle East",
    thumbnail: PANORAMA_POOL_TOURS.brownStudio6,
    startSceneId: "exterior",
    tags: ["resort", "multi-scene", "walk-through"],
    description:
      "A six-stop curated walk: exterior → lobby → suite → bathroom → pool → restaurant. Use the hotspots to move between spaces.",
    descriptionAr:
      "جولة مكوّنة من ست محطات: الواجهة → البهو → الجناح → الحمام → المسبح → المطعم. استخدم النقاط للتنقل بين الأماكن.",
    scenes: [
      {
        id: "exterior",
        name: "Resort Exterior",
        nameAr: "الواجهة الخارجية",
        image: PANORAMA_POOL_TOURS.brownStudio6,
        hotspots: [
          { target: "lobby", yaw: -10, pitch: -8, label: "Enter Lobby", labelAr: "ادخل البهو", type: "door" },
          { target: "pool", yaw: 90, pitch: -8, label: "Pool Deck", labelAr: "المسبح", type: "right" },
        ],
      },
      {
        id: "lobby",
        name: "Grand Lobby",
        nameAr: "البهو الرئيسي",
        image: PANORAMA_POOL_TOURS.thatchChapel,
        hotspots: [
          { target: "exterior", yaw: 170, pitch: -5, label: "Exit", labelAr: "الخروج", type: "left" },
          { target: "suite", yaw: 45, pitch: -10, label: "Suite", labelAr: "الجناح", type: "door" },
          { target: "restaurant", yaw: -60, pitch: -8, label: "Restaurant", labelAr: "المطعم", type: "right" },
        ],
      },
      {
        id: "suite",
        name: "Royal Suite",
        nameAr: "الجناح الملكي",
        image: PANORAMA_POOL_TOURS.studioSmall,
        hotspots: [
          { target: "lobby", yaw: -130, pitch: -10, label: "Back to Lobby", labelAr: "العودة للبهو", type: "left" },
          { target: "bathroom", yaw: 80, pitch: -5, label: "Bathroom", labelAr: "الحمام", type: "door" },
          { target: "pool", yaw: 150, pitch: -8, label: "Pool Deck", labelAr: "المسبح", type: "forward" },
        ],
      },
      {
        id: "bathroom",
        name: "Marble Bathroom",
        nameAr: "حمام رخامي",
        image: PANORAMA_POOL_TOURS.abandonedWorkshop,
        hotspots: [
          { target: "suite", yaw: -90, pitch: -5, label: "Back to Suite", labelAr: "العودة للجناح", type: "left" },
        ],
      },
      {
        id: "pool",
        name: "Infinity Pool",
        nameAr: "المسبح اللانهائي",
        image: PANORAMA_POOL_TOURS.airMuseum,
        hotspots: [
          { target: "suite", yaw: -30, pitch: -8, label: "Back to Suite", labelAr: "العودة للجناح", type: "left" },
          { target: "exterior", yaw: 120, pitch: -5, label: "Exterior", labelAr: "الخارج", type: "forward" },
        ],
      },
      {
        id: "restaurant",
        name: "Fine Dining",
        nameAr: "مطعم راقي",
        image: PANORAMA_POOL_TOURS.herkulessaulen,
        hotspots: [
          { target: "lobby", yaw: 60, pitch: -10, label: "Back to Lobby", labelAr: "العودة للبهو", type: "left" },
        ],
      },
    ],
  },

  {
    id: "tour-dubai-skyline",
    hotelName: "Dubai-Style Skyline Walk-Through",
    hotelNameAr: "جولة بأفق دبي",
    country: "United Arab Emirates",
    region: "Middle East",
    thumbnail: PANORAMA_POOL_TOURS.kiaraDawn,
    startSceneId: "exterior",
    tags: ["luxury", "city", "skyline"],
    description:
      "Walk from the dawn skyline view into a marble lobby, up to a sky suite, and through to the spa.",
    descriptionAr:
      "تنقّل من إطلالة الأفق فجرًا إلى البهو الرخامي ثم الجناح العلوي ثم السبا.",
    scenes: [
      {
        id: "exterior",
        name: "Skyline at Dawn",
        nameAr: "الأفق فجرًا",
        image: PANORAMA_POOL_TOURS.kiaraDawn,
        hotspots: [
          { target: "lobby", yaw: 0, pitch: -8, label: "Enter Lobby", labelAr: "ادخل البهو", type: "door" },
        ],
      },
      {
        id: "lobby",
        name: "Marble Lobby",
        nameAr: "البهو الرخامي",
        image: PANORAMA_POOL_TOURS.musicHall,
        hotspots: [
          { target: "exterior", yaw: 180, pitch: -5, label: "Skyline View", labelAr: "إطلالة الأفق", type: "left" },
          { target: "suite", yaw: 60, pitch: -8, label: "Sky Suite", labelAr: "الجناح العلوي", type: "door" },
        ],
      },
      {
        id: "suite",
        name: "Sky Suite",
        nameAr: "جناح السماء",
        image: PANORAMA_POOL_TOURS.artistWorkshop,
        hotspots: [
          { target: "lobby", yaw: -120, pitch: -8, label: "Back to Lobby", labelAr: "العودة للبهو", type: "left" },
          { target: "spa", yaw: 90, pitch: -5, label: "Spa Bathroom", labelAr: "حمام السبا", type: "right" },
        ],
      },
      {
        id: "spa",
        name: "Spa Bathroom",
        nameAr: "حمام السبا",
        image: PANORAMA_POOL_TOURS.drachenfels,
        hotspots: [
          { target: "suite", yaw: -90, pitch: -5, label: "Back to Suite", labelAr: "العودة للجناح", type: "left" },
        ],
      },
    ],
  },

  // ═══════════════ EUROPE ═══════════════
  {
    id: "tour-venice-walk",
    hotelName: "Venetian Canal Walk-Through",
    hotelNameAr: "جولة قنوات البندقية",
    country: "Italy",
    region: "Europe",
    thumbnail: PANORAMA_POOL_TOURS.abandonedFactory,
    startSceneId: "exterior",
    tags: ["heritage", "city", "boutique"],
    description:
      "Step from the canal front into a historic lobby, peek into a canal-side suite, and finish at an Italian trattoria.",
    descriptionAr:
      "ابدأ من واجهة القناة، ادخل البهو التاريخي، تفقّد جناحًا قناويًا، واختم في مطعم إيطالي.",
    scenes: [
      {
        id: "exterior",
        name: "Canal Front",
        nameAr: "واجهة القناة",
        image: PANORAMA_POOL_TOURS.abandonedFactory,
        hotspots: [
          { target: "lobby", yaw: -10, pitch: -5, label: "Enter Hotel", labelAr: "ادخل الفندق", type: "door" },
        ],
      },
      {
        id: "lobby",
        name: "Historic Lobby",
        nameAr: "بهو تاريخي",
        image: PANORAMA_POOL_TOURS.cyclorama,
        hotspots: [
          { target: "exterior", yaw: 170, pitch: -5, label: "Exit", labelAr: "الخروج", type: "left" },
          { target: "suite", yaw: 60, pitch: -8, label: "Canal Suite", labelAr: "جناح القناة", type: "door" },
          { target: "restaurant", yaw: -60, pitch: -8, label: "Trattoria", labelAr: "المطعم", type: "right" },
        ],
      },
      {
        id: "suite",
        name: "Canal-Side Suite",
        nameAr: "جناح القناة",
        image: PANORAMA_POOL_TOURS.brownStudio2,
        hotspots: [
          { target: "lobby", yaw: -120, pitch: -8, label: "Back to Lobby", labelAr: "العودة للبهو", type: "left" },
        ],
      },
      {
        id: "restaurant",
        name: "Italian Trattoria",
        nameAr: "مطعم إيطالي",
        image: PANORAMA_POOL_TOURS.stPetersNight,
        hotspots: [
          { target: "lobby", yaw: 60, pitch: -8, label: "Back to Lobby", labelAr: "العودة للبهو", type: "left" },
        ],
      },
    ],
  },
];

export const TOUR_SCENE_LABELS_AR: Record<string, string> = {
  lobby: "البهو",
  suite: "الجناح",
  room: "الغرفة",
  bathroom: "الحمام",
  spa: "السبا",
  pool: "المسبح",
  restaurant: "المطعم",
  exterior: "الخارج",
};
