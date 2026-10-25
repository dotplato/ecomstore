"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export type CartActionResult = { ok: boolean; error?: string };

async function requireUserId(callbackPath?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    const cb = callbackPath ? `?callbackUrl=${encodeURIComponent(callbackPath)}` : "";
    redirect(`/login${cb}`);
  }
  return session.user.id;
}

export async function addToCartAction(
  productId: string,
  quantity = 1,
): Promise<CartActionResult> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Product not found" };
  const userId = await requireUserId(`/product/${product.slug}`);
  if (product.stock < 1) return { ok: false, error: "Out of stock" };

  const cart = await getOrCreateCart(userId);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const nextQty = (existing?.quantity ?? 0) + quantity;
  if (nextQty > product.stock) {
    return { ok: false, error: `Only ${product.stock} in stock` };
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: nextQty },
  });

  revalidatePath("/cart");
  revalidatePath("/shop");
  return { ok: true };
}

export async function updateCartItemAction(
  productId: string,
  quantity: number,
): Promise<CartActionResult> {
  const userId = await requireUserId("/cart");
  if (quantity < 1) return removeCartItemAction(productId);

  const cart = await getOrCreateCart(userId);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Product not found" };
  if (quantity > product.stock) {
    return { ok: false, error: `Only ${product.stock} in stock` };
  }

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity },
  });

  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function removeCartItemAction(
  productId: string,
): Promise<CartActionResult> {
  const userId = await requireUserId("/cart");
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function buyNowAction(productId: string, quantity = 1) {
  const result = await addToCartAction(productId, quantity);
  if (!result.ok) return result;
  redirect("/checkout");
}
