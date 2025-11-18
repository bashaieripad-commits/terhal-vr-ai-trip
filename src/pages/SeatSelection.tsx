import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plane, ArrowLeft, Info } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";

interface Seat {
  id: string;
  seat_number: string;
  seat_class: string;
  seat_row: number;
  seat_column: string;
  is_available: boolean;
  is_window: boolean;
  is_aisle: boolean;
  price_modifier: number;
}

interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  base_price: number;
}

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchFlightAndSeats();
    }
  }, [id]);

  const fetchFlightAndSeats = async () => {
    try {
      const { data: flightData, error: flightError } = await supabase
        .from("flights")
        .select("*")
        .eq("id", id)
        .single();

      if (flightError) throw flightError;
      setFlight(flightData);

      const { data: seatsData, error: seatsError } = await supabase
        .from("seats")
        .select("*")
        .eq("flight_id", id)
        .order("seat_row", { ascending: true })
        .order("seat_column", { ascending: true });

      if (seatsError) throw seatsError;
      setSeats(seatsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const getSeatsByRow = () => {
    const rows: { [key: number]: Seat[] } = {};
    seats.forEach((seat) => {
      if (!rows[seat.seat_row]) {
        rows[seat.seat_row] = [];
      }
      rows[seat.seat_row].push(seat);
    });
    return rows;
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available) return;
    setSelectedSeat(seat);
  };

  const handleConfirmBooking = () => {
    if (!selectedSeat || !flight) return;

    const totalPrice = flight.base_price + selectedSeat.price_modifier;
    
    const cartItem: CartItem = {
      id: `${flight.id}-${selectedSeat.id}`,
      type: "flight",
      name: `رحلة ${flight.airline} - ${flight.flight_number}`,
      location: `من ${flight.from_city} إلى ${flight.to_city}`,
      price: totalPrice,
      image: "/placeholder.svg",
      checkIn: new Date(flight.departure_time).toISOString().split('T')[0],
      checkOut: new Date(flight.departure_time).toISOString().split('T')[0],
    };

    addItem(cartItem);
    navigate("/checkout");
  };

  const getSeatClass = (seat: Seat) => {
    if (!seat.is_available) return "bg-muted cursor-not-allowed";
    if (selectedSeat?.id === seat.id) return "bg-primary text-primary-foreground";
    
    switch (seat.seat_class) {
      case "first":
        return "bg-amber-100 hover:bg-amber-200 border-amber-300";
      case "business":
        return "bg-blue-100 hover:bg-blue-200 border-blue-300";
      default:
        return "bg-green-100 hover:bg-green-200 border-green-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">الرحلة غير موجودة</p>
        </div>
      </div>
    );
  }

  const seatsByRow = getSeatsByRow();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/flights")} className="mb-4">
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للرحلات
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  اختر مقعدك - {flight.airline} {flight.flight_number}
                </CardTitle>
                <CardDescription>
                  من {flight.from_city} إلى {flight.to_city}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 border-2 border-amber-300 rounded"></div>
                    <span className="text-sm">درجة أولى</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded"></div>
                    <span className="text-sm">درجة الأعمال</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 border-2 border-green-300 rounded"></div>
                    <span className="text-sm">الدرجة السياحية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted border-2 rounded"></div>
                    <span className="text-sm">محجوز</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary border-2 rounded"></div>
                    <span className="text-sm">مختار</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-8 text-center font-semibold text-sm text-muted-foreground">
                        {row}
                      </span>
                      <div className="flex gap-2">
                        {rowSeats.map((seat, idx) => (
                          <div key={seat.id} className="flex items-center">
                            <button
                              onClick={() => handleSeatClick(seat)}
                              disabled={!seat.is_available}
                              className={`
                                w-10 h-10 rounded border-2 font-semibold text-xs
                                transition-all duration-200
                                ${getSeatClass(seat)}
                                ${seat.is_available ? 'hover:scale-110' : ''}
                              `}
                              title={`${seat.seat_number} - ${seat.seat_class} - ${
                                seat.is_available ? 'متاح' : 'محجوز'
                              }`}
                            >
                              {seat.seat_column}
                            </button>
                            {/* Aisle spacing */}
                            {seat.seat_column === 'C' && (
                              <div className="w-4"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>ملخص الحجز</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSeat ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المقعد:</span>
                        <span className="font-semibold">{selectedSeat.seat_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الدرجة:</span>
                        <Badge>
                          {selectedSeat.seat_class === 'first'
                            ? 'درجة أولى'
                            : selectedSeat.seat_class === 'business'
                            ? 'درجة الأعمال'
                            : 'سياحية'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">النوع:</span>
                        <span>
                          {selectedSeat.is_window
                            ? 'نافذة'
                            : selectedSeat.is_aisle
                            ? 'ممر'
                            : 'وسط'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">سعر الرحلة:</span>
                        <span>{flight.base_price} ريال</span>
                      </div>
                      {selectedSeat.price_modifier > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">إضافة المقعد:</span>
                          <span>+{selectedSeat.price_modifier} ريال</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>الإجمالي:</span>
                        <span className="text-primary">
                          {flight.base_price + selectedSeat.price_modifier} ريال
                        </span>
                      </div>
                    </div>

                    <Button onClick={handleConfirmBooking} className="w-full" size="lg">
                      تأكيد الحجز
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">اختر مقعدك من الخريطة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
