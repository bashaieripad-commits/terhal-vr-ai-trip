import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  vr_content: string | null;
}

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { language } = useLanguage();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVR, setShowVR] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    if (id) {
      fetchActivity();
    }
  }, [id]);

  const fetchActivity = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("id", id)
        .eq("content_type", "activity")
        .single();

      if (error) throw error;

      setActivity({
        id: data.id,
        title: data.title,
        description: data.description || "",
        location: data.location || "",
        price: data.price || 0,
        images: Array.isArray(data.images) ? (data.images as string[]) : [],
        vr_content: data.vr_content,
      });
    } catch (error) {
      console.error("Error fetching activity:", error);
      toast.error(language === "ar" ? "خطأ في تحميل الفعالية" : "Error loading activity");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!activity || !selectedDate) {
      toast.error(language === "ar" ? "الرجاء اختيار تاريخ الفعالية" : "Please select event date");
      return;
    }

    addItem({
      id: activity.id,
      name: activity.title,
      type: "activity",
      location: activity.location,
      price: activity.price * guests,
      image: activity.images[0] || "/placeholder.svg",
      checkIn: selectedDate,
    });

    toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === "ar" ? "الفعالية غير موجودة" : "Activity not found"}
          </h2>
          <Button onClick={() => navigate("/search")}>
            {language === "ar" ? "العودة للبحث" : "Back to search"}
          </Button>
        </div>
      </div>
    );
  }

  if (showVR && activity.vr_content) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="p-4 bg-card border-b flex items-center justify-between">
            <h2 className="text-xl font-bold">{activity.title} - VR Tour</h2>
            <Button variant="outline" onClick={() => setShowVR(false)}>
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          </div>
          <iframe
            src={activity.vr_content}
            className="flex-1 w-full border-0"
            allowFullScreen
            title="VR Tour"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src={activity.images[0] || "/placeholder.svg"}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
              {activity.vr_content && (
                <Button
                  variant="hero"
                  size="lg"
                  className="absolute top-4 right-4"
                  onClick={() => setShowVR(true)}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  {language === "ar" ? "جولة VR" : "VR Tour"}
                </Button>
              )}
            </div>

            {activity.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {activity.images.slice(1).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${activity.title} ${idx + 2}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {language === "ar" ? "عن الفعالية" : "About Event"}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {activity.location}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {language === "ar" ? "فعالية" : "Activity"}
                  </Badge>
                </div>

                <div className="py-4 border-y border-border">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {activity.price} {language === "ar" ? "ر.س" : "SAR"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "للشخص" : "per person"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {language === "ar" ? "تاريخ الفعالية" : "Event Date"}
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {language === "ar" ? "عدد الأشخاص" : "Number of Guests"}
                    </label>
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button size="lg" className="w-full" onClick={handleAddToCart}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                  </Button>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" 
                        ? `الإجمالي: ${activity.price * guests} ر.س`
                        : `Total: ${activity.price * guests} SAR`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
