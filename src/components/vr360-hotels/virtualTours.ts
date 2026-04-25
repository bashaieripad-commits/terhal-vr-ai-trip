// ─────────────────────────────────────────────────────────────────────────
// MULTI-SCENE VIRTUAL TOURS — Matterport / Google Street View style
// ─────────────────────────────────────────────────────────────────────────
//
// Each tour represents a hotel/resort with MULTIPLE connected 360° scenes
// (lobby, room, bathroom, pool, restaurant, exterior, …). Scenes are linked
// via clickable HOTSPOTS that move the user to the next scene, with smooth
// fade transitions handled by the MultiSceneTourViewer (Three.js).
//
// All panoramas are equirectangular (2:1) and CORS-enabled so they work as
// textures inside the inverted Three.js sphere.
//
// ADMIN NOTE — IMPORTANT:
// True interactive multi-scene hotel walkthroughs (Matterport/Realsee/iStaging)
// are typically hosted behind iframes by their providers and cannot be
// re-skinned without their UI. To stay 100% white-label and avoid any third-
// party branding, we compose our own virtual tours from verified CORS-enabled
// equirectangular panoramas (Polyhaven HDRIs + Photo-Sphere-Viewer demo
// assets). Hotspots are authored manually below.
//
// To plug a real, fully-rendered hotel tour: replace each scene's `image`
// field with the equirectangular JPG of the actual room/space, keep the
// hotspot coordinates (yaw/pitch in degrees), and the viewer "just works".
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
  /** Equirectangular 360° JPG (CORS-enabled). */
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
const PH = (slug: string) =>
  `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${slug}.jpg`;
const PSV_SPHERE =
  "https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg";
const PSV_SPHERE_SMALL =
  "https://photo-sphere-viewer-data.netlify.app/assets/sphere-small.jpg";

