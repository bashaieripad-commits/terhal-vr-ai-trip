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
import { CalendarIcon, MapPin, Star, Eye, ShoppingCart, ArrowLeft } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { VRViewer } from "@/components/VRViewer";
import { toast } from "sonner";

interface Hotel {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  vr_content: string | null;
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

  useEffect(() => {
    if (id) {
      fetchHotel();
    }
  }, [id]);

  const fetchHotel = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("content_type", "hotel")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setHotel({
          id: data.id,
          title: data.title,
          description: data.description || "",
          location: data.location || "",
          price: data.price || 0,
          images: Array.isArray(data.images) ? (data.images as string[]) : [],
          vr_content: data.vr_content,
        });
      }
    } catch (error) {
      console.error("Error fetching hotel:", error);
      toast.error(language === "ar" ? "خطأ في تحميل بيانات الفندق" : "Error loading hotel data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 px-4 text-center">
          <p>{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 px-4 text-center">
          <p>{language === "ar" ? "الفندق غير موجود" : "Hotel not found"}</p>
          <Button onClick={() => navigate("/search")} className="mt-4">
            {language === "ar" ? "العودة للبحث" : "Back to Search"}
          </Button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights * hotel.price;

  const handleAddToCart = () => {
    if (!checkIn || !checkOut || !hotel) {
      toast.error(language === "ar" ? "الرجاء اختيار تواريخ الحجز" : "Please select booking dates");
      return;
    }
    addItem({
      id: `hotel-${hotel.id}-${Date.now()}`,
      type: "hotel",
      name: hotel.title,
      location: hotel.location,
      price: totalPrice,
      image: hotel.images[0] || "/placeholder.svg",
      nights,
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
    });
  };

  const handleBookNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />

      <main className="container py-8 px-4" role="main" id="main-content">
        <Button
          variant="outline"
          onClick={() => navigate("/search")}
          className="mb-6"
          aria-label={language === "ar" ? "العودة للبحث" : "Back to search"}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative">
              <img
                src={hotel.images[0] || "/placeholder.svg"}
                alt={hotel.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              {hotel.vr_content && (
                <Button
                  onClick={() => setShowVR(!showVR)}
                  className="absolute top-4 right-4 gap-2"
                  variant={showVR ? "default" : "secondary"}
                >
                  <Eye className="h-4 w-4" />
                  {showVR 
                    ? (language === "ar" ? "إخفاء VR" : "Hide VR") 
                    : (language === "ar" ? "عرض VR" : "View VR")}
                </Button>
              )}
            </div>

            {/* VR Viewer */}
            {showVR && hotel.vr_content && (
              <div className="space-y-4">
                <VRViewer />
                <Card className="p-4 bg-primary/5">
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "استخدم الماوس أو اللمس للتحكم في عرض الغرفة ثلاثي الأبعاد" 
                      : "Use mouse or touch to control the 3D room view"}
                  </p>
                </Card>
              </div>
            )}

            {/* Additional Images */}
            {hotel.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {hotel.images.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${hotel.title} - ${i + 2}`}
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                ))}
              </div>
            )}

            {/* Hotel Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{hotel.title}</h1>
                {hotel.vr_content && (
                  <Badge variant="outline" className="gap-1">
                    <Eye className="h-3 w-3" />
                    VR
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {hotel.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  4.8
                </div>
              </div>

              <p className="text-foreground/80 mb-6 leading-relaxed">
                {hotel.description}
              </p>

              <div>
                <h3 className="font-semibold mb-3">
                  {language === "ar" ? "المرافق" : "Amenities"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["WiFi", "مسبح", "سبا", "مطعم", "موقف سيارات", "صالة رياضية"].map((amenity, i) => (
                    <Badge key={i} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {hotel.price} {language === "ar" ? "ر.س" : "SAR"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === "ar" ? "لكل ليلة" : "per night"}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "تسجيل الدخول" : "Check-in"}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkIn && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                          {checkIn ? format(checkIn, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "تسجيل الخروج" : "Check-out"}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkOut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                          {checkOut ? format(checkOut, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => !checkIn || date <= checkIn}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {hotel.price} {language === "ar" ? "ر.س" : "SAR"} × {nights}{" "}
                        {language === "ar" ? "ليالي" : "nights"}
                      </span>
                      <span>{hotel.price * nights} {language === "ar" ? "ر.س" : "SAR"}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                      <span className="text-primary">{totalPrice} {language === "ar" ? "ر.س" : "SAR"}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={handleBookNow}
                    disabled={!checkIn || !checkOut}
                    className="w-full"
                    size="lg"
                  >
                    {language === "ar" ? "احجز الآن" : "Book Now"}
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={!checkIn || !checkOut}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelDetails;
