import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Eye, Bed, Waves, Building2, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const scenes = [
  {
    id: "luxury-room",
    titleAr: "جناح ملكي فاخر",
    titleEn: "Royal Luxury Suite",
    descAr: "غرفة بإطلالة بانورامية على المدينة",
    descEn: "Panoramic city view suite",
    icon: Bed,
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop",
    badge: { ar: "الأكثر طلباً", en: "Most Popular" },
    videoId: "54wxpXIWAXk",
  },
  {
    id: "pool",
    titleAr: "المسبح اللامتناهي",
    titleEn: "Infinity Pool",
    descAr: "مسبح على السطح بإطلالة خلابة",
    descEn: "Rooftop pool with stunning views",
    icon: Waves,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
    badge: { ar: "حصري", en: "Exclusive" },
    videoId: "p5y7sShCSy8",
  },
  {
    id: "lobby",
    titleAr: "اللوبي الرئيسي",
    titleEn: "Grand Lobby",
    descAr: "استقبال فاخر بتصميم عصري",
    descEn: "Luxurious modern reception",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    badge: { ar: "جديد", en: "New" },
    videoId: "54wxpXIWAXk",
  },
];

export const VRViewer = () => {
  const [activeScene, setActiveScene] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const handleSceneChange = (index: number) => {
    if (index === activeScene) return;
    setIsLoading(true);
    setActiveScene(index);
    setTimeout(() => setIsLoading(false), 600);
  };

  const currentScene = scenes[activeScene];

  return (
    <div className="space-y-6">
      {/* Scene selector thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {scenes.map((scene, i) => (
          <motion.button
            key={scene.id}
            onClick={() => handleSceneChange(i)}
            className={`relative flex-shrink-0 w-48 rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-start ${
              i === activeScene
                ? "border-primary shadow-[var(--shadow-lg)] scale-[1.02]"
                : "border-border/50 hover:border-primary/40 opacity-70 hover:opacity-100"
            }`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative h-28">
              <img src={scene.image} alt={scene.titleEn} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
              {i === activeScene && (
                <motion.div
                  className="absolute top-2 right-2 rtl:right-auto rtl:left-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                    {scene.badge[language === "ar" ? "ar" : "en"]}
                  </Badge>
                </motion.div>
              )}
              <div className="absolute bottom-2 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5">
                <scene.icon className="h-3.5 w-3.5 text-primary-foreground" />
                <span className="text-xs font-semibold text-primary-foreground">
                  {language === "ar" ? scene.titleAr : scene.titleEn}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Main VR viewer */}
      <motion.div
        className="relative rounded-3xl overflow-hidden border-2 border-border/50 shadow-[var(--shadow-lg)] bg-card"
        layout
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-foreground/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-md flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary-foreground">
                  {language === "ar" ? currentScene.titleAr : currentScene.titleEn}
                </h3>
                <p className="text-xs text-primary-foreground/70">
                  {language === "ar" ? currentScene.descAr : currentScene.descEn}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-primary-foreground/10 backdrop-blur-md hover:bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/10 rounded-xl"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative w-full h-[520px]">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="absolute inset-0 z-30 bg-foreground/40 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  <span className="text-sm text-primary-foreground font-medium">
                    {language === "ar" ? "جاري التحميل..." : "Loading scene..."}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wrapper hides YouTube branding by scaling the iframe beyond visible area */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              key={currentScene.videoId + activeScene}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: "calc(100% + 200px)",
                height: "calc(100% + 200px)",
                border: 0,
              }}
              src={`https://www.youtube-nocookie.com/embed/${currentScene.videoId}?autoplay=1&mute=1&loop=1&playlist=${currentScene.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&cc_load_policy=0&autohide=1&color=white`}
              title={currentScene.titleEn}
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              tabIndex={-1}
              aria-hidden="true"
            />
            {/* Transparent overlay to block any residual YouTube UI clicks */}
            <div className="absolute inset-0 z-[1]" />
          </div>

          {/* Bottom controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/70 to-transparent z-10">
            <div className="flex items-center justify-between">
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs font-medium text-primary-foreground">
                  {language === "ar" ? "جولة افتراضية • فيديو مباشر" : "Virtual Tour • Live Video"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-primary-foreground/10 backdrop-blur-md hover:bg-primary-foreground/20 text-primary-foreground rounded-xl"
                  onClick={() => handleSceneChange(Math.max(0, activeScene - 1))}
                  disabled={activeScene === 0}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </Button>
                <div className="flex gap-1.5">
                  {scenes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleSceneChange(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeScene ? "w-6 bg-primary-foreground" : "w-1.5 bg-primary-foreground/40 hover:bg-primary-foreground/60"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-primary-foreground/10 backdrop-blur-md hover:bg-primary-foreground/20 text-primary-foreground rounded-xl"
                  onClick={() => handleSceneChange(Math.min(scenes.length - 1, activeScene + 1))}
                  disabled={activeScene === scenes.length - 1}
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
