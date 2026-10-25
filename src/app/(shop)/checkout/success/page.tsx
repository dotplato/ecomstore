import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ orderId?: string }>;

export const metadata = { title: "Order placed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { orderId } = await searchParams;
  if (!orderId) redirect("/");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { items: true },
  });

  if (!order) redirect("/");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" />
      <h1 className="mb-2 text-3xl font-bold">Order placed</h1>
      <p className="mb-6 text-muted-foreground">
        Thanks, {order.customerName}. Your order has been recorded — no payment
        was charged.
      </p>
      <div className="mb-8 rounded-2xl border border-border bg-white p-6 text-left text-sm">
        <p className="mb-2">
          <span className="text-muted-foreground">Order ID:</span>{" "}
          <span className="font-mono text-xs">{order.id}</span>
        </p>
        <p className="mb-2">
          <span className="text-muted-foreground">Ship to:</span> {order.address}
        </p>
        {order.message && (
          <p className="mb-2">
            <span className="text-muted-foreground">Message:</span> {order.message}
          </p>
        )}
        <p className="mb-4 font-semibold">
          Total: {formatMoney(order.total)}
        </p>
        <ul className="space-y-1 border-t border-border pt-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span className="tabular-nums">
                {formatMoney(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Link href={`/profile/orders/${order.id}`} className="mb-4 inline-flex h-11 items-center justify-center rounded-full border border-primary px-6 text-sm font-medium text-primary">Track your order</Link>
      <br />
      <Link
        href="/shop"
        className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue shopping
      </Link>
    </div>
  );
}
