import { Suspense } from "react";
import { CategoryPills } from "@/components/product/category-pills";
import { ProductCard } from "@/components/product/product-card";
import { SearchForm } from "@/components/layout/search-form";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type SearchParams = Promise<{ category?: string; q?: string }>;

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category: categorySlug, q } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  const where: Prisma.ProductWhereInput = { status: "LIVE" };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (q?.trim()) {
    where.OR = [
      { title: { contains: q.trim(), mode: "insensitive" } },
      { about: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { title: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <Suspense fallback={<div className="h-10 w-full max-w-xs rounded-full bg-muted" />}>
          <SearchForm className="w-full max-w-xs" compact />
        </Suspense>
      </div>

      <div className="mb-8">
        <CategoryPills
          categories={categories}
          activeSlug={categorySlug}
          searchQuery={q}
        />
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No products found. Try another category or search.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {products.map((p) => (
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
      )}
    </div>
  );
}
