import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { CalendarIcon, Download, Loader2, RefreshCw, Search, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchRow {
  query: string;
  normalized_query: string | null;
  city: string | null;
  language: string | null;
  created_at: string;
}

interface PhraseRow {
  normalized: string;
  display: string;
  count: number;
  cities: Set<string>;
  languages: Set<string>;
  lastSeen: string;
}

const ALL = "__all__";
const MAX_ROWS = 5000;

const SearchTrends = () => {
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [to, setTo] = useState<Date>(() => new Date());
  const [city, setCity] = useState<string>(ALL);
  const [language, setLanguage] = useState<string>(ALL);
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<"phrase" | "day" | "city" | "language">("phrase");

  const load = async () => {
    setLoading(true);
    try {
      const fromIso = new Date(from);
      fromIso.setHours(0, 0, 0, 0);
      const toIso = new Date(to);
      toIso.setHours(23, 59, 59, 999);

      let q = supabase
        .from("search_queries")
        .select("query, normalized_query, city, language, created_at")
        .gte("created_at", fromIso.toISOString())
        .lte("created_at", toIso.toISOString())
        .order("created_at", { ascending: false })
        .limit(MAX_ROWS);

      if (city !== ALL) q = q.eq("city", city);
      if (language !== ALL) q = q.eq("language", language);

      const { data, error } = await q;
      if (error) throw error;
      setRows((data ?? []) as SearchRow[]);
    } catch (e) {
      console.error(e);
      toast.error("فشل تحميل بيانات البحث");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, city, language]);

  // Distinct filter options derived from a small all-time sample.
  const [filterOptions, setFilterOptions] = useState<{ cities: string[]; languages: string[] }>({
    cities: [],
    languages: [],
  });
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("search_queries")
        .select("city, language")
        .order("created_at", { ascending: false })
        .limit(2000);
      const cities = new Set<string>();
      const languages = new Set<string>();
      for (const r of data ?? []) {
        if (r.city) cities.add(r.city);
        if (r.language) languages.add(r.language);
      }
      setFilterOptions({
        cities: Array.from(cities).sort(),
        languages: Array.from(languages).sort(),
      });
    })();
  }, []);

  const phrases = useMemo<PhraseRow[]>(() => {
    const map = new Map<string, PhraseRow & { displays: Map<string, number> }>();
    for (const r of rows) {
      const norm = (r.normalized_query || r.query || "").trim().toLowerCase();
      if (!norm) continue;
      const display = (r.query || "").trim();
      const existing = map.get(norm);
      if (existing) {
        existing.count += 1;
        if (display) existing.displays.set(display, (existing.displays.get(display) ?? 0) + 1);
        if (r.city) existing.cities.add(r.city);
        if (r.language) existing.languages.add(r.language);
        if (r.created_at > existing.lastSeen) existing.lastSeen = r.created_at;
      } else {
        const displays = new Map<string, number>();
        if (display) displays.set(display, 1);
        map.set(norm, {
          normalized: norm,
          display,
          count: 1,
          cities: new Set(r.city ? [r.city] : []),
          languages: new Set(r.language ? [r.language] : []),
          lastSeen: r.created_at,
          displays,
        });
      }
    }
    const list: PhraseRow[] = Array.from(map.values()).map((p) => {
      let bestDisplay = p.display;
      let bestCount = -1;
      for (const [d, c] of p.displays) {
        if (c > bestCount) {
          bestDisplay = d;
          bestCount = c;
        }
      }
      return {
        normalized: p.normalized,
        display: bestDisplay || p.normalized,
        count: p.count,
        cities: p.cities,
        languages: p.languages,
        lastSeen: p.lastSeen,
      };
    });

    const term = search.trim().toLowerCase();
    const filtered = term
      ? list.filter(
          (p) => p.normalized.includes(term) || p.display.toLowerCase().includes(term),
        )
      : list;
    return filtered.sort((a, b) => b.count - a.count).slice(0, 100);
  }, [rows, search]);

  const dimensionData = useMemo(() => {
    if (groupBy === "phrase") return [];
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const r of rows) {
      let key: string;
      let label: string;
      if (groupBy === "day") {
        key = r.created_at.slice(0, 10);
        label = key;
      } else if (groupBy === "city") {
        key = r.city ?? "—";
        label = r.city ?? "(unknown)";
      } else {
        key = r.language ?? "—";
        label = (r.language ?? "(unknown)").toUpperCase();
      }
      const cur = map.get(key);
      if (cur) cur.count += 1;
      else map.set(key, { key, label, count: 1 });
    }
    const arr = Array.from(map.values());
    return groupBy === "day"
      ? arr.sort((a, b) => a.key.localeCompare(b.key))
      : arr.sort((a, b) => b.count - a.count).slice(0, 20);
  }, [rows, groupBy]);

  const totalSearches = rows.length;
  const uniquePhrases = phrases.length;
  const maxCount = phrases[0]?.count ?? 1;
  const maxDimCount = dimensionData[0]?.count ?? 1;
  const truncated = totalSearches >= MAX_ROWS;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              اتجاهات البحث / Search Trends
            </CardTitle>
            <CardDescription>
              أهم العبارات المُبحوثة حسب اليوم والمدينة واللغة
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv({ phrases, dimensionData, groupBy, from, to, city, language })}
              disabled={loading || (groupBy === "phrase" ? phrases.length === 0 : dimensionData.length === 0)}
            >
              <Download className="w-4 h-4 mr-2" />
              تصدير CSV
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              تحديث
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">من</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !from && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {from ? format(from, "yyyy-MM-dd") : "اختر تاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={from}
                  onSelect={(d) => d && setFrom(d)}
                  disabled={(date) => date > to || date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">إلى</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !to && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {to ? format(to, "yyyy-MM-dd") : "اختر تاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={to}
                  onSelect={(d) => d && setTo(d)}
                  disabled={(date) => date < from || date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">المدينة</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="كل المدن" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value={ALL}>كل المدن</SelectItem>
                {filterOptions.cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">اللغة</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="كل اللغات" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value={ALL}>كل اللغات</SelectItem>
                {filterOptions.languages.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">بحث ضمن العبارات</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="filter…"
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="إجمالي عمليات البحث" value={totalSearches} suffix={truncated ? "+" : ""} />
          <Stat label="عبارات فريدة" value={uniquePhrases} />
          <Stat
            label="مدى التواريخ"
            value={`${format(from, "MM-dd")} → ${format(to, "MM-dd")}`}
            isText
          />
        </div>

        {truncated && (
          <p className="text-xs text-muted-foreground">
            تم عرض أحدث {MAX_ROWS.toLocaleString()} بحث ضمن النطاق المحدد. ضيِّق الفلاتر لرؤية كل النتائج.
          </p>
        )}

        {/* Group-by switcher */}
        <div className="flex flex-wrap gap-2">
          {([
            { v: "phrase", l: "حسب العبارة" },
            { v: "day", l: "حسب اليوم" },
            { v: "city", l: "حسب المدينة" },
            { v: "language", l: "حسب اللغة" },
          ] as const).map((opt) => (
            <Button
              key={opt.v}
              size="sm"
              variant={groupBy === opt.v ? "default" : "outline"}
              onClick={() => setGroupBy(opt.v)}
            >
              {opt.l}
            </Button>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري التحميل…
          </div>
        ) : groupBy === "phrase" ? (
          phrases.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>العبارة</TableHead>
                  <TableHead className="w-32">العدد</TableHead>
                  <TableHead className="hidden md:table-cell">المدن</TableHead>
                  <TableHead className="hidden md:table-cell">اللغات</TableHead>
                  <TableHead className="hidden lg:table-cell">آخر ظهور</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phrases.map((p, i) => (
                  <TableRow key={p.normalized}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{p.display}</div>
                      {p.display.toLowerCase() !== p.normalized && (
                        <div className="text-xs text-muted-foreground">{p.normalized}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <CountBar count={p.count} max={maxCount} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <ChipList items={Array.from(p.cities)} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <ChipList items={Array.from(p.languages).map((l) => l.toUpperCase())} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {format(new Date(p.lastSeen), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        ) : dimensionData.length === 0 ? (
          <EmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {groupBy === "day" ? "اليوم" : groupBy === "city" ? "المدينة" : "اللغة"}
                </TableHead>
                <TableHead className="w-1/2">عمليات البحث</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dimensionData.map((d) => (
                <TableRow key={d.key}>
                  <TableCell className="font-medium">{d.label}</TableCell>
                  <TableCell>
                    <CountBar count={d.count} max={maxDimCount} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const Stat = ({
  label,
  value,
  suffix = "",
  isText = false,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  isText?: boolean;
}) => (
  <div className="rounded-lg border bg-card p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-xl font-semibold mt-1">
      {isText ? value : `${(value as number).toLocaleString()}${suffix}`}
    </div>
  </div>
);

const CountBar = ({ count, max }: { count: number; max: number }) => {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 bg-muted rounded-full flex-1 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm tabular-nums w-10 text-right">{count}</span>
    </div>
  );
};

const ChipList = ({ items }: { items: string[] }) => {
  if (items.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((it) => (
        <Badge key={it} variant="secondary" className="text-[10px] py-0 px-1.5">
          {it}
        </Badge>
      ))}
      {extra > 0 && (
        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
          +{extra}
        </Badge>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-12 text-muted-foreground text-sm">
    لا توجد بيانات بحث ضمن النطاق المحدد.
  </div>
);

export default SearchTrends;
