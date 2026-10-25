import Link from "next/link";
import { Package, ArrowRight, LifeBuoy, Heart } from "lucide-react";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_OPTIONS, ORDER_STATUS_VALUES, orderDate } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";
import { formatMoney } from "@/lib/money";
import { OrderTracking } from "@/components/orders/order-tracking";
import { RefreshOrders } from "@/components/orders/refresh-orders";
import { StatusBadge, controlClass } from "@/components/management/table";

export const metadata = { title: "My profile & orders" };
export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const { status = "" } = await searchParams;
  const filter = ORDER_STATUS_VALUES.includes(status as OrderStatus) ? status as OrderStatus : undefined;
  const orders = await prisma.order.findMany({
    where: { userId: user.id, ...(filter ? { status: filter } : {}) },
    include: { items: true }, orderBy: { createdAt: "desc" },
  });
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">My profile</h1><p className="mt-2 text-muted-foreground">Your account, orders and delivery updates in one place.</p></div>
    <div className="grid items-start gap-8 lg:grid-cols-[250px_1fr]">
      <aside className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">{(user.name || user.email).slice(0, 1).toUpperCase()}</div>
        <h2 className="font-semibold">{user.name ?? "Your account"}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
        <nav aria-label="Account" className="mt-6 space-y-2 border-t border-border pt-4">
          <Link href="/profile" aria-current="page" className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-sm font-medium text-primary"><Package className="h-4 w-4" />My orders</Link>
          <Link href="/wishlist" className="flex items-center gap-2 rounded-xl p-3 text-sm hover:bg-muted"><Heart className="h-4 w-4" />Wishlist</Link>
          <Link href="/support" className="flex items-center gap-2 rounded-xl p-3 text-sm hover:bg-muted"><LifeBuoy className="h-4 w-4" />Customer support</Link>
        </nav>
      </aside>
      <section aria-label="Your orders">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold">Your orders</h2><p className="mt-1 text-sm text-muted-foreground">Status updates refresh automatically while this page is open.</p></div><RefreshOrders /></div>
        <form method="get" className="mb-5 flex items-center gap-3"><label className="text-sm font-medium">Status<select name="status" defaultValue={status} className={controlClass + " ml-3"}><option value="">All orders</option>{ORDER_STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">Filter</button></form>
        <div className="space-y-5">{orders.map(order => <article key={order.id} className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
            <div><Link href={`/profile/orders/${order.id}`} className="font-semibold text-primary hover:underline">Order #{order.id.slice(-8)}</Link><p className="mt-1 text-xs text-muted-foreground">{orderDate(order.createdAt)}</p></div><StatusBadge status={order.status} />
          </div>
          <div className="space-y-5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-medium">{order.items.map(item => item.quantity + " × " + item.title).join(", ")}</p><p className="mt-1 text-xs text-muted-foreground">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items · Ship to {order.customerName}</p></div><p className="font-semibold">{formatMoney(order.total)}</p></div>
            <OrderTracking status={order.status} compact />
            <div className="flex justify-end border-t border-border pt-4"><Link href={`/profile/orders/${order.id}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">Track & view order<ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </article>)}</div>
        {!orders.length && <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center"><Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h3 className="font-semibold">{filter ? "No orders with this status" : "Your orders will appear here"}</h3><p className="mb-5 mt-2 text-sm text-muted-foreground">{filter ? "Try another status to find your order." : "Once you place an order, you can follow its progress here."}</p><Link href={filter ? "/profile" : "/shop"} className="text-sm font-medium text-primary underline">{filter ? "Show all orders" : "Explore the shop"}</Link></div>}
      </section>
    </div>
  </div>;
}
