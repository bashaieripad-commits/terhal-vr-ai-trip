import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface Content {
  id: string;
  content_type: string;
  title: string;
  description: string | null;
  price: number | null;
  location: string | null;
  is_active: boolean | null;
  created_at: string | null;
  vr_content: string | null;
  images: any;
}

const emptyForm = {
  content_type: "hotel",
  title: "",
  description: "",
  price: "",
  location: "",
  is_active: true,
  vr_content: "",
};

const ContentManagement = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("خطأ في تحميل المحتوى");
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: Content) => {
    setForm({
      content_type: item.content_type,
      title: item.title,
      description: item.description || "",
      price: item.price?.toString() || "",
      location: item.location || "",
      is_active: item.is_active ?? true,
      vr_content: item.vr_content || "",
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("يرجى إدخال عنوان المحتوى");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        content_type: form.content_type,
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: form.price ? parseFloat(form.price) : null,
        location: form.location.trim() || null,
        is_active: form.is_active,
        vr_content: form.vr_content.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("content")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("تم تحديث المحتوى بنجاح");
      } else {
        const { error } = await supabase
          .from("content")
          .insert(payload);
        if (error) throw error;
        toast.success("تم إضافة المحتوى بنجاح");
      }

      setDialogOpen(false);
      fetchContent();
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast.error(error.message || "خطأ في حفظ المحتوى");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("content").delete().eq("id", id);
      if (error) throw error;
      toast.success("تم حذف المحتوى بنجاح");
      fetchContent();
    } catch (error: any) {
      console.error("Error deleting content:", error);
      toast.error(error.message || "خطأ في حذف المحتوى");
    }
  };

  const contentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hotel: "فندق",
      flight: "رحلة",
      activity: "نشاط",
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>إدارة المحتوى</CardTitle>
              <CardDescription>إضافة وتحديث محتوى الفنادق والرحلات</CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة محتوى
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {content.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد محتوى بعد. اضغط على "إضافة محتوى" للبدء.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>النوع</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{contentTypeLabel(item.content_type)}</Badge>
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.location || "-"}</TableCell>
                    <TableCell>{item.price ? `${item.price} ريال` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "نشط" : "معطل"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("ar-SA")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد من حذف هذا المحتوى؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف المحتوى نهائياً ولا يمكن التراجع.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل المحتوى" : "إضافة محتوى جديد"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>نوع المحتوى</Label>
              <Select
                value={form.content_type}
                onValueChange={(v) => setForm({ ...form, content_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">فندق</SelectItem>
                  <SelectItem value="flight">رحلة</SelectItem>
                  <SelectItem value="activity">نشاط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>العنوان *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="أدخل عنوان المحتوى"
              />
            </div>
            <div className="grid gap-2">
              <Label>الوصف</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="أدخل وصف المحتوى"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>السعر (ريال)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>الموقع</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="المدينة أو المنطقة"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>رابط محتوى VR</Label>
              <Input
                value={form.vr_content}
                onChange={(e) => setForm({ ...form, vr_content: e.target.value })}
                placeholder="رابط المحتوى الافتراضي (اختياري)"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "جاري الحفظ..." : editingId ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentManagement;
