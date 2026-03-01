import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, CheckCircle, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Check hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(isRtl ? "كلمات المرور غير متطابقة" : "Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error(isRtl ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success(isRtl ? "تم تغيير كلمة المرور بنجاح!" : "Password updated successfully!");
      setTimeout(() => navigate("/auth"), 2500);
    } catch (error: any) {
      toast.error(error.message || (isRtl ? "حدث خطأ" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <Navbar />

      <div className="container py-12 px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="shadow-[var(--shadow-lg)] border border-border/60 overflow-hidden backdrop-blur-sm bg-card/80">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
              <CardContent className="p-6 pt-8">
                {success ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {isRtl ? "تم تغيير كلمة المرور!" : "Password Updated!"}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {isRtl ? "سيتم توجيهك لتسجيل الدخول..." : "Redirecting to sign in..."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-[var(--shadow-md)]">
                        <KeyRound className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h1 className="text-2xl font-bold text-foreground mb-1">
                        {isRtl ? "إعادة تعيين كلمة المرور" : "Reset Password"}
                      </h1>
                      <p className="text-muted-foreground text-sm">
                        {isRtl ? "أدخل كلمة المرور الجديدة" : "Enter your new password"}
                      </p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <Lock className="h-4 w-4 text-primary" />
                          {isRtl ? "كلمة المرور الجديدة" : "New Password"}
                        </label>
                        <div className="relative">
                          <Input
                            type={showPass ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="rounded-xl h-12 pe-12"
                          />
                          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground transition-colors">
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <Lock className="h-4 w-4 text-primary" />
                          {isRtl ? "تأكيد كلمة المرور" : "Confirm Password"}
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="rounded-xl h-12 pe-12"
                          />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground transition-colors">
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" variant="hero" className="w-full rounded-xl h-12" size="lg" disabled={loading}>
                        {loading ? (isRtl ? "جاري التحديث..." : "Updating...") : (isRtl ? "تحديث كلمة المرور" : "Update Password")}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
