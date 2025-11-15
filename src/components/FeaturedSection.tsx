import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, Compass, Sparkles } from "lucide-react";
import hotelImage from "@/assets/hotel-luxury.jpg";
import activitiesImage from "@/assets/activities.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

export const FeaturedSection = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Plane,
      title: t('search.flights'),
      description: "Find the best deals on flights across Saudi Arabia and beyond",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
      gradient: "from-terracotta to-sandy-gold",
    },
    {
      icon: Hotel,
      title: t('search.hotels'),
      description: t('featured.luxuryDesc'),
      image: hotelImage,
      gradient: "from-warm-beige to-desert-sand",
    },
    {
      icon: Compass,
      title: t('search.activities'),
      description: t('featured.activitiesDesc'),
      image: activitiesImage,
      gradient: "from-deep-brown to-terracotta",
    },
    {
      icon: Sparkles,
      title: t('nav.tripPlanner'),
      description: "Let AI create your perfect itinerary based on your preferences",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop",
      gradient: "from-sandy-gold to-warm-beige",
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t('featured.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-2 border-border/50"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-40 group-hover:opacity-30 transition-opacity`} />
                <div className="absolute bottom-4 left-4">
                  <div className="rounded-full bg-white/90 p-3 shadow-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                <Button variant="ghost" className="w-full group-hover:text-primary">
                  {t('featured.explore')} →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
