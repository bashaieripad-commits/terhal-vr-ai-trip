import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Search, Sparkles, Snowflake, TrendingUp, Loader2, MapPin, X, LayoutGrid, Hotel, Plane, CalendarHeart, Compass } from "lucide-react";
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

interface FlatSuggestion {
  text: string;
  group: "personalized" | "seasonal" | "trending";
}

// Recently picked suggestions are stored per language so Arabic and English
// recents don't bleed into each other. Most-recent first, capped at 6.
const RECENTS_KEY = "tarhal:globalSearch:recents";
const RECENTS_LIMIT = 6;

const loadRecents = (language: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    const list = parsed?.[language];
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

const saveRecent = (language: string, term: string) => {
  if (typeof window === "undefined") return;
  const clean = term.trim();
  if (!clean) return;
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const existing = Array.isArray(parsed[language]) ? parsed[language] : [];
    const deduped = [clean, ...existing.filter((x) => x.toLowerCase() !== clean.toLowerCase())];
    parsed[language] = deduped.slice(0, RECENTS_LIMIT);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(parsed));
  } catch {
    // Quota / private mode — ignore.
  }
};

// --- Remote (cross-device) sync helpers --------------------------------------
// When the user is signed in we mirror recents into `user_recent_searches`
// so they sync across devices. Local storage stays as the offline fallback
// and as a buffer that gets merged into the remote store on sign-in.

const loadRecentsRemote = async (
  userId: string,
  language: string,
): Promise<string[]> => {
  const { data, error } = await supabase
    .from("user_recent_searches")
    .select("term, updated_at")
    .eq("user_id", userId)
    .eq("language", language)
    .order("updated_at", { ascending: false })
    .limit(RECENTS_LIMIT);
  if (error) {
    console.warn("recents load (remote) failed", error);
    return [];
  }
  return (data ?? []).map((r) => r.term as string);
};

