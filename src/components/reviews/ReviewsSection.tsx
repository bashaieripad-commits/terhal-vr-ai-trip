import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, ShieldCheck, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type ItemType = "hotel" | "activity" | "flight";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  reviewer_name?: string | null;
}

interface Props {
  itemId: string;
  itemType: ItemType;
  itemName: string;
}

const StarRow = ({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange?.(n)}
        disabled={!onChange}
        aria-label={`${n} stars`}
        className={onChange ? "transition-transform hover:scale-110" : "cursor-default"}
      >
        <Star
          style={{ width: size, height: size }}
          className={n <= value ? "fill-sandy-gold text-sandy-gold" : "text-muted-foreground/40"}
        />
      </button>
    ))}
  </div>
);

export const ReviewsSection = ({ itemId, itemType, itemName }: Props) => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"latest" | "highest">("latest");

  const [user, setUser] = useState<any>(null);
  const [eligibleReservation, setEligibleReservation] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [reportTarget, setReportTarget] = useState<Review | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("id, user_id, rating, comment, is_verified, created_at")
      .eq("item_id", itemId)
      .eq("item_type", itemType)
      .eq("is_approved", true)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Fetch reviewer names from profiles (only first name shown for privacy)
    const ids = Array.from(new Set((data ?? []).map((r) => r.user_id)));
    let nameMap: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      profs?.forEach((p) => {
        const first = (p.full_name ?? "").trim().split(/\s+/)[0];
        nameMap[p.id] = first || (isAr ? "زائر" : "Guest");
      });
    }

    setReviews((data ?? []).map((r) => ({ ...r, reviewer_name: nameMap[r.user_id] ?? (isAr ? "زائر" : "Guest") })));
    setLoading(false);
  };

  const checkEligibility = async (uid: string) => {
    // confirmed/completed reservation matching this item by name (item_id is text)
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", uid)
      .eq("item_id", itemId)
      .eq("item_type", itemType)
      .maybeSingle();
    setAlreadyReviewed(!!existing);

    const { data: res } = await supabase
      .from("reservations")
      .select("id, item_name, status, type, check_out, created_at")
      .eq("user_id", uid)
      .eq("type", itemType)
      .in("status", ["confirmed", "completed"])
      .order("created_at", { ascending: false });

    const match = (res ?? []).find((r) => r.item_name === itemName);
    setEligibleReservation(match?.id ?? null);
  };

  useEffect(() => {
    fetchReviews();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) checkEligibility(data.user.id);
    });
  }, [itemId, itemType]);

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (sortBy === "highest") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return list;
  }, [reviews, sortBy]);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  const submitReview = async () => {
    if (!user) {
      toast.error(isAr ? "سجّل دخولك أولاً" : "Please sign in first");
      return;
    }
    if (!eligibleReservation) {
      toast.error(isAr ? "يلزم وجود حجز مؤكد لهذا العنصر" : "A confirmed booking is required");
      return;
    }
    if (rating < 1) {
      toast.error(isAr ? "اختر تقييماً من 1 إلى 5" : "Pick a rating 1–5");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      item_id: itemId,
      item_type: itemType,
      rating,
      comment: comment.trim().slice(0, 1000) || null,
      reservation_id: eligibleReservation,
    } as any);
    setSubmitting(false);
    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }
    toast.success(isAr ? "تم نشر مراجعتك. شكراً!" : "Review posted. Thanks!");
    setRating(0);
    setComment("");
    setAlreadyReviewed(true);
    fetchReviews();
  };

  const submitReport = async () => {
    if (!user || !reportTarget) return;
    if (reportReason.trim().length < 5) {
      toast.error(isAr ? "اكتب سبباً واضحاً" : "Please write a clear reason");
      return;
    }
    setReporting(true);
    const { error } = await supabase.from("review_reports").insert({
      review_id: reportTarget.id,
      user_id: user.id,
      reason: reportReason.trim().slice(0, 500),
    } as any);
    setReporting(false);
    if (error) {
      toast.error(
        error.code === "23505"
          ? isAr ? "سبق أن أبلغت عن هذه المراجعة" : "You already reported this review"
          : error.message
      );
      return;
    }
    toast.success(isAr ? "تم إرسال البلاغ" : "Report submitted");
    setReportTarget(null);
    setReportReason("");
  };

  return (
    <Card className="border-2 border-border/50">
      <CardContent className="p-6 space-y-6">
        {/* Header / average */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">{isAr ? "آراء الضيوف" : "Guest Reviews"}</h3>
            <div className="flex items-center gap-3">
              <StarRow value={Math.round(avg)} size={20} />
              <span className="font-semibold">{avg ? avg.toFixed(1) : "—"}</span>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {isAr ? "مراجعة" : "reviews"})
              </span>
            </div>
          </div>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">{isAr ? "الأحدث" : "Latest"}</SelectItem>
              <SelectItem value="highest">{isAr ? "الأعلى تقييماً" : "Highest rated"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Compose */}
        {user && eligibleReservation && !alreadyReviewed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{isAr ? "شاركنا تجربتك" : "Share your experience"}</p>
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                {isAr ? "مستخدم موثّق" : "Verified user"}
              </Badge>
            </div>
            <StarRow value={rating} onChange={setRating} />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isAr ? "اكتب رأيك (اختياري)" : "Write your opinion (optional)"}
              maxLength={1000}
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={submitReview} disabled={submitting} variant="hero" className="rounded-xl">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isAr ? "نشر المراجعة" : "Post review"}
              </Button>
            </div>
          </motion.div>
        )}

        {user && !eligibleReservation && !alreadyReviewed && (
          <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-3">
            {isAr
              ? "تستطيع كتابة مراجعة فقط بعد إتمام حجز مؤكد لهذا العنصر."
              : "You can post a review only after a confirmed booking for this item."}
          </p>
        )}

        {alreadyReviewed && (
          <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-3">
            {isAr ? "شكراً لمشاركتك مراجعتك مسبقاً." : "Thanks — you've already shared a review."}
          </p>
        )}

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isAr ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {isAr ? "لا توجد مراجعات بعد. كن أول من يكتب مراجعة!" : "No reviews yet. Be the first!"}
            </p>
          ) : (
            sorted.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-border/50 bg-card"
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.reviewer_name}</span>
                    {r.is_verified && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <ShieldCheck className="h-3 w-3" />
                        {isAr ? "مستخدم موثّق" : "Verified"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRow value={r.rating} size={16} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                    </span>
                  </div>
                </div>
                {r.comment && <p className="text-sm leading-relaxed text-foreground/80">{r.comment}</p>}
                {user && user.id !== r.user_id && (
                  <button
                    onClick={() => setReportTarget(r)}
                    className="mt-2 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                  >
                    <Flag className="h-3 w-3" />
                    {isAr ? "إبلاغ" : "Report"}
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={!!reportTarget} onOpenChange={(o) => !o && setReportTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "الإبلاغ عن مراجعة" : "Report review"}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder={isAr ? "اشرح سبب الإبلاغ" : "Explain why you're reporting"}
            rows={4}
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportTarget(null)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={submitReport} disabled={reporting}>
              {reporting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isAr ? "إرسال البلاغ" : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ReviewsSection;
