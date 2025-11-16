import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trash2, CreditCard, Hotel, Plane, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

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
          <h2 className="text-2xl font-bold mb-4">
            {language === "ar" ? "سلتك فارغة" : "Your cart is empty"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === "ar" 
              ? "أضف فنادق أو رحلات أو أنشطة للبدء في الحجز"
              : "Add hotels, flights, or activities to start booking"}
          </p>
          <Button onClick={() => navigate("/search")} variant="hero">
            {language === "ar" ? "ابدأ البحث" : "Start Searching"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">
          {language === "ar" ? "إتمام الحجز" : "Checkout"}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "عناصر السلة" : "Cart Items"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(item.type)}
                            <span className="text-xs text-muted-foreground uppercase">
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.location}</p>
                          {item.nights && (
                            <p className="text-sm text-muted-foreground">
                              {item.nights} {language === "ar" ? "ليالي" : "nights"} • {item.checkIn} - {item.checkOut}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-lg font-bold text-primary">${item.price}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {language === "ar" ? "معلومات الدفع" : "Payment Information"}
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                  <Button type="submit" className="w-full" variant="hero">
                    {language === "ar" ? "ادفع الآن" : "Pay Now"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate max-w-[200px]">{item.name}</span>
                      <span className="font-medium">${item.price}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                  <span className="text-primary">${getTotalPrice()}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  {language === "ar"
                    ? "الأسعار تشمل جميع الضرائب والرسوم"
                    : "Prices include all taxes and fees"}
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
