"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import { computeCheckoutTotals } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";

export type CheckoutResult = { ok: boolean; error?: string };

export async function placeOrderAction(
  _prev: CheckoutResult | null,
  formData: FormData,
): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    address: formData.get("address"),
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { lines, subtotal, cart } = await getCartWithItems(session.user.id);
  if (!cart || lines.length === 0) {
    return { ok: false, error: "Your cart is empty" };
  }

  for (const line of lines) {
    if (line.quantity > line.stock) {
      return {
        ok: false,
        error: `"${line.title}" only has ${line.stock} in stock`,
      };
    }
  }

  const totals = computeCheckoutTotals(subtotal);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
        customerName: parsed.data.customerName,
        address: parsed.data.address,
        message: parsed.data.message || null,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        items: {
          create: lines.map((line) => ({
            productId: line.productId,
            title: line.title,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
          })),
        },
      },
    });

    for (const line of lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/shop");
  redirect(`/checkout/success?orderId=${order.id}`);
}
