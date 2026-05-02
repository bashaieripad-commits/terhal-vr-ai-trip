import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, MapPin, Search, SlidersHorizontal, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchBar } from "@/components/SearchBar";
import { GlobalSearch } from "@/components/GlobalSearch";

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  location: string;
  price: number;
  images: string[];
  vr_content: string | null;
  flight_number?: string;
  airline?: string;
  departure_time?: string;
  arrival_time?: string;
}

const mapSearchTypeToFilters = (type: string) => {
  if (type === "flights") return ["flight"];
  if (type === "hotels") return ["hotel"];
  if (type === "activities") return ["activity"];
  return ["all"];
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { language } = useLanguage();
  const [results, setResults] = useState<ContentItem[]>([]);
  const [allResults, setAllResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => mapSearchTypeToFilters(searchParams.get("type") || "all"));
  const [showFilters, setShowFilters] = useState(false);
  const [nameFilter, setNameFilter] = useState(searchParams.get("q") || "");

  // Read search params
  const searchType = searchParams.get("type") || "all";
  const searchQuery = searchParams.get("q") || "";
  const searchFrom = searchParams.get("from") || "";
  const searchTo = searchParams.get("to") || "";
  const searchDate = searchParams.get("date") || "";
  const searchCheckIn = searchParams.get("checkIn") || "";
  const searchCheckOut = searchParams.get("checkOut") || "";

  useEffect(() => {
    setSelectedTypes(mapSearchTypeToFilters(searchType));
  }, [searchType]);

  // Keep the in-page name filter in sync with the URL `q` param so that
  // submitting a query from GlobalSearch (or any link) immediately filters
  // the visible results without requiring extra typing.
  useEffect(() => {
    setNameFilter(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    fetchContent();
  }, [searchParams.toString()]);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const items: ContentItem[] = [];

      let contentQuery = supabase
        .from("content")
        .select("*")
        .eq("is_active", true);

      if (searchType === "hotels") contentQuery = contentQuery.eq("content_type", "hotel");
      if (searchType === "activities") contentQuery = contentQuery.eq("content_type", "activity");

      if (searchQuery) {
        contentQuery = contentQuery.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data: contentData, error: contentError } = await contentQuery.order("created_at", { ascending: false });
      if (contentError) throw contentError;

      const formatted = (contentData || []).map((item) => ({
        id: item.id,
        title: item.title,
        content_type: item.content_type,
        location: item.location || "",
        price: item.price || 0,
        images: Array.isArray(item.images) ? (item.images as string[]) : [],
        vr_content: item.vr_content,
      }));
      items.push(...formatted);

      let flightQuery = supabase
        .from("flights")
        .select("*")
        .eq("status", "scheduled");

      if (searchFrom) flightQuery = flightQuery.ilike("from_city", `%${searchFrom}%`);
      if (searchTo) flightQuery = flightQuery.ilike("to_city", `%${searchTo}%`);
      if (searchDate) flightQuery = flightQuery.gte("departure_time", searchDate);
      if (searchQuery) {
        flightQuery = flightQuery.or(`from_city.ilike.%${searchQuery}%,to_city.ilike.%${searchQuery}%`);
      }

      const { data: flightsData, error: flightsError } = await flightQuery.order("departure_time", { ascending: true });
      if (flightsError) throw flightsError;

      const formattedFlights = (flightsData || []).map((flight) => ({
        id: flight.id,
        title: `${flight.from_city} → ${flight.to_city}`,
        content_type: "flight",
        location: `${flight.from_city} → ${flight.to_city}`,
        price: flight.base_price,
        images: ["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop"],
        vr_content: null,
        flight_number: flight.flight_number,
        airline: flight.airline,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
      }));
      items.push(...formattedFlights);

      setAllResults(items);
      setResults(items);
    } catch (err) {
      console.error("Error fetching content:", err);
      const msg = language === "ar" 
        ? "حدث خطأ أثناء تحميل البيانات. تأكد من اتصالك بالإنترنت وحاول مرة أخرى."
        : "An error occurred while loading data. Check your connection and try again.";
      setError(msg);
      toast.error(language === "ar" ? "خطأ في تحميل البيانات" : "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = (type: string) => {
    setSelectedTypes((prev) => {
      if (type === "all") return ["all"];
      let newTypes = prev.filter((t) => t !== "all");
      if (newTypes.includes(type)) newTypes = newTypes.filter((t) => t !== type);
      else newTypes.push(type);
      return newTypes.length === 0 ? ["all"] : newTypes;
    });
  };

  useEffect(() => {
    let filtered = [...allResults];

    if (!selectedTypes.includes("all")) {
      filtered = filtered.filter((item) => selectedTypes.includes(item.content_type));
    }

    if (nameFilter.trim()) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(nameFilter.toLowerCase()) ||
        item.location.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    filtered = filtered.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1]);

    setResults(filtered);
  }, [selectedTypes, allResults, nameFilter, priceRange]);

  const handleViewDetails = (item: ContentItem) => {
    if (item.content_type === "hotel") navigate(`/hotel/${item.id}`);
    else if (item.content_type === "activity") navigate(`/activity/${item.id}`);
    else if (item.content_type === "flight") navigate(`/flight/${item.id}/seats`);
    else toast.info(language === "ar" ? "قريباً" : "Coming soon");
  };

  const typeFilters = [
    { value: "all", label: language === "ar" ? "الكل" : "All" },
    { value: "hotel", label: language === "ar" ? "فنادق" : "Hotels" },
    { value: "flight", label: language === "ar" ? "رحلات" : "Flights" },
    { value: "activity", label: language === "ar" ? "فعاليات" : "Events" },
  ];

  const getSearchSummary = () => {
    const parts: string[] = [];
    if (searchQuery) parts.push(searchQuery);
    if (searchFrom && searchTo) parts.push(`${searchFrom} → ${searchTo}`);
    else if (searchFrom) parts.push(searchFrom);
    else if (searchTo) parts.push(searchTo);
    if (searchDate) parts.push(searchDate);
    if (searchCheckIn) parts.push(searchCheckIn);
    return parts.length > 0 ? parts.join(" • ") : null;
  };

  const summary = getSearchSummary();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {language === "ar" ? "نتائج البحث" : "Search Results"}
          </h1>
          {summary && (
            <p className="text-primary font-medium text-lg mb-1">
              {summary}
            </p>
          )}
          <p className="text-muted-foreground">
            {loading 
              ? (language === "ar" ? "جاري البحث..." : "Searching...") 
              : (language === "ar" ? `تم العثور على ${results.length} نتيجة` : `Found ${results.length} results`)}
          </p>
        </motion.div>

        {/* Free-text keyword search with suggestions */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlobalSearch variant="hero" />
        </motion.div>

        {/* Inline search bar for refining by type */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchBar />
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{language === "ar" ? "خطأ" : "Error"}</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={fetchContent}>
                  {language === "ar" ? "إعادة المحاولة" : "Retry"}
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Filter chips */}
        <motion.div 
          className="flex flex-wrap items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {typeFilters.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeFilter(type.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedTypes.includes(type.value)
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-md)]"
                  : "bg-card border border-border hover:border-primary/50 text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-card border border-border hover:border-primary/50 text-foreground flex items-center gap-2 transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {language === "ar" ? "فلتر" : "Filter"}
          </button>
        </motion.div>

        {/* Expandable filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="border-2 border-primary/10">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">{language === "ar" ? "بحث بالاسم" : "Search by name"}</label>
                    <Input 
                      placeholder={language === "ar" ? "بحث بالاسم..." : "Filter by name..."} 
                      className="rounded-xl h-11" 
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-sm font-medium">{language === "ar" ? "نطاق السعر" : "Price Range"}</label>
                    <Slider value={priceRange} onValueChange={setPriceRange} max={5000} step={100} className="w-full" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{priceRange[0]} {language === "ar" ? "ر.س" : "SAR"}</span>
                      <span>{priceRange[1]} {language === "ar" ? "ر.س" : "SAR"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground text-lg">{language === "ar" ? "جاري البحث..." : "Searching..."}</p>
          </div>
        ) : results.length === 0 && !error ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-2">
              <CardContent className="py-16 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-2xl font-bold mb-2">
                  {language === "ar" ? "لا توجد نتائج" : "No results found"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {language === "ar" 
                    ? "لم نجد نتائج تطابق بحثك. جرب تغيير معايير البحث أو البحث بكلمات مختلفة."
                    : "We couldn't find results matching your search. Try different search criteria."}
                </p>
                <Button onClick={() => navigate("/search")} variant="outline">
                  {language === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card
                  className="group overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-500 hover:-translate-y-2 border-border/50 cursor-pointer h-full"
                  onClick={() => handleViewDetails(result)}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={result.images[0] || "/placeholder.svg"}
                      alt={result.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {result.vr_content && (
                      <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm gap-1">
                        <Eye className="h-3 w-3" /> VR
                      </Badge>
                    )}
                    <Badge className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-card/90 backdrop-blur-sm text-foreground border-0">
                      {language === "ar" 
                        ? (result.content_type === "hotel" ? "فندق" : 
                           result.content_type === "activity" ? "فعالية" : 
                           result.content_type === "flight" ? "رحلة" : result.content_type)
                        : (result.content_type === "activity" ? "Event" : result.content_type)}
                    </Badge>
                    {result.airline && (
                      <Badge className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground border-0">
                        {result.airline} • {result.flight_number}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{result.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {result.location}
                      </p>
                      {result.departure_time && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(result.departure_time).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", { 
                            weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-sandy-gold text-sandy-gold" />
                        <span className="font-semibold text-sm">4.8</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {result.price} <span className="text-sm font-normal text-muted-foreground">{language === "ar" ? "ر.س" : "SAR"}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
