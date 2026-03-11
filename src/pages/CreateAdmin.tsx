import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";

const CreateAdmin = () => {
  const [email, setEmail] = useState("admin@tarhal.com");
  const [password, setPassword] = useState("1234");
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: { email, password }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('تم إنشاء حساب المسؤول بنجاح!');
      toast.info(`الإيميل: ${email}\nكلمة المرور: ${password}`);
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(
        error instanceof Error ? error.message : 'حدث خطأ في إنشاء حساب المسؤول'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            إنشاء حساب مسؤول
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">البريد الإلكتروني</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة المرور</label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleCreateAdmin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                إنشاء حساب المسؤول
              </>
            )}
          </Button>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>ملاحظة:</strong> بعد إنشاء الحساب، استخدم هذه البيانات لتسجيل الدخول في صفحة /admin/login
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdmin;
