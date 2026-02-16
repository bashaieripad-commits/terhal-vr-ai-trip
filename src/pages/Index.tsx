import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { FeaturedSection } from "@/components/FeaturedSection";
import { VRViewer } from "@/components/VRViewer";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, Shield, Bell, ArrowDown, Star, MapPin, Plane } from "lucide-react";
import { Testimonials } from "@/components/Testimonials";
import heroImage from "@/assets/hero-desert.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6 }
  })
};

const Index = () => {
  const { t, language } = useLanguage();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const { permission, requestPermission, checkNearbyActivities, shouldNotify, isSupported } = useNotifications({
    enabled: true,
    language
  });
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if (isSupported && permission === 'default' && shouldNotify()) {
      setShowNotificationPrompt(true);
    }
    if (permission === 'granted' && shouldNotify()) {
      checkNearbyActivities();
    }
  }, [permission, isSupported, shouldNotify, checkNearbyActivities]);

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    setShowNotificationPrompt(false);
    if (result === 'granted') {
      checkNearbyActivities();
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        تخطي إلى المحتوى الرئيسي | Skip to main content
      </a>
      
      <Navbar />

      {/* Notification Prompt */}
      {showNotificationPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 left-4 md:left-auto md:w-96 z-50"
        >
          <Card className="glass border-primary/30 shadow-[var(--shadow-lg)]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">
                    {language === "ar" ? "تفعيل الإشعارات" : "Enable Notifications"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {language === "ar"
                      ? "احصل على إشعارات عن الفعاليات القريبة منك"
                      : "Get notified about events near you"}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEnableNotifications}>
                      {language === "ar" ? "تفعيل" : "Enable"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowNotificationPrompt(false)}>
                      {language === "ar" ? "لاحقاً" : "Later"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Hero Section - Immersive */}
      <section 
        ref={heroRef}
        className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden"
        role="banner"
      >
        <motion.div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${heroImage})`, y: heroY }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-deep-brown/70 via-deep-brown/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-brown/60 via-transparent to-transparent" />
        </motion.div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 right-[15%] w-20 h-20 rounded-full bg-sandy-gold/20 blur-xl animate-float" />
        <div className="absolute bottom-32 left-[10%] w-32 h-32 rounded-full bg-terracotta/15 blur-2xl animate-float-delayed" />
        <div className="absolute top-40 left-[20%] w-16 h-16 rounded-full bg-warm-beige/20 blur-lg animate-float-delayed" />
        
        <motion.div 
          className="container relative z-10 px-4"
          style={{ opacity: heroOpacity }}
        >
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-white/90 mb-6">
                <Star className="h-4 w-4 text-sandy-gold" />
                {language === "ar" ? "أفضل منصة سفر في المملكة" : "Saudi Arabia's #1 Travel Platform"}
              </div>
            </motion.div>

            <motion.h1 
              className="text-5xl sm:text-6xl md:text-8xl font-bold text-white leading-[0.9] tracking-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('hero.title')}
              <span className="block mt-2 text-transparent bg-gradient-to-r from-sandy-gold via-terracotta to-sandy-gold bg-clip-text animate-shimmer">
                {t('hero.subtitle')}
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-white/80 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('hero.cta')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
            >
              <SearchBar />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-xs text-white/50 font-medium">
            {language === "ar" ? "اكتشف المزيد" : "Scroll to explore"}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown className="h-5 w-5 text-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Stats Bar */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="container">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { value: "500+", label: language === "ar" ? "فندق" : "Hotels", icon: "🏨" },
              { value: "50+", label: language === "ar" ? "وجهة" : "Destinations", icon: "📍" },
              { value: "1000+", label: language === "ar" ? "رحلة يومية" : "Daily Flights", icon: "✈️" },
              { value: "98%", label: language === "ar" ? "رضا العملاء" : "Satisfaction", icon: "⭐" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="glass rounded-2xl p-5 text-center shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" role="main">
        <FeaturedSection />

        {/* VR Experience Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-secondary/30 to-background" aria-labelledby="vr-section-title">
          <div className="container">
            <motion.div 
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2 variants={fadeUp} custom={0} id="vr-section-title" className="text-4xl md:text-5xl font-bold mb-4">
                {language === "ar" ? "استكشف بتقنية VR" : "Explore with VR"}
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {language === "ar" ? "جرّب الغرف والفنادق قبل الحجز" : "Experience rooms and hotels before booking"}
              </motion.p>
            </motion.div>
            <motion.div 
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <VRViewer />
            </motion.div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-20 bg-gradient-to-b from-background to-secondary/30" aria-labelledby="benefits-section-title">
          <div className="container px-4">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2 variants={fadeUp} custom={0} id="benefits-section-title" className="text-4xl md:text-5xl font-bold mb-4">
                {language === "ar" ? "لماذا ترحال؟" : "Why Choose Terhal?"}
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg">
                {language === "ar" ? "مستقبل التخطيط للسفر" : "Experience the future of travel planning"}
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: Sparkles, title: language === "ar" ? "مخطط رحلات ذكي" : "AI Trip Planner", desc: language === "ar" ? "خطط رحلة مخصصة بناءً على ميزانيتك واهتماماتك" : "Personalized itineraries based on your preferences, budget, and interests", gradient: "from-terracotta to-sandy-gold" },
                { icon: Eye, title: language === "ar" ? "واقع افتراضي" : "Virtual Reality", desc: language === "ar" ? "جولات 360° غامرة للفنادق قبل الحجز" : "Immersive 360° tours of hotels and attractions before you book", gradient: "from-warm-beige to-desert-sand" },
                { icon: Shield, title: language === "ar" ? "حجز آمن" : "Secure Booking", desc: language === "ar" ? "معاملات آمنة ومشفرة مع دعم 24/7" : "Safe and secure payment processing with 24/7 customer support", gradient: "from-sandy-gold to-warm-beige" },
              ].map((item, i) => (
                <motion.article 
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  className="group text-center space-y-4 p-8 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-2 transition-all duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />
      </main>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-terracotta via-sandy-gold to-warm-beige" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
        <motion.div 
          className="container px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {language === "ar" ? "جاهز تبدأ مغامرتك؟" : "Ready to Start Your Adventure?"}
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {language === "ar" ? "انضم لآلاف المسافرين" : "Join thousands of travelers experiencing the future of travel planning"}
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            className="text-lg px-10 py-7 shadow-xl hover:scale-105 transition-transform rounded-2xl font-semibold"
          >
            {language === "ar" ? "ابدأ الآن" : "Get Started Today"}
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-deep-brown text-white">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-2xl font-bold bg-gradient-to-r from-terracotta to-sandy-gold bg-clip-text text-transparent">
                ترحال
              </p>
              <p className="text-white/70 mt-2">
                {language === "ar" ? "متوافق مع رؤية 2030" : "Aligned with Vision 2030"}
              </p>
            </div>
            <div className="flex space-x-6 rtl:space-x-reverse">
              <a href="#" className="hover:text-terracotta transition-colors">{language === "ar" ? "عن ترحال" : "About"}</a>
              <a href="#" className="hover:text-terracotta transition-colors">{language === "ar" ? "الدعم" : "Support"}</a>
              <a href="#" className="hover:text-terracotta transition-colors">{language === "ar" ? "الخصوصية" : "Privacy"}</a>
              <a href="#" className="hover:text-terracotta transition-colors">{language === "ar" ? "الشروط" : "Terms"}</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
            <p>© 2024 ترحال. {language === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved."}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
