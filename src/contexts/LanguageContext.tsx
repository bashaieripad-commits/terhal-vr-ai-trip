import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.search': 'بحث',
    'nav.tripPlanner': 'مخطط الرحلات',
    'nav.signIn': 'تسجيل الدخول',
    'nav.getStarted': 'ابدأ الآن',
    
    // Hero Section
    'hero.title': 'اكتشف جمال المملكة',
    'hero.subtitle': 'خطط لرحلتك المثالية مع الذكاء الاصطناعي',
    'hero.cta': 'ابدأ الاستكشاف',
    
    // Search Bar
    'search.all': 'الكل',
    'search.flights': 'الرحلات',
    'search.hotels': 'الفنادق',
    'search.activities': 'الأنشطة',
    'search.destination': 'الوجهة',
    'search.checkIn': 'تسجيل الوصول',
    'search.checkOut': 'تسجيل المغادرة',
    'search.guests': 'الضيوف',
    'search.whereTo': 'إلى أين؟',
    'search.searchEverything': 'ابحث عن كل شيء',
    'search.from': 'من',
    'search.to': 'إلى',
    'search.date': 'التاريخ',
    'search.departureCity': 'مدينة المغادرة',
    'search.arrivalCity': 'مدينة الوصول',
    'search.searchFlights': 'ابحث عن رحلات',
    'search.location': 'الموقع',
    'search.cityOrHotel': 'المدينة أو اسم الفندق',
    'search.searchHotels': 'ابحث عن فنادق',
    'search.whereToExplore': 'أين تريد الاستكشاف؟',
    'search.searchActivities': 'ابحث عن أنشطة',
    
    // Featured Section
    'featured.title': 'استكشف الأفضل في المملكة',
    'featured.subtitle': 'من الصحاري الذهبية إلى المدن الحديثة',
    'featured.luxury': 'فنادق فاخرة',
    'featured.luxuryDesc': 'اختبر الضيافة على مستوى عالمي',
    'featured.explore': 'استكشف الآن',
    'featured.activities': 'الأنشطة والمغامرات',
    'featured.activitiesDesc': 'أنشئ ذكريات لا تُنسى',
    'featured.discover': 'اكتشف المزيد',
    'featured.heritage': 'التراث والثقافة',
    'featured.heritageDesc': 'انغمس في التاريخ الغني',
    'featured.learnMore': 'اعرف المزيد',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.tripPlanner': 'Trip Planner',
    'nav.signIn': 'Sign In',
    'nav.getStarted': 'Get Started',
    
    // Hero Section
    'hero.title': 'Discover the Beauty of Saudi Arabia',
    'hero.subtitle': 'Plan Your Perfect Journey with AI-Powered Recommendations',
    'hero.cta': 'Start Exploring',
    
    // Search Bar
    'search.all': 'All',
    'search.flights': 'Flights',
    'search.hotels': 'Hotels',
    'search.activities': 'Activities',
    'search.destination': 'Destination',
    'search.checkIn': 'Check-in',
    'search.checkOut': 'Check-out',
    'search.guests': 'Guests',
    'search.whereTo': 'Where to?',
    'search.searchEverything': 'Search Everything',
    'search.from': 'From',
    'search.to': 'To',
    'search.date': 'Date',
    'search.departureCity': 'Departure city',
    'search.arrivalCity': 'Arrival city',
    'search.searchFlights': 'Search Flights',
    'search.location': 'Location',
    'search.cityOrHotel': 'City or hotel name',
    'search.searchHotels': 'Search Hotels',
    'search.whereToExplore': 'Where to explore?',
    'search.searchActivities': 'Search Activities',
    
    // Featured Section
    'featured.title': 'Explore the Best of Saudi Arabia',
    'featured.subtitle': 'From golden deserts to modern cities',
    'featured.luxury': 'Luxury Hotels',
    'featured.luxuryDesc': 'Experience world-class hospitality',
    'featured.explore': 'Explore Now',
    'featured.activities': 'Activities & Adventures',
    'featured.activitiesDesc': 'Create unforgettable memories',
    'featured.discover': 'Discover More',
    'featured.heritage': 'Heritage & Culture',
    'featured.heritageDesc': 'Immerse in rich history',
    'featured.learnMore': 'Learn More',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    // Set HTML dir and lang attributes
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
