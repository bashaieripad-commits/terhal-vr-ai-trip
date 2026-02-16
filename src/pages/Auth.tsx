import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Shield, Tent } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: signInEmail, password: signInPassword });
      if (error) throw error;
      toast.success(language === "ar" ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!");
      navigate("/");
    } catch (error: any) { toast.error(error.message || "Login failed"); } finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) { toast.error(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords don't match"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail, password: signUpPassword,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: signUpFullName } }
      });
      if (error) throw error;
      toast.success(language === "ar" ? "تم إنشاء الحساب بنجاح!" : "Account created!");
      navigate("/");
    } catch (error: any) { toast.error(error.message || "Signup failed"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-80 h-80 rounded-full bg-sandy-gold/5 blur-3xl" />
      
      <Navbar />
      
      <div className="container py-12 px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-terracotta to-sandy-gold mb-6 shadow-[var(--shadow-lg)]">
              <Tent className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              {language === "ar" ? "أهلاً بك في ترحال" : "Welcome to Terhal"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {language === "ar" ? "رحلتك تبدأ من هنا" : "Your journey begins here"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="shadow-[var(--shadow-lg)] border-2 border-border/50 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-terracotta via-sandy-gold to-warm-beige" />
              <CardContent className="p-6 pt-8">
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 rounded-xl p-1 bg-muted/50">
                    <TabsTrigger value="signin" className="rounded-lg">{language === "ar" ? "تسجيل الدخول" : "Sign In"}</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg">{language === "ar" ? "حساب جديد" : "Sign Up"}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-5">
                    <form onSubmit={handleSignIn} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <Mail className="h-4 w-4 text-primary" />
                          {language === "ar" ? "البريد الإلكتروني" : "Email"}
                        </label>
                        <Input type="email" placeholder="your@email.com" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                          <Lock className="h-4 w-4 text-primary" />
                          {language === "ar" ? "كلمة المرور" : "Password"}
                        </label>
                        <Input type="password" placeholder="••••••••" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <Button type="submit" variant="hero" className="w-full rounded-xl h-12" size="lg" disabled={loading}>
                        {loading ? (language === "ar" ? "جاري التحميل..." : "Loading...") : (language === "ar" ? "تسجيل الدخول" : "Sign In")}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-5">
                    <form onSubmit={handleSignUp} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80"><User className="h-4 w-4 text-primary" />{language === "ar" ? "الاسم الكامل" : "Full Name"}</label>
                        <Input placeholder={language === "ar" ? "الاسم الكامل" : "Full name"} value={signUpFullName} onChange={(e) => setSignUpFullName(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80"><Mail className="h-4 w-4 text-primary" />{language === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                        <Input type="email" placeholder="your@email.com" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80"><Lock className="h-4 w-4 text-primary" />{language === "ar" ? "كلمة المرور" : "Password"}</label>
                        <Input type="password" placeholder="••••••••" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-foreground/80"><Lock className="h-4 w-4 text-primary" />{language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                        <Input type="password" placeholder="••••••••" value={signUpConfirmPassword} onChange={(e) => setSignUpConfirmPassword(e.target.value)} required className="rounded-xl h-12" />
                      </div>
                      <Button type="submit" variant="hero" className="w-full rounded-xl h-12" size="lg" disabled={loading}>
                        {loading ? (language === "ar" ? "جاري الإنشاء..." : "Creating...") : (language === "ar" ? "إنشاء حساب" : "Create Account")}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">{language === "ar" ? "أو" : "Or continue with"}</span></div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full rounded-xl h-12">
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      Google
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/admin/login">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                <Shield className="w-4 h-4" />
                {language === "ar" ? "تسجيل دخول الموظفين" : "Staff Login"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
