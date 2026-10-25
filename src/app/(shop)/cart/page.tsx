import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  removeCartItemAction,
  updateCartItemAction,
} from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/cart");

  const { lines, subtotal } = await getCartWithItems(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Your cart</h1>

      {lines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="mb-4 text-muted-foreground">Your cart is empty.</p>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 p-4">
                <Link
                  href={`/product/${line.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {line.imageUrl && (
                    <Image
                      src={line.imageUrl}
                      alt={line.title}
                      fill
                      className="object-contain p-1"
                      sizes="96px"
                    />
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link
                      href={`/product/${line.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {line.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatMoney(line.unitPrice)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <form
                      action={async (fd) => {
                        "use server";
                        const qty = Number(fd.get("quantity"));
                        await updateCartItemAction(line.productId, qty);
                      }}
                      className="flex items-center gap-2"
                    >
                      <label className="sr-only" htmlFor={`qty-${line.id}`}>
                        Quantity
                      </label>
                      <input
                        id={`qty-${line.id}`}
                        name="quantity"
                        type="number"
                        min={1}
                        max={line.stock}
                        defaultValue={line.quantity}
                        className="h-9 w-16 rounded-full border border-border px-3 text-sm"
                      />
                      <Button type="submit" variant="secondary" size="sm">
                        Update
                      </Button>
                    </form>
                    <p className="min-w-16 text-right text-sm font-semibold tabular-nums">
                      {formatMoney(line.lineTotal)}
                    </p>
                    <form
                      action={async () => {
                        "use server";
                        await removeCartItemAction(line.productId);
                      }}
                    >
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-end gap-3 rounded-2xl border border-border bg-white p-6">
            <div className="flex w-full max-w-xs justify-between text-base">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatMoney(subtotal)}
              </span>
            </div>
            <p className="w-full max-w-xs text-xs text-muted-foreground">
              Shipping and tax calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
