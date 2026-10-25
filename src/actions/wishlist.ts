"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleWishlistAction(productId: string, returnPath?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    const cb = returnPath ? `?callbackUrl=${encodeURIComponent(returnPath)}` : "";
    redirect(`/login${cb}`);
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    const product = await prisma.product.findFirst({ where: { id: productId, status: "LIVE" } });
    if (!product) return { ok: false as const, error: "Product unavailable" };
    await prisma.wishlistItem.create({
      data: { userId: session.user.id, productId },
    });
  }

  revalidatePath("/wishlist");
  revalidatePath("/shop");
  if (returnPath) revalidatePath(returnPath);
  return { ok: true as const, wished: !existing };
}
