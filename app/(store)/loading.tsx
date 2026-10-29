/** Restrained pending plate while a storefront segment streams — no spinner, no ninja. */
export default function StoreLoading() {
  return (
    <div className="relative min-h-[40svh] bg-paper" aria-busy="true" aria-live="polite">
      <span className="sr-only">جارٍ التحميل</span>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px overflow-hidden bg-border"
      >
        <div className="store-loading-ink h-full w-1/3 bg-seal/80" />
      </div>
    </div>
  );
}
