import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useAnimationControls } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useEffect, useRef } from "react";

const testimonials = [
  {
    nameAr: "محمد العتيبي", nameEn: "Mohammed Al-Otaibi",
    roleAr: "مسافر دائم", roleEn: "Frequent Traveler",
    textAr: "تجربة حجز رائعة! الفنادق المختارة كانت ممتازة والأسعار تنافسية جداً. أنصح الجميع بترحال.",
    textEn: "Amazing booking experience! Selected hotels were excellent with very competitive prices.",
    rating: 5, avatar: "https://i.pravatar.cc/80?img=11",
  },
  {
    nameAr: "نورة الشمري", nameEn: "Noura Al-Shammari",
    roleAr: "رحالة", roleEn: "Explorer",
    textAr: "مخطط الرحلات الذكي وفّر عليّ ساعات من البحث. رحلتي للعلا كانت مثالية بفضل ترحال!",
    textEn: "The AI trip planner saved me hours. My AlUla trip was perfect thanks to Terhal!",
    rating: 5, avatar: "https://i.pravatar.cc/80?img=5",
  },
  {
    nameAr: "عبدالله القحطاني", nameEn: "Abdullah Al-Qahtani",
    roleAr: "عائلي", roleEn: "Family Traveler",
    textAr: "حجزت لعائلتي رحلة كاملة من فنادق وطيران وأنشطة. كل شيء كان منظم ومريح.",
    textEn: "Booked a complete trip for my family - hotels, flights, and activities. Everything was organized.",
    rating: 5, avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    nameAr: "سارة الدوسري", nameEn: "Sara Al-Dosari",
    roleAr: "مصورة سفر", roleEn: "Travel Photographer",
    textAr: "ميزة الواقع الافتراضي ساعدتني أختار الفندق المثالي قبل الحجز. تقنية مذهلة!",
    textEn: "The VR feature helped me choose the perfect hotel before booking. Amazing tech!",
    rating: 5, avatar: "https://i.pravatar.cc/80?img=9",
  },
  {
    nameAr: "فهد الحربي", nameEn: "Fahad Al-Harbi",
    roleAr: "رجل أعمال", roleEn: "Business Traveler",
    textAr: "أفضل منصة حجز سعودية. الدفع عبر مدى و STC Pay سهّل العملية كثيراً.",
    textEn: "Best Saudi booking platform. Mada and STC Pay made everything so easy.",
    rating: 4, avatar: "https://i.pravatar.cc/80?img=14",
  },
  {
    nameAr: "ريم المطيري", nameEn: "Reem Al-Mutairi",
    roleAr: "طالبة جامعية", roleEn: "University Student",
    textAr: "أسعار مناسبة للطلاب وعروض مستمرة. حجزت رحلتي لأبها بسعر ممتاز!",
    textEn: "Student-friendly prices and constant deals. Booked my Abha trip at a great price!",
    rating: 5, avatar: "https://i.pravatar.cc/80?img=16",
  },
];

const TestimonialCard = ({ t, isAr }: { t: typeof testimonials[0]; isAr: boolean }) => (
  <div className="flex-shrink-0 w-[340px] md:w-[380px] p-6 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow mx-3">
    <div className="flex items-center gap-1 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < t.rating ? "text-sandy-gold fill-sandy-gold" : "text-border"}`}
        />
      ))}
    </div>
    <Quote className="h-6 w-6 text-primary/30 mb-2" />
    <p className="text-sm text-foreground/80 leading-relaxed mb-5 min-h-[60px]">
      {isAr ? t.textAr : t.textEn}
    </p>
    <div className="flex items-center gap-3 pt-3 border-t border-border/50">
      <img
        src={t.avatar}
        alt={isAr ? t.nameAr : t.nameEn}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
        loading="lazy"
      />
      <div>
        <p className="text-sm font-semibold text-foreground">{isAr ? t.nameAr : t.nameEn}</p>
        <p className="text-xs text-muted-foreground">{isAr ? t.roleAr : t.roleEn}</p>
      </div>
    </div>
  </div>
);

export const Testimonials = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  // Duplicate for infinite scroll effect
  const allItems = [...testimonials, ...testimonials];

  return (
    <section className="py-20 overflow-hidden bg-gradient-to-b from-secondary/20 to-background">
      <div className="container px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {isAr ? "ماذا يقول عملاؤنا" : "What Our Travelers Say"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isAr ? "آراء حقيقية من مسافرين حقيقيين" : "Real reviews from real travelers"}
          </p>
        </motion.div>
      </div>

      {/* Scrolling row 1 - left to right */}
      <div className="relative mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex"
          animate={{ x: isAr ? ["0%", "-50%"] : ["-50%", "0%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {allItems.map((t, i) => (
            <TestimonialCard key={`row1-${i}`} t={t} isAr={isAr} />
          ))}
        </motion.div>
      </div>

      {/* Scrolling row 2 - right to left */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex"
          animate={{ x: isAr ? ["-50%", "0%"] : ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {[...allItems].reverse().map((t, i) => (
            <TestimonialCard key={`row2-${i}`} t={t} isAr={isAr} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
