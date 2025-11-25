import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, Menu, Languages, Tent, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { items } = useCart();

  const navLinks = [
    { to: "/", label: t('nav.home'), icon: Tent },
    { to: "/search", label: t('nav.search'), icon: Search },
    { to: "/trip-planner", label: t('nav.tripPlanner'), icon: Calendar },
  ];

  return (
    <nav 
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="navigation"
      aria-label="شريط التنقل الرئيسي | Main navigation"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 rtl:space-x-reverse focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          aria-label="العودة إلى الصفحة الرئيسية | Return to home page"
        >
          <div className="rounded-lg bg-gradient-to-r from-terracotta to-sandy-gold p-2 shadow-md" aria-hidden="true">
            <Tent className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-terracotta to-sandy-gold bg-clip-text text-transparent">
            ترحال
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6" role="menubar">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
              role="menuitem"
              aria-label={link.label}
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Link to="/checkout" className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              aria-label={`سلة التسوق - ${items.length} عنصر | Shopping cart - ${items.length} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  aria-label={`${items.length} عناصر في السلة`}
                >
                  {items.length}
                </Badge>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="hidden md:flex"
            aria-label={`تغيير اللغة إلى ${language === 'ar' ? 'English' : 'العربية'} | Switch language to ${language === 'ar' ? 'English' : 'Arabic'}`}
          >
            <Languages className="h-5 w-5" />
          </Button>
          <Link to="/auth" className="hidden md:block">
            <Button 
              variant="ghost" 
              size="sm"
              aria-label="تسجيل الدخول | Sign in"
            >
              <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" aria-hidden="true" />
              {t('nav.signIn')}
            </Button>
          </Link>
          <Link to="/auth" className="hidden md:block">
            <Button 
              variant="hero" 
              size="sm"
              aria-label="ابدأ الآن | Get started"
            >
              {t('nav.getStarted')}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                aria-label="فتح القائمة | Open menu"
                aria-expanded={isOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px]"
              aria-label="القائمة المنسدلة | Mobile menu"
            >
              <nav className="flex flex-col space-y-4 mt-8" role="navigation" aria-label="قائمة التنقل على الأجهزة المحمولة | Mobile navigation menu">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                ))}
                <div className="pt-4 border-t border-border space-y-2">
                  <Link to="/checkout" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <ShoppingCart className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {language === 'ar' ? 'سلة الحجز' : 'Cart'}
                      {items.length > 0 && (
                        <Badge className="mr-auto">{items.length}</Badge>
                      )}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      toggleLanguage();
                      setIsOpen(false);
                    }}
                  >
                    <Languages className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {language === 'ar' ? 'English' : 'العربية'}
                  </Button>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {t('nav.signIn')}
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="hero" className="w-full">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
