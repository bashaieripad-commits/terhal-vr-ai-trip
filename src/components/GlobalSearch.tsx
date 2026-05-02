import { useEffect, useRef, useState, useCallback } from "react";
import { Search, Sparkles, Snowflake, TrendingUp, Loader2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  variant?: "navbar" | "hero";
  className?: string;
}

const seasonLabel = (season: string, language: "ar" | "en") => {
  const map: Record<string, { ar: string; en: string }> = {
    winter: { ar: "هروب الشتاء", en: "Winter getaways" },
    spring: { ar: "وجهات الربيع", en: "Spring picks" },
    summer: { ar: "هروب الصيف", en: "Summer escapes" },
    autumn: { ar: "وجهات الخريف", en: "Autumn picks" },
  };
  const entry = map[season];
  if (!entry) return language === "ar" ? "موسمي" : "Seasonal";
  return language === "ar" ? entry.ar : entry.en;
};

export const GlobalSearch = ({ variant = "navbar", className }: GlobalSearchProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, loading, fetchSuggestions } = useSearchSuggestions(language as "ar" | "en");

  // Close on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleFocus = () => {
    setOpen(true);
    fetchSuggestions();
  };

  const submitQuery = useCallback(
    async (raw: string) => {
      const term = raw.trim();
      if (!term) return;
      // Fire-and-forget log (do not block navigation; respect RLS).
      // Server-side de-dup: a unique index suppresses repeats of the same
      // normalized query from the same user within a 10-minute window.
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const { error: logError } = await supabase.from("search_queries").insert({
          query: term.slice(0, 200),
          city: data.city,
          language,
          user_id: sessionData.session?.user.id ?? null,
        });
        // 23505 = unique_violation → expected when the same search is
        // submitted twice in the same 10-minute window. Ignore silently.
        if (logError && logError.code !== "23505") {
          console.warn("search log failed", logError);
        }
      } catch (err) {
        console.warn("search log failed", err);
      }
      setOpen(false);
      navigate(`/search?type=all&q=${encodeURIComponent(term)}`);
    },
    [data.city, language, navigate],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery(query);
  };

  const placeholder = language === "ar"
    ? "ابحث عن وجهة، فندق، رحلة، نشاط..."
    : "Search destinations, hotels, flights, activities…";

  const wrapperClass = cn(
    "relative w-full",
    variant === "navbar" ? "max-w-md" : "max-w-2xl mx-auto",
    className,
  );

  return (
    <div ref={wrapperRef} className={wrapperClass}>
      <form onSubmit={handleSubmit} role="search" aria-label={placeholder}>
        <div
          className={cn(
            "relative flex items-center gap-2 rounded-full border border-border/60 bg-card/95 backdrop-blur-md shadow-sm transition-all focus-within:shadow-md focus-within:border-primary/60",
            variant === "navbar" ? "h-10 pl-4 pr-1" : "h-14 pl-6 pr-2 shadow-lg",
          )}
        >
          <Search
            className={cn(
              "text-muted-foreground shrink-0",
              variant === "navbar" ? "h-4 w-4" : "h-5 w-5",
            )}
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={cn(
              "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0",
              variant === "navbar" ? "h-9 text-sm" : "h-12 text-base",
            )}
            aria-label={placeholder}
          />
          <Button
            type="submit"
            size={variant === "navbar" ? "sm" : "default"}
            variant="hero"
            className={cn("rounded-full shrink-0", variant === "navbar" ? "h-8 px-3 text-xs" : "h-10 px-5")}
          >
            {language === "ar" ? "بحث" : "Search"}
          </Button>
        </div>
      </form>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-border/60 bg-popover shadow-[var(--shadow-lg)] overflow-hidden",
            "animate-in fade-in-0 slide-in-from-top-1",
          )}
          role="listbox"
        >
          {loading && data.personalized.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === "ar" ? "جاري تحضير الاقتراحات..." : "Preparing suggestions…"}
            </div>
          )}

          {data.city && (
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {language === "ar"
                ? `موقعك التقريبي: ${data.city}`
                : `Near you: ${data.city}`}
            </div>
          )}

          <SuggestionGroup
            icon={<Sparkles className="h-4 w-4 text-terracotta" />}
            label={language === "ar" ? "مخصصة لك" : "For you"}
            items={data.personalized}
            onPick={submitQuery}
          />
          <SuggestionGroup
            icon={<Snowflake className="h-4 w-4 text-sandy-gold" />}
            label={seasonLabel(data.season, language as "ar" | "en")}
            items={data.seasonal}
            onPick={submitQuery}
          />
          <SuggestionGroup
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            label={language === "ar" ? "الأكثر بحثاً" : "Trending now"}
            items={data.trending}
            onPick={submitQuery}
          />

          {!loading &&
            data.personalized.length === 0 &&
            data.seasonal.length === 0 &&
            data.trending.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {language === "ar" ? "ابدأ الكتابة للبحث" : "Start typing to search"}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

interface SuggestionGroupProps {
  icon: React.ReactNode;
  label: string;
  items: string[];
  onPick: (item: string) => void;
}

const SuggestionGroup = ({ icon, label, items, onPick }: SuggestionGroupProps) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="px-4 py-3 border-t border-border/40 first:border-t-0">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            className="px-3 py-1.5 text-sm rounded-full bg-muted/60 hover:bg-primary hover:text-primary-foreground transition-colors border border-border/40"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};
