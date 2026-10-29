type AdminFallbackProps = {
  label?: string;
};

export function AdminFallback({ label = "KAGE" }: AdminFallbackProps) {
  return (
    <div className="grid min-h-svh place-items-center bg-ink">
      <p className="font-sans text-xs tracking-[0.45em] text-gold">{label}</p>
    </div>
  );
}
