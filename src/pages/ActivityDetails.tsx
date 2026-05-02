import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Users, Eye, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReviewsSection from "@/components/reviews/ReviewsSection";

interface Activity {
  id: string; title: string; description: string; location: string; price: number; images: string[]; vr_content: string | null;
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

  useEffect(() => { if (id) fetchActivity(); }, [id]);

  const fetchActivity = async () => {
    try {
      const { data, error } = await supabase.from("content").select("*").eq("id", id).eq("content_type", "activity").single();
      if (error) throw error;
      setActivity({ id: data.id, title: data.title, description: data.description || "", location: data.location || "", price: data.price || 0, images: Array.isArray(data.images) ? (data.images as string[]) : [], vr_content: data.vr_content });
    } catch (error) {
      toast.error(language === "ar" ? "خطأ في تحميل الفعالية" : "Error loading activity");
    } finally { setLoading(false); }
  };

  const handleAddToCart = () => {
    if (!activity || !selectedDate) { toast.error(language === "ar" ? "الرجاء اختيار التاريخ" : "Please select a date"); return; }
    addItem({ id: activity.id, name: activity.title, type: "activity", location: activity.location, price: activity.price * guests, image: activity.images[0] || "/placeholder.svg", checkIn: selectedDate });
    toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container py-16 text-center"><div className="w-16 h-16 rounded-2xl bg-muted animate-pulse mx-auto mb-4" /><div className="h-6 w-48 bg-muted animate-pulse mx-auto rounded-lg" /></div>
    </div>
  );

  if (!activity) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{language === "ar" ? "الفعالية غير موجودة" : "Activity not found"}</h2>
        <Button onClick={() => navigate("/search")}>{language === "ar" ? "العودة للبحث" : "Back to search"}</Button>
      </div>
    </div>
  );

  if (showVR && activity.vr_content) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="p-4 bg-card border-b flex items-center justify-between">
            <h2 className="text-xl font-bold">{activity.title} - VR Tour</h2>
            <Button variant="outline" onClick={() => setShowVR(false)} className="rounded-xl">{language === "ar" ? "إغلاق" : "Close"}</Button>
          </div>
          <iframe src={activity.vr_content} className="flex-1 w-full border-0" allowFullScreen title="VR Tour" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => navigate("/search")} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{language === "ar" ? "العودة" : "Back"}
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <img src={activity.images[0] || "/placeholder.svg"} alt={activity.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/50 to-transparent" />
              {activity.vr_content && (
                <Button variant="hero" size="lg" className="absolute top-4 right-4 rtl:right-auto rtl:left-4 rounded-xl" onClick={() => setShowVR(true)}>
                  <Eye className="w-5 h-5 mr-2" />{language === "ar" ? "جولة VR" : "VR Tour"}
                </Button>
              )}
              <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4">
                <Badge className="mb-2 bg-primary/90 backdrop-blur-sm">{language === "ar" ? "فعالية" : "Activity"}</Badge>
                <h1 className="text-3xl font-bold text-white">{activity.title}</h1>
              </div>
            </div>

            {activity.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {activity.images.slice(1).map((img, idx) => (
                  <img key={idx} src={img} alt={`${activity.title} ${idx + 2}`} className="w-full h-32 object-cover rounded-xl" />
                ))}
              </div>
            )}

            <Card className="border-2 border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">{language === "ar" ? "عن الفعالية" : "About This Activity"}</h2>
                <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
              </CardContent>
            </Card>

            <ReviewsSection itemId={activity.id} itemType="activity" itemName={activity.title} />
          </motion.div>

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
                  <p className="text-muted-foreground flex items-center gap-2 mb-3"><MapPin className="h-4 w-4" />{activity.location}</p>
                  <div className="text-3xl font-bold text-primary">{activity.price} <span className="text-base font-normal text-muted-foreground">{language === "ar" ? "ر.س / شخص" : "SAR / person"}</span></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground/80"><Calendar className="h-4 w-4 text-primary" />{language === "ar" ? "تاريخ الفعالية" : "Event Date"}</label>
                    <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="rounded-xl h-12" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2 text-foreground/80"><Users className="h-4 w-4 text-primary" />{language === "ar" ? "عدد الأشخاص" : "Guests"}</label>
                    <Input type="number" value={guests} onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="rounded-xl h-12" />
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                    <span className="text-primary">{activity.price * guests} {language === "ar" ? "ر.س" : "SAR"}</span>
                  </div>
                </div>

                <Button size="lg" variant="hero" className="w-full rounded-xl h-12" onClick={handleAddToCart}>
                  <ShoppingCart className="w-4 h-4 mr-2" />{language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
