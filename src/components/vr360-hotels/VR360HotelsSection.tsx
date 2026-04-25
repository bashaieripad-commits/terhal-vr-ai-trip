import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Glasses,
  Globe2,
  Play,
  MapPin,
  Sparkles,
  Footprints,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchVR360Hotels } from "./youtubeApi";
import { ImmersiveVR360Viewer } from "./ImmersiveVR360Viewer";
import { MultiSceneTourViewer } from "./MultiSceneTourViewer";
import {
  SAMPLE_VR360_HOTELS,
  VR360_REGIONS,
  type VR360HotelVideo,
  type VR360Region,
} from "./sampleVideos";
import { VIRTUAL_TOURS, type VirtualTour } from "./virtualTours";

type FilterValue = "All" | VR360Region;

const REGION_LABELS_AR: Record<FilterValue, string> = {
  All: "الكل",
  "Middle East": "الشرق الأوسط",
  Europe: "أوروبا",
  Asia: "آسيا",
  Africa: "أفريقيا",
  Americas: "الأمريكتين",
};

// Discriminated union — every card is either a Full Virtual Tour or a 360 Preview.
type GridItem =
  | { kind: "tour"; tour: VirtualTour }
  | { kind: "preview"; video: VR360HotelVideo };

const itemRegion = (item: GridItem): VR360Region =>
  item.kind === "tour" ? item.tour.region : item.video.region;

const itemKey = (item: GridItem): string =>
  item.kind === "tour"
    ? `tour-${item.tour.id}`
    : `preview-${item.video.title}`;

export const VR360HotelsSection = () => {
  const { language } = useLanguage();
  const [previews, setPreviews] = useState<VR360HotelVideo[]>(
    SAMPLE_VR360_HOTELS
  );
  const [filter, setFilter] = useState<FilterValue>("All");
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

  // Tours first, then previews — multi-scene experiences are the headline.
  const allItems: GridItem[] = useMemo(
    () => [
      ...VIRTUAL_TOURS.map((t) => ({ kind: "tour" as const, tour: t })),
      ...previews.map((v) => ({ kind: "preview" as const, video: v })),
    ],
    [previews]
  );

  const filteredItems = useMemo(() => {
    if (filter === "All") return allItems;
    return allItems.filter((i) => itemRegion(i) === filter);
  }, [allItems, filter]);

  const filters: FilterValue[] = ["All", ...VR360_REGIONS];

  return (
    <section
      className="vr360hotels-section py-20 px-4 bg-gradient-to-b from-background via-secondary/20 to-background"
      aria-labelledby="vr360hotels-title"
    >
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">
              {language === "ar" ? "تجارب غامرة" : "Immersive Experiences"}
            </span>
          </div>
          <h2
            id="vr360hotels-title"
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            {language === "ar"
              ? "استكشف الفنادق بتقنية 360° VR"
              : "Explore Hotels in 360° VR"}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {language === "ar"
              ? "جولات افتراضية غامرة متعددة الغرف — تنقل بين البهو والغرف والمسبح بنقرة واحدة."
              : "Interactive multi-room virtual tours — walk between the lobby, suites, pool and more with a single click."}
          </p>
        </motion.div>

        {/* Region Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {filters.map((f) => {
            const active = filter === f;
            const label =
              language === "ar" ? REGION_LABELS_AR[f] : f === "All" ? "All" : f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`vr360hotels-chip group inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-md)]"
                    : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <Globe2 className="h-3.5 w-3.5 opacity-80" />
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
              const region = isTour ? item.tour.region : item.video.region;
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
                  className="vr360hotels-card group relative rounded-3xl overflow-hidden border border-border/60 bg-card shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-500"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={thumbnail}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

                    {/* Tour vs Preview badge */}
                    {isTour ? (
                      <Badge className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-primary text-primary-foreground border-0 backdrop-blur-md shadow-md flex items-center gap-1 px-2.5 py-1">
                        <Footprints className="h-3 w-3" />
                        <span className="text-[10px] font-bold tracking-wider">
                          {language === "ar" ? "جولة 360 تفاعلية" : "Interactive 360 Tour"}
                        </span>
                      </Badge>
                    ) : (
                      <Badge className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-background/90 text-foreground border-0 backdrop-blur-md shadow-sm flex items-center gap-1 px-2.5 py-1">
                        <Eye className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold tracking-wider">
                          {language === "ar" ? "مشهد 360 فريد" : "Unique 360 Scene"}
                        </span>
                      </Badge>
                    )}

                    {/* Region/country label */}
                    <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/40 backdrop-blur-md text-[11px] font-medium text-primary-foreground">
                      <MapPin className="h-3 w-3" />
                      {country}
                    </div>

                    {/* Scene count chip (tours only) */}
                    {isTour && (
                      <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                        <Glasses className="h-3 w-3" />
                        {language === "ar"
                          ? `${sceneCount} مشاهد قابلة للتنقل`
                          : `${sceneCount} navigable scenes`}
                      </div>
                    )}

                    {/* Play affordance */}
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
                            ? "ابدأ الجولة الافتراضية لـ"
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
                      <span className="text-xs text-muted-foreground font-medium">
                        {language === "ar"
                          ? REGION_LABELS_AR[region]
                          : region}
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
                          ? "معاينة 360"
                          : "360 Preview"}
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
              ? "لا توجد جولات في هذه المنطقة حالياً."
              : "No tours available in this region yet."}
          </p>
        )}
      </div>

      {/* Multi-scene virtual tour viewer (with hotspot navigation) */}
      <MultiSceneTourViewer
        tour={activeTour}
        onClose={() => setActiveTour(null)}
      />

      {/* Single-scene 360° preview viewer (legacy/preview-only mode) */}
      <ImmersiveVR360Viewer
        video={activePreview}
        onClose={() => setActivePreview(null)}
      />
    </section>
  );
};

export default VR360HotelsSection;
