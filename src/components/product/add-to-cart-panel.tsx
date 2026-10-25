"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCartAction, buyNowAction } from "@/actions/cart";
import { toggleWishlistAction } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddToCartPanel({
  productId,
  stock,
  slug,
  wished = false,
}: {
  productId: string;
  stock: number;
  slug: string;
  wished?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isWished, setIsWished] = useState(wished);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function clamp(n: number) {
    return Math.max(1, Math.min(stock, n));
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center rounded-full border border-border bg-white">
        <button
          type="button"
          className="h-10 w-10 text-lg text-foreground/70 hover:text-foreground disabled:opacity-40"
          onClick={() => setQty((q) => clamp(q - 1))}
          disabled={qty <= 1}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="min-w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
        <button
          type="button"
          className="h-10 w-10 text-lg text-foreground/70 hover:text-foreground disabled:opacity-40"
          onClick={() => setQty((q) => clamp(q + 1))}
          disabled={qty >= stock}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className="min-w-[160px] flex-1"
          disabled={pending || stock < 1}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await addToCartAction(productId, qty);
              if (!res.ok) setError(res.error ?? "Could not add to cart");
              else router.refresh();
            });
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-xl"
          disabled={pending}
          aria-label="Toggle wishlist"
          onClick={() => {
            startTransition(async () => {
              const res = await toggleWishlistAction(
                productId,
                `/product/${slug}`,
              );
              if (res.ok) setIsWished(res.wished);
            });
          }}
        >
          <Heart
            className={cn("h-5 w-5", isWished && "fill-red-500 text-red-500")}
          />
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full rounded-full"
        disabled={pending || stock < 1}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await buyNowAction(productId, qty);
            if (res && !res.ok) setError(res.error ?? "Could not checkout");
          });
        }}
      >
        Buy Now
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {stock < 1 && (
        <p className="text-sm font-medium text-red-600">Out of stock</p>
      )}
    </div>
  );
}
