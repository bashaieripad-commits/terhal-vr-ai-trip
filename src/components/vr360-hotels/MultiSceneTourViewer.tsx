import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import {
  X,
  Maximize2,
  Minimize2,
  Glasses,
  MapPin,
  Loader2,
  AlertTriangle,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  DoorOpen,
  Info,
  Map as MapIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import {
  TOUR_SCENE_LABELS_AR,
  type TourHotspot,
  type TourScene,
  type VirtualTour,
} from "./virtualTours";

interface MultiSceneTourViewerProps {
  tour: VirtualTour | null;
  onClose: () => void;
}

interface ProjectedHotspot {
  hotspot: TourHotspot;
  x: number;
  y: number;
  visible: boolean;
}

/**
 * Multi-scene 360° virtual tour viewer (Matterport / Street-View style).
 *
 * Renders an equirectangular panorama of the current scene onto an inverted
 * sphere using Three.js. Clickable hotspots are projected from 3D world
 * positions to 2D screen coordinates each frame and rendered as DOM buttons,
 * so they remain crisp, accessible (real <button> elements), and easy to
 * style without GPU sprites.
 *
 * - Drag to look around (mouse + touch)
 * - Click hotspot → smooth fade transition → next scene loads
 * - Mini-map of all scenes with current scene highlighted
 * - Fullscreen + ESC to close
 */
export const MultiSceneTourViewer = ({
  tour,
  onClose,
}: MultiSceneTourViewerProps) => {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [projected, setProjected] = useState<ProjectedHotspot[]>([]);
  const [showMap, setShowMap] = useState(false);

  // Reset to start scene whenever a new tour opens
  useEffect(() => {
    if (tour) {
      setCurrentSceneId(tour.startSceneId);
      setShowMap(false);
    } else {
      setCurrentSceneId(null);
    }
  }, [tour?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentScene: TourScene | null = useMemo(() => {
    if (!tour || !currentSceneId) return null;
    return tour.scenes.find((s) => s.id === currentSceneId) ?? tour.scenes[0];
  }, [tour, currentSceneId]);

  // Lock scroll while open
  useEffect(() => {
    if (!tour) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [tour]);

  // ESC to close
  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tour, onClose]);

  // Track fullscreen state
  useEffect(() => {
    const onFsChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.warn("[VR360 Tour] Fullscreen request failed:", err);
    }
  };

  // ─── Three.js scene setup — re-runs whenever the active scene changes ──
  useEffect(() => {
    if (!tour || !currentScene || !mountRef.current) return;

    setLoaded(false);
    setError(null);

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1100);
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";

    // Load equirectangular panorama
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const texture = loader.load(
      currentScene.image,
      () => setLoaded(true),
      undefined,
      () =>
        setError(
          language === "ar"
            ? "تعذّر تحميل صورة 360. تأكد من الرابط ودعم CORS."
            : "Failed to load 360 image. Verify the URL and CORS support."
        )
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // ─── Drag-to-look controls ────────────────────────────────────────────
    let lon = 0;
    let lat = 0;
    let isDown = false;
    let downX = 0;
    let downY = 0;
    let startLon = 0;
    let startLat = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      downX = e.clientX;
      downY = e.clientY;
      startLon = lon;
      startLat = lat;
      renderer.domElement.style.cursor = "grabbing";
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      lon = startLon - (e.clientX - downX) * 0.15;
      lat = startLat + (e.clientY - downY) * 0.15;
      lat = Math.max(-85, Math.min(85, lat));
    };
    const onPointerUp = (e: PointerEvent) => {
      isDown = false;
      renderer.domElement.style.cursor = "grab";
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerUp);

    // ─── Project hotspot 3D positions → 2D screen positions each frame ────
    const hotspotVectors = currentScene.hotspots.map((h) => {
      const phi = THREE.MathUtils.degToRad(90 - h.pitch);
      const theta = THREE.MathUtils.degToRad(h.yaw);
      const r = 100;
      return {
        hotspot: h,
        vec: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        ),
      };
    });

    let frame = 0;
    const v = new THREE.Vector3();
    const camDir = new THREE.Vector3();

    const animate = () => {
      frame = requestAnimationFrame(animate);

      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);
      renderer.render(scene, camera);

      // Project hotspots to screen
      camera.getWorldDirection(camDir);
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      const next: ProjectedHotspot[] = hotspotVectors.map(({ hotspot, vec }) => {
        v.copy(vec);
        // Visible only if in front of camera
        const toPoint = v.clone().normalize();
        const dot = toPoint.dot(camDir);
        v.project(camera);
        const x = (v.x * 0.5 + 0.5) * w;
        const y = (-v.y * 0.5 + 0.5) * h;
        return { hotspot, x, y, visible: dot > 0.15 };
      });
      setProjected(next);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerUp);
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.id, currentSceneId]);

  const goToScene = (targetId: string) => {
    if (transitioning || targetId === currentSceneId) return;
    setTransitioning(true);
    // Smooth fade-out → swap scene → fade-in handled by overlay opacity
    window.setTimeout(() => {
      setCurrentSceneId(targetId);
      window.setTimeout(() => setTransitioning(false), 350);
    }, 280);
  };

  if (!tour || !currentScene) return null;

  const hotelLabel = language === "ar" ? tour.hotelNameAr : tour.hotelName;
  const sceneLabel =
    language === "ar"
      ? currentScene.nameAr ||
        TOUR_SCENE_LABELS_AR[currentScene.id] ||
        currentScene.name
      : currentScene.name;

  const hotspotIcon = (type?: TourHotspot["type"]) => {
    switch (type) {
      case "left":
        return <ArrowLeft className="h-5 w-5" />;
      case "right":
        return <ArrowRight className="h-5 w-5" />;
      case "door":
        return <DoorOpen className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      case "forward":
      default:
        return <ArrowUp className="h-5 w-5" />;
    }
  };

  const overlay = (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${hotelLabel} — ${sceneLabel}`}
      className="vr360hotels-tour fixed inset-0 z-[9999] bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-start justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] font-bold tracking-wider px-2 py-1 flex-shrink-0">
              <Glasses className="h-3 w-3 mr-1" />
              {language === "ar" ? "جولة افتراضية" : "Virtual Tour"}
            </Badge>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white line-clamp-1">
                {hotelLabel}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/70 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {tour.country}
                <span className="mx-1.5 opacity-50">•</span>
                <span className="text-white/90">{sceneLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowMap((s) => !s)}
              aria-label="Toggle scenes map"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md text-white flex items-center justify-center transition-colors ${
                showMap ? "bg-primary/80 hover:bg-primary" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <MapIcon className="h-4 w-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Close virtual tour"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Three.js canvas + hotspots */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* Hotspot DOM layer (positioned over the canvas) */}
        {loaded && !error && (
          <div className="absolute inset-0 pointer-events-none">
            {projected.map(({ hotspot, x, y, visible }, i) =>
              visible ? (
                <button
                  key={`${currentScene.id}-${hotspot.target}-${i}`}
                  type="button"
                  onClick={() => goToScene(hotspot.target)}
                  style={{
                    transform: `translate(-50%, -50%)`,
                    left: x,
                    top: y,
                  }}
                  aria-label={`Go to ${hotspot.label}`}
                  className="vr360hotels-hotspot pointer-events-auto absolute group flex flex-col items-center gap-1.5 focus:outline-none"
                >
                  <span className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(255,255,255,0.35)] ring-2 ring-white/80 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                    <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
                    <span className="relative">{hotspotIcon(hotspot.type)}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {hotspot.label}
                  </span>
                </button>
              ) : null
            )}
          </div>
        )}

        {/* Smooth fade transition overlay */}
        <div
          className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 ${
            transitioning || !loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Loading state */}
        {!loaded && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${tour.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(20px) saturate(1.1)",
                transform: "scale(1.08)",
                opacity: 0.6,
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-white/90 animate-spin" />
              <p className="text-white/85 text-sm font-medium">
                {language === "ar"
                  ? `جارٍ تحميل ${sceneLabel}…`
                  : `Loading ${sceneLabel}…`}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black p-6">
            <div className="max-w-md text-center text-white space-y-3">
              <AlertTriangle className="h-10 w-10 mx-auto text-amber-400" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Scene mini-map (bottom) */}
      {showMap && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 max-w-[92vw]">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="flex gap-2 overflow-x-auto">
              {tour.scenes.map((s) => {
                const active = s.id === currentSceneId;
                return (
                  <button
                    key={s.id}
                    onClick={() => goToScene(s.id)}
                    className={`flex-shrink-0 group relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      active ? "border-primary scale-105" : "border-white/20 hover:border-white/60"
                    }`}
                  >
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1 py-0.5 text-[9px] font-semibold text-white text-center line-clamp-1">
                      {language === "ar" ? s.nameAr : s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom hint bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/85 text-xs sm:text-sm font-medium">
            {language === "ar"
              ? "اسحب للنظر حولك  •  انقر على النقاط المضيئة للانتقال بين الغرف  •  ESC للخروج"
              : "Drag to look around  •  Click the glowing hotspots to move between rooms  •  ESC to exit"}
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
};

export default MultiSceneTourViewer;
