import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, AlertCircle, TrendingUp } from "lucide-react";

const SystemMonitor = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalReservations: 0,
    errorLogs: 0,
    systemHealth: "جيد",
  });

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const { count: reservationsCount } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true });

      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: errorCount } = await supabase
        .from("system_logs")
        .select("*", { count: "exact", head: true })
        .eq("log_type", "error");

      setStats({
        activeUsers: usersCount || 0,
        totalReservations: reservationsCount || 0,
        errorLogs: errorCount || 0,
        systemHealth: errorCount && errorCount > 10 ? "متوسط" : "جيد",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">إجمالي المسجلين</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الحجوزات</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReservations}</div>
          <p className="text-xs text-muted-foreground">إجمالي الحجوزات</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">سجلات الأخطاء</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.errorLogs}</div>
          <p className="text-xs text-muted-foreground">أخطاء نشطة</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">صحة النظام</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge variant={stats.systemHealth === "جيد" ? "default" : "secondary"}>
            {stats.systemHealth}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">حالة الخوادم</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitor;
