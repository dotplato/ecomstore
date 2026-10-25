"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators";

export type ReviewResult = { ok: boolean; error?: string };

export async function createReviewAction(
  _prev: ReviewResult | null,
  formData: FormData,
): Promise<ReviewResult> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || product.status !== "LIVE") return { ok: false, error: "Product not found" };

  const existing = await prisma.review.findUnique({
    where: {
      productId_userId: {
        productId: parsed.data.productId,
        userId: session.user.id,
      },
    },
  });
  if (existing) {
    return { ok: false, error: "You already reviewed this product" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        productId: parsed.data.productId,
        userId: session.user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    const agg = await tx.review.aggregate({
      where: { productId: parsed.data.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: parsed.data.productId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        reviewCount: agg._count.rating,
      },
    });
  });

  revalidatePath(`/product/${product.slug}`);
  return { ok: true };
}
