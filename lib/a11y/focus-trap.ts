export function nextTrapTarget(
  items: readonly HTMLElement[],
  active: EventTarget | null,
  shiftKey: boolean,
): HTMLElement | null {
  if (items.length === 0) return null;
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return null;
  if (shiftKey && active === first) return last;
  if (!shiftKey && active === last) return first;
  return null;
}

export function focusableElements(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
}
