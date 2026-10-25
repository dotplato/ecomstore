import {
  discountPercent,
  formatMoney,
  sellingPrice,
  toNumber,
  type MoneyInput,
} from "@/lib/money";
import { cn } from "@/lib/utils";

export function PriceDisplay({
  originalPrice,
  discountedPrice,
  size = "card",
  showBadge = false,
}: {
  originalPrice: MoneyInput;
  discountedPrice: MoneyInput;
  size?: "card" | "detail";
  showBadge?: boolean;
}) {
  const original = toNumber(originalPrice);
  const discounted = toNumber(discountedPrice);
  const sell = sellingPrice(original, discounted);
  const pct = discountPercent(original, discounted);
  const onSale = pct > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "font-semibold tabular-nums text-foreground",
          size === "detail" ? "text-2xl" : "text-base",
        )}
      >
        {formatMoney(sell)}
      </span>
      {onSale && (
        <>
          <span
            className={cn(
              "tabular-nums text-muted-foreground line-through",
              size === "detail" ? "text-base" : "text-sm",
            )}
          >
            {formatMoney(original)}
          </span>
          {showBadge && (
            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              -{pct}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
