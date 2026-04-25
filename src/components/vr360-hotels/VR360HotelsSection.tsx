import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Glasses,
  Play,
  MapPin,
  Sparkles,
  Footprints,
  Eye,
  Trophy,
  Hand,
  Building2,
  TreePine,
  Mountain,
  Waves,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchVR360Hotels } from "./youtubeApi";
import { ImmersiveVR360Viewer } from "./ImmersiveVR360Viewer";
import { MultiSceneTourViewer } from "./MultiSceneTourViewer";
import {
  SAMPLE_VR360_HOTELS,
  type VR360HotelVideo,
  type VR360Region,
  type VR360Category,
} from "./sampleVideos";
import { VIRTUAL_TOURS, type VirtualTour } from "./virtualTours";

// ─── Filters: by experience tier OR by content category ──────────────────
type TierFilter = "All" | "Full Virtual Tour" | "360 Preview";
type CategoryFilter = "All" | VR360Category;

const TIER_LABELS_AR: Record<TierFilter, string> = {
  All: "كل التجارب",
  "Full Virtual Tour": "جولة افتراضية كاملة",
  "360 Preview": "معاينة 360",
};

const CATEGORY_LABELS_AR: Record<CategoryFilter, string> = {
  All: "كل الفئات",
  Resort: "منتجعات",
  Beach: "شواطئ",
  Landscape: "مناظر طبيعية",
  City: "مدن",
  Nature: "طبيعة",
  Landmark: "معالم",
};

const CATEGORY_ICONS: Record<CategoryFilter, typeof Building2> = {
  All: Filter,
  Resort: Building2,
  Beach: Waves,
  Landscape: Mountain,
  City: Building2,
  Nature: TreePine,
  Landmark: Mountain,
};

// Discriminated union — every card is either a Full Virtual Tour or a 360 Preview.
type GridItem =
  | { kind: "tour"; tour: VirtualTour }
  | { kind: "preview"; video: VR360HotelVideo };

const itemKey = (item: GridItem): string =>
  item.kind === "tour"
    ? `tour-${item.tour.id}`
    : `preview-${item.video.title}`;

const CATEGORY_FILTERS: CategoryFilter[] = [
  "All",
  "Resort",
  "Beach",
  "Landscape",
  "City",
  "Nature",
  "Landmark",
];

