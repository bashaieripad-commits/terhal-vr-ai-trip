import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Camera, LogOut, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Profile = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      setEmail(user.email || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
        setPhone(profile.phone || "");
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
      } else {
        setFullName(user.user_metadata?.full_name || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone })
        .eq("id", user.id);

      if (error) throw error;
      toast.success(isRtl ? "تم حفظ التغييرات" : "Changes saved");
    } catch (error: any) {
      toast.error(error.message || (isRtl ? "حدث خطأ" : "Something went wrong"));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(isRtl ? "تم تسجيل الخروج" : "Signed out");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <Navbar />

      <div className="container py-10 px-4 relative z-10">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="shadow-[var(--shadow-lg)] border border-border/60 overflow-hidden backdrop-blur-sm bg-card/80">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

              {/* Avatar + Name Header */}
              <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-md">
                    <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-foreground">{fullName || email}</h1>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </CardHeader>

              {/* Form */}
              <CardContent className="space-y-5 pb-8">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                    <User className="h-4 w-4 text-primary" />
                    {isRtl ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isRtl ? "أدخل اسمك" : "Enter your name"}
                    className="rounded-xl h-12"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                    <Mail className="h-4 w-4 text-primary" />
                    {isRtl ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <Input
                    value={email}
                    disabled
                    className="rounded-xl h-12 bg-muted/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                    <Phone className="h-4 w-4 text-primary" />
                    {isRtl ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isRtl ? "05xxxxxxxx" : "+966 5xxxxxxxx"}
                    className="rounded-xl h-12"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    variant="hero"
                    className="flex-1 rounded-xl h-12"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 me-2" />
                        {isRtl ? "حفظ التغييرات" : "Save Changes"}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="rounded-xl h-12 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                  >
                    <LogOut className="h-4 w-4 me-2" />
                    {isRtl ? "خروج" : "Sign Out"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
