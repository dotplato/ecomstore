import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { orderDetailsInclude, serializeOrder } from "@/lib/orders";
import { OrderDetails } from "@/components/orders/order-details";
import { RefreshOrders } from "@/components/orders/refresh-orders";
import { StatusBadge } from "@/components/management/table";

export const metadata = { title: "Track your order" };
export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await prisma.order.findFirst({ where: { id, userId: user.id }, include: orderDetailsInclude });
  if (!order) notFound();
  return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <Link href="/profile" className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"><ArrowLeft className="h-4 w-4" />Back to your orders</Link>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1><div className="mt-3"><StatusBadge status={order.status} /></div></div><RefreshOrders /></div>
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-7"><OrderDetails order={serializeOrder(order)} email={user.email} /></div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted p-5"><p className="text-sm text-muted-foreground">Have a question about this order?</p><Link href="/support" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><LifeBuoy className="h-4 w-4" />Contact support</Link></div>
  </div>;
}
