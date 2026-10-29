type InkCircleMotifProps = {
  className?: string;
};

/** Lightweight Japanese-inspired enso — decorative only, static. */
export function InkCircleMotif({ className }: InkCircleMotifProps) {
  return (
    <div aria-hidden="true" className={className}>
      <svg viewBox="0 0 420 420" className="h-full w-full text-seal" fill="none">
        <path
          d="M210 46c78 4 138 58 148 132 9 68-28 132-92 158-62 26-136 12-176-42-42-56-38-138 12-186 42-40 98-62 108-62"
          stroke="currentColor"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <path
          d="M198 58c66 8 118 52 126 112 8 54-22 106-74 128-48 20-108 8-140-36-34-46-30-112 10-150 34-34 78-52 78-54"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.45"
        />
        <circle cx="318" cy="92" r="7" fill="currentColor" opacity="0.35" />
      </svg>
    </div>
  );
}
