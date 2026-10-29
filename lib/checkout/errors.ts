export function publicCheckoutError(message: string): string {
  const allowed = message.startsWith("أحد") || message.startsWith("أكمل") || message.startsWith("رقم")
    || message.startsWith("الحقيبة") || message.startsWith("كمية") || message.startsWith("حجم")
    || message.startsWith("الكثافة") || message.startsWith("اختر") || message.startsWith("الرمز")
    || message.startsWith("رسالة") || message.startsWith("مجموعة") || message.startsWith("عرض");
  return allowed ? message : "تعذّر حفظ الطلب.";
}
