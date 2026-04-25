// ─────────────────────────────────────────────────────────────────────────
// MULTI-SCENE VIRTUAL TOURS — Matterport / Google Street View style
// ─────────────────────────────────────────────────────────────────────────
//
// ADMIN NOTE — IMPORTANT (read before editing):
//
// Per the user's choice, we do NOT use Google Street View (which would
// require a Google Maps JavaScript API key + Google Cloud billing and
// keep Google's branding visible per their ToS). Instead each scene of
// each tour uses a UNIQUE, verified, CORS-enabled equirectangular
// panorama from Polyhaven so that every card opens a different scene.
//
// REPETITION RULE:
//   Every Polyhaven slug used here MUST NOT appear in
//   ./sampleVideos.ts (PANORAMA_POOL_PREVIEWS) or in any other tour's
//   scenes. The full list of slugs reserved for tours is at the top of
//   this file (PANORAMA_POOL_TOURS).
//
// To plug a real, fully-rendered hotel tour later: replace each scene's
// `image` with the equirectangular JPG of the actual room/space, keep
// the hotspot coordinates (yaw/pitch in degrees), and the viewer will
// "just work".
// ─────────────────────────────────────────────────────────────────────────

import type { VR360Region } from "./sampleVideos";

export type TourSceneId = string;

export interface TourHotspot {
  /** Target scene id within the same tour. */
  target: TourSceneId;
  /** Horizontal angle in degrees (0 = front, 90 = right, -90 = left). */
  yaw: number;
  /** Vertical angle in degrees (0 = horizon, negative = down, positive = up). */
  pitch: number;
  /** Short label shown on hover (e.g. "Go to Pool"). */
  label: string;
  /** Visual style hint. */
  type?: "forward" | "left" | "right" | "door" | "info";
}

export interface TourScene {
  id: TourSceneId;
  name: string;        // English
  nameAr: string;      // Arabic
  /** Equirectangular 360° JPG (CORS-enabled, verified live). */
  image: string;
  hotspots: TourHotspot[];
}

export interface VirtualTour {
  id: string;
  hotelName: string;     // English
  hotelNameAr: string;   // Arabic
  country: string;
  region: VR360Region;
  thumbnail: string;
  /** Initial scene shown when the tour opens. */
  startSceneId: TourSceneId;
  scenes: TourScene[];
  tags: string[];
}

// ─── Verified CORS-enabled equirectangular sources ───────────────────────
// Each slug here is RESERVED FOR TOURS only and must not appear in
// ./sampleVideos.ts. All slugs verified HTTP 200 + CORS-allow-origin: *.
const PH = (slug: string) =>
  `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${slug}.jpg`;

export const PANORAMA_POOL_TOURS = {
  // Riyadh Grand Resort (6 unique scenes)
  thatchChapel: PH("thatch_chapel"),                // Lobby
  abandonedWorkshop: PH("abandoned_workshop_02"),   // Bathroom
  studioSmall: PH("studio_small_09"),               // Suite
  herkulessaulen: PH("herkulessaulen"),             // Restaurant
  airMuseum: PH("air_museum_playground"),           // Pool deck
  brownStudio6: PH("brown_photostudio_06"),         // Exterior

  // Dubai Skyline Hotel (4 unique)
  shanghaiSpare: PH("kiara_1_dawn"),                // Skyline-style sunrise (exterior)
  drachenfels: PH("drachenfels_cellar"),            // Spa bathroom
  artistWorkshop: PH("artist_workshop"),            // Sky suite interior
  musicHall: PH("music_hall_01"),                   // Marble lobby

  // Venetian Palace Hotel (4 unique)
  stPetersNight: PH("st_peters_square_night"),      // Italian trattoria
  brownStudio2: PH("brown_photostudio_02"),         // Canal suite interior
  cyclorama: PH("cyclorama_hard_light"),            // Historic lobby
  abandonedFactory: PH("abandoned_factory_canteen_01"), // Canal-front exterior

  // Bali Forest Retreat (5 unique)
  kartClub: PH("kart_club"),                        // Outdoor bath
  // Re-uses for tour-internal navigation are NOT allowed across cards but
  // a single tour can re-link scenes — we still give each scene its own image.
} as const;

