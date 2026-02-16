import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion, type Variants } from "framer-motion";
import {
  Ticket,
  Plane,
  Hotel,
  CalendarDays,
  MapPin,
  Clock,
  QrCode,
  ArrowRightLeft,
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag,
  Users,
  TrendingUp,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

// Mock data
const mockBookings = [
  {
    id: "1",
    type: "flight" as const,
    name: "الرياض → جدة",
    nameEn: "Riyadh → Jeddah",
    date: "2026-03-15",
    time: "08:30",
    location: "مطار الملك خالد الدولي",
    locationEn: "King Khalid International Airport",
    status: "confirmed" as const,
    ticketNumber: "TR-FL-2026-001",
    price: 450,
    qrCode: true,
    resellable: true,
  },
  {
    id: "2",
    type: "hotel" as const,
    name: "فندق الريتز كارلتون",
    nameEn: "The Ritz-Carlton Hotel",
    date: "2026-03-15",
    time: "14:00",
    location: "جدة، المملكة العربية السعودية",
    locationEn: "Jeddah, Saudi Arabia",
    status: "confirmed" as const,
    ticketNumber: "TR-HT-2026-002",
    price: 1200,
    nights: 3,
    qrCode: true,
    resellable: true,
  },
  {
    id: "3",
    type: "activity" as const,
    name: "رحلة صحراوية",
    nameEn: "Desert Safari Tour",
    date: "2026-03-17",
    time: "16:00",
    location: "الربع الخالي",
    locationEn: "Rub' al Khali",
    status: "pending" as const,
    ticketNumber: "TR-EV-2026-003",
    price: 350,
    qrCode: false,
    resellable: false,
  },
  {
    id: "4",
    type: "flight" as const,
    name: "جدة → الرياض",
    nameEn: "Jeddah → Riyadh",
    date: "2026-03-20",
    time: "18:00",
    location: "مطار الملك عبدالعزيز الدولي",
    locationEn: "King Abdulaziz International Airport",
    status: "cancelled" as const,
    ticketNumber: "TR-FL-2026-004",
    price: 500,
    qrCode: false,
    resellable: false,
  },
];

const resaleListings = [
  {
    id: "r1",
    eventName: "حفل موسم الرياض",
    eventNameEn: "Riyadh Season Concert",
    date: "2026-04-10",
    originalPrice: 600,
    resalePrice: 500,
    seller: "أحمد م.",
    sellerEn: "Ahmed M.",
    discount: 17,
  },
  {
    id: "r2",
    eventName: "رحلة بحرية - ينبع",
    eventNameEn: "Cruise Trip - Yanbu",
    date: "2026-04-05",
    originalPrice: 800,
    resalePrice: 650,
    seller: "سارة ع.",
    sellerEn: "Sarah A.",
    discount: 19,
  },
  {
    id: "r3",
    eventName: "جولة تاريخية - الدرعية",
    eventNameEn: "Historical Tour - Diriyah",
    date: "2026-03-28",
    originalPrice: 250,
    resalePrice: 200,
    seller: "محمد ك.",
    sellerEn: "Mohammed K.",
    discount: 20,
  },
];

const MyTickets = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");

  const isAr = language === "ar";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {isAr ? "مؤكد" : "Confirmed"}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20">
            <AlertCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {isAr ? "قيد الانتظار" : "Pending"}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/20">
            <XCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {isAr ? "ملغي" : "Cancelled"}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="w-5 h-5" />;
      case "hotel":
        return <Hotel className="w-5 h-5" />;
      case "activity":
        return <CalendarDays className="w-5 h-5" />;
      default:
        return <Ticket className="w-5 h-5" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case "flight":
        return "from-blue-500 to-cyan-500";
      case "hotel":
        return "from-terracotta to-sandy-gold";
      case "activity":
        return "from-emerald-500 to-teal-500";
      default:
        return "from-primary to-accent";
    }
  };

  const filteredBookings = mockBookings.filter((b) => {
    const name = isAr ? b.name : b.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || b.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta/10 via-sandy-gold/5 to-background" />
        <div className="absolute top-10 right-[10%] w-40 h-40 rounded-full bg-terracotta/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-[15%] w-32 h-32 rounded-full bg-sandy-gold/10 blur-2xl animate-float-delayed" />

        <div className="container relative z-10 px-4">
          <motion.div
            className="text-center space-y-4"
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium">
              <Ticket className="h-4 w-4 text-primary" />
              {isAr ? "إدارة حجوزاتك بسهولة" : "Manage your bookings easily"}
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold">
              {isAr ? "تذاكري و" : "My Tickets &"}
              <span className="text-transparent bg-gradient-to-r from-terracotta to-sandy-gold bg-clip-text"> {isAr ? "حجوزاتي" : "Bookings"}</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">
              {isAr ? "تتبع جميع حجوزاتك واستكشف فرص إعادة بيع التذاكر" : "Track all your bookings and explore ticket resale opportunities"}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container px-4 pb-20 -mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 h-12 rounded-xl bg-secondary/60 p-1">
              <TabsTrigger value="bookings" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md">
                <Ticket className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {isAr ? "حجوزاتي" : "My Bookings"}
              </TabsTrigger>
              <TabsTrigger value="resale" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md">
                <ArrowRightLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {isAr ? "إعادة البيع" : "Ticket Resale"}
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isAr ? "ابحث برقم التذكرة أو الاسم..." : "Search by ticket number or name..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rtl:pr-10 rtl:pl-3 rounded-xl"
                />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
              initial="hidden"
              animate="visible"
            >
              {[
                { value: filteredBookings.filter((b) => b.status === "confirmed").length, label: isAr ? "مؤكد" : "Confirmed", color: "text-emerald-500" },
                { value: filteredBookings.filter((b) => b.status === "pending").length, label: isAr ? "قيد الانتظار" : "Pending", color: "text-amber-500" },
                { value: filteredBookings.filter((b) => b.status === "cancelled").length, label: isAr ? "ملغي" : "Cancelled", color: "text-red-500" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} custom={i} className="text-center p-4 rounded-xl bg-card border border-border/50">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Booking Cards */}
            <motion.div className="grid gap-4 max-w-3xl mx-auto" initial="hidden" animate="visible">
              {filteredBookings.map((booking, i) => (
                <motion.div key={booking.id} variants={fadeUp} custom={i}>
                  <Card className="overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row">
                      {/* Type indicator */}
                      <div className={`sm:w-2 w-full h-2 sm:h-auto bg-gradient-to-b ${getTypeGradient(booking.type)}`} />
                      <CardContent className="flex-1 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeGradient(booking.type)} flex items-center justify-center text-white shrink-0`}>
                              {getTypeIcon(booking.type)}
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg">{isAr ? booking.name : booking.nameEn}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {isAr ? booking.location : booking.locationEn}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  {new Date(booking.date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {booking.time}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="font-mono text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
                                  {booking.ticketNumber}
                                </span>
                                {getStatusBadge(booking.status)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-xl font-bold text-primary">{booking.price} {isAr ? "ر.س" : "SAR"}</div>
                            {booking.nights && (
                              <span className="text-xs text-muted-foreground">{booking.nights} {isAr ? "ليالي" : "nights"}</span>
                            )}
                            <div className="flex gap-2">
                              {booking.qrCode && (
                                <Button size="sm" variant="outline" className="rounded-lg text-xs">
                                  <QrCode className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                                  {isAr ? "QR" : "QR Code"}
                                </Button>
                              )}
                              {booking.resellable && booking.status === "confirmed" && (
                                <Button size="sm" variant="default" className="rounded-lg text-xs bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90">
                                  <ArrowRightLeft className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                                  {isAr ? "إعادة بيع" : "Resell"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Resale Tab */}
          <TabsContent value="resale" className="space-y-8">
            {/* Resale Info Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/20 bg-gradient-to-r from-terracotta/5 via-sandy-gold/5 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta to-sandy-gold flex items-center justify-center text-white shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{isAr ? "سوق إعادة بيع التذاكر" : "Ticket Resale Marketplace"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isAr
                          ? "اشترِ تذاكر بأسعار مخفضة أو أعد بيع تذاكرك بأمان. جميع المعاملات محمية."
                          : "Buy tickets at discounted prices or safely resell yours. All transactions are protected."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resale Stats */}
            <motion.div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto" initial="hidden" animate="visible">
              {[
                { icon: Tag, value: resaleListings.length, label: isAr ? "تذاكر متاحة" : "Available", gradient: "from-terracotta to-sandy-gold" },
                { icon: Users, value: "150+", label: isAr ? "بائع نشط" : "Active Sellers", gradient: "from-blue-500 to-cyan-500" },
                { icon: DollarSign, value: "20%", label: isAr ? "متوسط الخصم" : "Avg. Discount", gradient: "from-emerald-500 to-teal-500" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} custom={i} className="text-center p-5 rounded-xl bg-card border border-border/50 hover:shadow-[var(--shadow-md)] transition-shadow">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Resale Listings */}
            <div className="max-w-3xl mx-auto space-y-4">
              <h3 className="font-bold text-lg">{isAr ? "تذاكر معروضة للبيع" : "Tickets For Sale"}</h3>
              <motion.div className="grid gap-4" initial="hidden" animate="visible">
                {resaleListings.map((listing, i) => (
                  <motion.div key={listing.id} variants={fadeUp} custom={i}>
                    <Card className="overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 group">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h4 className="font-bold text-lg">{isAr ? listing.eventName : listing.eventNameEn}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {new Date(listing.date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {isAr ? listing.seller : listing.sellerEn}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right rtl:text-left">
                              <div className="text-xs text-muted-foreground line-through">{listing.originalPrice} {isAr ? "ر.س" : "SAR"}</div>
                              <div className="text-xl font-bold text-primary">{listing.resalePrice} {isAr ? "ر.س" : "SAR"}</div>
                              <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-600">
                                -{listing.discount}%
                              </Badge>
                            </div>
                            <Button className="rounded-xl bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90">
                              {isAr ? "اشترِ الآن" : "Buy Now"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Sell Your Ticket CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="bg-gradient-to-r from-terracotta/10 to-sandy-gold/10 border-primary/20">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-terracotta to-sandy-gold flex items-center justify-center text-white">
                    <ArrowRightLeft className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">{isAr ? "عندك تذكرة تبي تبيعها؟" : "Have a ticket to sell?"}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {isAr
                      ? "أعد بيع تذاكرك بأمان عبر منصتنا. معاملات محمية وسريعة."
                      : "Safely resell your tickets through our platform. Protected and fast transactions."}
                  </p>
                  <Button size="lg" className="rounded-xl bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90 px-8">
                    <Tag className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {isAr ? "اعرض تذكرتك للبيع" : "List Your Ticket"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyTickets;
