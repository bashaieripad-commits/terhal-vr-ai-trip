import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Glasses, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

export interface YouTube360Item {
  id: string;
  title: string;
  country: string;
  thumbnail: string;
  youtubeId: string;
}

interface Props {
  item: YouTube360Item | null;
  onClose: () => void;
}

/**
 * YouTube 360° viewer — uses YouTube's native iframe player which supports
 * 360° drag/look-around natively. Used for cards explicitly sourced from
 * YouTube 360° videos (e.g. user-supplied links).
 */
export const YouTube360Viewer = ({ item, onClose }: Props) => {
  const { language } = useLanguage();

  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  // Params:
  //   playsinline=1 → required for iOS to render 360 controls inline
  //   fs=1          → allow YouTube's fullscreen (enables VR/cardboard button)
  //   modestbranding/rel → minimize unrelated UI
  //   enablejsapi=1 → some 360 features check for it
  const src = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&playsinline=1&fs=1&rel=0&modestbranding=1&enablejsapi=1`;

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[9999] bg-black"
    >
      {/* Iframe — full screen so YouTube's native 360° pan compass (top-left)
          and VR/cardboard button (bottom-right) stay reachable */}
      <iframe
        src={src}
        title={item.title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />

      {/* Floating title pill — top-center so it doesn't cover YouTube's 360 compass */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 pointer-events-auto max-w-[80vw]">
          <Badge className="bg-primary text-primary-foreground border-0 text-[9px] font-bold tracking-wider px-1.5 py-0.5 flex-shrink-0">
            <Glasses className="h-2.5 w-2.5 mr-0.5" />
            360°
          </Badge>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white line-clamp-1 leading-tight">
              {item.title}
            </p>
            <p className="text-[10px] text-white/60 flex items-center gap-1 leading-tight">
              <MapPin className="h-2.5 w-2.5" />
              {item.country}
            </p>
          </div>
        </div>
      </div>

      {/* Close button — top-right (YouTube has nothing there) */}
      <button
        onClick={onClose}
        aria-label={language === "ar" ? "إغلاق" : "Close"}
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
};

export default YouTube360Viewer;
