import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";

const NotificationManagement = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          title,
          message,
          type,
          is_broadcast: isBroadcast,
        });

      if (error) throw error;

      toast.success("تم إرسال الإشعار بنجاح");
      setTitle("");
      setMessage("");
      setType("general");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("خطأ في إرسال الإشعار");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          إدارة الإشعارات
        </CardTitle>
        <CardDescription>إرسال إشعارات للمستخدمين</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الإشعار</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الإشعار"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">محتوى الإشعار</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="أدخل محتوى الإشعار"
              required
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">نوع الإشعار</Label>
            <Select value={type} onValueChange={setType} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">عام</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
                <SelectItem value="offer">عرض</SelectItem>
                <SelectItem value="reservation">حجز</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {loading ? "جاري الإرسال..." : "إرسال الإشعار"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationManagement;