const saveRecentRemote = async (
  userId: string,
  language: string,
  term: string,
): Promise<void> => {
  const clean = term.trim();
  if (!clean) return;
  // Upsert by (user_id, language, term_lower) so reusing a term bumps it
  // to the top instead of creating duplicates. The DB trigger trims the
  // list to RECENTS_LIMIT per (user, language).
  const { error } = await supabase
    .from("user_recent_searches")
    .upsert(
      {
        user_id: userId,
        language,
        term: clean.slice(0, 200),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,language,term_lower" },
    );
  if (error) console.warn("recents save (remote) failed", error);
};

const clearRecentsRemote = async (
  userId: string,
  language: string,
): Promise<void> => {
  const { error } = await supabase
    .from("user_recent_searches")
    .delete()
    .eq("user_id", userId)
    .eq("language", language);
  if (error) console.warn("recents clear (remote) failed", error);
};

// Merge any local recents into the remote store on sign-in. Oldest first
// so the most recent local pick ends up with the freshest updated_at.
const mergeLocalIntoRemote = async (userId: string, language: string) => {
  const local = loadRecents(language);
  if (local.length === 0) return;
  for (const term of [...local].reverse()) {
    await saveRecentRemote(userId, language, term);
  }
};


const clearRecents = (language: string) => {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    delete parsed[language];
    if (Object.keys(parsed).length === 0) {
      window.localStorage.removeItem(RECENTS_KEY);
    } else {
      window.localStorage.setItem(RECENTS_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
};
export const GlobalSearch = ({ variant = "navbar", className }: GlobalSearchProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { data, loading, fetchSuggestions } = useSearchSuggestions(language as "ar" | "en");
  const [recents, setRecents] = useState<string[]>(() => loadRecents(language));
  const [userId, setUserId] = useState<string | null>(null);

  // Track auth state so recents can sync across devices for signed-in users.
  // We listen first, then read the existing session, per Supabase guidance.
  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUserId(data.session?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Reload recents when the language or auth state changes. For signed-in
  // users we merge any local picks made while signed-out into the remote
  // store, then read the canonical list from the server.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (userId) {
        try {
          await mergeLocalIntoRemote(userId, language);
          // After merging, drop the local copy for this language so the
          // remote store is the single source of truth across devices.
          clearRecents(language);
          const remote = await loadRecentsRemote(userId, language);
          if (!cancelled) setRecents(remote);
        } catch (err) {
          console.warn("recents sync failed", err);
          if (!cancelled) setRecents(loadRecents(language));
        }
      } else {
        if (!cancelled) setRecents(loadRecents(language));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language, userId]);

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

  // Build grouped + filtered suggestion lists. While typing, narrow each
  // group by substring match (case-insensitive) so suggestions react to input.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filterList = (items: string[]) =>
      q ? items.filter((i) => i.toLowerCase().includes(q)) : items;

    // Prepend recently picked suggestions to the personalized group, in
    // most-recent-first order, with case-insensitive de-duplication against
    // the rest of the personalized list.
    const personalizedBase = data.personalized || [];
    const personalizedLower = new Set(personalizedBase.map((p) => p.toLowerCase()));
    const recentFirst = recents.filter((r) => !personalizedLower.has(r.toLowerCase()));
    const mergedPersonalized = [...recentFirst, ...personalizedBase];

    return {
      personalized: filterList(mergedPersonalized),
      seasonal: filterList(data.seasonal || []),
      trending: filterList(data.trending || []),
    };
  }, [query, data, recents]);

  // Flat list used for keyboard navigation in display order.
  const flat = useMemo<FlatSuggestion[]>(() => {
    return [
      ...filtered.personalized.map((t) => ({ text: t, group: "personalized" as const })),
      ...filtered.seasonal.map((t) => ({ text: t, group: "seasonal" as const })),
      ...filtered.trending.map((t) => ({ text: t, group: "trending" as const })),
    ];
  }, [filtered]);

  // Reset highlight when the filtered set changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query, data]);

  const submitQuery = useCallback(
    async (raw: string) => {
      const term = raw.trim();
      if (!term) return;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const { error: logError } = await supabase.from("search_queries").insert({
          query: term.slice(0, 200),
          city: data.city,
          language,
          user_id: sessionData.session?.user.id ?? null,
        });
        if (logError && logError.code !== "23505") {
          console.warn("search log failed", logError);
        }
      } catch (err) {
        console.warn("search log failed", err);
      }
      // Persist this pick so it appears at the top of "For you" next time.
      // Signed-in users get cross-device sync via the remote table; others
      // fall back to localStorage only.
      if (userId) {
        await saveRecentRemote(userId, language, term);
        const remote = await loadRecentsRemote(userId, language);
        setRecents(remote);
      } else {
        saveRecent(language, term);
        setRecents(loadRecents(language));
      }
      setOpen(false);
      navigate(`/search?type=all&q=${encodeURIComponent(term)}`);
    },
    [data.city, language, navigate, userId],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < flat.length) {
      submitQuery(flat[activeIndex].text);
    } else {
      submitQuery(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      fetchSuggestions();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flat.length === 0) return;
      setActiveIndex((i) => (i + 1 >= flat.length ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flat.length === 0) return;
      setActiveIndex((i) => (i <= 0 ? flat.length - 1 : i - 1));
    } else if (e.key === "Home") {
      if (flat.length) {
        e.preventDefault();
        setActiveIndex(0);
      }
    } else if (e.key === "End") {
      if (flat.length) {
        e.preventDefault();
        setActiveIndex(flat.length - 1);
      }
    }
  };

  // Scroll the active option into view.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-suggestion-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const placeholder = language === "ar"
    ? "ابحث عن وجهة، فندق، رحلة، نشاط..."
    : "Search destinations, hotels, flights, activities…";

  const wrapperClass = cn(
    "relative w-full",
    variant === "navbar" ? "max-w-md" : "max-w-2xl mx-auto",
    className,
  );

  const showEmpty =
    !loading &&
    flat.length === 0 &&
    (data.personalized.length || data.seasonal.length || data.trending.length) === 0;

  const showNoMatch =
    !loading &&
    flat.length === 0 &&
    query.trim().length > 0 &&
    (data.personalized.length || data.seasonal.length || data.trending.length) > 0;

  const activeId = activeIndex >= 0 ? `gs-opt-${activeIndex}` : undefined;

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
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0",
              variant === "navbar" ? "h-9 text-sm" : "h-12 text-base",
            )}
            aria-label={placeholder}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="gs-listbox"
            aria-activedescendant={activeId}
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
          ref={listRef}
          id="gs-listbox"
          className={cn(
            "absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-border/60 bg-popover shadow-[var(--shadow-lg)] overflow-hidden max-h-[70vh] overflow-y-auto",
            "animate-in fade-in-0 slide-in-from-top-1",
          )}
          role="listbox"
        >
          {loading && flat.length === 0 && (
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
            items={filtered.personalized}
            offset={0}
            activeIndex={activeIndex}
            onPick={submitQuery}
            onHover={setActiveIndex}
            action={
              recents.length > 0 ? (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    clearRecents(language);
                    setRecents([]);
                    if (userId) {
                      // Fire-and-forget: also wipe the remote copy so the
                      // clear propagates to other devices on next load.
                      void clearRecentsRemote(userId, language);
                    }
                  }}
                  className="ml-auto rtl:ml-0 rtl:mr-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors normal-case"
                  aria-label={language === "ar" ? "مسح الاقتراحات الأخيرة" : "Clear recent suggestions"}
                  title={language === "ar" ? "مسح الاقتراحات الأخيرة" : "Clear recent suggestions"}
                >
                  <X className="h-3 w-3" />
                  {language === "ar" ? "مسح" : "Clear"}
                </button>
              ) : null
            }
          />
          <SuggestionGroup
            icon={<Snowflake className="h-4 w-4 text-sandy-gold" />}
            label={seasonLabel(data.season, language as "ar" | "en")}
            items={filtered.seasonal}
            offset={filtered.personalized.length}
            activeIndex={activeIndex}
            onPick={submitQuery}
            onHover={setActiveIndex}
          />
          <SuggestionGroup
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            label={language === "ar" ? "الأكثر بحثاً" : "Trending now"}
            items={filtered.trending}
            offset={filtered.personalized.length + filtered.seasonal.length}
            activeIndex={activeIndex}
            onPick={submitQuery}
            onHover={setActiveIndex}
          />

          {showNoMatch && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {language === "ar"
                ? `اضغط بحث للبحث عن "${query.trim()}"`
                : `Press search to look up "${query.trim()}"`}
            </div>
          )}

          {showEmpty && (
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
  offset: number;
  activeIndex: number;
  onPick: (item: string) => void;
  onHover: (index: number) => void;
  action?: React.ReactNode;
}

const SuggestionGroup = ({
  icon,
  label,
  items,
  offset,
  activeIndex,
  onPick,
  onHover,
  action,
}: SuggestionGroupProps) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="px-4 py-3 border-t border-border/40 first:border-t-0">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
        {action}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => {
          const idx = offset + i;
          const isActive = idx === activeIndex;
          return (
            <button
              key={item}
              type="button"
              id={`gs-opt-${idx}`}
              data-suggestion-index={idx}
              role="option"
              aria-selected={isActive}
              onMouseDown={(e) => {
                // Prevent input blur before click fires.
                e.preventDefault();
                onPick(item);
              }}
              onMouseEnter={() => onHover(idx)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/60 hover:bg-primary hover:text-primary-foreground border-border/40",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};
