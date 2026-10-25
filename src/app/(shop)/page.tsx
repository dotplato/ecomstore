import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCard } from "@/components/product/product-card";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 8,
    }),
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-6 sm:px-6 lg:px-8">
      <HeroCarousel />

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group overflow-hidden rounded-xl"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 12vw"
                  />
                )}
              </div>
              <p className="mt-2 truncate text-center text-xs font-medium text-foreground/80">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            Shop all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                title: p.title,
                slug: p.slug,
                originalPrice: p.originalPrice,
                discountedPrice: p.discountedPrice,
                ratingAvg: p.ratingAvg,
                reviewCount: p.reviewCount,
                imageUrl: p.images[0]?.url ?? null,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