// ─────────────────────────────────────────────────────────────────────────
// TOURS
// ─────────────────────────────────────────────────────────────────────────
export const VIRTUAL_TOURS: VirtualTour[] = [
  // ═══════════════ MIDDLE EAST ═══════════════
  {
    id: "tour-riyadh-grand",
    hotelName: "Riyadh Grand Resort",
    hotelNameAr: "منتجع الرياض الكبير",
    country: "Saudi Arabia",
    region: "Middle East",
    thumbnail: PH("kloppenheim_06_puresky"),
    startSceneId: "lobby",
    tags: ["luxury", "resort", "multi-scene"],
    scenes: [
      {
        id: "lobby",
        name: "Grand Lobby",
        nameAr: "البهو الرئيسي",
        image: PSV_SPHERE,
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
        image: PH("thatch_chapel"),
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
        image: PH("abandoned_workshop_02"),
        hotspots: [
          { target: "room", yaw: -90, pitch: -5, label: "Back to Suite", type: "left" },
        ],
      },
      {
        id: "pool",
        name: "Infinity Pool",
        nameAr: "المسبح اللانهائي",
        image: PH("limpopo_golf_course"),
        hotspots: [
          { target: "room",     yaw:  -30, pitch: -8, label: "Back to Suite",  type: "left" },
          { target: "exterior", yaw:  120, pitch: -5, label: "Exterior",       type: "forward" },
        ],
      },
      {
        id: "restaurant",
        name: "Fine Dining",
        nameAr: "مطعم راقي",
        image: PH("kloofendal_48d_partly_cloudy_puresky"),
        hotspots: [
          { target: "lobby", yaw: 60, pitch: -10, label: "Back to Lobby", type: "left" },
        ],
      },
      {
        id: "exterior",
        name: "Resort Exterior",
        nameAr: "الواجهة الخارجية",
        image: PH("kloppenheim_06_puresky"),
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
    thumbnail: PH("the_sky_is_on_fire"),
    startSceneId: "lobby",
    tags: ["luxury", "city", "skyline"],
    scenes: [
      {
        id: "lobby",
        name: "Marble Lobby",
        nameAr: "البهو الرخامي",
        image: PH("thatch_chapel"),
        hotspots: [
          { target: "room",     yaw:  60,  pitch: -8, label: "Sky Suite",  type: "door" },
          { target: "exterior", yaw: 180,  pitch: -5, label: "Skyline View", type: "forward" },
        ],
      },
      {
        id: "room",
        name: "Sky Suite",
        nameAr: "جناح السماء",
        image: PSV_SPHERE,
        hotspots: [
          { target: "lobby",    yaw: -120, pitch: -8, label: "Back to Lobby", type: "left" },
          { target: "bathroom", yaw:   90, pitch: -5, label: "Bathroom",      type: "right" },
        ],
      },
      {
        id: "bathroom",
        name: "Spa Bathroom",
        nameAr: "حمام السبا",
        image: PH("abandoned_workshop_02"),
        hotspots: [
          { target: "room", yaw: -90, pitch: -5, label: "Back to Suite", type: "left" },
        ],
      },
      {
        id: "exterior",
        name: "Dubai Skyline",
        nameAr: "أفق دبي",
        image: PH("the_sky_is_on_fire"),
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
    thumbnail: PH("venice_sunset"),
    startSceneId: "exterior",
    tags: ["heritage", "city", "boutique"],
    scenes: [
      {
        id: "exterior",
        name: "Canal Front",
        nameAr: "واجهة القناة",
        image: PH("venice_sunset"),
        hotspots: [
          { target: "lobby", yaw: -10, pitch: -5, label: "Enter Hotel", type: "door" },
        ],
      },
      {
        id: "lobby",
        name: "Historic Lobby",
        nameAr: "بهو تاريخي",
        image: PH("pretville_street"),
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
        image: PSV_SPHERE_SMALL,
        hotspots: [
          { target: "lobby", yaw: -120, pitch: -8, label: "Back to Lobby", type: "left" },
        ],
      },
      {
        id: "restaurant",
        name: "Italian Trattoria",
        nameAr: "مطعم إيطالي",
        image: PH("kloofendal_48d_partly_cloudy_puresky"),
        hotspots: [
          { target: "lobby", yaw: 60, pitch: -8, label: "Back to Lobby", type: "left" },
        ],
      },
    ],
  },

  // ═══════════════ ASIA ═══════════════
  {
    id: "tour-bali-retreat",
    hotelName: "Bali Forest Retreat",
    hotelNameAr: "منتجع غابة بالي",
    country: "Indonesia",
    region: "Asia",
    thumbnail: PH("rosendal_plains_2"),
    startSceneId: "exterior",
    tags: ["nature", "retreat", "tropical"],
    scenes: [
      {
        id: "exterior",
        name: "Forest Entrance",
        nameAr: "مدخل الغابة",
        image: PH("rosendal_plains_2"),
        hotspots: [
          { target: "lobby", yaw: 10, pitch: -5, label: "Enter Lodge", type: "door" },
          { target: "pool",  yaw: 120, pitch: -8, label: "Pool",       type: "right" },
        ],
      },
      {
        id: "lobby",
        name: "Open-Air Lobby",
        nameAr: "بهو مفتوح",
        image: PH("thatch_chapel"),
        hotspots: [
          { target: "exterior", yaw: 180, pitch: -5, label: "Exit",      type: "left" },
          { target: "room",     yaw:  60, pitch: -8, label: "Villa",     type: "door" },
        ],
      },
      {
        id: "room",
        name: "Jungle Villa",
        nameAr: "فيلا الأدغال",
        image: PSV_SPHERE,
        hotspots: [
          { target: "lobby",    yaw: -120, pitch: -8, label: "Back to Lobby", type: "left" },
          { target: "bathroom", yaw:   90, pitch: -5, label: "Bathroom",      type: "right" },
        ],
      },
      {
        id: "bathroom",
        name: "Outdoor Bath",
        nameAr: "حمام خارجي",
        image: PH("abandoned_workshop_02"),
        hotspots: [
          { target: "room", yaw: -90, pitch: -5, label: "Back to Villa", type: "left" },
        ],
      },
      {
        id: "pool",
        name: "Jungle Pool",
        nameAr: "مسبح الأدغال",
        image: PH("limpopo_golf_course"),
        hotspots: [
          { target: "exterior", yaw: -100, pitch: -8, label: "Back to Entrance", type: "left" },
        ],
      },
    ],
  },

  // ═══════════════ AMERICAS ═══════════════
  {
    id: "tour-rio-beach",
    hotelName: "Rio Beach Resort",
    hotelNameAr: "منتجع شاطئ ريو",
    country: "Brazil",
    region: "Americas",
    thumbnail: PH("the_sky_is_on_fire"),
    startSceneId: "exterior",
    tags: ["beach", "resort", "tropical"],
    scenes: [
      {
        id: "exterior",
        name: "Beachfront",
        nameAr: "واجهة الشاطئ",
        image: PH("the_sky_is_on_fire"),
        hotspots: [
          { target: "lobby", yaw: 10, pitch: -5, label: "Enter Resort", type: "door" },
          { target: "pool",  yaw: 100, pitch: -8, label: "Pool",         type: "right" },
        ],
      },
      {
        id: "lobby",
        name: "Resort Lobby",
        nameAr: "بهو المنتجع",
        image: PH("pretville_street"),
        hotspots: [
          { target: "exterior",   yaw: 180, pitch: -5, label: "Beach",       type: "left" },
          { target: "room",       yaw:  60, pitch: -8, label: "Ocean Suite", type: "door" },
          { target: "restaurant", yaw: -60, pitch: -8, label: "Restaurant",  type: "right" },
        ],
      },
      {
        id: "room",
        name: "Ocean Suite",
        nameAr: "جناح المحيط",
        image: PSV_SPHERE,
        hotspots: [
          { target: "lobby", yaw: -120, pitch: -8, label: "Back to Lobby", type: "left" },
        ],
      },
      {
        id: "pool",
        name: "Beach Pool",
        nameAr: "مسبح الشاطئ",
        image: PH("limpopo_golf_course"),
        hotspots: [
          { target: "exterior", yaw: -90, pitch: -8, label: "Beachfront", type: "left" },
        ],
      },
      {
        id: "restaurant",
        name: "Beachfront Grill",
        nameAr: "مطعم الشاطئ",
        image: PH("kloofendal_48d_partly_cloudy_puresky"),
        hotspots: [
          { target: "lobby", yaw: 60, pitch: -8, label: "Back to Lobby", type: "left" },
        ],
      },
    ],
  },

  // ═══════════════ AFRICA ═══════════════
  {
    id: "tour-marrakech-riad",
    hotelName: "Marrakech Heritage Riad",
    hotelNameAr: "رياض مراكش التراثي",
    country: "Morocco",
    region: "Africa",
    thumbnail: PH("abandoned_workshop_02"),
    startSceneId: "exterior",
    tags: ["heritage", "riad", "traditional"],
    scenes: [
      {
        id: "exterior",
        name: "Medina Street",
        nameAr: "شارع المدينة",
        image: PH("pretville_street"),
        hotspots: [
          { target: "lobby", yaw: 0, pitch: -5, label: "Enter Riad", type: "door" },
        ],
      },
      {
        id: "lobby",
        name: "Riad Courtyard",
        nameAr: "فناء الرياض",
        image: PH("abandoned_workshop_02"),
        hotspots: [
          { target: "exterior", yaw: 180, pitch: -5, label: "Medina",   type: "left" },
          { target: "room",     yaw:  60, pitch: -8, label: "Room",     type: "door" },
        ],
      },
      {
        id: "room",
        name: "Traditional Room",
        nameAr: "غرفة تقليدية",
        image: PSV_SPHERE_SMALL,
        hotspots: [
          { target: "lobby", yaw: -120, pitch: -8, label: "Courtyard", type: "left" },
        ],
      },
    ],
  },
];

export const TOUR_SCENE_LABELS_AR: Record<string, string> = {
  lobby: "البهو",
  room: "الغرفة",
  bathroom: "الحمام",
  pool: "المسبح",
  restaurant: "المطعم",
  exterior: "الخارج",
};
