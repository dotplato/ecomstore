"use server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import type { FormResult } from "@/components/management/action-form";

export async function applyPricing(_: FormResult | null, form: FormData): Promise<FormResult> {
  await requireStaff();
  const parsed = z.object({
    scope: z.enum(["products", "category"]),
    percentage: z.string().trim().min(1).pipe(z.coerce.number<string>().finite().min(0).max(100)),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: "Choose a scope and a discount between 0 and 100%." };
  const ids = [...new Set(form.getAll("productId").map(String))];
  const categoryId = String(form.get("categoryId") ?? "");
  if (parsed.data.scope === "products" && (!ids.length || ids.length > 1000)) return { ok: false, error: "Select between 1 and 1000 products." };
  if (parsed.data.scope === "category" && !categoryId) return { ok: false, error: "Choose a category." };
  try {
    const count = await prisma.$transaction(async tx => {
      const products = await tx.product.findMany({ where: parsed.data.scope === "category" ? { categoryId } : { id: { in: ids } }, select: { id: true, originalPrice: true } });
      if (!products.length || (parsed.data.scope === "products" && products.length !== ids.length)) throw new Error("Selection changed. Refresh and try again.");
      const multiplier = new Prisma.Decimal(100).minus(parsed.data.percentage).div(100);
      for (const product of products) {
        await tx.product.update({ where: { id: product.id }, data: { discountedPrice: product.originalPrice.mul(multiplier).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP) } });
      }
      return products.length;
    }, { timeout: 30000 });
    revalidatePath("/", "layout");
    return { ok: true, message: `Applied ${parsed.data.percentage}% discount to ${count} product${count === 1 ? "" : "s"}.` };
  } catch { return { ok: false, error: "Could not update the selection. Refresh and try again." }; }
}
