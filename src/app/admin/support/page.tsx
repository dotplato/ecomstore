import Link from "next/link";
import { createThread, supportAction } from "@/actions/support";
import { ActionForm, Field } from "@/components/management/action-form";
import { Area, Hidden } from "@/components/management/common";
import { ManageDialog } from "@/components/management/dialog";
import { PageHeading, StatusBadge, controlClass } from "@/components/management/table";
import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export default async function SupportInbox({ searchParams }: { searchParams: Promise<{ view?: string; q?: string }> }) {
  await requireStaff();
  const { view = "all", q = "" } = await searchParams;
  const [customers, threads] = await Promise.all([
    prisma.user.findMany({ where: { role: "CUSTOMER" }, select: { id: true, email: true }, orderBy: { email: "asc" } }),
    prisma.supportThread.findMany({
      where: q ? { OR: [{ subject: { contains: q, mode: "insensitive" } }, { user: { email: { contains: q, mode: "insensitive" } } }, { messages: { some: { body: { contains: q, mode: "insensitive" } } } }] } : {},
      include: { user: { select: { name: true, email: true } }, messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true } }, _count: { select: { messages: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  const unread = threads.filter(thread => thread.staffUnread).length;
  const filtered = threads.filter(thread => view === "unread" ? thread.staffUnread : view === "read" ? !thread.staffUnread : true);
  return <>
    <PageHeading title="Support inbox" description="Keep track of new messages and follow up with your customers." action={<ManageDialog title="Message a customer" trigger="+ New message" primary><ActionForm action={createThread} label="Send message"><label className="block text-sm font-medium">Customer<select name="userId" required className={controlClass + " mt-1 block w-full"}>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.email}</option>)}</select></label><Field name="subject" label="Subject" /><Area name="body" label="Message" required /></ActionForm></ManageDialog>} />
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Inbox filters" className="flex gap-1 rounded-xl border border-border bg-white p-1">
        {[{ id: "all", label: "All", count: threads.length }, { id: "unread", label: "Unread / New", count: unread }, { id: "read", label: "Read", count: threads.length - unread }].map(tab => <Link key={tab.id} href={`/admin/support?view=${tab.id}&q=${encodeURIComponent(q)}`} aria-current={view === tab.id ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-medium ${view === tab.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>{tab.label} <span className="ml-1 opacity-75">{tab.count}</span></Link>)}
      </nav>
      <form method="get" className="flex gap-2"><input type="hidden" name="view" value={view} /><input name="q" aria-label="Search support conversations" placeholder="Search messages or customer…" defaultValue={q} className={controlClass} /><button className="rounded-xl border border-border bg-white px-4 text-sm">Search</button></form>
    </div>
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      {filtered.map(thread => <article key={thread.id} className={`flex flex-wrap items-center gap-4 border-b border-border px-5 py-5 last:border-0 ${thread.staffUnread ? "bg-primary/5" : ""}`}>
        <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${thread.staffUnread ? "bg-primary" : "bg-transparent"}`} />
        <Link href={`/support/${thread.id}`} className="min-w-48 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2"><h2 className={`text-sm ${thread.staffUnread ? "font-bold" : "font-medium"}`}>{thread.subject}</h2><StatusBadge status={thread.staffUnread ? "Unread / New" : "Read"} /><span className="text-xs text-muted-foreground">{thread.status === "CLOSED" ? "Closed" : "Open"}</span></div>
          <p className="text-xs text-muted-foreground">{thread.user.name ?? "Customer"} · {thread.user.email}</p>
          <p className="mt-2 line-clamp-1 max-w-2xl text-sm text-muted-foreground">{thread.messages[0]?.body ?? "No messages"}</p>
        </Link>
        <div className="space-y-2 text-right"><p className="text-xs text-muted-foreground">{thread.updatedAt.toLocaleString("en-US")} · {thread._count.messages} messages</p><ActionForm action={supportAction} label={thread.staffUnread ? "Mark as read" : "Mark as unread"}><Hidden name="operation" value={thread.staffUnread ? "mark-read" : "mark-unread"} /><Hidden name="threadId" value={thread.id} /></ActionForm></div>
      </article>)}
      {!filtered.length && <p className="p-16 text-center text-sm text-muted-foreground">No {view === "all" ? "" : view + " "}conversations found.</p>}
    </div>
  </>;
}
