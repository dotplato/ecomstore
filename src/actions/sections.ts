"use server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import type { FormResult } from "@/components/management/action-form";

export async function sectionAction(_: FormResult | null, form: FormData): Promise<FormResult> {
  await requireStaff(true);
  const parsed = z.object({
    operation: z.enum(["create-section", "update-section", "delete-section", "move-section"]),
    id: z.string().max(128),
  }).safeParse({ operation: form.get("operation"), id: form.get("id") ?? "" });
  if (!parsed.success) return { ok: false, error: "Invalid section operation." };
  const { operation, id } = parsed.data;
  if (operation !== "create-section" && !id) return { ok: false, error: "Section not found." };
  try {
    if (operation === "create-section" || operation === "update-section") {
      const name = z.string().trim().min(1, "Section name is required.").max(100).parse(form.get("name"));
      const ids = z.array(z.string().min(1).max(128)).max(1000).parse([...new Set(form.getAll("productId").map(String))]);
      await prisma.$transaction(async tx => {
        if (await tx.product.count({ where: { id: { in: ids } } }) !== ids.length) throw new Error("Some selected products no longer exist. Refresh and try again.");
        const products = ids.map((productId, sortOrder) => ({ productId, sortOrder }));
        if (operation === "create-section") {
          const max = await tx.storefrontSection.aggregate({ _max: { sortOrder: true } });
          await tx.storefrontSection.create({ data: { name, sortOrder: (max._max.sortOrder ?? -1) + 1, products: { create: products } } });
        } else {
          await tx.storefrontSection.update({ where: { id }, data: { name, products: { deleteMany: {}, create: products } } });
        }
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } else {
      const direction = operation === "move-section" ? z.enum(["up", "down"]).parse(form.get("direction")) : null;
      await prisma.$transaction(async tx => {
        const sections = await tx.storefrontSection.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } });
        const index = sections.findIndex(section => section.id === id);
        if (index < 0) throw new Error("Section not found. Refresh and try again.");
        if (operation === "delete-section") {
          await tx.storefrontSection.delete({ where: { id } });
          sections.splice(index, 1);
        } else {
          const next = direction === "up" ? index - 1 : index + 1;
          if (next >= 0 && next < sections.length) [sections[index], sections[next]] = [sections[next], sections[index]];
        }
        for (const [sortOrder, section] of sections.entries()) {
          await tx.storefrontSection.update({ where: { id: section.id }, data: { sortOrder } });
        }
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, error: error.issues[0].message };
    if (error instanceof Prisma.PrismaClientKnownRequestError) return { ok: false, error: error.code === "P2002" ? "A section with this name already exists." : "The section list changed. Refresh and try again." };
    return { ok: false, error: error instanceof Error ? error.message : "Could not save section." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: operation === "move-section" ? "Section order updated." : operation === "delete-section" ? "Section deleted." : "Section saved." };
}
