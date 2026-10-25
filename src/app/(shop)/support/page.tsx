import Link from "next/link";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { createThread } from "@/actions/support";
import { ActionForm, Field } from "@/components/management/action-form";
import { Card, Area } from "@/components/management/common";
export default async function SupportPage() {
  const user = await requireUser();
  const threads = await prisma.supportThread.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } });
  return <div className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-2 text-3xl font-bold">Customer support</h1><p className="mb-8 text-muted-foreground">Send us a message and keep track of replies here.</p><div className="grid gap-6 md:grid-cols-2"><Card title="Start a conversation"><ActionForm action={createThread} label="Send message"><Field name="subject" label="Subject" /><Area name="body" label="How can we help?" required /></ActionForm></Card><Card title="Your conversations"><div className="space-y-3">{threads.map(thread => <Link key={thread.id} href={`/support/${thread.id}`} className="block rounded-xl border border-border p-4"><p className="font-medium">{thread.subject}</p><p className="mt-1 text-xs text-muted-foreground">{thread.status} · Updated {thread.updatedAt.toLocaleString("en-US")}</p></Link>)}{!threads.length && <p className="text-sm text-muted-foreground">Your conversations will appear here.</p>}</div></Card></div></div>;
}
