import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { auth } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import { computeCheckoutTotals, formatMoney } from "@/lib/money";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/checkout");

  const { lines, subtotal } = await getCartWithItems(session.user.id);
  if (lines.length === 0) redirect("/cart");

  const totals = computeCheckoutTotals(subtotal);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Shipping details</h2>
          <CheckoutForm defaultName={session.user.name} />
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
          <ul className="mb-6 divide-y divide-border">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3 py-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {line.imageUrl && (
                    <Image
                      src={line.imageUrl}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/product/${line.slug}`}
                    className="line-clamp-2 text-sm font-medium hover:underline"
                  >
                    {line.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Qty {line.quantity} × {formatMoney(line.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">
                  {formatMoney(line.lineTotal)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{formatMoney(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="tabular-nums">{formatMoney(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(totals.total)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            No payment is collected. Placing an order confirms your request only.
          </p>
        </div>
      </div>
    </div>
  );
}
