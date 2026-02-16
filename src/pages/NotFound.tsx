import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tent, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-20 right-[20%] w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-[15%] w-80 h-80 rounded-full bg-sandy-gold/5 blur-3xl" />
      
      <motion.div 
        className="text-center px-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-terracotta to-sandy-gold mb-8 shadow-[var(--shadow-lg)]">
          <Tent className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary to-sandy-gold bg-clip-text text-transparent mb-4">
          404
        </h1>
        <p className="text-2xl font-semibold text-foreground mb-2">
          الصفحة غير موجودة
        </p>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto">
          Page not found — it seems you've wandered off the trail
        </p>
        <Link to="/">
          <Button variant="hero" size="lg" className="rounded-xl px-8">
            <ArrowLeft className="mr-2 h-5 w-5 rtl:rotate-180" />
            العودة للرئيسية
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
