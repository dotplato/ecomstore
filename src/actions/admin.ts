"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { computeCheckoutTotals, sellingPrice } from "@/lib/money";
import type { FormResult } from "@/components/management/action-form";

const text = z.string().trim().min(1).max(200);
const amount = z.coerce.number().finite().min(0).max(99999999);
export async function adminAction(_: FormResult | null, form: FormData): Promise<FormResult> {
  const actor = await requireStaff();
  const operation = String(form.get("operation"));
  const id = String(form.get("id") ?? "");
  const superOnly = ["create-user", "create-product", "create-order", "promote", "demote", "update-admin", "delete-admin"];
  if (superOnly.includes(operation) && actor.role !== "SUPER_ADMIN") return { ok: false, error: "Super admin access required." };
  try {
    if (operation === "promote") {
      const email = z.string().trim().email().parse(form.get("email")).toLowerCase();
      const target = await prisma.user.findUnique({ where: { email } });
      if (!target) return { ok: false, error: "No account found. The user must sign up first." };
      if (target.role !== "CUSTOMER") return { ok: false, error: "This account already has a staff role." };
      await prisma.user.update({ where: { id: target.id }, data: { role: "ADMIN" } });
    } else if (operation === "demote") {
      if (id === actor.id) return { ok: false, error: "You cannot remove your own role." };
      await prisma.user.updateMany({ where: { id, role: "ADMIN" }, data: { role: "CUSTOMER" } });
    } else if (operation === "update-admin" || operation === "delete-admin") {
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target || target.role !== "ADMIN" || target.id === actor.id) return { ok: false, error: "Only other admin accounts can be changed here." };
      if (operation === "update-admin") {
        const name = text.parse(form.get("name"));
        const email = z.string().trim().email().parse(form.get("email")).toLowerCase();
        await prisma.user.update({ where: { id }, data: { name, email } });
      } else {
        await prisma.$transaction(async tx => {
          await tx.order.deleteMany({ where: { userId: id } });
          await tx.user.delete({ where: { id } });
        });
      }
    } else if (["create-user", "update-user", "delete-user"].includes(operation)) {
      const target = id ? await prisma.user.findUnique({ where: { id } }) : null;
      if (operation !== "create-user" && (!target || target.role !== "CUSTOMER")) return { ok: false, error: "Only customer accounts can be changed here." };
      if (operation === "delete-user") {
        if (form.get("confirmed") !== "yes") return { ok: false, error: "Confirm deletion of this customer and their orders." };
        await prisma.$transaction(async tx => {
          await tx.order.deleteMany({ where: { userId: id } });
          await tx.user.delete({ where: { id } });
        });
      } else {
        const name = text.parse(form.get("name"));
        const email = z.string().trim().email().parse(form.get("email")).toLowerCase();
        if (operation === "create-user") {
          const password = z.string().min(8).max(72).parse(form.get("password"));
          await prisma.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
        } else await prisma.user.update({ where: { id }, data: { name, email } });
      }
    } else if (["create-product", "update-product", "delete-product"].includes(operation)) {
      if (operation === "delete-product") await prisma.product.delete({ where: { id } });
      else {
        const parsed = z.object({
          title: text, slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          about: z.string().trim().min(1).max(10000), categoryId: text,
          stock: z.coerce.number().int().min(0).max(1000000),
          originalPrice: amount, discountedPrice: amount,
        }).parse(Object.fromEntries(form));
        if (parsed.discountedPrice > parsed.originalPrice) return { ok: false, error: "Discounted price cannot exceed original price." };
        const urls = z.array(z.string().url().refine(url => url.startsWith("https://images.unsplash.com/"), "Use images.unsplash.com HTTPS image URLs.")).min(1).max(20)
          .parse(String(form.get("images") ?? "").split("\n").map(v => v.trim()).filter(Boolean));
        const images = urls.map((url, sortOrder) => ({ url, sortOrder }));
        if (operation === "create-product") await prisma.product.create({ data: { ...parsed, images: { create: images } } });
        else await prisma.product.update({ where: { id }, data: { ...parsed, images: { deleteMany: {}, create: images } } });
      }
    } else if (operation === "delete-order") {
      await prisma.order.delete({ where: { id } });
    } else if (operation === "update-order") {
      const parsed = z.object({ customerName: text, address: z.string().trim().min(5).max(2000), message: z.string().max(1000), status: z.enum(["PLACED", "CANCELLED"]) }).parse(Object.fromEntries(form));
      await prisma.order.update({ where: { id }, data: parsed });
    } else if (operation === "create-order") {
      const userId = text.parse(form.get("userId"));
      const customerName = text.parse(form.get("customerName"));
      const address = z.string().trim().min(5).max(2000).parse(form.get("address"));
      const message = z.string().max(1000).parse(form.get("message") ?? "");
      const entries = z.array(z.object({ productId: text, quantity: z.coerce.number().int().min(1).max(99) })).min(1).max(100).parse(JSON.parse(String(form.get("items"))));
      const quantities = new Map<string, number>();
      for (const entry of entries) quantities.set(entry.productId, (quantities.get(entry.productId) ?? 0) + entry.quantity);
      await prisma.$transaction(async tx => {
        const lines = [];
        for (const [productId, quantity] of quantities) {
          const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });
          const changed = await tx.product.updateMany({ where: { id: productId, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } });
          if (!changed.count) throw new Error("Insufficient stock for " + product.title);
          lines.push({ productId, title: product.title, quantity, unitPrice: sellingPrice(product.originalPrice, product.discountedPrice) });
        }
        const totals = computeCheckoutTotals(lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0));
        await tx.order.create({ data: { userId, customerName, address, message, ...totals, items: { create: lines } } });
      });
    } else return { ok: false, error: "Invalid operation." };
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, error: error.issues[0].message };
    if (error instanceof SyntaxError) return { ok: false, error: "Order items must be valid JSON." };
    if (error instanceof Prisma.PrismaClientKnownRequestError) return { ok: false, error: error.code === "P2002" ? "That email or slug already exists." : "Record unavailable or still referenced. Refresh and try again." };
    return { ok: false, error: error instanceof Error && error.message.startsWith("Insufficient stock") ? error.message : "Could not save. Refresh and try again." };
  }
  revalidatePath("/admin", "layout"); revalidatePath("/", "layout");
  return { ok: true };
}
