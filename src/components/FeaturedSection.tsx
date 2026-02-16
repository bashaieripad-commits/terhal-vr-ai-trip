import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, Compass, Sparkles, ArrowRight } from "lucide-react";
import hotelImage from "@/assets/hotel-luxury.jpg";
import activitiesImage from "@/assets/activities.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5 }
  })
};

export const FeaturedSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Plane,
      title: t('search.flights'),
      description: language === "ar" ? "أفضل عروض الطيران داخل وخارج المملكة" : "Find the best deals on flights across Saudi Arabia and beyond",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
      gradient: "from-terracotta to-sandy-gold",
      link: "/search",
    },
    {
      icon: Hotel,
      title: t('search.hotels'),
      description: t('featured.luxuryDesc'),
      image: hotelImage,
      gradient: "from-warm-beige to-desert-sand",
      link: "/search",
    },
    {
      icon: Compass,
      title: t('search.activities'),
      description: t('featured.activitiesDesc'),
      image: activitiesImage,
      gradient: "from-deep-brown to-terracotta",
      link: "/search",
    },
    {
      icon: Sparkles,
      title: t('nav.tripPlanner'),
      description: language === "ar" ? "دع الذكاء الاصطناعي يخطط رحلتك المثالية" : "Let AI create your perfect itinerary based on your preferences",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop",
      gradient: "from-sandy-gold to-warm-beige",
      link: "/trip-planner",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('featured.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </motion.div>

        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} custom={index} variants={cardVariants}>
              <Card
                className="group overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-500 hover:-translate-y-3 border-border/50 cursor-pointer h-full"
                onClick={() => navigate(feature.link)}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-40 group-hover:opacity-20 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                    <div className={`rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{feature.description}</p>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>{t('featured.explore')}</span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
