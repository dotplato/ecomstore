import { ReadMarker } from "@/components/management/read-marker";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { supportAction } from "@/actions/support";
import { ActionForm } from "@/components/management/action-form";
import { Hidden, Area } from "@/components/management/common";
export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const staff = user.role !== "CUSTOMER";
  const thread = await prisma.supportThread.findFirst({ where: { id, ...(!staff ? { userId: user.id } : {}) }, include: { user: { select: { email: true } }, messages: { include: { sender: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } } } });
  if (!thread) notFound();
  return <div className="mx-auto max-w-3xl px-4 py-8">{staff && thread.staffUnread && <ReadMarker id={id} seenAt={thread.updatedAt.toISOString()} />}<Link className="text-sm text-primary underline" href={staff ? "/admin/support" : "/support"}>← Conversations</Link><h1 className="mt-4 text-3xl font-bold">{thread.subject}</h1><p className="mb-6 mt-2 text-sm text-muted-foreground">{thread.status}{staff && ` · ${thread.user.email}`}</p>
    {staff && <div className="mb-6 flex flex-wrap gap-3"><ActionForm action={supportAction} label={thread.status === "OPEN" ? "Close conversation" : "Reopen conversation"}><Hidden name="threadId" value={id} /><Hidden name="operation" value="status" /></ActionForm><ActionForm action={supportAction} label="Delete conversation" confirm="Delete this conversation and all its messages?"><Hidden name="threadId" value={id} /><Hidden name="operation" value="delete" /></ActionForm></div>}
    <div className="space-y-4">{thread.messages.map(message => <article key={message.id} className={`rounded-2xl border border-border p-5 ${message.senderId === user.id ? "bg-muted" : "bg-white"}`}><div className="mb-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{message.sender.name ?? "Customer"}{message.sender.role !== "CUSTOMER" ? " · Support team" : ""}</span><time>{message.createdAt.toLocaleString("en-US")}</time></div><p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>{staff && <details className="mt-3 text-sm"><summary className="cursor-pointer text-primary">Manage message</summary><div className="mt-3"><ActionForm action={supportAction} label="Update message"><Hidden name="threadId" value={id} /><Hidden name="messageId" value={message.id} /><Hidden name="operation" value="edit-message" /><Area name="body" label="Message" value={message.body} required /></ActionForm><div className="mt-3"><ActionForm action={supportAction} label="Delete message" confirm="Permanently delete this message?"><Hidden name="threadId" value={id} /><Hidden name="messageId" value={message.id} /><Hidden name="operation" value="delete-message" /></ActionForm></div></div></details>}</article>)}</div>
    <div className="mt-6">{thread.status === "OPEN" ? <ActionForm action={supportAction} label="Send reply"><Hidden name="threadId" value={id} /><Hidden name="operation" value="reply" /><Area name="body" label="Your reply" required /></ActionForm> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">This conversation is closed. You can start a new conversation if you need more help.</p>}</div>
  </div>;
}
