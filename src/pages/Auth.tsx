import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Shield, Tent, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const PasswordInput = ({ value, onChange, show, onToggle, placeholder }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string;
}) => (
  <div className="relative">
    <Input
      type={show ? "text" : "password"}
      placeholder={placeholder || "••••••••"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="rounded-xl h-12 pe-12"
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground transition-colors"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [showSignInPass, setShowSignInPass] = useState(false);
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [showSignUpConfirm, setShowSignUpConfirm] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const isRtl = language === "ar";

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
      toast.success(isRtl ? "تم إرسال رابط إعادة التعيين!" : "Reset link sent!");
    } catch (error: any) {
      toast.error(error.message || (isRtl ? "حدث خطأ" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: signInEmail, password: signInPassword });
      if (error) throw error;
      toast.success(isRtl ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!");
      navigate("/");
    } catch (error: any) { toast.error(error.message || "Login failed"); } finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) { toast.error(isRtl ? "كلمات المرور غير متطابقة" : "Passwords don't match"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail, password: signUpPassword,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: signUpFullName } }
      });
      if (error) throw error;
      toast.success(isRtl ? "تم إنشاء الحساب بنجاح!" : "Account created!");
      navigate("/");
    } catch (error: any) { toast.error(error.message || "Signup failed"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <Navbar />

      <div className="container py-8 px-4 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mb-5 shadow-[var(--shadow-lg)]"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Tent className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-1.5 text-foreground">
              {isRtl ? "أهلاً بك في ترحال" : "Welcome to Terhal"}
            </h1>
            <p className="text-muted-foreground">
              {isRtl ? "رحلتك تبدأ من هنا" : "Your journey begins here"}
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="shadow-[var(--shadow-lg)] border border-border/60 overflow-hidden backdrop-blur-sm bg-card/80">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
              <CardContent className="p-6 pt-7">
                {forgotMode ? (
                  <div className="space-y-5">
                    <div className="text-center mb-2">
                      <h2 className="text-xl font-bold text-foreground mb-1">
                        {isRtl ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {isRtl ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين" : "Enter your email and we'll send you a reset link"}
                      </p>
                    </div>
                    {forgotSent ? (
                      <div className="text-center py-6 space-y-3">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
                          <Mail className="h-7 w-7 text-primary" />
                        </div>
                        <p className="text-sm text-foreground font-medium">
                          {isRtl ? "تم إرسال رابط إعادة التعيين!" : "Reset link sent!"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isRtl ? "تحقق من بريدك الإلكتروني" : "Check your email inbox"}
                        </p>
                        <Button variant="ghost" className="mt-2" onClick={() => { setForgotMode(false); setForgotSent(false); }}>
                          {isRtl ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                            <Mail className="h-4 w-4 text-primary" />
                            {isRtl ? "البريد الإلكتروني" : "Email"}
                          </label>
                          <Input type="email" placeholder="your@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="rounded-xl h-12" />
                        </div>
                        <Button type="submit" variant="hero" className="w-full rounded-xl h-12" size="lg" disabled={loading}>
                          {loading ? (isRtl ? "جاري الإرسال..." : "Sending...") : (isRtl ? "إرسال رابط إعادة التعيين" : "Send Reset Link")}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotMode(false)}>
                          {isRtl ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                        </Button>
                      </form>
                    )}
                  </div>
                ) : (
                <Tabs defaultValue={searchParams.get("tab") === "signup" ? "signup" : "signin"} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-7 rounded-xl p-1 bg-muted/60 h-11">
                    <TabsTrigger value="signin" className="rounded-lg font-medium text-sm data-[state=active]:shadow-[var(--shadow-sm)]">
                      {isRtl ? "تسجيل الدخول" : "Sign In"}
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg font-medium text-sm data-[state=active]:shadow-[var(--shadow-sm)]">
                      {isRtl ? "حساب جديد" : "Sign Up"}
                    </TabsTrigger>
                  </TabsList>

                  {/* Sign In */}
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <Mail className="h-4 w-4 text-primary" />
                          {isRtl ? "البريد الإلكتروني" : "Email"}
                        </label>
                        <Input type="email" placeholder="your@email.com" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                            <Lock className="h-4 w-4 text-primary" />
                            {isRtl ? "كلمة المرور" : "Password"}
                          </label>
                          <button
                            type="button"
                            onClick={() => setForgotMode(true)}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                          >
                            {isRtl ? "نسيت كلمة المرور؟" : "Forgot password?"}
                          </button>
                        </div>
                        <PasswordInput value={signInPassword} onChange={setSignInPassword} show={showSignInPass} onToggle={() => setShowSignInPass(!showSignInPass)} />
                      </div>

                      <Button type="submit" variant="hero" className="w-full rounded-xl h-12 group" size="lg" disabled={loading}>
                        {loading
                          ? (isRtl ? "جاري التحميل..." : "Loading...")
                          : (
                            <span className="flex items-center gap-2">
                              {isRtl ? "تسجيل الدخول" : "Sign In"}
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                            </span>
                          )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Sign Up */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <User className="h-4 w-4 text-primary" />
                          {isRtl ? "الاسم الكامل" : "Full Name"}
                        </label>
                        <Input placeholder={isRtl ? "محمد أحمد" : "John Doe"} value={signUpFullName} onChange={(e) => setSignUpFullName(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <Mail className="h-4 w-4 text-primary" />
                          {isRtl ? "البريد الإلكتروني" : "Email"}
                        </label>
                        <Input type="email" placeholder="your@email.com" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <Lock className="h-4 w-4 text-primary" />
                          {isRtl ? "كلمة المرور" : "Password"}
                        </label>
                        <PasswordInput value={signUpPassword} onChange={setSignUpPassword} show={showSignUpPass} onToggle={() => setShowSignUpPass(!showSignUpPass)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <Lock className="h-4 w-4 text-primary" />
                          {isRtl ? "تأكيد كلمة المرور" : "Confirm Password"}
                        </label>
                        <PasswordInput value={signUpConfirmPassword} onChange={setSignUpConfirmPassword} show={showSignUpConfirm} onToggle={() => setShowSignUpConfirm(!showSignUpConfirm)} />
                      </div>

                      <Button type="submit" variant="hero" className="w-full rounded-xl h-12 group" size="lg" disabled={loading}>
                        {loading
                          ? (isRtl ? "جاري الإنشاء..." : "Creating...")
                          : (
                            <span className="flex items-center gap-2">
                              {isRtl ? "إنشاء حساب" : "Create Account"}
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                            </span>
                          )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                )}

                {/* Divider + Google */}
                <div className="mt-7">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card/80 px-3 text-muted-foreground">
                        {isRtl ? "أو" : "Or continue with"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full rounded-xl h-12 hover:bg-muted/60 transition-colors">
                      <svg className="me-2 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Staff login */}
          <motion.div
            className="mt-5 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/admin/login">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground text-sm">
                <Shield className="w-4 h-4" />
                {isRtl ? "تسجيل دخول الموظفين" : "Staff Login"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
