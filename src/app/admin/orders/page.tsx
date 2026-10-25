import { OrderItems } from "@/components/management/order-items";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/access";
import { adminAction } from "@/actions/admin";
import { ActionForm, Field } from "@/components/management/action-form";
import { Card, Hidden, Area } from "@/components/management/common";
import { formatMoney } from "@/lib/money";
export default async function OrdersPage() {
  const actor = await requireStaff();
  const [orders, users, products] = await Promise.all([prisma.order.findMany({ include: { items: true, user: { select: { email: true } } }, orderBy: { createdAt: "desc" } }), actor.role === "SUPER_ADMIN" ? prisma.user.findMany({ select: { id: true, email: true } }) : [], actor.role === "SUPER_ADMIN" ? prisma.product.findMany({ select: { id: true, title: true } }) : []]);
  return <><h1 className="mb-6 text-3xl font-bold">Orders</h1><div className="space-y-5">
    {actor.role === "SUPER_ADMIN" && <Card title="Add order"><ActionForm action={adminAction} label="Create order"><Hidden name="operation" value="create-order" /><label className="block text-sm">Customer<select name="userId" className="mt-1 block w-full rounded-xl border border-border p-2">{users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}</select></label><Field name="customerName" label="Recipient name" /><Area name="address" label="Address" required /><Area name="message" label="Message" /><OrderItems products={products} /><p className="text-sm text-muted-foreground">Prices, shipping and tax are calculated automatically. Stock is deducted on creation.</p></ActionForm></Card>}
    {orders.map(order => <Card key={order.id} title={`Order ${order.id}`}><p className="mb-2 text-sm text-muted-foreground">{order.user.email} · {order.createdAt.toLocaleDateString("en-US")}</p><ul className="mb-4 text-sm">{order.items.map(item => <li key={item.id}>{item.quantity} × {item.title} · {formatMoney(item.unitPrice)}</li>)}</ul><p className="mb-5 text-sm">Subtotal {formatMoney(order.subtotal)} + shipping {formatMoney(order.shipping)} + tax {formatMoney(order.tax)} = <strong>{formatMoney(order.total)}</strong></p><ActionForm action={adminAction}><Hidden name="operation" value="update-order" /><Hidden name="id" value={order.id} /><Field name="customerName" label="Recipient name" value={order.customerName} /><Area name="address" label="Address" value={order.address} required /><Area name="message" label="Message" value={order.message ?? ""} /><label className="block text-sm">Status<select name="status" defaultValue={order.status} className="ml-3 rounded-xl border border-border p-2"><option>PLACED</option><option>CANCELLED</option></select></label><p className="text-xs text-muted-foreground">Changing status or deleting an order does not change stock.</p></ActionForm><div className="mt-4"><ActionForm action={adminAction} label="Delete order" confirm="Permanently delete this order?"><Hidden name="operation" value="delete-order" /><Hidden name="id" value={order.id} /></ActionForm></div></Card>)}
    {!orders.length && <p className="text-muted-foreground">No orders yet.</p>}
  </div></>;
}
