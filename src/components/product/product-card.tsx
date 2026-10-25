import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { addToCartAction } from "@/actions/cart";
import { PriceDisplay } from "@/components/product/price-display";
import { StarRating } from "@/components/product/star-rating";
import { discountPercent, toNumber, type MoneyInput } from "@/lib/money";

export type ProductCardData = {
  id: string;
  title: string;
  slug: string;
  originalPrice: MoneyInput;
  discountedPrice: MoneyInput;
  ratingAvg: number;
  reviewCount: number;
  imageUrl: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const pct = discountPercent(product.originalPrice, product.discountedPrice);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-white transition hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square bg-white">
        {pct > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-sm bg-amber-300 px-1.5 py-0.5 text-xs font-bold text-amber-950">
            -{pct}%
          </span>
        )}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-contain p-3 transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-1">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground hover:underline"
        >
          {product.title}
        </Link>
        <StarRating rating={product.ratingAvg} count={product.reviewCount} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <PriceDisplay
            originalPrice={toNumber(product.originalPrice)}
            discountedPrice={toNumber(product.discountedPrice)}
          />
          <form
            action={async () => {
              "use server";
              await addToCartAction(product.id, 1);
            }}
          >
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
              aria-label={`Add ${product.title} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
