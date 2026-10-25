import Link from "next/link";
import { notFound } from "next/navigation";
import { Share2 } from "lucide-react";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { PriceDisplay } from "@/components/product/price-display";
import { ProductGallery } from "@/components/product/product-gallery";
import { StarRating } from "@/components/product/star-rating";
import { ReviewForm } from "@/components/product/review-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug, status: "LIVE" } });
  return { title: product?.title ?? "Product" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { slug, status: "LIVE" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  let wished = false;
  if (session?.user?.id) {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: product.id,
        },
      },
    });
    wished = Boolean(item);
  }

  const shortTitle =
    product.title.length > 90
      ? `${product.title.slice(0, 90)}...`
      : product.title;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>›</span>
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span>›</span>
        <span className="line-clamp-1 text-foreground">{shortTitle}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div className="relative space-y-5">
          <button
            type="button"
            className="absolute right-0 top-0 rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>

          <div>
            <h1 className="pr-10 text-xl font-semibold leading-snug sm:text-2xl">
              {shortTitle}
            </h1>
            {product.title.length > 90 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-sm text-primary hover:underline">
                  Show full title
                </summary>
                <p className="mt-1 text-sm text-foreground/80">{product.title}</p>
              </details>
            )}
          </div>

          <StarRating
            rating={product.ratingAvg}
            count={product.reviewCount}
            size="md"
          />

          <PriceDisplay
            originalPrice={product.originalPrice}
            discountedPrice={product.discountedPrice}
            size="detail"
            showBadge
          />

          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{product.stock}</span> in
            stock
          </p>

          <AddToCartPanel
            productId={product.id}
            stock={product.stock}
            slug={product.slug}
            wished={wished}
          />

          <div className="border-t border-border pt-5">
            <h2 className="mb-2 font-semibold">About</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              {product.about}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Category:{" "}
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <section className="mt-14 border-t border-border pt-8">
        <h2 className="mb-4 text-xl font-bold">Reviews</h2>
        {session ? (
          <ReviewForm productId={product.id} />
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">
            <Link href={`/login?callbackUrl=/product/${slug}`} className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        )}

        {product.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {product.reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border border-border/60 bg-white p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {review.user.name ?? review.user.email}
                  </p>
                  <StarRating rating={review.rating} showCount={false} />
                </div>
                <p className="text-sm text-foreground/80">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
