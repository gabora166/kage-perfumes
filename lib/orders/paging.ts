export const orderPageSize = 10;

const maximumOrderPage = 10000;

export function readOrderPage(value: string | null): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  if (page > maximumOrderPage) return maximumOrderPage;
  return page;
}

export function orderSearchPattern(value: string): string {
  const trimmed = value.trim().slice(0, 80);
  const escaped = trimmed.replace(/[\\%_]/g, (character) => `\\${character}`);
  return `%${escaped}%`;
}
