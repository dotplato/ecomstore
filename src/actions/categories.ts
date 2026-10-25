"use server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { validateImageUrls } from "@/lib/product-media";
import type { FormResult } from "@/components/management/action-form";

export async function categoryAction(_: FormResult | null, form: FormData): Promise<FormResult> {
  await requireStaff();
  const operation = String(form.get("operation"));
  const id = String(form.get("id") ?? "");
  if (!["create-category", "update-category", "delete-category"].includes(operation)) return { ok: false, error: "Invalid category operation." };
  if (operation !== "create-category" && !id) return { ok: false, error: "Category not found." };
  try {
    if (operation === "delete-category") {
      const replacementId = String(form.get("replacementId") ?? "");
      await prisma.$transaction(async tx => {
        const count = await tx.product.count({ where: { categoryId: id } });
        if (count) {
          if (!replacementId || replacementId === id || !await tx.category.findUnique({ where: { id: replacementId } })) throw new Error("Choose another category to move these products to before deleting.");
          await tx.product.updateMany({ where: { categoryId: id }, data: { categoryId: replacementId } });
        }
        await tx.category.delete({ where: { id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } else {
      const name = z.string().trim().min(1, "Category name is required.").max(100).parse(form.get("name"));
      const slug = z.string().max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a slug with lowercase letters, numbers and hyphens.").parse(String(form.get("slug") ?? "").trim() || slugify(name));
      const urls = validateImageUrls(String(form.get("imageUrl") ?? ""));
      if (urls.length > 1) return { ok: false, error: "Use one category image URL." };
      const data = { name, slug, imageUrl: urls[0] ?? null };
      if (operation === "create-category") await prisma.category.create({ data });
      else await prisma.category.update({ where: { id }, data });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, error: error.issues[0].message };
    if (error instanceof Prisma.PrismaClientKnownRequestError) return { ok: false, error: error.code === "P2002" ? "This category slug is already in use." : "The category changed or is still in use. Refresh and try again." };
    return { ok: false, error: error instanceof Error ? error.message : "Could not save category." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: operation === "delete-category" ? "Category removed. Products have been preserved." : "Category saved." };
}
