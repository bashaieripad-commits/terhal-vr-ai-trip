import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, RotateCw, ZoomIn, ZoomOut, Eye, Bed, Waves, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

// Simple hotel room scene
const HotelRoom = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#d4b896" />
      </mesh>
      {/* Walls */}
      <mesh position={[0, 2.5, -5]}>
        <boxGeometry args={[10, 5, 0.1]} />
        <meshStandardMaterial color="#e8d5be" />
      </mesh>
      <mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 5, 0.1]} />
        <meshStandardMaterial color="#e8d5be" />
      </mesh>
      {/* Bed */}
      <group position={[0, 0.5, -3]}>
        <mesh><boxGeometry args={[3, 0.5, 4]} /><meshStandardMaterial color="#8b7355" /></mesh>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[3, 0.2, 4]} /><meshStandardMaterial color="#f5e6d3" /></mesh>
        <mesh position={[-0.8, 0.7, -1.3]}><boxGeometry args={[0.8, 0.3, 0.6]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0.8, 0.7, -1.3]}><boxGeometry args={[0.8, 0.3, 0.6]} /><meshStandardMaterial color="#ffffff" /></mesh>
      </group>
      {/* Window */}
      <mesh position={[-4.9, 2.5, -2]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.3} />
      </mesh>
      {/* Nightstand */}
      <mesh position={[2.5, 0.4, -3]}>
        <boxGeometry args={[0.8, 0.8, 0.6]} /><meshStandardMaterial color="#8b7355" />
      </mesh>
      {/* Lamp */}
      <group position={[2.5, 1, -3]}>
        <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.1, 0.1, 0.6]} /><meshStandardMaterial color="#d4af37" /></mesh>
        <mesh position={[0, 0.8, 0]}><coneGeometry args={[0.3, 0.4, 32]} /><meshStandardMaterial color="#f5deb3" emissive="#fff5e1" emissiveIntensity={0.5} /></mesh>
      </group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[2.5, 1.5, -3]} intensity={0.5} color="#fff5e1" />
    </group>
  );
};

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
              <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/80 via-transparent to-transparent" />
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
                <scene.icon className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-semibold text-white">
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
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-deep-brown/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-md flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === "ar" ? currentScene.titleAr : currentScene.titleEn}
                </h3>
                <p className="text-xs text-white/70">
                  {language === "ar" ? currentScene.descAr : currentScene.descEn}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[RotateCw, ZoomIn, ZoomOut, Maximize2].map((Icon, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/10 rounded-xl"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="relative w-full h-[520px]">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="absolute inset-0 z-30 bg-deep-brown/40 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-white/30 border-t-white animate-spin" />
                  <span className="text-sm text-white font-medium">
                    {language === "ar" ? "جاري التحميل..." : "Loading scene..."}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Canvas shadows>
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 1.6, 4]} />
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={8}
                target={[0, 1.5, -2]}
                autoRotate
                autoRotateSpeed={0.5}
              />
              <Environment preset="apartment" />
              <HotelRoom />
            </Suspense>
          </Canvas>

          {/* Bottom controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-deep-brown/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs font-medium text-white">
                  {language === "ar" ? "بث مباشر • اسحب للتحكم" : "Live • Drag to explore"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl"
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
                        i === activeScene ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl"
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
