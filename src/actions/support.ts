"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import type { FormResult } from "@/components/management/action-form";

export async function createThread(_: FormResult | null, data: FormData): Promise<FormResult> {
  const user = await requireUser();
  const parsed = z.object({ subject: z.string().trim().min(3).max(200), body: z.string().trim().min(1).max(5000) }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const recipientId = user.role !== "CUSTOMER" && data.get("userId") ? String(data.get("userId")) : user.id;
  if (recipientId !== user.id && !await prisma.user.findFirst({ where: { id: recipientId, role: "CUSTOMER" } })) return { ok: false, error: "Customer not found." };
  const thread = await prisma.supportThread.create({ data: { userId: recipientId, subject: parsed.data.subject, messages: { create: { senderId: user.id, body: parsed.data.body } } } });
  revalidatePath("/support");
  revalidatePath("/admin/support");
  redirect(`/support/${thread.id}`);
}
export async function supportAction(_: FormResult | null, data: FormData): Promise<FormResult> {
  const user = await requireUser();
  const staff = user.role !== "CUSTOMER";
  const id = String(data.get("threadId") ?? "");
  const thread = await prisma.supportThread.findUnique({ where: { id } });
  if (!thread || (!staff && thread.userId !== user.id)) return { ok: false, error: "Conversation not found." };
  const operation = String(data.get("operation"));
  if (!staff && operation !== "reply") return { ok: false, error: "Permission denied." };
  if (operation === "reply") {
    const body = z.string().trim().min(1).max(5000).safeParse(data.get("body"));
    if (!body.success) return { ok: false, error: "Enter a message between 1 and 5000 characters." };
    if (thread.status === "CLOSED") return { ok: false, error: "This conversation is closed." };
    await prisma.supportThread.update({ where: { id }, data: { updatedAt: new Date(), messages: { create: { senderId: user.id, body: body.data } } } });
  } else if (operation === "status") {
    await prisma.supportThread.update({ where: { id }, data: { status: thread.status === "OPEN" ? "CLOSED" : "OPEN" } });
  } else if (operation === "delete") {
    await prisma.supportThread.delete({ where: { id } });
  } else if (operation === "edit-message" || operation === "delete-message") {
    const messageId = String(data.get("messageId"));
    if (operation === "delete-message") await prisma.supportMessage.deleteMany({ where: { id: messageId, threadId: id } });
    else {
      const body = z.string().trim().min(1).max(5000).safeParse(data.get("body"));
      if (!body.success) return { ok: false, error: "Enter a message between 1 and 5000 characters." };
      await prisma.supportMessage.updateMany({ where: { id: messageId, threadId: id }, data: { body: body.data } });
    }
  } else return { ok: false, error: "Invalid operation." };
  revalidatePath("/support"); revalidatePath("/admin/support"); revalidatePath(`/support/${id}`);
  if (operation === "delete") redirect("/admin/support");
  return { ok: true };
}
