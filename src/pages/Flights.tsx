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
import { Plane, Calendar, Clock, MapPin, Users, DollarSign } from "lucide-react";

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
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      let query = supabase
        .from("flights")
        .select("*")
        .eq("status", "scheduled")
        .order("departure_time", { ascending: true });

      if (searchFrom) {
        query = query.ilike("from_city", `%${searchFrom}%`);
      }
      if (searchTo) {
        query = query.ilike("to_city", `%${searchTo}%`);
      }
      if (searchDate) {
        query = query.gte("departure_time", searchDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFlights(data || []);
    } catch (error) {
      console.error("Error fetching flights:", error);
      toast.error("خطأ في تحميل الرحلات");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchFlights();
  };

  const handleSelectFlight = (flightId: string) => {
    navigate(`/flight/${flightId}/seats`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Plane className="w-10 h-10 text-primary" />
            الرحلات الجوية
          </h1>
          <p className="text-muted-foreground">ابحث عن رحلتك واختر مقعدك المفضل</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>البحث عن رحلات</CardTitle>
            <CardDescription>أدخل معلومات رحلتك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="from">من</Label>
                <Input
                  id="from"
                  placeholder="المدينة"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">إلى</Label>
                <Input
                  id="to"
                  placeholder="المدينة"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري البحث..." : "بحث"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Flights List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">جاري تحميل الرحلات...</p>
          </div>
        ) : flights.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">لا توجد رحلات متاحة</h3>
              <p className="text-muted-foreground">جرب البحث بمعايير أخرى</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {flights.map((flight) => (
              <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-5 gap-4 items-center">
                    {/* Flight Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-sm">
                          {flight.airline}
                        </Badge>
                        <span className="text-sm font-mono text-muted-foreground">
                          {flight.flight_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{flight.from_city}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(flight.departure_time).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-full h-px bg-border relative">
                            <Plane className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-primary" />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{flight.to_city}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(flight.arrival_time).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(flight.departure_time).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          البوابة {flight.gate} - المبنى {flight.terminal}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {flight.available_seats} مقعد متاح من {flight.total_seats}
                        </span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="md:col-span-2 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">يبدأ من</div>
                        <div className="text-3xl font-bold text-primary flex items-center gap-1">
                          {flight.base_price}
                          <span className="text-lg">ريال</span>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => handleSelectFlight(flight.id)}
                        disabled={flight.available_seats === 0}
                      >
                        {flight.available_seats === 0 ? "مكتمل" : "اختر مقعدك"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flights;
