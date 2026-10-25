import { prisma } from "@/lib/prisma";
import { sellingPrice, toNumber } from "@/lib/money";

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function getCartWithItems(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!cart) {
    return { cart: null, lines: [], subtotal: 0, itemCount: 0 };
  }

  const lines = cart.items.map((item) => {
    const unit = sellingPrice(
      item.product.originalPrice,
      item.product.discountedPrice,
    );
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      title: item.product.title,
      slug: item.product.slug,
      imageUrl: item.product.images[0]?.url ?? null,
      stock: item.product.stock,
      unitPrice: unit,
      lineTotal: unit * item.quantity,
      originalPrice: toNumber(item.product.originalPrice),
      discountedPrice: toNumber(item.product.discountedPrice),
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return { cart, lines, subtotal, itemCount };
}
