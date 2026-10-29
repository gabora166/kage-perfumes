import { PasswordForm } from "@/components/admin/password-form";

export default function PasswordPage() {
  return (
    <div className="max-w-md">
      <h1 className="font-arabic-display text-5xl">كلمة المرور</h1>
      <p className="mt-3 leading-8 text-mist">
        غيّر كلمة الدخول قبل نشر الدار. الجلسة الحالية تبقى بعد التغيير.
      </p>
      <PasswordForm />
    </div>
  );
}
