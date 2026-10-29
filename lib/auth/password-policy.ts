const minimumPasswordLength = 8;
const maximumPasswordLength = 128;

type PasswordChangeInput = {
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
};

export function validatePasswordChange(input: PasswordChangeInput): string | null {
  if (!input.currentPassword || !input.nextPassword) return "أكمل كلمة المرور الحالية والجديدة.";
  if (input.nextPassword.length < minimumPasswordLength || input.nextPassword.length > maximumPasswordLength) {
    return "كلمة المرور الجديدة يجب أن تكون بين 8 و 128 حرفًا.";
  }
  if (input.nextPassword !== input.confirmPassword) return "تأكيد كلمة المرور غير مطابق.";
  if (input.nextPassword === input.currentPassword) return "اختر كلمة مرور مختلفة عن الحالية.";
  return null;
}
