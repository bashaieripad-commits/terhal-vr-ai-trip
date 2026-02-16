import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plane, Calendar, Clock, MapPin, Users, DollarSign, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  available_seats: number;
  total_seats: number;
  gate: string;
  terminal: string;
}

const Flights = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => { fetchFlights(); }, []);

  const fetchFlights = async () => {
    try {
      let query = supabase.from("flights").select("*").eq("status", "scheduled").order("departure_time", { ascending: true });
      if (searchFrom) query = query.ilike("from_city", `%${searchFrom}%`);
      if (searchTo) query = query.ilike("to_city", `%${searchTo}%`);
      if (searchDate) query = query.gte("departure_time", searchDate);
      const { data, error } = await query;
      if (error) throw error;
      setFlights(data || []);
    } catch (error) {
      console.error("Error fetching flights:", error);
      toast.error(language === "ar" ? "خطأ في تحميل الرحلات" : "Error loading flights");
    } finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setLoading(true); fetchFlights(); };
  const handleSelectFlight = (flightId: string) => { navigate(`/flight/${flightId}/seats`); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.header 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta to-sandy-gold flex items-center justify-center">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {language === "ar" ? "الرحلات الجوية" : "Flights"}
              </h1>
              <p className="text-muted-foreground">
                {language === "ar" ? "ابحث عن رحلتك واختر مقعدك المفضل" : "Find your flight and choose your seat"}
              </p>
            </div>
          </div>
        </motion.header>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="mb-10 border-2 border-primary/10 shadow-[var(--shadow-md)]">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="from" className="text-foreground/80">{language === "ar" ? "من" : "From"}</Label>
                  <Input id="from" placeholder={language === "ar" ? "المدينة" : "City"} value={searchFrom} onChange={(e) => setSearchFrom(e.target.value)} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to" className="text-foreground/80">{language === "ar" ? "إلى" : "To"}</Label>
                  <Input id="to" placeholder={language === "ar" ? "المدينة" : "City"} value={searchTo} onChange={(e) => setSearchTo(e.target.value)} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-foreground/80">{language === "ar" ? "التاريخ" : "Date"}</Label>
                  <Input id="date" type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="rounded-xl h-12" />
                </div>
                <div className="flex items-end">
                  <Button type="submit" variant="hero" className="w-full h-12 rounded-xl" disabled={loading}>
                    <Search className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {loading ? (language === "ar" ? "جاري البحث..." : "Searching...") : (language === "ar" ? "بحث" : "Search")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flights List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : flights.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-2">
              <CardContent className="py-16 text-center">
                <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
                <h3 className="text-2xl font-bold mb-2">{language === "ar" ? "لا توجد رحلات متاحة" : "No flights available"}</h3>
                <p className="text-muted-foreground">{language === "ar" ? "جرب البحث بمعايير أخرى" : "Try different criteria"}</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {flights.map((flight, i) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Card className="group hover:shadow-[var(--shadow-lg)] hover:border-primary/30 transition-all duration-300 border-2 border-border/50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-5 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-sm rounded-lg">{flight.airline}</Badge>
                          <span className="text-sm font-mono text-muted-foreground">{flight.flight_number}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{flight.from_city}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(flight.departure_time).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <div className="w-full h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50 relative">
                              <div className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-full border-2 border-primary flex items-center justify-center">
                                <Plane className="w-4 h-4 text-primary" />
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{flight.to_city}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(flight.arrival_time).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-primary" /><span>{new Date(flight.departure_time).toLocaleDateString("ar-SA")}</span></div>
                        <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-primary" /><span>{language === "ar" ? `البوابة ${flight.gate} - المبنى ${flight.terminal}` : `Gate ${flight.gate} - Terminal ${flight.terminal}`}</span></div>
                        <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-primary" /><span>{flight.available_seats} {language === "ar" ? "مقعد متاح" : "seats available"}</span></div>
                      </div>
                      <div className="md:col-span-2 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">{language === "ar" ? "يبدأ من" : "Starting from"}</div>
                          <div className="text-3xl font-bold text-primary">{flight.base_price} <span className="text-base font-normal text-muted-foreground">{language === "ar" ? "ر.س" : "SAR"}</span></div>
                        </div>
                        <Button size="lg" variant="hero" onClick={() => handleSelectFlight(flight.id)} disabled={flight.available_seats === 0} className="rounded-xl">
                          {flight.available_seats === 0 ? (language === "ar" ? "مكتمل" : "Full") : (language === "ar" ? "اختر مقعدك" : "Select Seat")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Flights;
