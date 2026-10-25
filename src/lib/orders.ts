import "server-only";
import type { Prisma } from "@prisma/client";
import type { OrderDetailsData } from "@/components/orders/order-details";
export const orderDetailsInclude = {
  items: true,
  statusEvents: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
} as const satisfies Prisma.OrderInclude;
export function serializeOrder(order: Prisma.OrderGetPayload<{ include: typeof orderDetailsInclude }>): OrderDetailsData {
  return {
    id: order.id, customerName: order.customerName, address: order.address,
    message: order.message, status: order.status, createdAt: order.createdAt,
    subtotal: order.subtotal.toString(), shipping: order.shipping.toString(),
    tax: order.tax.toString(), total: order.total.toString(),
    items: order.items.map(item => ({ id: item.id, title: item.title, quantity: item.quantity, unitPrice: item.unitPrice.toString() })),
    statusEvents: order.statusEvents.map(event => ({ id: event.id, status: event.status, createdAt: event.createdAt })),
  };
}
