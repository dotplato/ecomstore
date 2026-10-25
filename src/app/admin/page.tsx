import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/access";
export default async function AdminPage() {
  await requireStaff();
  const [users, products, orders, support] = await Promise.all([prisma.user.count({ where: { role: "CUSTOMER" } }), prisma.product.count(), prisma.order.count(), prisma.supportThread.count({ where: { status: "OPEN" } })]);
  return <><h1 className="mb-2 text-3xl font-bold">Store overview</h1><p className="mb-8 text-muted-foreground">Manage your customers, inventory, orders and conversations.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["users", "Customers", users], ["products", "Products", products], ["orders", "Orders", orders], ["support", "Open conversations", support]].map(([route, title, count]) => <Link href={`/admin/${route}`} key={route} className="rounded-2xl border border-border bg-white p-6"><p className="text-sm text-muted-foreground">{title}</p><p className="mt-3 text-4xl font-bold">{count}</p></Link>)}</div></>;
}