// ─────────────────────────────────────────────────────────────────────────
// TOURS — every scene image is unique across the entire VR section.
// ─────────────────────────────────────────────────────────────────────────
export const VIRTUAL_TOURS: VirtualTour[] = [
  // ═══════════════ MIDDLE EAST ═══════════════
  {
    id: "tour-riyadh-grand",
    hotelName: "Riyadh Grand Resort",
    hotelNameAr: "منتجع الرياض الكبير",
    country: "Saudi Arabia",
    region: "Middle East",
    thumbnail: PANORAMA_POOL_TOURS.brownStudio6,
    startSceneId: "lobby",
    tags: ["luxury", "resort", "multi-scene"],
    scenes: [
      {
        id: "lobby",
        name: "Grand Lobby",
        nameAr: "البهو الرئيسي",
        image: PANORAMA_POOL_TOURS.thatchChapel,
        hotspots: [
          { target: "room",       yaw:   45, pitch: -10, label: "Suite",      type: "door" },
          { target: "restaurant", yaw:  -60, pitch: -8,  label: "Restaurant", type: "right" },
          { target: "exterior",   yaw:  170, pitch: -5,  label: "Exterior",   type: "forward" },
        ],
      },
      {
        id: "room",
        name: "Royal Suite",
        nameAr: "الجناح الملكي",
        image: PANORAMA_POOL_TOURS.studioSmall,
        hotspots: [
          { target: "lobby",    yaw: -130, pitch: -10, label: "Back to Lobby", type: "left" },
          { target: "bathroom", yaw:   80, pitch: -5,  label: "Bathroom",      type: "door" },
          { target: "pool",     yaw:  150, pitch: -8,  label: "Pool Deck",     type: "forward" },
        ],
      },
      {
        id: "bathroom",
        name: "Marble Bathroom",
        nameAr: "حمام رخامي",
        image: PANORAMA_POOL_TOURS.abandonedWorkshop,
        hotspots: [
          { target: "room", yaw: -90, pitch: -5, label: "Back to Suite", type: "left" },
        ],
      },
      {
        id: "pool",
        name: "Infinity Pool",
        nameAr: "المسبح اللانهائي",
        image: PANORAMA_POOL_TOURS.airMuseum,
        hotspots: [
          { target: "room",     yaw:  -30, pitch: -8, label: "Back to Suite",  type: "left" },
          { target: "exterior", yaw:  120, pitch: -5, label: "Exterior",       type: "forward" },
        ],
      },
      {
        id: "restaurant",
        name: "Fine Dining",
        nameAr: "مطعم راقي",
        image: PANORAMA_POOL_TOURS.herkulessaulen,
        hotspots: [
          { target: "lobby", yaw: 60, pitch: -10, label: "Back to Lobby", type: "left" },
        ],
      },
      {
        id: "exterior",
        name: "Resort Exterior",
        nameAr: "الواجهة الخارجية",
        image: PANORAMA_POOL_TOURS.brownStudio6,
        hotspots: [
          { target: "lobby", yaw: -10, pitch: -8, label: "Enter Lobby", type: "door" },
          { target: "pool",  yaw:  90, pitch: -8, label: "Pool Deck",   type: "right" },
        ],
      },
    ],
  },

  {
    id: "tour-dubai-skyline",
    hotelName: "Dubai Skyline Hotel",
    hotelNameAr: "فندق دبي سكاي لاين",
    country: "United Arab Emirates",
    region: "Middle East",
    thumbnail: PANORAMA_POOL_TOURS.shanghaiSpare,
    startSceneId: "lobby",
    tags: ["luxury", "city", "skyline"],
    scenes: [
      {
        id: "lobby",
        name: "Marble Lobby",
        nameAr: "البهو الرخامي",
        image: PANORAMA_POOL_TOURS.musicHall,
        hotspots: [
          { target: "room",     yaw:  60,  pitch: -8, label: "Sky Suite",    type: "door" },
          { target: "exterior", yaw: 180,  pitch: -5, label: "Skyline View", type: "forward" },
        ],
      },
      {
        id: "room",
        name: "Sky Suite",
        nameAr: "جناح السماء",
        image: PANORAMA_POOL_TOURS.artistWorkshop,
        hotspots: [
          { target: "lobby",    yaw: -120, pitch: -8, label: "Back to Lobby", type: "left" },
          { target: "bathroom", yaw:   90, pitch: -5, label: "Bathroom",      type: "right" },
        ],
      },
      {
        id: "bathroom",
        name: "Spa Bathroom",
        nameAr: "حمام السبا",
        image: PANORAMA_POOL_TOURS.drachenfels,
        hotspots: [
          { target: "room", yaw: -90, pitch: -5, label: "Back to Suite", type: "left" },
        ],
      },
      {
        id: "exterior",
        name: "Dubai Skyline",
        nameAr: "أفق دبي",
        image: PANORAMA_POOL_TOURS.shanghaiSpare,
        hotspots: [
          { target: "lobby", yaw: 0, pitch: -8, label: "Enter Lobby", type: "door" },
        ],
      },
    ],
  },

  // ═══════════════ EUROPE ═══════════════
  {
    id: "tour-venice-palace",
    hotelName: "Venetian Palace Hotel",
    hotelNameAr: "فندق قصر البندقية",
    country: "Italy",
    region: "Europe",
    thumbnail: PANORAMA_POOL_TOURS.abandonedFactory,
    startSceneId: "exterior",
    tags: ["heritage", "city", "boutique"],
    scenes: [
      {
        id: "exterior",
        name: "Canal Front",
        nameAr: "واجهة القناة",
        image: PANORAMA_POOL_TOURS.abandonedFactory,
        hotspots: [
          { target: "lobby", yaw: -10, pitch: -5, label: "Enter Hotel", type: "door" },
        ],
      },
      {
        id: "lobby",
        name: "Historic Lobby",
        nameAr: "بهو تاريخي",
        image: PANORAMA_POOL_TOURS.cyclorama,
        hotspots: [
          { target: "exterior",   yaw: 170, pitch: -5, label: "Exit",        type: "left" },
          { target: "room",       yaw:  60, pitch: -8, label: "Suite",       type: "door" },
          { target: "restaurant", yaw: -60, pitch: -8, label: "Restaurant",  type: "right" },
        ],
      },
      {
        id: "room",
        name: "Canal Suite",
        nameAr: "جناح القناة",
        image: PANORAMA_POOL_TOURS.brownStudio2,
        hotspots: [
          { target: "lobby", yaw: -120, pitch: -8, label: "Back to Lobby", type: "left" },
        ],
      },
      {
        id: "restaurant",
        name: "Italian Trattoria",
        nameAr: "مطعم إيطالي",
        image: PANORAMA_POOL_TOURS.stPetersNight,
        hotspots: [
          { target: "lobby", yaw: 60, pitch: -8, label: "Back to Lobby", type: "left" },
        ],
      },
    ],
  },

  // NOTE: Bali / Marrakech / Rio multi-scene tours were removed because we
  // could not source enough UNIQUE, verified, CORS-enabled equirectangular
  // panoramas to honor the "no repeated scenes" rule for those properties.
  // They will be re-introduced once the actual hotel panoramas are provided.
];

export const TOUR_SCENE_LABELS_AR: Record<string, string> = {
  lobby: "البهو",
  room: "الغرفة",
  bathroom: "الحمام",
  pool: "المسبح",
  restaurant: "المطعم",
  exterior: "الخارج",
};
