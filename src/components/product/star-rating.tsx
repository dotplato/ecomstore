import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  count,
  showCount = true,
  size = "sm",
}: {
  rating: number;
  count?: number;
  showCount?: boolean;
  size?: "sm" | "md";
}) {
  const starClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(
                starClass,
                filled ? "fill-amber-400 text-amber-400" : "text-amber-300/70",
              )}
            />
          );
        })}
      </div>
      {showCount && (
        <span className={cn("tabular-nums", size === "md" ? "text-sm" : "text-xs")}>
          {rating.toFixed(1)}
          {typeof count === "number" && (
            <span>
              {" "}
              ({count}
              {size === "md" ? " reviews" : ""})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
