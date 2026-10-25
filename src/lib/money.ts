import { Decimal } from "@prisma/client/runtime/library";

export const DEFAULT_SHIPPING_FEE = Number(process.env.SHIPPING_FEE ?? "5.00");
export const DEFAULT_TAX_RATE = Number(process.env.TAX_RATE ?? "0.08");

export type MoneyInput = number | string | Decimal;

export function toNumber(value: MoneyInput): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number(value.toString());
}

export function formatMoney(value: MoneyInput): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(toNumber(value));
}

export function discountPercent(
  original: MoneyInput,
  discounted: MoneyInput,
): number {
  const o = toNumber(original);
  const d = toNumber(discounted);
  if (o <= 0 || d >= o) return 0;
  return Math.round((1 - d / o) * 100);
}

export function sellingPrice(
  original: MoneyInput,
  discounted: MoneyInput,
): number {
  const o = toNumber(original);
  const d = toNumber(discounted);
  return d > 0 && d < o ? d : o;
}

export function computeCheckoutTotals(subtotal: number) {
  const shipping = DEFAULT_SHIPPING_FEE;
  const tax = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { subtotal, shipping, tax, total };
}
