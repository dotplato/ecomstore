import { ORDER_STATUS_OPTIONS } from "@/lib/order-status";
import { adminAction } from "@/actions/admin";
import { ActionForm, Field } from "./action-form";
import { Hidden, Area } from "./common";
import { OrderItems } from "./order-items";
import { controlClass } from "./table";
import { formatMoney } from "@/lib/money";
export function OrderEditor({ order, users = [], products = [] }: {
  order?: { id: string; customerName: string; address: string; message: string | null; status: string; subtotal: string; shipping: string; tax: string; total: string; items: { id: string; title: string; quantity: number; unitPrice: string }[] };
  users?: { id: string; email: string }[]; products?: { id: string; title: string }[];
}) {
  return <ActionForm action={adminAction} label={order ? "Save changes" : "Create order"}>
    <Hidden name="operation" value={order ? "update-order" : "create-order"} />
    {order ? <Hidden name="id" value={order.id} /> : <label className="block text-sm font-medium">Customer<select name="userId" required className={controlClass + " mt-1 block w-full"}>{users.map(user => <option key={user.id} value={user.id}>{user.email}</option>)}</select></label>}
    <Field name="customerName" label="Recipient name" value={order?.customerName} />
    <Area name="address" label="Address" value={order?.address} required />
    <Area name="message" label="Message" value={order?.message ?? ""} />
    {order ? <><label className="block text-sm font-medium">Status<select name="status" defaultValue={order.status} className={controlClass + " mt-1 block w-full"}>{ORDER_STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <div className="rounded-xl bg-muted p-4 text-sm"><ul className="space-y-2">{order.items.map(item => <li key={item.id}>{item.quantity} × {item.title} · {formatMoney(item.unitPrice)}</li>)}</ul><p className="mt-4">Subtotal {formatMoney(order.subtotal)} + shipping {formatMoney(order.shipping)} + tax {formatMoney(order.tax)} = <strong>{formatMoney(order.total)}</strong></p></div>
      <p className="text-xs text-muted-foreground">Changing status or deleting an order does not change stock.</p></> : <><OrderItems products={products} /><p className="text-sm text-muted-foreground">Prices, shipping and tax are calculated automatically. Stock is deducted on creation.</p></>}
  </ActionForm>;
}
