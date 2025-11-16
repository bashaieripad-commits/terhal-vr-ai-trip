import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trash2, CreditCard, Hotel, Plane, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Checkout = () => {
  const { items, removeItem, clearCart, getTotalPrice } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: language === "ar" ? "تم الدفع بنجاح!" : "Payment Successful!",
      description: language === "ar" 
        ? "تم تأكيد حجزك. ستصلك رسالة تأكيد عبر البريد الإلكتروني."
        : "Your booking is confirmed. A confirmation email will be sent to you.",
    });
    clearCart();
    navigate("/");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Hotel className="h-5 w-5" />;
      case "flight":
        return <Plane className="h-5 w-5" />;
      case "activity":
        return <MapPin className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    if (language === "ar") {
      return type === "hotel" ? "فندق" : type === "flight" ? "رحلة" : "نشاط";
    }
    return type;
  };

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
                ? "أضف فنادق أو رحلات أو أنشطة للبدء في الحجز"
                : "Add hotels, flights, or activities to start booking"}
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
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-28 h-28 object-cover rounded-lg shadow-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(item.type)}
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(item.type)}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </p>
                          {item.checkIn && item.checkOut && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {language === "ar" 
                                  ? `${item.checkIn} - ${item.checkOut}`
                                  : `${item.checkIn} - ${item.checkOut}`}
                              </span>
                              {item.nights && (
                                <span className="text-primary font-medium">
                                  ({item.nights} {language === "ar" ? "ليالي" : "nights"})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {language === "ar" ? "السعر الإجمالي" : "Total Price"}
                        </span>
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
                  <CreditCard className="h-5 w-5 text-primary" />
                  {language === "ar" ? "معلومات الدفع" : "Payment Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">
                      {language === "ar" ? "الاسم على البطاقة" : "Name on Card"}
                    </Label>
                    <Input id="cardName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">
                      {language === "ar" ? "رقم البطاقة" : "Card Number"}
                    </Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">
                        {language === "ar" ? "تاريخ الانتهاء" : "Expiry Date"}
                      </Label>
                      <Input id="expiry" placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" required />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-sandy-gold hover:opacity-90 transition-opacity" 
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {language === "ar" ? "إتمام الدفع" : "Complete Payment"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {language === "ar" 
                      ? "جميع المعاملات آمنة ومشفرة" 
                      : "All transactions are secure and encrypted"}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-sandy-gold/10">
                <CardTitle className="text-xl">
                  {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                </CardTitle>
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
                      {language === "ar" 
                        ? `${getTotalPrice()} ر.س`
                        : `SAR ${getTotalPrice()}`}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{language === "ar" ? "دفع آمن ومشفر" : "Secure encrypted payment"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>{language === "ar" ? "جميع بطاقات الائتمان مقبولة" : "All major credit cards accepted"}</span>
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
