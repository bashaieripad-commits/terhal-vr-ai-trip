import { useCallback, useEffect, useState } from "react";
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

interface PhraseRow {
  normalized: string;
  display: string;
  count: number;
  cities: string[];
  languages: string[];
  lastSeen: string;
}

interface DimRow {
  key: string;
  label: string;
  count: number;
}

interface TrendsResponse {
  kpis: { total: number; uniquePhrases: number; truncated: boolean };
  rows: PhraseRow[] | DimRow[];
  filters: { cities: string[]; languages: string[] };
}

const ALL = "__all__";
type GroupBy = "phrase" | "day" | "city" | "language";

const SearchTrends = () => {
  const [phrases, setPhrases] = useState<PhraseRow[]>([]);
  const [dimensionData, setDimensionData] = useState<DimRow[]>([]);
  const [kpis, setKpis] = useState<{ total: number; uniquePhrases: number; truncated: boolean }>({
    total: 0,
    uniquePhrases: 0,
    truncated: false,
  });
  const [filterOptions, setFilterOptions] = useState<{ cities: string[]; languages: string[] }>({
    cities: [],
    languages: [],
  });

  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [to, setTo] = useState<Date>(() => new Date());
  const [city, setCity] = useState<string>(ALL);
  const [language, setLanguage] = useState<string>(ALL);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("phrase");

  // Debounce free-text search → server.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fromIso = new Date(from);
      fromIso.setHours(0, 0, 0, 0);
      const toIso = new Date(to);
      toIso.setHours(23, 59, 59, 999);

      const { data, error } = await supabase.functions.invoke<TrendsResponse>("search-trends", {
        body: {
          from: fromIso.toISOString(),
          to: toIso.toISOString(),
          city: city === ALL ? null : city,
          language: language === ALL ? null : language,
          search: search || null,
          groupBy,
          limit: groupBy === "phrase" ? 100 : 50,
        },
      });
      if (error) throw error;
      const resp = data as TrendsResponse;
      setKpis(resp.kpis);
      setFilterOptions(resp.filters);
      if (groupBy === "phrase") {
        setPhrases(resp.rows as PhraseRow[]);
        setDimensionData([]);
      } else {
        setPhrases([]);
        setDimensionData(resp.rows as DimRow[]);
      }
    } catch (e) {
      console.error(e);
      toast.error("فشل تحميل بيانات البحث");
      setPhrases([]);
      setDimensionData([]);
      setKpis({ total: 0, uniquePhrases: 0, truncated: false });
    } finally {
      setLoading(false);
    }
  }, [from, to, city, language, search, groupBy]);

  useEffect(() => {
    load();
  }, [load]);

  const totalSearches = kpis.total;
  const uniquePhrases = kpis.uniquePhrases;
  const truncated = kpis.truncated;
  const maxCount = phrases[0]?.count ?? 1;
  const maxDimCount = dimensionData[0]?.count ?? 1;

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
            تم عرض أهم {phrases.length.toLocaleString()} عبارة من أصل {uniquePhrases.toLocaleString()}. ضيِّق الفلاتر لرؤية المزيد.
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

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
  // BOM so Excel renders Arabic + UTF-8 correctly.
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface ExportArgs {
  phrases: PhraseRow[];
  dimensionData: { key: string; label: string; count: number }[];
  groupBy: "phrase" | "day" | "city" | "language";
  from: Date;
  to: Date;
  city: string;
  language: string;
}

function exportCsv({ phrases, dimensionData, groupBy, from, to, city, language }: ExportArgs) {
  const fromStr = format(from, "yyyy-MM-dd");
  const toStr = format(to, "yyyy-MM-dd");
  const cityPart = city === ALL ? "all-cities" : city.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const langPart = language === ALL ? "all-langs" : language.toLowerCase();
  const filename = `search-trends_${groupBy}_${fromStr}_to_${toStr}_${cityPart}_${langPart}.csv`;

  // Metadata header rows so the CSV is self-describing.
  const meta: (string | number)[][] = [
    ["# Search Trends Export"],
    ["# Generated", new Date().toISOString()],
    ["# Date range", `${fromStr} → ${toStr}`],
    ["# City filter", city === ALL ? "All" : city],
    ["# Language filter", language === ALL ? "All" : language.toUpperCase()],
    ["# Group by", groupBy],
    [],
  ];

  let dataRows: (string | number)[][];
  if (groupBy === "phrase") {
    dataRows = [
      ["Rank", "Phrase", "Normalized", "Count", "Cities", "Languages", "Last seen (UTC)"],
      ...phrases.map((p, i) => [
        i + 1,
        p.display,
        p.normalized,
        p.count,
        Array.from(p.cities).sort().join("; "),
        Array.from(p.languages).map((l) => l.toUpperCase()).sort().join("; "),
        p.lastSeen,
      ]),
    ];
  } else {
    const header =
      groupBy === "day" ? "Day" : groupBy === "city" ? "City" : "Language";
    dataRows = [
      [header, "Searches"],
      ...dimensionData.map((d) => [d.label, d.count]),
    ];
  }

  downloadCsv(filename, [...meta, ...dataRows]);
  toast.success(`تم تصدير ${dataRows.length - 1} صف`);
}

export default SearchTrends;
