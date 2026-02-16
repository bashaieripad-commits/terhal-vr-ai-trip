import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarIcon, MapPin, Star, Eye, ShoppingCart, ArrowLeft, Wifi, Car, Dumbbell, UtensilsCrossed } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { VRViewer } from "@/components/VRViewer";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Hotel {
  id: string; title: string; description: string; location: string; price: number; images: string[]; vr_content: string | null;
}

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { language } = useLanguage();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVR, setShowVR] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => { if (id) fetchHotel(); }, [id]);

  const fetchHotel = async () => {
    try {
      const { data, error } = await supabase.from("content").select("*").eq("content_type", "hotel").eq("id", id).single();
      if (error) throw error;
      if (data) setHotel({ id: data.id, title: data.title, description: data.description || "", location: data.location || "", price: data.price || 0, images: Array.isArray(data.images) ? (data.images as string[]) : [], vr_content: data.vr_content });
    } catch (error) {
      toast.error(language === "ar" ? "خطأ في تحميل بيانات الفندق" : "Error loading hotel data");
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted animate-pulse mx-auto mb-4" />
        <div className="h-6 w-48 bg-muted animate-pulse mx-auto rounded-lg" />
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container py-16 text-center">
        <p className="text-xl font-semibold mb-4">{language === "ar" ? "الفندق غير موجود" : "Hotel not found"}</p>
        <Button onClick={() => navigate("/search")}>{language === "ar" ? "العودة للبحث" : "Back to Search"}</Button>
      </div>
    </div>
  );

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights * hotel.price;

  const handleAddToCart = () => {
    if (!checkIn || !checkOut) { toast.error(language === "ar" ? "الرجاء اختيار تواريخ الحجز" : "Please select dates"); return; }
    addItem({ id: `hotel-${hotel.id}-${Date.now()}`, type: "hotel", name: hotel.title, location: hotel.location, price: totalPrice, image: hotel.images[0] || "/placeholder.svg", nights, checkIn: format(checkIn, "yyyy-MM-dd"), checkOut: format(checkOut, "yyyy-MM-dd") });
  };

  const handleBookNow = () => { handleAddToCart(); navigate("/checkout"); };

  const amenities = [
    { icon: Wifi, label: "WiFi" }, { icon: Car, label: language === "ar" ? "موقف سيارات" : "Parking" },
    { icon: Dumbbell, label: language === "ar" ? "صالة رياضية" : "Gym" }, { icon: UtensilsCrossed, label: language === "ar" ? "مطعم" : "Restaurant" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 px-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => navigate("/search")} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {language === "ar" ? "العودة" : "Back"}
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden">
              <img src={hotel.images[activeImage] || "/placeholder.svg"} alt={hotel.title} className="w-full h-[450px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/40 to-transparent" />
              {hotel.vr_content && (
                <Button onClick={() => setShowVR(!showVR)} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 gap-2 rounded-xl" variant={showVR ? "default" : "secondary"}>
                  <Eye className="h-4 w-4" />
                  {showVR ? (language === "ar" ? "إخفاء VR" : "Hide VR") : (language === "ar" ? "عرض VR" : "View VR")}
                </Button>
              )}
              <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4">
                <h1 className="text-3xl font-bold text-white mb-1">{hotel.title}</h1>
                <p className="text-white/80 flex items-center gap-1"><MapPin className="h-4 w-4" />{hotel.location}</p>
              </div>
            </div>

            {/* Thumbnails */}
            {hotel.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {hotel.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {showVR && hotel.vr_content && <VRViewer />}

            {/* Details */}
            <Card className="border-2 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1"><Star className="h-5 w-5 fill-sandy-gold text-sandy-gold" /><span className="font-bold">4.8</span></div>
                  {hotel.vr_content && <Badge variant="outline" className="gap-1 rounded-lg"><Eye className="h-3 w-3" />VR</Badge>}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-6">{hotel.description}</p>
                <h3 className="font-semibold mb-3">{language === "ar" ? "المرافق" : "Amenities"}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                      <a.icon className="h-4 w-4 text-primary" /><span className="text-sm">{a.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="sticky top-20 border-2 border-border/50 shadow-[var(--shadow-lg)] overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-terracotta via-sandy-gold to-warm-beige" />
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-3xl font-bold text-primary">{hotel.price} <span className="text-base font-normal text-muted-foreground">{language === "ar" ? "ر.س / ليلة" : "SAR / night"}</span></div>
                </div>

                <div className="space-y-4">
                  {[{ label: language === "ar" ? "تسجيل الدخول" : "Check-in", date: checkIn, setDate: setCheckIn, disabled: (d: Date) => d < new Date() },
                    { label: language === "ar" ? "تسجيل الخروج" : "Check-out", date: checkOut, setDate: setCheckOut, disabled: (d: Date) => !checkIn || d <= checkIn! }
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="text-sm font-medium mb-2 block text-foreground/80">{field.label}</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl h-12", !field.date && "text-muted-foreground")}>
                            <CalendarIcon className="h-4 w-4" />
                            {field.date ? format(field.date, "PPP") : <span>{language === "ar" ? "اختر التاريخ" : "Pick a date"}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.date} onSelect={field.setDate as any} disabled={field.disabled} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))}
                </div>

                {nights > 0 && (
                  <div className="p-4 bg-primary/5 rounded-2xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{hotel.price} {language === "ar" ? "ر.س" : "SAR"} × {nights} {language === "ar" ? "ليالي" : "nights"}</span>
                      <span>{totalPrice} {language === "ar" ? "ر.س" : "SAR"}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary/10">
                      <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                      <span className="text-primary">{totalPrice} {language === "ar" ? "ر.س" : "SAR"}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button onClick={handleBookNow} disabled={!checkIn || !checkOut} variant="hero" className="w-full rounded-xl h-12" size="lg">
                    {language === "ar" ? "احجز الآن" : "Book Now"}
                  </Button>
                  <Button onClick={handleAddToCart} disabled={!checkIn || !checkOut} variant="outline" className="w-full gap-2 rounded-xl h-12">
                    <ShoppingCart className="h-4 w-4" />{language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HotelDetails;
