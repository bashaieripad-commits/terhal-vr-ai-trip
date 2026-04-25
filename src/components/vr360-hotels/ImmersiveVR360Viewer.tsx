import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import {
  X,
  Maximize2,
  Minimize2,
  Glasses,
  MapPin,
  Loader2,
  Volume2,
  VolumeX,
  Pause,
  Play,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import type { VR360HotelVideo } from "./sampleVideos";

interface ImmersiveVR360ViewerProps {
  video: VR360HotelVideo | null;
  onClose: () => void;
}

/**
 * White-label immersive 360° viewer.
 *
 * Renders an equirectangular MP4 onto the inside of a sphere using Three.js,
 * with mouse-drag (desktop) and touch-drag (mobile) look-around in all
 * directions. No external video platform branding is shown.
 *
 * IMPORTANT — YouTube limitation:
 * YouTube videos cannot be fully re-rendered without YouTube UI due to
 * platform restrictions (CORS-blocked stream + DRM). They cannot be piped
 * into a <video> element / Three.js video texture. Therefore each VR360
 * entry must include `mp4Url` pointing at a CORS-enabled equirectangular
 * 360° MP4 for full white-label immersive playback. If `mp4Url` is missing,
 * an admin notice is displayed instead of the YouTube embed.
 */
export const ImmersiveVR360Viewer = ({
  video,
  onClose,
}: ImmersiveVR360ViewerProps) => {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  // Lock scroll while open
  useEffect(() => {
    if (!video) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [video]);

  // ESC to close
  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [video, onClose]);

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
      console.warn("[VR360] Fullscreen request failed:", err);
    }
  };

  // ─── Three.js scene setup (mp4Url OR imageUrl) ─────────────────────────
  useEffect(() => {
    if (!video || !mountRef.current) return;
    const hasSource = !!(video.mp4Url || video.imageUrl);
    if (!hasSource) return;

    setLoaded(false);
    setError(null);

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera at center of sphere
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1100);
    camera.position.set(0, 0, 0.01);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";

    let texture: THREE.Texture;
    let videoEl: HTMLVideoElement | null = null;
    let onCanPlay: (() => void) | null = null;
    let onErr: (() => void) | null = null;

    if (video.mp4Url) {
      // Animated 360° video texture
      videoEl = document.createElement("video");
      videoEl.crossOrigin = "anonymous";
      videoEl.loop = true;
      videoEl.muted = true; // required for autoplay
      videoEl.playsInline = true;
      videoEl.setAttribute("webkit-playsinline", "true");
      videoEl.preload = "auto";
      videoEl.src = video.mp4Url;
      videoElRef.current = videoEl;

      onCanPlay = () => {
        setLoaded(true);
        videoEl?.play().catch(() => setPlaying(false));
      };
      onErr = () => {
        setError(
          language === "ar"
            ? "تعذّر تحميل فيديو 360. تأكد من رابط MP4 يدعم CORS."
            : "Failed to load 360 video. Ensure the MP4 URL is CORS-enabled."
        );
      };
      videoEl.addEventListener("canplay", onCanPlay);
      videoEl.addEventListener("error", onErr);

      texture = new THREE.VideoTexture(videoEl);
    } else {
      // Still 360° equirectangular image — fully draggable, no playback
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      texture = loader.load(
        video.imageUrl!,
        () => setLoaded(true),
        undefined,
        () => {
          setError(
            language === "ar"
              ? "تعذّر تحميل صورة 360. تأكد من الرابط ودعم CORS."
              : "Failed to load 360 image. Verify the URL and CORS support."
          );
        }
      );
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Inverted sphere — texture visible from the inside
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // ─── Drag-to-look controls (mouse + touch) ─────────────────────────────
    let lon = 0; // horizontal angle (degrees)
    let lat = 0; // vertical angle (degrees)
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
      // 0.1 deg per pixel feels natural for a 360 sphere
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

    // ─── Animation loop ────────────────────────────────────────────────────
    let frame = 0;
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
    };
    animate();

    // ─── Resize ────────────────────────────────────────────────────────────
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
      videoEl.removeEventListener("canplay", onCanPlay);
      videoEl.removeEventListener("error", onErr);
      videoEl.pause();
      videoEl.removeAttribute("src");
      videoEl.load();
      videoElRef.current = null;
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.youtubeVideoId, video?.mp4Url]);

  const togglePlay = () => {
    const v = videoElRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoElRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  if (!video) return null;

  const overlay = (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="vr360hotels-immersive fixed inset-0 z-[9999] bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-start justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] font-bold tracking-wider px-2 py-1 flex-shrink-0">
              <Glasses className="h-3 w-3 mr-1" />
              360° / VR
            </Badge>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white line-clamp-1">
                {video.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/70 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {video.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {video.mp4Url && (
              <>
                <button
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </>
            )}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Close immersive viewer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Three.js canvas mount OR admin notice */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {video.mp4Url ? (
          <>
            <div ref={mountRef} className="absolute inset-0 w-full h-full" />

            {/* Loading state over the canvas */}
            {!loaded && !error && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black">
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${video.thumbnail})`,
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
                      ? "جاري تحميل التجربة الغامرة 360°..."
                      : "Loading immersive 360° experience..."}
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
          </>
        ) : (
          // No mp4 source — show admin notice instead of falling back to YouTube
          <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
            <div className="max-w-lg text-center text-white space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-400" />
              <h3 className="text-lg font-bold">
                {language === "ar"
                  ? "مصدر فيديو 360 غير متوفر"
                  : "360° video source unavailable"}
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                YouTube videos cannot be fully re-rendered without YouTube UI
                due to platform restrictions. Use direct .mp4 360 video files
                for full white-label immersive 360 playback. Add a{" "}
                <code className="px-1 py-0.5 rounded bg-white/10">mp4Url</code>{" "}
                to this entry in{" "}
                <code className="px-1 py-0.5 rounded bg-white/10">
                  sampleVideos.ts
                </code>
                .
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/85 text-xs sm:text-sm font-medium">
            {language === "ar"
              ? "اسحب يميناً ويساراً وأعلى وأسفل للنظر حولك في 360°  •  ESC للخروج"
              : "Drag left, right, up, down to look around in 360°  •  Press ESC to exit"}
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
};

export default ImmersiveVR360Viewer;
