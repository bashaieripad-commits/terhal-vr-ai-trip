import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { motion, type Variants } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useRef } from "react";
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
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

interface Reservation {
  id: string;
  type: string;
  item_name: string;
  status: string;
  total_price: number | null;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  details: any;
  created_at: string | null;
}

interface TicketRow {
  id: string;
  ticket_number: string;
  event_name: string;
  event_date: string;
  is_valid: boolean | null;
  is_resellable: boolean | null;
  resell_status: string | null;
  resell_price: number | null;
  qr_code: string | null;
  reservation_id: string | null;
  user_id: string;
  created_at: string | null;
}

const MyTickets = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [resaleTickets, setResaleTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Resell dialog
  const [resellDialogOpen, setResellDialogOpen] = useState(false);
  const [selectedTicketForResell, setSelectedTicketForResell] = useState<TicketRow | null>(null);
  const [selectedBookingForResell, setSelectedBookingForResell] = useState<Reservation | null>(null);
  const [resellPrice, setResellPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirm resell
  const [confirmResellOpen, setConfirmResellOpen] = useState(false);
  const [pendingResellBooking, setPendingResellBooking] = useState<(Reservation & { ticket?: TicketRow }) | null>(null);

  // Confirm cancel resale
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [pendingCancelTicketId, setPendingCancelTicketId] = useState<string | null>(null);

  // Buy ticket
  const [confirmBuyOpen, setConfirmBuyOpen] = useState(false);
  const [pendingBuyTicket, setPendingBuyTicket] = useState<TicketRow | null>(null);
  const [buying, setBuying] = useState(false);

  // QR dialog
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrTicket, setQrTicket] = useState<{ ticketNumber: string; eventName: string; date: string; bookingName: string } | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleShowQR = useCallback((ticket: TicketRow | undefined, bookingName: string) => {
    if (!ticket) return;
    setQrTicket({
      ticketNumber: ticket.ticket_number,
      eventName: ticket.event_name,
      date: ticket.event_date,
      bookingName,
    });
    setQrDialogOpen(true);
  }, []);

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    // Create a styled ticket image
    const exportCanvas = document.createElement("canvas");
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    const padding = 40;
    const qrSize = canvas.width;
    const width = qrSize + padding * 2;
    const height = qrSize + padding * 2 + 120;
    exportCanvas.width = width;
    exportCanvas.height = height;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(0, 0, width, height, 16);
    ctx.fill();

    // Header
    ctx.fillStyle = "#C4956A";
    ctx.roundRect(0, 0, width, 50, [16, 16, 0, 0]);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Terhal Ticket", width / 2, 32);

    // QR Code
    ctx.drawImage(canvas, padding, 60);

    // Ticket number
    ctx.fillStyle = "#333333";
    ctx.font = "bold 14px monospace";
    ctx.fillText(qrTicket?.ticketNumber || "", width / 2, qrSize + 80);

    // Event name
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#666666";
    ctx.fillText(qrTicket?.bookingName || "", width / 2, qrSize + 105);

    const link = document.createElement("a");
    link.download = `ticket-${qrTicket?.ticketNumber || "qr"}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();

    toast.success(isAr ? "تم تحميل التذكرة" : "Ticket downloaded");
  }, [qrTicket, isAr]);


  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await Promise.all([
          fetchReservations(user.id),
          fetchMyTickets(user.id),
          fetchResaleTickets(),
        ]);
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchReservations = async (uid: string) => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching reservations:", error);
      return;
    }
    setReservations(data || []);
  };

  const fetchMyTickets = async (uid: string) => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching tickets:", error);
      return;
    }
    setTickets(data || []);
  };

  const fetchResaleTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("is_resellable", true)
      .eq("resell_status", "listed")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching resale tickets:", error);
      return;
    }
    setResaleTickets(data || []);
  };

  const requestListForResale = (booking: Reservation & { ticket?: TicketRow }) => {
    if (booking.type === "flight") {
      toast.error(
        isAr
          ? "تذاكر الطيران لا يمكن إعادة بيعها لأنها مرتبطة بمعلومات شخصية وأمنية."
          : "Flight tickets cannot be resold due to personal and security information requirements."
      );
      return;
    }
    setPendingResellBooking(booking);
    setConfirmResellOpen(true);
  };

  const proceedToResellDialog = async () => {
    if (!pendingResellBooking || !userId) return;
    setConfirmResellOpen(false);

    let ticket = pendingResellBooking.ticket;

    // Auto-create a ticket for this reservation if missing (e.g. flights/hotels)
    if (!ticket) {
      const ticketNumber = `TRH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const eventDate =
        pendingResellBooking.check_in ||
        pendingResellBooking.created_at ||
        new Date().toISOString();

      const { data, error } = await supabase
        .from("tickets")
        .insert({
          user_id: userId,
          reservation_id: pendingResellBooking.id,
          ticket_number: ticketNumber,
          event_name: pendingResellBooking.item_name,
          event_date: eventDate,
          is_valid: true,
          is_resellable: false,
        })
        .select()
        .single();

      if (error || !data) {
        console.error("Error creating ticket:", error);
        toast.error(isAr ? "تعذر إنشاء التذكرة" : "Could not create ticket");
        return;
      }
      ticket = data as TicketRow;
      await fetchMyTickets(userId);
    }

    setSelectedTicketForResell(ticket);
    setSelectedBookingForResell(pendingResellBooking);
    setResellPrice(String(pendingResellBooking.total_price ?? ""));
    setResellDialogOpen(true);
  };

  const handleSubmitResale = async () => {
    if (!selectedTicketForResell || !resellPrice) return;

    // Block flight resale
    if (selectedBookingForResell?.type === "flight") {
      toast.error(
        isAr
          ? "تذاكر الطيران لا يمكن إعادة بيعها لأنها مرتبطة بالهوية الشخصية."
          : "Flight tickets cannot be resold due to personal & security info requirements."
      );
      return;
    }

    // Enforce resale price <= original purchase price
    const originalPrice = Number(selectedBookingForResell?.total_price ?? 0);
    const requested = Number(resellPrice);
    if (!Number.isFinite(requested) || requested <= 0) {
      toast.error(isAr ? "أدخل سعراً صحيحاً" : "Enter a valid price");
      return;
    }
    if (originalPrice > 0 && requested > originalPrice) {
      toast.error(
        isAr
          ? `سعر إعادة البيع يجب ألا يتجاوز السعر الأصلي (${originalPrice} ر.س)`
          : `Resale price must not exceed the original price (${originalPrice} SAR)`
      );
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          is_resellable: true,
          resell_status: "listed",
          resell_price: requested,
        })
        .eq("id", selectedTicketForResell.id);

      if (error) throw error;
      toast.success(isAr ? "تم عرض التذكرة للبيع بنجاح" : "Ticket listed for resale successfully");
      setResellDialogOpen(false);
      if (userId) {
        await Promise.all([fetchMyTickets(userId), fetchResaleTickets()]);
      }
    } catch (error) {
      console.error("Error listing ticket:", error);
      toast.error(isAr ? "حدث خطأ أثناء عرض التذكرة" : "Error listing ticket for resale");
    } finally {
      setSubmitting(false);
    }
  };

  const requestCancelResale = (ticketId: string) => {
    setPendingCancelTicketId(ticketId);
    setConfirmCancelOpen(true);
  };

  const handleCancelResale = async () => {
    if (!pendingCancelTicketId) return;
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ is_resellable: false, resell_status: null })
        .eq("id", pendingCancelTicketId);
      if (error) throw error;
      toast.success(isAr ? "تم إلغاء عرض البيع" : "Resale listing cancelled");
      if (userId) {
        await Promise.all([fetchMyTickets(userId), fetchResaleTickets()]);
      }
    } catch (error) {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setConfirmCancelOpen(false);
      setPendingCancelTicketId(null);
    }
  };

  const requestBuyTicket = (ticket: TicketRow) => {
    setPendingBuyTicket(ticket);
    setConfirmBuyOpen(true);
  };

  const handleBuyTicket = async () => {
    if (!pendingBuyTicket || !userId) return;
    setBuying(true);
    try {
      const sellerId = pendingBuyTicket.user_id;
      const price = Number(pendingBuyTicket.resell_price ?? 0);

      // Transfer ownership + mark as sold
      const { error: updateErr } = await supabase
        .from("tickets")
        .update({
          user_id: userId,
          is_resellable: false,
          resell_status: "sold",
        })
        .eq("id", pendingBuyTicket.id)
        .eq("resell_status", "listed");

      if (updateErr) throw updateErr;

      // Record payment for the buyer
      const { error: payErr } = await supabase.from("payments").insert({
        user_id: userId,
        amount: price,
        currency: "SAR",
        status: "completed",
        payment_method: "mada",
        transaction_id: `RESALE-${Date.now().toString(36).toUpperCase()}`,
      } as any);
      if (payErr) console.warn("Payment insert warning:", payErr);

      // Notify seller
      await supabase.from("notifications").insert({
        user_id: sellerId,
        title: isAr ? "تم بيع تذكرتك" : "Your ticket was sold",
        message: isAr
          ? `تم بيع تذكرتك "${pendingBuyTicket.event_name}" بمبلغ ${price} ر.س`
          : `Your ticket "${pendingBuyTicket.event_name}" was sold for ${price} SAR`,
        type: "resale",
      } as any);

      toast.success(isAr ? "تم شراء التذكرة بنجاح 🎉" : "Ticket purchased successfully 🎉");
      setConfirmBuyOpen(false);
      setPendingBuyTicket(null);
      await Promise.all([fetchMyTickets(userId), fetchResaleTickets()]);
      setActiveTab("bookings");
    } catch (error) {
      console.error("Error buying ticket:", error);
      toast.error(isAr ? "تعذر إتمام الشراء" : "Could not complete purchase");
    } finally {
      setBuying(false);
    }
  };

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
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flight": return <Plane className="w-5 h-5" />;
      case "hotel": return <Hotel className="w-5 h-5" />;
      case "activity": return <CalendarDays className="w-5 h-5" />;
      default: return <Ticket className="w-5 h-5" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case "flight": return "from-blue-500 to-cyan-500";
      case "hotel": return "from-terracotta to-sandy-gold";
      case "activity": return "from-emerald-500 to-teal-500";
      default: return "from-primary to-accent";
    }
  };

  // Combine reservations with their tickets
  const combinedBookings = reservations.map((res) => {
    const ticket = tickets.find((t) => t.reservation_id === res.id);
    return { ...res, ticket };
  });

  const filteredBookings = combinedBookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.item_name.toLowerCase().includes(q) ||
      (b.ticket?.ticket_number || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Ticket className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">{isAr ? "يرجى تسجيل الدخول" : "Please log in"}</h2>
          <p className="text-muted-foreground">{isAr ? "سجل دخولك لعرض تذاكرك وحجوزاتك" : "Log in to view your tickets and bookings"}</p>
          <Button onClick={() => window.location.href = "/auth"} className="rounded-xl bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90">
            {isAr ? "تسجيل الدخول" : "Log In"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta/10 via-sandy-gold/5 to-background" />
        <div className="absolute top-10 right-[10%] w-40 h-40 rounded-full bg-terracotta/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-[15%] w-32 h-32 rounded-full bg-sandy-gold/10 blur-2xl animate-float-delayed" />
        <div className="container relative z-10 px-4">
          <motion.div className="text-center space-y-4" initial="hidden" animate="visible">
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
            <motion.div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto" initial="hidden" animate="visible">
              {[
                { value: reservations.filter((b) => b.status === "confirmed").length, label: isAr ? "مؤكد" : "Confirmed", color: "text-emerald-500" },
                { value: reservations.filter((b) => b.status === "pending").length, label: isAr ? "قيد الانتظار" : "Pending", color: "text-amber-500" },
                { value: reservations.filter((b) => b.status === "cancelled").length, label: isAr ? "ملغي" : "Cancelled", color: "text-red-500" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} custom={i} className="text-center p-4 rounded-xl bg-card border border-border/50">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Booking Cards */}
            {filteredBookings.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
                <Ticket className="w-16 h-16 mx-auto text-muted-foreground/40" />
                <h3 className="text-xl font-semibold text-muted-foreground">{isAr ? "لا توجد حجوزات بعد" : "No bookings yet"}</h3>
                <p className="text-sm text-muted-foreground">{isAr ? "ابدأ بحجز رحلتك القادمة!" : "Start by booking your next trip!"}</p>
              </motion.div>
            ) : (
              <motion.div className="grid gap-4 max-w-3xl mx-auto" initial="hidden" animate="visible">
                {filteredBookings.map((booking, i) => (
                  <motion.div key={booking.id} variants={fadeUp} custom={i}>
                    <Card className="overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300 group">
                      <div className="flex flex-col sm:flex-row">
                        <div className={`sm:w-2 w-full h-2 sm:h-auto bg-gradient-to-b ${getTypeGradient(booking.type)}`} />
                        <CardContent className="flex-1 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeGradient(booking.type)} flex items-center justify-center text-white shrink-0`}>
                                {getTypeIcon(booking.type)}
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-bold text-lg">{booking.item_name}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  {booking.check_in && (
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="w-3.5 h-3.5" />
                                      {new Date(booking.check_in).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                                    </span>
                                  )}
                                  {booking.check_out && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {isAr ? "حتى" : "to"} {new Date(booking.check_out).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                  {booking.ticket && (
                                    <span className="font-mono text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
                                      {booking.ticket.ticket_number}
                                    </span>
                                  )}
                                  {getStatusBadge(booking.status)}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="text-xl font-bold text-primary">{booking.total_price || 0} {isAr ? "ر.س" : "SAR"}</div>
                              <div className="flex gap-2">
                                {booking.ticket && booking.status === "confirmed" && (
                                  <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => handleShowQR(booking.ticket, booking.item_name)}>
                                    <QrCode className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                                    QR
                                  </Button>
                                )}
                                {booking.status === "confirmed" && (
                                  booking.type === "flight" ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled
                                      title={isAr
                                        ? "تذاكر الطيران لا يمكن إعادة بيعها لأنها مرتبطة بمعلومات شخصية وأمنية."
                                        : "Flight tickets cannot be resold due to personal and security information requirements."}
                                      className="rounded-lg text-xs opacity-70 cursor-not-allowed"
                                    >
                                      <Plane className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                                      {isAr ? "غير قابل للبيع" : "Non-transferable"}
                                    </Button>
                                  ) : booking.ticket?.resell_status === "listed" ? (
                                    <Button size="sm" variant="outline" className="rounded-lg text-xs border-red-300 text-red-500" onClick={() => requestCancelResale(booking.ticket!.id)}>
                                      <XCircle className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                                      {isAr ? "إلغاء البيع" : "Cancel"}
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="default" className="rounded-lg text-xs bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90" onClick={() => requestListForResale(booking)}>
                                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                                      {isAr ? "إعادة بيع" : "Resell"}
                                    </Button>
                                  )
                                )}
                                {booking.type === "flight" && booking.status === "confirmed" && (
                                  <p className="basis-full text-[10px] text-muted-foreground mt-1 max-w-[220px] text-right rtl:text-left">
                                    {isAr
                                      ? "تذاكر الطيران مرتبطة بهويتك الشخصية ولا يمكن نقلها."
                                      : "Flight tickets are linked to your identity and cannot be transferred."}
                                  </p>
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
            )}
          </TabsContent>

          {/* Resale Tab */}
          <TabsContent value="resale" className="space-y-8">
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
                { icon: Tag, value: resaleTickets.length, label: isAr ? "تذاكر متاحة" : "Available", gradient: "from-terracotta to-sandy-gold" },
                { icon: Users, value: new Set(resaleTickets.map(t => t.user_id)).size, label: isAr ? "بائع نشط" : "Active Sellers", gradient: "from-blue-500 to-cyan-500" },
                { icon: DollarSign, value: resaleTickets.length > 0 ? "20%" : "0%", label: isAr ? "متوسط الخصم" : "Avg. Discount", gradient: "from-emerald-500 to-teal-500" },
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
              {resaleTickets.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Tag className="w-12 h-12 mx-auto text-muted-foreground/40" />
                  <p className="text-muted-foreground">{isAr ? "لا توجد تذاكر معروضة حالياً" : "No tickets listed for resale currently"}</p>
                </div>
              ) : (
                <motion.div className="grid gap-4" initial="hidden" animate="visible">
                  {resaleTickets.map((ticket, i) => (
                    <motion.div key={ticket.id} variants={fadeUp} custom={i}>
                      <Card className="overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <h4 className="font-bold text-lg">{ticket.event_name}</h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  {new Date(ticket.event_date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                                </span>
                                <span className="font-mono text-xs bg-secondary/60 px-2 py-0.5 rounded">{ticket.ticket_number}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right rtl:text-left">
                                <div className="text-xl font-bold text-primary">
                                  {ticket.resell_price ?? 0} {isAr ? "ر.س" : "SAR"}
                                </div>
                                <div className="text-xs text-muted-foreground">{isAr ? "سعر إعادة البيع" : "Resale price"}</div>
                              </div>
                              {ticket.user_id !== userId && (
                                <Button
                                  className="rounded-xl bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90"
                                  onClick={() => requestBuyTicket(ticket)}
                                >
                                  {isAr ? "اشترِ الآن" : "Buy Now"}
                                </Button>
                              )}
                              {ticket.user_id === userId && (
                                <Badge variant="outline" className="text-sm">{isAr ? "تذكرتك" : "Your ticket"}</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Sell Your Ticket CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-3xl mx-auto">
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
                  <Button
                    size="lg"
                    className="rounded-xl bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90 px-8"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <Tag className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {isAr ? "اذهب لحجوزاتك واختر تذكرة" : "Go to bookings & pick a ticket"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Resell Dialog */}
      <Dialog open={resellDialogOpen} onOpenChange={setResellDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isAr ? "عرض التذكرة للبيع" : "List Ticket for Resale"}</DialogTitle>
          </DialogHeader>
          {selectedTicketForResell && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/40 space-y-2">
                <p className="font-semibold">{selectedTicketForResell.event_name}</p>
                <p className="text-sm text-muted-foreground font-mono">{selectedTicketForResell.ticket_number}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedTicketForResell.event_date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "سعر البيع (ر.س)" : "Resale Price (SAR)"}</Label>
                <Input
                  type="number"
                  placeholder={isAr ? "أدخل السعر المطلوب" : "Enter desired price"}
                  value={resellPrice}
                  onChange={(e) => setResellPrice(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResellDialogOpen(false)} className="rounded-xl">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleSubmitResale}
              disabled={!resellPrice || submitting}
              className="rounded-xl bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isAr ? "تأكيد العرض" : "Confirm Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{isAr ? "رمز QR للتذكرة" : "Ticket QR Code"}</DialogTitle>
          </DialogHeader>
          {qrTicket && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div ref={qrRef} className="p-4 bg-white rounded-xl">
                <QRCodeCanvas
                  value={JSON.stringify({
                    ticket: qrTicket.ticketNumber,
                    event: qrTicket.eventName,
                    date: qrTicket.date,
                  })}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="text-center space-y-1">
                <p className="font-mono text-sm font-bold">{qrTicket.ticketNumber}</p>
                <p className="text-sm text-muted-foreground">{qrTicket.bookingName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(qrTicket.date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                </p>
              </div>
              <Button onClick={handleDownloadQR} className="w-full rounded-xl bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90">
                <QrCode className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {isAr ? "تحميل كصورة" : "Download as Image"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Confirm Resell */}
      <AlertDialog open={confirmResellOpen} onOpenChange={setConfirmResellOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAr ? "هل أنت متأكد أنك تريد إعادة البيع؟" : "Are you sure you want to resell?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? `سيتم عرض حجزك "${pendingResellBooking?.item_name ?? ""}" في سوق إعادة البيع. يمكنك إلغاء العرض في أي وقت قبل البيع.`
                : `Your booking "${pendingResellBooking?.item_name ?? ""}" will be listed on the resale marketplace. You can cancel the listing anytime before it sells.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "تراجع" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={proceedToResellDialog}
              className="bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90"
            >
              {isAr ? "نعم، متابعة" : "Yes, continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Cancel Resale */}
      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAr ? "إلغاء عرض البيع؟" : "Cancel resale listing?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? "سيتم إزالة التذكرة من سوق إعادة البيع."
                : "The ticket will be removed from the resale marketplace."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "تراجع" : "Back"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelResale} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isAr ? "نعم، إلغاء" : "Yes, cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Buy Ticket */}
      <AlertDialog open={confirmBuyOpen} onOpenChange={(o) => !buying && setConfirmBuyOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAr ? "تأكيد شراء التذكرة" : "Confirm ticket purchase"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBuyTicket && (
                <>
                  {isAr
                    ? `هل أنت متأكد من شراء تذكرة "${pendingBuyTicket.event_name}" بمبلغ ${pendingBuyTicket.resell_price ?? 0} ر.س؟ سيتم نقل ملكية التذكرة إليك فوراً وتسجيل عملية الدفع.`
                    : `Are you sure you want to buy "${pendingBuyTicket.event_name}" for ${pendingBuyTicket.resell_price ?? 0} SAR? Ownership will be transferred to you and the payment will be recorded.`}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={buying}>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleBuyTicket(); }}
              disabled={buying}
              className="bg-gradient-to-r from-terracotta to-sandy-gold hover:opacity-90"
            >
              {buying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isAr ? "تأكيد الشراء" : "Confirm purchase"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTickets;
