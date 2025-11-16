import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarIcon, MapPin, Star, Eye, ShoppingCart } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const mockHotels = [
  {
    id: "1",
    name: "Luxury Desert Resort",
    nameAr: "منتجع الصحراء الفاخر",
    location: "Riyadh",
    locationAr: "الرياض",
    pricePerNight: 450,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop",
    description: "Experience luxury in the heart of the desert with modern amenities and traditional Saudi hospitality.",
    descriptionAr: "استمتع بالفخامة في قلب الصحراء مع وسائل الراحة الحديثة والضيافة السعودية التقليدية.",
    amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym"],
    amenitiesAr: ["واي فاي مجاني", "مسبح", "سبا", "مطعم", "صالة رياضية"],
    hasVR: true,
  },
];

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { language } = useLanguage();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();

  const hotel = mockHotels.find((h) => h.id === id) || mockHotels[0];

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights * hotel.pricePerNight;

  const handleAddToCart = () => {
    if (!checkIn || !checkOut) {
      return;
    }
    addItem({
      id: `hotel-${hotel.id}-${Date.now()}`,
      type: "hotel",
      name: language === "ar" ? hotel.nameAr : hotel.name,
      location: language === "ar" ? hotel.locationAr : hotel.location,
      price: totalPrice,
      image: hotel.image,
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <img
              src={hotel.image}
              alt={language === "ar" ? hotel.nameAr : hotel.name}
              className="w-full h-96 object-cover rounded-lg"
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">
                  {language === "ar" ? hotel.nameAr : hotel.name}
                </h1>
                {hotel.hasVR && (
                  <Badge variant="outline" className="gap-1">
                    <Eye className="h-3 w-3" />
                    VR
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {language === "ar" ? hotel.locationAr : hotel.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {hotel.rating}
                </div>
              </div>

              <p className="text-foreground/80 mb-6">
                {language === "ar" ? hotel.descriptionAr : hotel.description}
              </p>

              <div>
                <h3 className="font-semibold mb-3">
                  {language === "ar" ? "المرافق" : "Amenities"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(language === "ar" ? hotel.amenitiesAr : hotel.amenities).map((amenity, i) => (
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
                    ${hotel.pricePerNight}
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
                        ${hotel.pricePerNight} × {nights}{" "}
                        {language === "ar" ? "ليالي" : "nights"}
                      </span>
                      <span>${hotel.pricePerNight * nights}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                      <span className="text-primary">${totalPrice}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={handleBookNow}
                    disabled={!checkIn || !checkOut}
                    className="w-full"
                    variant="hero"
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
      </div>
    </div>
  );
};

export default HotelDetails;
