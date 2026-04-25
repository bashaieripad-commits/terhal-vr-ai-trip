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

  const src = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
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
                {item.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/70 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {item.country}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <iframe
          src={src}
          title={item.title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/85 text-xs sm:text-sm font-medium">
            {language === "ar"
              ? "اسحب للنظر حولك في 360°  •  ESC للخروج"
              : "Drag to look around in 360°  •  Press ESC to exit"}
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
};

export default YouTube360Viewer;
