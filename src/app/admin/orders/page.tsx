import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/access";
import { adminAction } from "@/actions/admin";
import { ActionForm } from "@/components/management/action-form";
import { Hidden } from "@/components/management/common";
import { ManageDialog } from "@/components/management/dialog";
import { OrderEditor } from "@/components/management/order-editor";
import { DataTable, FilterBar, PageHeading, StatusBadge } from "@/components/management/table";
import { OrderRow } from "@/components/management/order-row";
import { OrderDetails } from "@/components/orders/order-details";
import { orderDetailsInclude, serializeOrder } from "@/lib/orders";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-status";
import { formatMoney } from "@/lib/money";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string }> }) {
  const actor = await requireStaff();
  const { q = "", category = "", status = "" } = await searchParams;
  const where: Prisma.OrderWhereInput = {
    ...(Object.values(OrderStatus).includes(status as OrderStatus) ? { status: status as OrderStatus } : {}),
    ...(category ? { items: { some: { product: { categoryId: category } } } } : {}),
    ...(q ? { OR: [{ id: { contains: q, mode: "insensitive" } }, { customerName: { contains: q, mode: "insensitive" } }, { user: { email: { contains: q, mode: "insensitive" } } }] } : {}),
  };
  const [orders, users, products, categories] = await Promise.all([
    prisma.order.findMany({ where, include: { ...orderDetailsInclude, user: { select: { email: true } } }, orderBy: { createdAt: "desc" } }),
    actor.role === "SUPER_ADMIN" ? prisma.user.findMany({ select: { id: true, email: true }, orderBy: { email: "asc" } }) : [],
    actor.role === "SUPER_ADMIN" ? prisma.product.findMany({ where: { status: "LIVE" }, select: { id: true, title: true }, orderBy: { title: "asc" } }) : [],
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return <>
    <PageHeading title="Orders" description="Click an order to view full details and tracking, or edit its delivery status." action={actor.role === "SUPER_ADMIN" && <ManageDialog title="Add order" trigger="+ Add order" primary><OrderEditor users={users} products={products} /></ManageDialog>} />
    <FilterBar q={q} category={category} status={status} categories={categories} statuses={ORDER_STATUS_OPTIONS} resetHref="/admin/orders" />
    <DataTable columns={["Order", "Customer", "Products", "Total", "Status", "Date", "Actions"]} count={orders.length} empty={!orders.length}>
      {orders.map(order => <OrderRow key={order.id} id={order.id} details={<OrderDetails order={serializeOrder(order)} email={order.user.email} />} actions={<>
        <ManageDialog title={"Edit order #" + order.id.slice(-8)} trigger="Edit"><OrderEditor order={serializeOrder(order)} /></ManageDialog>
        <ActionForm action={adminAction} label="Delete" confirm="Permanently delete this order?"><Hidden name="operation" value="delete-order" /><Hidden name="id" value={order.id} /></ActionForm>
      </>}>
        <td><p className="font-medium">{order.customerName}</p><p className="mt-1 text-xs text-muted-foreground">{order.user.email}</p></td>
        <td className="max-w-52"><p className="line-clamp-2">{order.items.map(item => item.quantity + " × " + item.title).join(", ")}</p></td>
        <td className="font-medium">{formatMoney(order.total)}</td><td><StatusBadge status={order.status} /></td>
        <td className="whitespace-nowrap text-muted-foreground">{order.createdAt.toLocaleDateString("en-US", { timeZone: "Asia/Karachi" })}</td>
      </OrderRow>)}
    </DataTable>
  </>;
}
