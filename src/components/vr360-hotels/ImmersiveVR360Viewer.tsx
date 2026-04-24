import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Maximize2, Minimize2, Glasses, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import type { VR360HotelVideo } from "./sampleVideos";

interface ImmersiveVR360ViewerProps {
  video: VR360HotelVideo | null;
  onClose: () => void;
}

/**
 * Full-screen immersive 360° viewer.
 *
 * Strategy:
 * - YouTube 360° videos already render an interactive 360 sphere inside the
 *   official embed when controls are enabled. We use the YouTube IFrame embed
 *   with `enablejsapi=1`, controls visible, and full sensor permissions
 *   (gyroscope, accelerometer) so users can drag/swipe to look around on
 *   desktop and mobile, and use device motion on mobile.
 * - The viewer is rendered through a portal at the document root so it covers
 *   the entire viewport without being affected by parent transforms or overflow.
 * - Self-hosted 360 videos would use A-Frame/Three.js — left as a future hook;
 *   this viewer focuses on YouTube 360, matching the section's data source.
 */
export const ImmersiveVR360Viewer = ({
  video,
  onClose,
}: ImmersiveVR360ViewerProps) => {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  // Reset state whenever a new video opens
  useEffect(() => {
    if (video) {
      setIframeLoaded(false);
      setReady(false);
    }
  }, [video?.youtubeVideoId]);

  // Smooth fade-in: wait a beat after iframe load so YouTube has time to
  // upgrade quality before revealing the player.
  useEffect(() => {
    if (!iframeLoaded) return;
    const t = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(t);
  }, [iframeLoaded]);

  // Lock body scroll while the viewer is open
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

  if (!video) return null;

  // Build YouTube 360-friendly embed URL.
  // Controls are intentionally KEPT VISIBLE (controls=1) because YouTube's
  // own 360 drag/touch interaction requires the standard player UI.
  const embedSrc =
    `https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}` +
    `?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1` +
    `&iv_load_policy=3&cc_load_policy=0&fs=1&enablejsapi=1` +
    `&vq=hd1080&hd=1`;

  const overlay = (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="vr360hotels-immersive fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in duration-300"
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
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
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

      {/* Player area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Blurred poster placeholder */}
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: ready ? 0 : 1,
            backgroundImage: `url(${video.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px) saturate(1.1)",
            transform: "scale(1.08)",
          }}
        />
        <div
          className="absolute inset-0 bg-black/50 transition-opacity duration-700 flex flex-col items-center justify-center gap-3"
          style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? "none" : "auto" }}
        >
          <Loader2 className="h-10 w-10 text-white/90 animate-spin" />
          <p className="text-white/80 text-sm font-medium">
            {language === "ar"
              ? "جاري تحميل التجربة الغامرة..."
              : "Loading immersive experience..."}
          </p>
        </div>

        {/* The 360° iframe — fills the viewport */}
        <iframe
          key={video.youtubeVideoId}
          title={video.title}
          src={embedSrc}
          onLoad={() => setIframeLoaded(true)}
          className="absolute inset-0 w-full h-full transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0, border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      </div>

      {/* Bottom hint bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/85 text-xs sm:text-sm font-medium">
            {language === "ar"
              ? "اسحب داخل الفيديو للنظر حولك في 360°  •  حرّك جهازك على الجوال  •  ESC للخروج"
              : "Drag inside the video to look around in 360°  •  Move your device on mobile  •  Press ESC to exit"}
          </p>
        </div>
      </div>
    </div>
  );

  // Render in a portal so the viewer truly covers the whole viewport
  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
};

export default ImmersiveVR360Viewer;
