import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { FeaturedSection } from "@/components/FeaturedSection";
import { VRViewer } from "@/components/VRViewer";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, Shield } from "lucide-react";
import heroImage from "@/assets/hero-desert.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        تخطي إلى المحتوى الرئيسي | Skip to main content
      </a>
      
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative h-[600px] flex items-center justify-center overflow-hidden"
        role="banner"
        aria-label="قسم البطل الرئيسي | Hero section"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          role="img"
          aria-label="صورة الصحراء - خلفية البطل | Desert hero background image"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-deep-brown/80 via-terracotta/50 to-transparent" />
        </div>
        
        <div className="container relative z-10 text-center space-y-6 px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            {t('hero.title')}
            <span className="block text-transparent bg-gradient-to-r from-terracotta to-sandy-gold bg-clip-text">
              {t('hero.subtitle')}
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t('hero.cta')}
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" role="main">

      {/* Features Grid */}
      <FeaturedSection />

      {/* VR Experience Section */}
      <section 
        className="py-16 px-4 bg-gradient-to-b from-secondary/30 to-background"
        aria-labelledby="vr-section-title"
      >
        <div className="container">
          <div className="text-center mb-12">
            <h2 id="vr-section-title" className="text-4xl font-bold mb-4">استكشف بتقنية VR | Explore with VR</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              جرّب الغرف والفنادق قبل الحجز | Experience rooms and hotels before booking
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <VRViewer />
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section 
        className="py-16 bg-gradient-to-b from-background to-secondary/30"
        aria-labelledby="benefits-section-title"
      >
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 id="benefits-section-title" className="text-4xl font-bold mb-4">Why Choose Terhal?</h2>
            <p className="text-muted-foreground text-lg">Experience the future of travel planning</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <article className="text-center space-y-4 p-6 rounded-lg bg-card shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-sandy-gold" aria-hidden="true">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">AI Trip Planner</h3>
              <p className="text-muted-foreground">
                Personalized itineraries based on your preferences, budget, and interests
              </p>
            </article>
            
            <article className="text-center space-y-4 p-6 rounded-lg bg-card shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-warm-beige to-desert-sand" aria-hidden="true">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Virtual Reality</h3>
              <p className="text-muted-foreground">
                Immersive 360° tours of hotels and attractions before you book
              </p>
            </article>
            
            <article className="text-center space-y-4 p-6 rounded-lg bg-card shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sandy-gold to-warm-beige" aria-hidden="true">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Secure Booking</h3>
              <p className="text-muted-foreground">
                Safe and secure payment processing with 24/7 customer support
              </p>
            </article>
          </div>
        </div>
      </section>
      </main>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-terracotta via-sandy-gold to-warm-beige">
        <div className="container px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers experiencing the future of travel planning
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            className="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-deep-brown text-white">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-2xl font-bold bg-gradient-to-r from-terracotta to-sandy-gold bg-clip-text text-transparent">
                ترحال
              </p>
              <p className="text-white/70 mt-2">Aligned with Vision 2030</p>
            </div>
            <div className="flex space-x-6 rtl:space-x-reverse">
              <a href="#" className="hover:text-terracotta transition-colors">About</a>
              <a href="#" className="hover:text-terracotta transition-colors">Support</a>
              <a href="#" className="hover:text-terracotta transition-colors">Privacy</a>
              <a href="#" className="hover:text-terracotta transition-colors">Terms</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
            <p>© 2024 ترحال. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
