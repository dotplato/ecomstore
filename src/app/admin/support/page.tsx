import { createThread } from "@/actions/support";
import { ActionForm, Field } from "@/components/management/action-form";
import { Card, Area } from "@/components/management/common";
import Link from "next/link";
import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";
export default async function SupportInbox() {
  await requireStaff();
  const customers = await prisma.user.findMany({ where: { role: "CUSTOMER" }, select: { id: true, email: true }, orderBy: { email: "asc" } });
  const threads = await prisma.supportThread.findMany({ include: { user: { select: { name: true, email: true } }, _count: { select: { messages: true } } }, orderBy: { updatedAt: "desc" } });
  return <><h1 className="mb-2 text-3xl font-bold">Support inbox</h1><p className="mb-6 text-muted-foreground">Read and reply to customer conversations.</p><div className="mb-6"><Card title="Message a customer"><ActionForm action={createThread} label="Send message"><label className="block text-sm">Customer<select name="userId" required className="mt-1 block w-full rounded-xl border border-border p-2">{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.email}</option>)}</select></label><Field name="subject" label="Subject" /><Area name="body" label="Message" required /></ActionForm></Card></div><div className="space-y-3">{threads.map(thread => <Link href={`/support/${thread.id}`} key={thread.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-5"><div><p className="font-semibold">{thread.subject}</p><p className="mt-1 text-sm text-muted-foreground">{thread.user.name} · {thread.user.email}</p></div><div className="text-right text-xs text-muted-foreground"><p>{thread.status} · {thread._count.messages} messages</p><p className="mt-1">{thread.updatedAt.toLocaleString("en-US")}</p></div></Link>)}{!threads.length && <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No support conversations yet.</p>}</div></>;
}
