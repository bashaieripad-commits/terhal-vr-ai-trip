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

interface TripSuggestion {
  recommendation: string;
  flight?: {
    id: string;
    title: string;
    price: number;
    details: string;
  };
  hotel?: {
    id: string;
    title: string;
    price: number;
    details: string;
  };
  activities?: Array<{
    id: string;
    title: string;
    price: number;
    details: string;
  }>;
}

const TripPlanner = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<TripSuggestion | null>(null);

  const handleGenerateTrip = async () => {
    if (!userLocation.trim()) {
      toast.error(language === "ar" ? "الرجاء إدخال موقعك" : "Please enter your location");
      return;
    }

    setLoading(true);
    setSuggestion(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-trip-planner', {
        body: { userLocation, language }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestion(data);
      toast.success(language === "ar" ? "تم إنشاء رحلتك المثالية!" : "Your perfect trip has been generated!");
    } catch (error) {
      console.error('Error generating trip:', error);
      toast.error(
        language === "ar" 
          ? "حدث خطأ في إنشاء الرحلة. حاول مرة أخرى."
          : "Error generating trip. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (type: string, id: string) => {
    if (type === "hotel") {
      navigate(`/hotel/${id}`);
    } else if (type === "activity") {
      navigate(`/activity/${id}`);
    } else if (type === "flight") {
      navigate(`/flights`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {language === "ar" ? "مخطط الرحلات الذكي" : "AI Trip Planner"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === "ar" 
                ? "أخبرنا بموقعك ودع الذكاء الاصطناعي يخطط رحلتك المثالية"
                : "Tell us your location and let AI plan your perfect trip"}
            </p>
          </div>

          {/* Planner Form */}
          <Card className="shadow-[var(--shadow-lg)] border-2 border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {language === "ar" ? "موقعك الحالي" : "Your Current Location"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Input 
                  placeholder={language === "ar" ? "مثال: الشرقية، الدمام، الخبر..." : "Example: Dammam, Khobar, Dhahran..."}
                  className="text-lg"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full text-lg"
                onClick={handleGenerateTrip}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {language === "ar" ? "جاري التخطيط..." : "Planning..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {language === "ar" ? "اقترح رحلتي المثالية" : "Suggest My Perfect Trip"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Trip Suggestion Results */}
          {suggestion && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Recommendation */}
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {language === "ar" ? "توصياتنا لك" : "Our Recommendations"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {suggestion.recommendation}
                  </p>
                </CardContent>
              </Card>

              {/* Flight */}
              {suggestion.flight && (
                <Card className="hover:shadow-[var(--shadow-lg)] transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Plane className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2">{suggestion.flight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.flight.details}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            {suggestion.flight.price} {language === "ar" ? "ر.س" : "SAR"}
                          </span>
                          <Button 
                            variant="outline"
                            onClick={() => handleViewDetails("flight", suggestion.flight!.id)}
                          >
                            {language === "ar" ? "عرض التفاصيل" : "View Details"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hotel */}
              {suggestion.hotel && (
                <Card className="hover:shadow-[var(--shadow-lg)] transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Hotel className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2">{suggestion.hotel.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.hotel.details}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            {suggestion.hotel.price} {language === "ar" ? "ر.س" : "SAR"}
                          </span>
                          <Button 
                            variant="outline"
                            onClick={() => handleViewDetails("hotel", suggestion.hotel!.id)}
                          >
                            {language === "ar" ? "عرض التفاصيل" : "View Details"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activities */}
              {suggestion.activities && suggestion.activities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    {language === "ar" ? "الفعاليات المقترحة" : "Suggested Activities"}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {suggestion.activities.map((activity) => (
                      <Card key={activity.id} className="hover:shadow-[var(--shadow-lg)] transition-all">
                        <CardContent className="p-4">
                          <h4 className="font-bold mb-2">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {activity.details}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {activity.price} {language === "ar" ? "ر.س" : "SAR"}
                            </span>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails("activity", activity.id)}
                            >
                              {language === "ar" ? "التفاصيل" : "Details"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* How it Works */}
          <Card className="mt-8 bg-gradient-to-br from-secondary/20 to-accent/10">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {language === "ar" ? "كيف يعمل مخطط الرحلات الذكي" : "How AI Trip Planner Works"}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>
                    {language === "ar" 
                      ? "أدخل موقعك الحالي (مثل: الشرقية، الدمام، الخبر)"
                      : "Enter your current location (e.g., Eastern Province, Dammam, Khobar)"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>
                    {language === "ar"
                      ? "الذكاء الاصطناعي يحلل آلاف الخيارات لإنشاء رحلتك المثالية"
                      : "AI analyzes thousands of options to create your personalized itinerary"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>
                    {language === "ar"
                      ? "احصل على اقتراحات لرحلات الطيران والفنادق والفعاليات"
                      : "Get suggestions for flights, hotels, and activities"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>
                    {language === "ar"
                      ? "احجز كل شيء بنقرة واحدة - رحلات، فنادق، وفعاليات"
                      : "Book everything with one click - flights, hotels, and activities"}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
