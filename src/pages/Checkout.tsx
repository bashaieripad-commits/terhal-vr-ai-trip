import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trash2, CreditCard, Hotel, Plane, MapPin, Calendar, ShieldCheck, Smartphone, Wallet, CheckCircle2, Copy, Loader2, User, Luggage, Utensils, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const generateReferenceNumber = () => {
  const prefix = "TRH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const Checkout = () => {
  const { items, removeItem, clearCart, getTotalPrice } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [bookedItems, setBookedItems] = useState<typeof items>([]);

  const flightItems = items.filter((i) => i.type === "flight");
  const hasFlights = flightItems.length > 0;

  type Passenger = {
    fullName: string;
    docType: "national_id" | "passport";
    docNumber: string;
    nationality: string;
    dob: string;
    gender: "male" | "female" | "";
    email: string;
    phone: string;
    baggage: "none" | "23kg" | "32kg";
    meal: "standard" | "vegetarian" | "halal" | "kids";
    specialAssistance: boolean;
    acceptTerms: boolean;
  };

  const makeEmptyPassenger = (): Passenger => ({
    fullName: "",
    docType: "national_id",
    docNumber: "",
    nationality: language === "ar" ? "السعودية" : "Saudi Arabia",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    baggage: "23kg",
    meal: "standard",
    specialAssistance: false,
    acceptTerms: false,
  });

  const [passengers, setPassengers] = useState<Record<string, Passenger>>(() =>
    Object.fromEntries(items.filter((i) => i.type === "flight").map((i) => [i.id, makeEmptyPassenger()]))
  );

  // keep passengers map in sync with cart flights
  const syncPassengers = () => {
    setPassengers((prev) => {
      const next: Record<string, Passenger> = {};
      flightItems.forEach((i) => {
        next[i.id] = prev[i.id] ?? makeEmptyPassenger();
      });
      return next;
    });
  };

  const updatePassenger = (id: string, patch: Partial<Passenger>) => {
    setPassengers((prev) => ({ ...prev, [id]: { ...(prev[id] ?? makeEmptyPassenger()), ...patch } }));
  };

  const validateFlightForms = (): string | null => {
    for (const f of flightItems) {
      const p = passengers[f.id];
      if (!p) return language === "ar" ? "بيانات الراكب ناقصة" : "Passenger details missing";
      if (!p.fullName.trim() || p.fullName.trim().split(/\s+/).length < 2)
        return language === "ar" ? "الاسم الكامل مطلوب (مطابق للهوية/الجواز)" : "Full name (as on ID/passport) is required";
      if (!p.docNumber.trim() || p.docNumber.trim().length < 5)
        return language === "ar" ? "رقم الهوية أو الجواز غير صحيح" : "ID/Passport number is invalid";
      if (!p.dob) return language === "ar" ? "تاريخ الميلاد مطلوب" : "Date of birth is required";
      if (!p.gender) return language === "ar" ? "الجنس مطلوب" : "Gender is required";
      if (!/^\S+@\S+\.\S+$/.test(p.email)) return language === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email";
      if (!/^[+0-9\s-]{8,}$/.test(p.phone)) return language === "ar" ? "رقم الجوال غير صحيح" : "Invalid phone number";
      if (!p.acceptTerms)
        return language === "ar"
          ? "يجب الموافقة على شروط شركة الطيران وتأكيد صحة البيانات"
          : "You must accept airline terms and confirm details are correct";
    }
    return null;
  };


  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) return;

    if (hasFlights) {
      syncPassengers();
      const err = validateFlightForms();
      if (err) {
        toast.error(err);
        return;
      }
    }
    
    setIsProcessing(true);
    const ref = generateReferenceNumber();
    setReferenceNumber(ref);
    setBookedItems([...items]);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Create reservation in database
        const reservationPromises = items.map((item) => {
          const passenger = item.type === "flight" ? passengers[item.id] : null;
          return supabase.from("reservations").insert({
            user_id: user.id,
            type: item.type,
            item_name: item.name,
            total_price: item.price,
            check_in: item.checkIn || null,
            check_out: item.checkOut || null,
            guests: 1,
            status: "confirmed",
            details: {
              reference_number: ref,
              payment_method: paymentMethod,
              location: item.location,
              image: item.image,
              nights: item.nights || null,
              ...(passenger
                ? {
                    passenger: {
                      full_name: passenger.fullName,
                      doc_type: passenger.docType,
                      doc_number: passenger.docNumber,
                      nationality: passenger.nationality,
                      dob: passenger.dob,
                      gender: passenger.gender,
                      email: passenger.email,
                      phone: passenger.phone,
                      baggage: passenger.baggage,
                      meal: passenger.meal,
                      special_assistance: passenger.specialAssistance,
                    },
                    pnr: ref.split("-").pop(),
                    e_ticket: `ETKT-${ref}`,
                  }
                : {}),
            },
          });
        });

        const results = await Promise.all(reservationPromises);
        const errors = results.filter((r) => r.error);
        
        if (errors.length > 0) {
          console.error("Reservation errors:", errors);
          // Continue anyway - payment simulation succeeded
        }
      }

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setBookingConfirmed(true);
      clearCart();

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        language === "ar" 
          ? "حدث خطأ أثناء معالجة الدفع. حاول مرة أخرى." 
          : "An error occurred during payment processing. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const copyReference = () => {
    navigator.clipboard.writeText(referenceNumber);
    toast.success(language === "ar" ? "تم نسخ الرقم المرجعي" : "Reference number copied");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel": return <Hotel className="h-5 w-5" />;
      case "flight": return <Plane className="h-5 w-5" />;
      case "activity": return <MapPin className="h-5 w-5" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    if (language === "ar") {
      return type === "hotel" ? "فندق" : type === "flight" ? "رحلة" : "نشاط";
    }
    return type;
  };

  // Booking Confirmation Screen
  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 px-4">
          <motion.div 
            className="max-w-lg mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div 
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-sandy-gold flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="h-14 w-14 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-3 text-foreground">
              {language === "ar" ? "تم الحجز بنجاح! 🎉" : "Booking Confirmed! 🎉"}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {language === "ar" 
                ? "شكراً لك! تم تأكيد حجزك وستصلك رسالة تأكيد عبر البريد الإلكتروني."
                : "Thank you! Your booking is confirmed. A confirmation email will be sent to you."}
            </p>

            {/* Reference Number */}
            <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  {language === "ar" ? "الرقم المرجعي" : "Reference Number"}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-bold text-primary tracking-wider">{referenceNumber}</span>
                  <Button size="icon" variant="ghost" onClick={copyReference} className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Booked Items Summary */}
            <Card className="mb-8 text-start">
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "تفاصيل الحجز" : "Booking Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.location}</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">
                      {item.price} {language === "ar" ? "ر.س" : "SAR"}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold">{language === "ar" ? "الإجمالي" : "Total"}</span>
                  <span className="text-xl font-bold text-primary">
                    {bookedItems.reduce((sum, item) => sum + item.price, 0)} {language === "ar" ? "ر.س" : "SAR"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/my-tickets")} size="lg" className="bg-gradient-to-r from-primary to-sandy-gold">
                {language === "ar" ? "عرض حجوزاتي" : "View My Bookings"}
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" size="lg">
                {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty Cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-sandy-gold flex items-center justify-center">
              <CreditCard className="h-12 w-12 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {language === "ar" ? "سلتك فارغة" : "Your cart is empty"}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {language === "ar" 
                ? "أضف فنادق أو رحلات أو فعاليات للبدء في الحجز"
                : "Add hotels, flights, or events to start booking"}
            </p>
            <Button 
              onClick={() => navigate("/search")} 
              size="lg"
              className="bg-gradient-to-r from-primary to-sandy-gold hover:opacity-90 transition-opacity"
            >
              {language === "ar" ? "ابدأ البحث" : "Start Searching"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-sandy-gold bg-clip-text text-transparent">
            {language === "ar" ? "إتمام الحجز" : "Checkout"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" ? "أكمل حجزك بشكل آمن" : "Complete your booking securely"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-sandy-gold/5">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {language === "ar" ? "عناصر الحجز" : "Booking Items"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border-2 rounded-xl hover:border-primary/50 transition-all bg-card">
                    <img src={item.image} alt={item.name} className="w-28 h-28 object-cover rounded-lg shadow-md" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(item.type)}
                            <Badge variant="secondary" className="text-xs">{getTypeLabel(item.type)}</Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" />{item.location}
                          </p>
                          {item.checkIn && item.checkOut && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{item.checkIn} - {item.checkOut}</span>
                              {item.nights && (
                                <span className="text-primary font-medium">
                                  ({item.nights} {language === "ar" ? "ليالي" : "nights"})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{language === "ar" ? "السعر الإجمالي" : "Total Price"}</span>
                        <div className="text-xl font-bold bg-gradient-to-r from-primary to-sandy-gold bg-clip-text text-transparent">
                          {language === "ar" ? `${item.price} ر.س` : `SAR ${item.price}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-sandy-gold/5">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  {language === "ar" ? "طريقة الدفع" : "Payment Method"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {[
                    { value: "apple", label: "Apple Pay", desc: language === "ar" ? "دفع سريع وآمن" : "Fast and secure" },
                    { value: "google", label: "Google Pay", desc: language === "ar" ? "دفع بنقرة واحدة" : "One-tap payment" },
                    { value: "stc", label: "STC Pay", desc: language === "ar" ? "المحفظة الرقمية" : "Digital wallet" },
                    { value: "mada", label: "مدى - Mada", desc: language === "ar" ? "البطاقة السعودية" : "Saudi card network" },
                    { value: "card", label: language === "ar" ? "بطاقة ائتمان" : "Credit/Debit Card", desc: "Visa, Mastercard" },
                  ].map((method) => (
                    <div key={method.value} className="flex items-center space-x-2 rtl:space-x-reverse border-2 rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer">
                      <RadioGroupItem value={method.value} id={method.value} />
                      <Label htmlFor={method.value} className="cursor-pointer flex-1">
                        <div className="font-semibold">{method.label}</div>
                        <div className="text-xs text-muted-foreground">{method.desc}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4 p-4 border-2 rounded-lg bg-muted/20">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">{language === "ar" ? "الاسم على البطاقة" : "Name on Card"}</Label>
                      <Input id="cardName" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">{language === "ar" ? "رقم البطاقة" : "Card Number"}</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">{language === "ar" ? "تاريخ الانتهاء" : "Expiry Date"}</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" maxLength={3} required />
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handlePayment} className="mt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-sandy-gold hover:opacity-90 transition-opacity" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {language === "ar" ? "جاري معالجة الدفع..." : "Processing payment..."}
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        {language === "ar" ? `ادفع ${getTotalPrice()} ر.س` : `Pay SAR ${getTotalPrice()}`}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    {language === "ar" 
                      ? "🔒 جميع المعاملات آمنة ومشفرة ببروتوكول SSL" 
                      : "🔒 All transactions are secure and encrypted with SSL"}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-sandy-gold/10">
                <CardTitle className="text-xl">{language === "ar" ? "ملخص الطلب" : "Order Summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm items-start p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 flex-1">
                        {getTypeIcon(item.type)}
                        <span className="text-muted-foreground line-clamp-1">{item.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {language === "ar" ? `${item.price} ر.س` : `SAR ${item.price}`}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="bg-gradient-to-r from-primary/5 to-sandy-gold/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{language === "ar" ? "الإجمالي" : "Total"}</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-sandy-gold bg-clip-text text-transparent">
                      {language === "ar" ? `${getTotalPrice()} ر.س` : `SAR ${getTotalPrice()}`}
                    </span>
                  </div>
                </div>
                <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{language === "ar" ? "دفع آمن ومشفر SSL 256-bit" : "Secure 256-bit SSL encryption"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>{language === "ar" ? "جميع البطاقات والمحافظ مقبولة" : "All cards and wallets accepted"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span>{language === "ar" ? "دعم Apple Pay و Google Pay" : "Apple Pay & Google Pay supported"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
