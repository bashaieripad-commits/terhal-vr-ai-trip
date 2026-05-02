import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Check, X } from "lucide-react";

interface Review {
  id: string;
  item_type: string;
  item_id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  is_verified?: boolean;
  is_hidden?: boolean;
  report_count?: number;
  created_at: string;
}

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("خطأ في تحميل المراجعات");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("تم تحديث حالة المراجعة");
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("خطأ في تحديث المراجعة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المراجعة؟")) return;

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);

      if (error) throw error;
      toast.success("تم حذف المراجعة");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("خطأ في حذف المراجعة");
    }
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة المراجعات</CardTitle>
        <CardDescription>عرض وحذف المراجعات غير اللائقة</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>النوع</TableHead>
              <TableHead>التقييم</TableHead>
              <TableHead>التعليق</TableHead>
              <TableHead>موثّق</TableHead>
              <TableHead>البلاغات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <Badge variant="outline">{review.item_type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {"⭐".repeat(review.rating)}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {review.comment || "-"}
                </TableCell>
                <TableCell>
                  {review.is_verified ? <Badge>موثّق</Badge> : <Badge variant="outline">—</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant={(review.report_count ?? 0) > 0 ? "destructive" : "outline"}>
                    {review.report_count ?? 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={review.is_hidden ? "destructive" : review.is_approved ? "default" : "secondary"}>
                    {review.is_hidden ? "مخفية" : review.is_approved ? "معتمدة" : "معلقة"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant={review.is_approved ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        handleToggleApproval(review.id, review.is_approved)
                      }
                    >
                      {review.is_approved ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReviewManagement;
