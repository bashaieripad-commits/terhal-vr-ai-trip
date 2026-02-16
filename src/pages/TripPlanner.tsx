import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Loader2, Hotel, Plane, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface TripSuggestion {
  recommendation: string;
  flight?: { id: string; title: string; price: number; details: string; };
  hotel?: { id: string; title: string; price: number; details: string; };
  activities?: Array<{ id: string; title: string; price: number; details: string; }>;
}

const TripPlanner = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<TripSuggestion | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error(language === "ar" ? "المتصفح لا يدعم تحديد الموقع" : "Geolocation is not supported");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language === "ar" ? "ar" : "en"}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.state || data.address.country;
          setUserLocation(city);
          toast.success(language === "ar" ? `تم تحديد موقعك: ${city}` : `Location detected: ${city}`);
          setTimeout(() => { handleGenerateTrip(city); }, 500);
        } catch (error) {
          toast.error(language === "ar" ? "حدث خطأ في تحديد اسم الموقع" : "Error determining location name");
        } finally { setDetectingLocation(false); }
      },
      (error) => {
        setDetectingLocation(false);
        let errorMessage = language === "ar" ? "حدث خطأ في تحديد موقعك" : "Error detecting your location";
        if (error.code === error.PERMISSION_DENIED) errorMessage = language === "ar" ? "يرجى السماح بالوصول إلى الموقع" : "Please allow location access";
        toast.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleGenerateTrip = async (locationOverride?: string) => {
    const location = locationOverride || userLocation;
    if (!location.trim()) { toast.error(language === "ar" ? "الرجاء إدخال موقعك" : "Please enter your location"); return; }
    setLoading(true); setSuggestion(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trip-planner', { body: { userLocation: location, language } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setSuggestion(data);
      toast.success(language === "ar" ? "تم إنشاء رحلتك المثالية!" : "Your perfect trip has been generated!");
    } catch (error) {
      toast.error(language === "ar" ? "حدث خطأ. حاول مرة أخرى." : "Error generating trip. Please try again.");
    } finally { setLoading(false); }
  };

  const handleViewDetails = (type: string, id: string) => {
    if (type === "hotel") navigate(`/hotel/${id}`);
    else if (type === "activity") navigate(`/activity/${id}`);
    else if (type === "flight") navigate(`/flights`);
  };

  const steps = [
    { num: "1", text: language === "ar" ? "أدخل موقعك الحالي" : "Enter your current location" },
    { num: "2", text: language === "ar" ? "الذكاء الاصطناعي يحلل آلاف الخيارات" : "AI analyzes thousands of options" },
    { num: "3", text: language === "ar" ? "احصل على اقتراحات مخصصة" : "Get personalized suggestions" },
    { num: "4", text: language === "ar" ? "احجز كل شيء بنقرة واحدة" : "Book everything with one click" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-terracotta to-sandy-gold mb-6 shadow-[var(--shadow-lg)]">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === "ar" ? "مخطط الرحلات الذكي" : "AI Trip Planner"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === "ar" 
                ? "أخبرنا بموقعك ودع الذكاء الاصطناعي يخطط رحلتك المثالية"
                : "Tell us your location and let AI plan your perfect trip"}
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {steps.map((step, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-card border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">{step.num}</span>
                </div>
                <p className="text-xs text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </motion.div>

          {/* Planner Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card className="shadow-[var(--shadow-lg)] border-2 border-primary/20 mb-10 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-terracotta via-sandy-gold to-warm-beige" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {language === "ar" ? "موقعك الحالي" : "Your Current Location"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input 
                    placeholder={language === "ar" ? "مثال: الدمام، الخبر..." : "Example: Dammam, Khobar..."}
                    className="text-lg flex-1 rounded-xl h-12"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    disabled={loading || detectingLocation}
                  />
                  <Button variant="outline" onClick={detectLocation} disabled={loading || detectingLocation} className="flex-shrink-0 h-12 w-12 rounded-xl">
                    {detectingLocation ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
                  </Button>
                </div>
                <Button variant="hero" size="lg" className="w-full text-lg rounded-xl h-14" onClick={() => handleGenerateTrip()} disabled={loading || detectingLocation}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{language === "ar" ? "جاري التخطيط..." : "Planning..."}</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" />{language === "ar" ? "اقترح رحلتي المثالية" : "Suggest My Perfect Trip"}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          {suggestion && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/10">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {language === "ar" ? "توصياتنا لك" : "Our Recommendations"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{suggestion.recommendation}</p>
                </CardContent>
              </Card>

              {suggestion.flight && (
                <Card className="group hover:shadow-[var(--shadow-lg)] transition-all border-2 border-border/50 hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta to-sandy-gold flex items-center justify-center flex-shrink-0">
                        <Plane className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2">{suggestion.flight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{suggestion.flight.details}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">{suggestion.flight.price} {language === "ar" ? "ر.س" : "SAR"}</span>
                          <Button variant="outline" className="rounded-xl" onClick={() => handleViewDetails("flight", suggestion.flight!.id)}>
                            {language === "ar" ? "عرض التفاصيل" : "View Details"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {suggestion.hotel && (
                <Card className="group hover:shadow-[var(--shadow-lg)] transition-all border-2 border-border/50 hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warm-beige to-desert-sand flex items-center justify-center flex-shrink-0">
                        <Hotel className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2">{suggestion.hotel.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{suggestion.hotel.details}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">{suggestion.hotel.price} {language === "ar" ? "ر.س" : "SAR"}</span>
                          <Button variant="outline" className="rounded-xl" onClick={() => handleViewDetails("hotel", suggestion.hotel!.id)}>
                            {language === "ar" ? "عرض التفاصيل" : "View Details"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {suggestion.activities && suggestion.activities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    {language === "ar" ? "الفعاليات المقترحة" : "Suggested Activities"}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {suggestion.activities.map((activity) => (
                      <Card key={activity.id} className="hover:shadow-[var(--shadow-lg)] transition-all border-2 border-border/50 hover:border-primary/30">
                        <CardContent className="p-5">
                          <h4 className="font-bold mb-2">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{activity.details}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">{activity.price} {language === "ar" ? "ر.س" : "SAR"}</span>
                            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => handleViewDetails("activity", activity.id)}>
                              {language === "ar" ? "التفاصيل" : "Details"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
