import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, MapPin, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const SearchResults = () => {
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { language } = useLanguage();
  const [results, setResults] = useState<ContentItem[]>([]);
  const [allResults, setAllResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["all"]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch content (hotels, activities)
      const { data: contentData, error: contentError } = await supabase
        .from("content")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (contentError) throw contentError;

      // Fetch flights
      const { data: flightsData, error: flightsError } = await supabase
        .from("flights")
        .select("*")
        .eq("status", "scheduled")
        .order("departure_time", { ascending: true });

      if (flightsError) throw flightsError;
      
      const formattedContent: ContentItem[] = (contentData || []).map((item) => ({
        id: item.id,
        title: item.title,
        content_type: item.content_type,
        location: item.location || "",
        price: item.price || 0,
        images: Array.isArray(item.images) ? (item.images as string[]) : [],
        vr_content: item.vr_content,
      }));

      const formattedFlights: ContentItem[] = (flightsData || []).map((flight) => ({
        id: flight.id,
        title: `${flight.from_city} - ${flight.to_city}`,
        content_type: "flight",
        location: `${flight.from_city} إلى ${flight.to_city}`,
        price: flight.base_price,
        images: ["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop"],
        vr_content: null,
        flight_number: flight.flight_number,
        airline: flight.airline,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
      }));

      const allData = [...formattedContent, ...formattedFlights];
      
      setAllResults(allData);
      setResults(allData);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error(language === "ar" ? "خطأ في تحميل البيانات" : "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = (type: string) => {
    setSelectedTypes((prev) => {
      if (type === "all") {
        return ["all"];
      }
      
      let newTypes = prev.filter((t) => t !== "all");
      
      if (newTypes.includes(type)) {
        newTypes = newTypes.filter((t) => t !== type);
      } else {
        newTypes.push(type);
      }
      
      if (newTypes.length === 0) {
        return ["all"];
      }
      
      return newTypes;
    });
  };

  useEffect(() => {
    if (selectedTypes.includes("all")) {
      setResults(allResults);
    } else {
      const filtered = allResults.filter((item) =>
        selectedTypes.includes(item.content_type)
      );
      setResults(filtered);
    }
  }, [selectedTypes, allResults]);

  const handleViewDetails = (item: ContentItem) => {
    if (item.content_type === "hotel") {
      navigate(`/hotel/${item.id}`);
    } else if (item.content_type === "activity") {
      navigate(`/activity/${item.id}`);
    } else if (item.content_type === "flight") {
      navigate(`/flight/${item.id}/seats`);
    } else {
      toast.info(language === "ar" ? "قريباً" : "Coming soon");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Filter Results
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input placeholder="Filter by name..." />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Price Range</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === "ar" ? "النوع" : "Type"}
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: language === "ar" ? "الكل" : "All" },
                      { value: "hotel", label: language === "ar" ? "فنادق" : "Hotels" },
                      { value: "flight", label: language === "ar" ? "رحلات" : "Flights" },
                      { value: "activity", label: language === "ar" ? "فعاليات" : "Events" },
                    ].map((type) => (
                      <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedTypes.includes(type.value)}
                          onChange={() => handleTypeFilter(type.value)}
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm">VR Available Only</span>
                  </label>
                </div>

                <Button variant="hero" className="w-full">
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {language === "ar" ? "نتائج البحث" : "Search Results"}
              </h1>
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? `تم العثور على ${results.length} نتيجة`
                  : `Found ${results.length} results`}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === "ar" ? "جاري التحميل..." : "Loading..."}
                </p>
              </div>
            ) : results.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    {language === "ar" ? "لا توجد نتائج" : "No results found"}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === "ar" ? "جرب البحث بمعايير أخرى" : "Try different search criteria"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={result.images[0] || "/placeholder.svg"}
                        alt={result.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      {result.vr_content && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          <Eye className="h-3 w-3 mr-1" />
                          VR
                        </Badge>
                      )}
                      <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
                        {language === "ar" 
                          ? (result.content_type === "hotel" ? "فندق" : 
                             result.content_type === "activity" ? "فعالية" : 
                             result.content_type === "flight" ? "رحلة" : result.content_type)
                          : (result.content_type === "activity" ? "Event" : result.content_type)}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg">{result.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.location}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">4.8</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {result.price} {language === "ar" ? "ر.س" : "SAR"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.content_type === "hotel" 
                              ? (language === "ar" ? "لكل ليلة" : "per night")
                              : (language === "ar" ? "للشخص" : "per person")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          variant="outline"
                          onClick={() => handleViewDetails(result)}
                        >
                          {language === "ar" ? "التفاصيل" : "Details"}
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => handleViewDetails(result)}
                        >
                          {language === "ar" ? "احجز الآن" : "Book Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