export const VR360HotelsSection = () => {
  const { language } = useLanguage();
  const [previews, setPreviews] = useState<VR360HotelVideo[]>(
    SAMPLE_VR360_HOTELS
  );
  const [tier, setTier] = useState<TierFilter>("All");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [activeTour, setActiveTour] = useState<VirtualTour | null>(null);
  const [activePreview, setActivePreview] = useState<VR360HotelVideo | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    fetchVR360Hotels().then((list) => {
      if (!cancelled && list.length) setPreviews(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Tours first — they're the headline experience.
  const allItems: GridItem[] = useMemo(
    () => [
      ...VIRTUAL_TOURS.map((t) => ({ kind: "tour" as const, tour: t })),
      ...previews.map((v) => ({ kind: "preview" as const, video: v })),
    ],
    [previews]
  );

  const filteredItems = useMemo(() => {
    return allItems.filter((i) => {
      // Tier filter
      if (tier === "Full Virtual Tour" && i.kind !== "tour") return false;
      if (tier === "360 Preview" && i.kind !== "preview") return false;
      // Category filter (tours don't carry a category, treat as "Resort")
      if (category !== "All") {
        const cat: VR360Category =
          i.kind === "tour" ? "Resort" : i.video.category;
        if (cat !== category) return false;
      }
      return true;
    });
  }, [allItems, tier, category]);

  const tourCount = allItems.filter((i) => i.kind === "tour").length;
  const previewCount = allItems.filter((i) => i.kind === "preview").length;

  return (
    <section
      className="vr360hotels-section py-20 px-4 bg-gradient-to-b from-background via-secondary/20 to-background"
      aria-labelledby="vr360hotels-title"
    >
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">
              {language === "ar"
                ? "استكشف قبل أن تزور"
                : "Explore Before You Visit"}
            </span>
          </div>
          <h2
            id="vr360hotels-title"
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            {language === "ar"
              ? "تجربة 360° الغامرة"
              : "Immersive 360° Experiences"}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {language === "ar"
              ? "جولات افتراضية متعددة الغرف ومعاينات 360° لمناظر حقيقية حول العالم. اسحب للنظر، انقر على النقاط للتنقل."
              : "Multi-room virtual walk-throughs and 360° previews of real places around the world. Drag to look, tap hotspots to move."}
          </p>

          {/* Honesty key — explains the tier system upfront */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15 text-left rtl:text-right">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Footprints className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold flex items-center gap-1.5">
                  {language === "ar" ? "جولة افتراضية كاملة" : "Full Virtual Tour"}
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-primary/40 text-primary">
                    <Trophy className="h-2.5 w-2.5 mr-0.5" />
                    {language === "ar" ? "الأفضل" : "Best"}
                  </Badge>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {language === "ar"
                    ? "تنقل بين الغرف عبر نقاط تفاعلية"
                    : "Move between rooms via interactive hotspots"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border text-left rtl:text-right">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground/10 text-foreground flex items-center justify-center">
                <Eye className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold">
                  {language === "ar" ? "معاينة 360°" : "360° Preview"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {language === "ar"
                    ? "انظر حولك في كل الاتجاهات (بدون تنقل)"
                    : "Look around in every direction (no movement)"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-8 text-xs"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Footprints className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{tourCount}</span>
            {language === "ar" ? "جولة كاملة" : "full tours"}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{previewCount}</span>
            {language === "ar" ? "معاينة 360°" : "360° previews"}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Hand className="h-3.5 w-3.5 text-primary" />
            {language === "ar" ? "اسحب للاستكشاف" : "Drag to explore"}
          </div>
        </motion.div>

        {/* Tier Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          {(["All", "Full Virtual Tour", "360 Preview"] as TierFilter[]).map((t) => {
            const active = tier === t;
            const label = language === "ar" ? TIER_LABELS_AR[t] : t;
            const Icon = t === "Full Virtual Tour" ? Footprints : t === "360 Preview" ? Eye : Sparkles;
            return (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`vr360hotels-tier-chip inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-md)]"
                    : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-1.5 mb-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {CATEGORY_FILTERS.map((c) => {
            const active = category === c;
            const label = language === "ar" ? CATEGORY_LABELS_AR[c] : c;
            const Icon = CATEGORY_ICONS[c];
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`vr360hotels-cat-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => {
              const isTour = item.kind === "tour";
              const title = isTour
                ? language === "ar"
                  ? item.tour.hotelNameAr
                  : item.tour.hotelName
                : item.video.title;
              const country = isTour ? item.tour.country : item.video.country;
              const thumbnail = isTour ? item.tour.thumbnail : item.video.thumbnail;
              const sceneCount = isTour ? item.tour.scenes.length : 0;

              const onOpen = () => {
                if (isTour) setActiveTour(item.tour);
                else setActivePreview(item.video);
              };

              return (
                <motion.article
                  key={itemKey(item)}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                  className={`vr360hotels-card group relative rounded-3xl overflow-hidden border bg-card transition-all duration-500 hover:-translate-y-1 ${
                    isTour
                      ? "border-primary/40 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] ring-1 ring-primary/10"
                      : "border-border/60 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]"
                  }`}
                >
                  {/* "Best Experience" ribbon for tours */}
                  {isTour && (
                    <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 z-20 pointer-events-none">
                      <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground text-[9px] font-bold tracking-wider uppercase px-3 py-1 rtl:rounded-br-none rounded-bl-xl rtl:rounded-br-xl shadow-md flex items-center gap-1">
                        <Trophy className="h-2.5 w-2.5" />
                        {language === "ar" ? "تجربة مميزة" : "Best Experience"}
                      </div>
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={thumbnail}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />

                    {/* Tier badge */}
                    {isTour ? (
                      <Badge className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-primary text-primary-foreground border-0 backdrop-blur-md shadow-md flex items-center gap-1 px-2.5 py-1">
                        <Footprints className="h-3 w-3" />
                        <span className="text-[10px] font-bold tracking-wider">
                          {language === "ar" ? "جولة كاملة" : "Full Virtual Tour"}
                        </span>
                      </Badge>
                    ) : (
                      <Badge className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-background/90 text-foreground border-0 backdrop-blur-md shadow-sm flex items-center gap-1 px-2.5 py-1">
                        <Eye className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold tracking-wider">
                          {language === "ar" ? "معاينة 360°" : "360° Preview"}
                        </span>
                      </Badge>
                    )}

                    {/* Country pill */}
                    <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-white">
                      <MapPin className="h-3 w-3" />
                      {country}
                    </div>

                    {/* Scene count chip (tours only) */}
                    {isTour && (
                      <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-md text-[10px] font-bold text-primary-foreground">
                        <Glasses className="h-3 w-3" />
                        {language === "ar"
                          ? `${sceneCount} مشاهد`
                          : `${sceneCount} scenes`}
                      </div>
                    )}

                    {/* Play affordance on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-primary/95 text-primary-foreground flex items-center justify-center shadow-[var(--shadow-lg)] scale-90 group-hover:scale-100 transition-transform">
                        {isTour ? (
                          <Footprints className="h-7 w-7" />
                        ) : (
                          <Play className="h-7 w-7 ml-0.5 rtl:ml-0 rtl:mr-0.5" fill="currentColor" />
                        )}
                      </div>
                    </div>

                    {/* Full-thumbnail click target */}
                    <button
                      type="button"
                      onClick={onOpen}
                      aria-label={`${
                        isTour
                          ? language === "ar"
                            ? "ابدأ الجولة"
                            : "Start virtual tour for"
                          : language === "ar"
                          ? "افتح معاينة 360 لـ"
                          : "Open 360 preview for"
                      } ${title}`}
                      className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold leading-snug line-clamp-2 min-h-[2.75rem]">
                      {title}
                    </h3>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-muted-foreground font-medium inline-flex items-center gap-1">
                        <Hand className="h-3 w-3" />
                        {language === "ar" ? "اسحب للاستكشاف" : "Drag to explore"}
                      </span>
                      <Button
                        size="sm"
                        onClick={onOpen}
                        className={`rounded-full text-xs font-semibold px-4 h-8 ${
                          isTour
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-foreground text-background hover:bg-foreground/90"
                        }`}
                      >
                        {isTour ? (
                          <Footprints className="h-3.5 w-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                        ) : (
                          <Glasses className="h-3.5 w-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                        )}
                        {isTour
                          ? language === "ar"
                            ? "ابدأ الجولة"
                            : "Start Tour"
                          : language === "ar"
                          ? "افتح المعاينة"
                          : "Open Preview"}
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">
            {language === "ar"
              ? "لا توجد تجارب تطابق هذا المرشّح."
              : "No experiences match this filter."}
          </p>
        )}
      </div>

      {/* Multi-scene virtual tour viewer (Tier 1) */}
      <MultiSceneTourViewer
        tour={activeTour}
        onClose={() => setActiveTour(null)}
      />

      {/* Single-scene 360° preview viewer (Tier 3) */}
      <ImmersiveVR360Viewer
        video={activePreview}
        onClose={() => setActivePreview(null)}
      />
    </section>
  );
};

export default VR360HotelsSection;
