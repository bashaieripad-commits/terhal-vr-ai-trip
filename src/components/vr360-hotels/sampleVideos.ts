// Curated fallback list of real 360°/VR hotel tour videos on YouTube.
// Used when the YouTube Data API key is not connected, or as a base list.

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
  thumbnail: string;
  tags: string[];
}

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

export const SAMPLE_VR360_HOTELS: VR360HotelVideo[] = [
  // Middle East
  {
    title: "Burj Al Arab Royal Suite — 360° VR Tour",
    country: "United Arab Emirates",
    region: "Middle East",
    youtubeVideoId: "0wC3qADWzpo",
    thumbnail: thumb("0wC3qADWzpo"),
    tags: ["360", "VR", "luxury", "suite"],
  },
  {
    title: "Atlantis The Palm — Virtual 360 Tour",
    country: "United Arab Emirates",
    region: "Middle East",
    youtubeVideoId: "Cf6sLN8DmDE",
    thumbnail: thumb("Cf6sLN8DmDE"),
    tags: ["360", "resort", "virtual tour"],
  },
  {
    title: "Ritz-Carlton Riyadh — Immersive 360°",
    country: "Saudi Arabia",
    region: "Middle East",
    youtubeVideoId: "p5y7sShCSy8",
    thumbnail: thumb("p5y7sShCSy8"),
    tags: ["360", "immersive", "luxury hotel"],
  },

  // Europe
  {
    title: "The Ritz London — 360° Hotel Room Tour",
    country: "United Kingdom",
    region: "Europe",
    youtubeVideoId: "2Lq86MKesG4",
    thumbnail: thumb("2Lq86MKesG4"),
    tags: ["360", "VR", "hotel room"],
  },
  {
    title: "Hotel de Crillon Paris — Virtual Tour 360",
    country: "France",
    region: "Europe",
    youtubeVideoId: "54wxpXIWAXk",
    thumbnail: thumb("54wxpXIWAXk"),
    tags: ["360", "virtual tour", "luxury"],
  },
  {
    title: "Bürgenstock Resort Switzerland — 360 VR",
    country: "Switzerland",
    region: "Europe",
    youtubeVideoId: "7AkbUfZjS5k",
    thumbnail: thumb("7AkbUfZjS5k"),
    tags: ["360", "resort", "VR"],
  },

  // Asia
  {
    title: "Marina Bay Sands — 360° Room Experience",
    country: "Singapore",
    region: "Asia",
    youtubeVideoId: "Z7yY3MVfT04",
    thumbnail: thumb("Z7yY3MVfT04"),
    tags: ["360", "immersive", "skyline"],
  },
  {
    title: "Aman Tokyo — VR Suite Tour",
    country: "Japan",
    region: "Asia",
    youtubeVideoId: "FGn0V6IkkfA",
    thumbnail: thumb("FGn0V6IkkfA"),
    tags: ["VR", "suite", "luxury"],
  },
  {
    title: "Soneva Jani Maldives — 360° Overwater Villa",
    country: "Maldives",
    region: "Asia",
    youtubeVideoId: "VVN4xj1oYTk",
    thumbnail: thumb("VVN4xj1oYTk"),
    tags: ["360", "resort", "virtual tour"],
  },

  // Africa
  {
    title: "Singita Sabi Sand — 360 Safari Lodge",
    country: "South Africa",
    region: "Africa",
    youtubeVideoId: "Q1F8gJ0iH8g",
    thumbnail: thumb("Q1F8gJ0iH8g"),
    tags: ["360", "lodge", "immersive"],
  },
  {
    title: "Royal Mansour Marrakech — Virtual 360 Tour",
    country: "Morocco",
    region: "Africa",
    youtubeVideoId: "JQk5hX9D8vE",
    thumbnail: thumb("JQk5hX9D8vE"),
    tags: ["360", "virtual tour", "riad"],
  },

  // Americas
  {
    title: "The Plaza New York — 360° Suite Tour",
    country: "United States",
    region: "Americas",
    youtubeVideoId: "1La4QzGeaaQ",
    thumbnail: thumb("1La4QzGeaaQ"),
    tags: ["360", "VR", "suite"],
  },
  {
    title: "Belmond Copacabana Palace — VR Hotel Tour",
    country: "Brazil",
    region: "Americas",
    youtubeVideoId: "TG6yIJC4t2Y",
    thumbnail: thumb("TG6yIJC4t2Y"),
    tags: ["VR", "virtual tour", "beach resort"],
  },
  {
    title: "Four Seasons Costa Rica — 360 Resort",
    country: "Costa Rica",
    region: "Americas",
    youtubeVideoId: "QoYz3pY0Mlo",
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
