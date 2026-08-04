import { cn } from "@/lib/utils";

/** Estrellas de marca: media estrella incluida, accesible por texto */
export function Stars({
  rating,
  size = 14,
  className,
  showValue = false,
}: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return (
            <svg
              key={i}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <defs>
                <linearGradient id={`s-${i}-${fill}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={fill} stopColor="#F4D58D" />
                  <stop offset={fill} stopColor="#F4D58D" stopOpacity="0.28" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.6l2.7 5.9 6.3.7-4.7 4.4 1.3 6.4L12 16.8 6.4 20l1.3-6.4L3 9.2l6.3-.7z"
                fill={`url(#s-${i}-${fill})`}
                stroke="#E0BC72"
                strokeWidth="0.7"
                strokeLinejoin="round"
              />
            </svg>
          );
        })}
      </span>
      <span className="sr-only">{rating} de 5 estrellas</span>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-ink">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
