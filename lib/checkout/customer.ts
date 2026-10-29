export type CustomerDraft = {
  customerName: string;
  phone: string;
  city: string;
  address: string;
};

export type CustomerField = keyof CustomerDraft;

const phonePattern = /^[0-9+\s-]{8,16}$/;

export function customerFieldErrors(draft: CustomerDraft): Partial<Record<CustomerField, string>> {
  const errors: Partial<Record<CustomerField, string>> = {};
  if (draft.customerName.trim().length < 2) errors.customerName = "أكمل الاسم.";
  if (!phonePattern.test(draft.phone.trim())) errors.phone = "رقم الموبايل غير واضح.";
  if (draft.city.trim().length < 2) errors.city = "أكمل المدينة أو المحافظة.";
  if (draft.address.trim().length < 8) errors.address = "أكمل العنوان.";
  return errors;
}

export function firstCustomerError(draft: CustomerDraft): string | null {
  const errors = customerFieldErrors(draft);
  return errors.customerName ?? errors.phone ?? errors.city ?? errors.address ?? null;
}
