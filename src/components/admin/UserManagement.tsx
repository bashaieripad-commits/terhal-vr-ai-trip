import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  is_disabled: boolean;
}

const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("خطأ في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisable = async (userId: string, currentlyDisabled: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_disabled: !currentlyDisabled })
        .eq("id", userId);

      if (error) throw error;

      toast.success(currentlyDisabled ? "تم تفعيل المستخدم" : "تم تعطيل المستخدم");
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, is_disabled: !currentlyDisabled } : p))
      );
    } catch (error) {
      console.error("Error toggling user:", error);
      toast.error("خطأ في تحديث حالة المستخدم");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("تم حذف المستخدم بنجاح");
      fetchProfiles();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "خطأ في حذف المستخدم");
    }
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          إدارة المستخدمين
        </CardTitle>
        <CardDescription>عرض وإدارة جميع المستخدمين المسجلين</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تفعيل/تعطيل</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id} className={profile.is_disabled ? "opacity-60" : ""}>
                <TableCell>{profile.full_name || "غير محدد"}</TableCell>
                <TableCell>{profile.phone || "غير محدد"}</TableCell>
                <TableCell>
                  {new Date(profile.created_at).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell>
                  <Badge variant={profile.is_disabled ? "destructive" : "default"}>
                    {profile.is_disabled ? "معطّل" : "نشط"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={!profile.is_disabled}
                    onCheckedChange={() => handleToggleDisable(profile.id, profile.is_disabled)}
                  />
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف المستخدم نهائياً ولا يمكن التراجع. يُفضل تعطيل الحساب بدلاً من الحذف.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(profile.id)}>
                          حذف نهائي
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
