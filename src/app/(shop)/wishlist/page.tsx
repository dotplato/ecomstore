import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleWishlistAction } from "@/actions/wishlist";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/wishlist");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id, product: { status: "LIVE" } },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Wishlist</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">No saved items yet.</p>
          <Link
            href="/shop"
            className="text-sm font-medium text-primary hover:underline"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <ProductCard
                product={{
                  id: item.product.id,
                  title: item.product.title,
                  slug: item.product.slug,
                  originalPrice: item.product.originalPrice,
                  discountedPrice: item.product.discountedPrice,
                  ratingAvg: item.product.ratingAvg,
                  reviewCount: item.product.reviewCount,
                  imageUrl: item.product.images[0]?.url ?? null,
                }}
              />
              <form
                action={async () => {
                  "use server";
                  await toggleWishlistAction(item.productId, "/wishlist");
                }}
                className="absolute right-2 top-2 z-10"
              >
                <Button
                  type="submit"
                  size="icon-sm"
                  variant="secondary"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
