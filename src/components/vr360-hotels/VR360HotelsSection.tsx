import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Glasses, Globe2, Play, X, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchVR360Hotels } from "./youtubeApi";
import {
  SAMPLE_VR360_HOTELS,
  VR360_REGIONS,
  type VR360HotelVideo,
  type VR360Region,
} from "./sampleVideos";

type FilterValue = "All" | VR360Region;

const REGION_LABELS_AR: Record<FilterValue, string> = {
  All: "الكل",
  "Middle East": "الشرق الأوسط",
  Europe: "أوروبا",
  Asia: "آسيا",
  Africa: "أفريقيا",
  Americas: "الأمريكتين",
};

export const VR360HotelsSection = () => {
  const { language } = useLanguage();
  const [videos, setVideos] = useState<VR360HotelVideo[]>(SAMPLE_VR360_HOTELS);
  const [filter, setFilter] = useState<FilterValue>("All");
  const [activeVideo, setActiveVideo] = useState<VR360HotelVideo | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchVR360Hotels().then((list) => {
      if (!cancelled && list.length) setVideos(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVideos = useMemo(() => {
    if (filter === "All") return videos;
    return videos.filter((v) => v.region === filter);
  }, [videos, filter]);

  const openVideo = (v: VR360HotelVideo) => {
    setPlayerReady(false);
    setActiveVideo(v);
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setPlayerReady(false);
  };

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
              ? "جولات افتراضية غامرة لغرف وفنادق ومنتجعات حول العالم."
              : "Take immersive virtual tours of hotel rooms, resorts, and suites around the world."}
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
            {filteredVideos.map((v, i) => (
              <motion.article
                key={v.youtubeVideoId}
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
                    src={v.thumbnail}
                    alt={v.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${v.youtubeVideoId}/hqdefault.jpg`;
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

                  {/* 360 / VR badge */}
                  <Badge className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-background/90 text-foreground border-0 backdrop-blur-md shadow-sm flex items-center gap-1 px-2.5 py-1">
                    <Glasses className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold tracking-wider">360° / VR</span>
                  </Badge>

                  {/* Region label */}
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/40 backdrop-blur-md text-[11px] font-medium text-primary-foreground">
                    <MapPin className="h-3 w-3" />
                    {v.country}
                  </div>

                  {/* Play affordance */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/95 text-primary-foreground flex items-center justify-center shadow-[var(--shadow-lg)] scale-90 group-hover:scale-100 transition-transform">
                      <Play className="h-7 w-7 ml-0.5 rtl:ml-0 rtl:mr-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold leading-snug line-clamp-2 min-h-[2.75rem]">
                    {v.title}
                  </h3>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      {language === "ar"
                        ? REGION_LABELS_AR[v.region]
                        : v.region}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => openVideo(v)}
                      className="rounded-full text-xs font-semibold px-4 h-8 bg-foreground text-background hover:bg-foreground/90"
                    >
                      <Glasses className="h-3.5 w-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                      {language === "ar" ? "شاهد جولة 360" : "Watch 360 Tour"}
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {filteredVideos.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">
            {language === "ar"
              ? "لا توجد جولات في هذه المنطقة حالياً."
              : "No tours available in this region yet."}
          </p>
        )}
      </div>

      {/* Modal Player */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && closeVideo()}>
        <DialogContent
          className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-foreground border-foreground/20 rounded-2xl"
          onInteractOutside={closeVideo}
        >
          {activeVideo && (
            <div className="relative">
              {/* Close button */}
              <button
                onClick={closeVideo}
                aria-label="Close"
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-background/15 hover:bg-background/30 backdrop-blur-md text-primary-foreground flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Title bar */}
              <div className="absolute top-0 left-0 right-0 z-10 p-4 pr-14 bg-gradient-to-b from-foreground/80 to-transparent">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground border-0 text-[10px] font-bold tracking-wider px-2 py-0.5">
                    <Glasses className="h-3 w-3 mr-1" /> 360° / VR
                  </Badge>
                  <h3 className="text-sm md:text-base font-semibold text-primary-foreground line-clamp-1">
                    {activeVideo.title}
                  </h3>
                </div>
              </div>

              {/* Player */}
              <div className="relative w-full aspect-video bg-foreground">
                {/* Loading placeholder */}
                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{
                    opacity: playerReady ? 0 : 1,
                    backgroundImage: `url(${activeVideo.thumbnail})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(14px) saturate(1.1)",
                    transform: "scale(1.08)",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-foreground/30 transition-opacity duration-700 flex items-center justify-center"
                  style={{ opacity: playerReady ? 0 : 1 }}
                >
                  <div className="w-12 h-12 rounded-full border-[3px] border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                </div>

                <iframe
                  key={activeVideo.youtubeVideoId}
                  onLoad={() => setTimeout(() => setPlayerReady(true), 1000)}
                  className="absolute inset-0 w-full h-full transition-opacity duration-700"
                  style={{ opacity: playerReady ? 1 : 0, border: 0 }}
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&cc_load_policy=0&vq=hd1080&hd=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Footer hint */}
              <div className="px-5 py-3 bg-foreground text-primary-foreground/80 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> {activeVideo.country}
                </span>
                <span className="hidden sm:inline">
                  {language === "ar"
                    ? "اسحب داخل الفيديو للنظر حولك (إن كان 360° حقيقي)"
                    : "Drag inside the video to look around (if real 360°)"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default VR360HotelsSection;
