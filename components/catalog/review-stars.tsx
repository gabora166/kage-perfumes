import { Star } from "lucide-react";

type ReviewStarsProps = {
  value: number;
};

export function ReviewStars({ value }: ReviewStarsProps) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex gap-0.5" aria-label={`${filled} من 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={star <= filled ? "size-4 fill-bronze text-bronze" : "size-4 fill-transparent text-ink/25"}
        />
      ))}
    </span>
  );
}
