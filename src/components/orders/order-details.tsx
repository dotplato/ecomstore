import { formatMoney } from "@/lib/money";
import { orderDate, orderStatusLabel, type OrderState } from "@/lib/order-status";
import { OrderTracking } from "./order-tracking";
export type OrderDetailsData = {
  id: string; customerName: string; address: string; message: string | null;
  status: OrderState; createdAt: Date; subtotal: string; shipping: string; tax: string; total: string;
  items: { id: string; title: string; unitPrice: string; quantity: number }[];
  statusEvents: { id: string; status: OrderState; createdAt: Date }[];
};
export function OrderDetails({ order, email }: { order: OrderDetailsData; email?: string }) {
  return <div className="space-y-6">
    <div className="text-sm"><p className="break-all font-mono text-xs text-muted-foreground">Order ID: {order.id}</p><p className="mt-2 text-muted-foreground">Placed {orderDate(order.createdAt)}</p></div>
    <OrderTracking status={order.status} events={order.statusEvents} />
    <div className="grid gap-6 sm:grid-cols-2">
      <section><h3 className="mb-2 font-semibold">Shipping details</h3><p className="text-sm">{order.customerName}</p>{email && <p className="mt-1 break-all text-sm text-muted-foreground">{email}</p>}<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{order.address}</p></section>
      <section><h3 className="mb-2 font-semibold">Order message</h3><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{order.message || "No message provided."}</p></section>
    </div>
    <section><h3 className="mb-3 font-semibold">Products</h3><div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-96 text-left text-sm">
      <thead className="bg-muted/60 text-muted-foreground"><tr><th scope="col" className="p-3">Product</th><th scope="col" className="p-3">Qty</th><th scope="col" className="p-3 text-right">Unit price</th><th scope="col" className="p-3 text-right">Total</th></tr></thead>
      <tbody className="divide-y divide-border">{order.items.map(item => <tr key={item.id}><td className="p-3">{item.title}</td><td className="p-3">{item.quantity}</td><td className="whitespace-nowrap p-3 text-right">{formatMoney(item.unitPrice)}</td><td className="whitespace-nowrap p-3 text-right">{formatMoney(Number(item.unitPrice) * item.quantity)}</td></tr>)}</tbody>
    </table></div><dl className="ml-auto mt-4 max-w-xs space-y-2 text-sm">
      {([["Subtotal", order.subtotal], ["Shipping", order.shipping], ["Tax", order.tax]] as const).map(([label, value]) => <div key={label} className="flex justify-between"><dt className="text-muted-foreground">{label}</dt><dd>{formatMoney(value)}</dd></div>)}
      <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
    </dl></section>
    {order.statusEvents.length > 0 && <section><h3 className="mb-3 font-semibold">Tracking updates</h3><ol className="space-y-3">{[...order.statusEvents].reverse().map(event => <li key={event.id} className="flex flex-wrap justify-between gap-2 border-l-2 border-primary/20 pl-3 text-sm"><span className="font-medium">{orderStatusLabel(event.status)}</span><time dateTime={event.createdAt.toISOString()} className="text-xs text-muted-foreground">{orderDate(event.createdAt)}</time></li>)}</ol></section>}
  </div>;
}
