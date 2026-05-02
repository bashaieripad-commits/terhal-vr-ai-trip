import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Users,
  Ticket,
  Monitor,
  CalendarCheck,
  Bell,
  CreditCard,
  Star,
  FileText,
  BarChart3,
  TrendingUp,
  LogOut,
} from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import TicketManagement from "@/components/admin/TicketManagement";
import SystemMonitor from "@/components/admin/SystemMonitor";
import ReservationManagement from "@/components/admin/ReservationManagement";
import NotificationManagement from "@/components/admin/NotificationManagement";
import PaymentOversight from "@/components/admin/PaymentOversight";
import ReviewManagement from "@/components/admin/ReviewManagement";
import ContentManagement from "@/components/admin/ContentManagement";
import Analytics from "@/components/admin/Analytics";
import SearchTrends from "@/components/admin/SearchTrends";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        toast.error("غير مصرح لك بالدخول إلى لوحة التحكم");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">لوحة تحكم المسؤول</h1>
            <p className="text-muted-foreground">إدارة جميع جوانب المنصة</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل الخروج
          </Button>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">المستخدمين</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">التذاكر</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">النظام</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              <span className="hidden sm:inline">الحجوزات</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">الإشعارات</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">المدفوعات</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">المراجعات</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">المحتوى</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="search-trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">اتجاهات البحث</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketManagement />
          </TabsContent>

          <TabsContent value="system">
            <SystemMonitor />
          </TabsContent>

          <TabsContent value="reservations">
            <ReservationManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentOversight />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="search-trends">
            <SearchTrends />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
