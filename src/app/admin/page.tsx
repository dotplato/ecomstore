import { OverviewQuickActions, OverviewSupportMessages } from "@/components/management/overview-panels";
import Link from "next/link";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/access";
import { formatMoney } from "@/lib/money";
export default async function AdminPage() {
  const actor = await requireStaff();
  const superAdmin = actor.role === "SUPER_ADMIN";
  const [users, products, orders, completed, unreadCount, threads, categories, customers, orderProducts] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { total: true } }),
    prisma.supportThread.count({ where: { staffUnread: true } }),
    prisma.supportThread.findMany({ where: { staffUnread: true }, take: 4, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], select: { id: true, subject: true, updatedAt: true, user: { select: { name: true, email: true } }, messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true } } } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    superAdmin ? prisma.user.findMany({ select: { id: true, email: true }, orderBy: { email: "asc" } }) : Promise.resolve([]),
    superAdmin ? prisma.product.findMany({ where: { status: "LIVE" }, select: { id: true, title: true }, orderBy: { title: "asc" } }) : Promise.resolve([]),
  ]);
  const metrics = [
    { href: "/admin/users", title: "Customers", value: String(users), icon: Users },
    { href: "/admin/products", title: "Products", value: String(products), icon: Package },
    { href: "/admin/orders", title: "Orders", value: String(orders), icon: ShoppingBag },
    { href: "/admin/orders?status=COMPLETED", title: "Revenue", value: formatMoney(completed._sum.total ?? 0), icon: DollarSign },
  ];
  return <>
    <h1 className="mb-2 text-3xl font-bold">Store overview</h1>
    <p className="mb-8 text-muted-foreground">Manage your customers, inventory, orders and conversations.</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ href, title, value, icon: Icon }) => <Link href={href} key={title} className="rounded-2xl border border-border bg-white p-6 transition hover:shadow-sm">
        <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{title}</p><Icon aria-hidden="true" className="h-5 w-5 text-primary/70" /></div>
        <p className="mt-3 break-words text-3xl font-bold tabular-nums">{value}</p>
        {title === "Revenue" && <p className="mt-2 text-xs text-muted-foreground">All-time · completed orders</p>}
      </Link>)}
    </div>
    <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <OverviewQuickActions superAdmin={superAdmin} categories={categories} customers={customers} products={orderProducts} />
      <OverviewSupportMessages unreadCount={unreadCount} threads={threads} />
    </div>
  </>;
}
