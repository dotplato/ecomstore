import Link from "next/link";
import { ArrowUpRight, ArrowRight, PackagePlus, ShoppingBag, FolderPlus, BadgePercent, Layers, Package, Zap, MessagesSquare, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ManageDialog } from "./dialog";
import { ProductEditor } from "./product-editor";
import { OrderEditor } from "./order-editor";
import { CategoryEditor } from "./category-editor";

const actionClass = "group flex h-full min-h-28 w-full items-start gap-3 rounded-xl border border-border bg-white p-4 text-left transition hover:border-primary/30 hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
function ActionContent({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return <><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary transition group-hover:bg-primary/10"><Icon aria-hidden="true" className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span><ArrowUpRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60 transition group-hover:text-primary" /></>;
}
export function OverviewQuickActions({ superAdmin, categories, customers, products }: {
  superAdmin: boolean; categories: { id: string; name: string }[];
  customers: { id: string; email: string }[]; products: { id: string; title: string }[];
}) {
  return <section aria-labelledby="quick-actions-title" className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white">
    <header className="flex min-h-24 items-center gap-3 border-b border-border px-5 py-5 sm:px-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary"><Zap aria-hidden="true" className="h-5 w-5" /></span><div><h2 id="quick-actions-title" className="text-lg font-semibold">Quick actions</h2><p className="mt-1 text-xs text-muted-foreground">The things you do most, one click away.</p></div></header>
    <div className="grid flex-1 content-start gap-3 p-5 sm:grid-cols-2 sm:p-6">
      {superAdmin ? <>
        <ManageDialog title="Add product" trigger="Add product" triggerClassName={actionClass} triggerContent={<ActionContent title="Add product" description="Grow your product catalog" icon={PackagePlus} />}><ProductEditor categories={categories} /></ManageDialog>
        <ManageDialog title="Add order" trigger="Create order" triggerClassName={actionClass} triggerContent={<ActionContent title="Create order" description="Place an order for a customer" icon={ShoppingBag} />}><OrderEditor users={customers} products={products} /></ManageDialog>
      </> : <>
        <Link href="/admin/products" className={actionClass}><ActionContent title="Manage inventory" description="Update stock and product details" icon={Package} /></Link>
        <Link href="/admin/orders" className={actionClass}><ActionContent title="Manage orders" description="Review orders and update status" icon={ShoppingBag} /></Link>
      </>}
      <ManageDialog title="Add category" trigger="Add category" triggerClassName={actionClass} triggerContent={<ActionContent title="Add category" description="Keep your catalog organized" icon={FolderPlus} />}><CategoryEditor /></ManageDialog>
      <Link href="/admin/pricing" className={actionClass}><ActionContent title="Manage pricing" description="Apply product or category discounts" icon={BadgePercent} /></Link>
    </div>
    <footer className="flex min-h-16 items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
      {superAdmin ? <Link href="/admin/sections" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><Layers aria-hidden="true" className="h-4 w-4" />Curate storefront sections</Link> : <Link href="/admin/categories" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><FolderPlus aria-hidden="true" className="h-4 w-4" />Manage categories</Link>}
      <ArrowRight aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
    </footer>
  </section>;
}
export function OverviewSupportMessages({ unreadCount, threads }: {
  unreadCount: number;
  threads: { id: string; subject: string; updatedAt: Date; user: { name: string | null; email: string }; messages: { body: string }[] }[];
}) {
  return <section aria-labelledby="new-support-title" className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white">
    <header className="flex min-h-24 items-center gap-3 border-b border-border px-5 py-5 sm:px-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary"><MessagesSquare aria-hidden="true" className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 id="new-support-title" className="text-lg font-semibold">New support messages</h2><p className="mt-1 text-xs text-muted-foreground">Recent unread conversations awaiting a reply.</p></div><span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold tabular-nums text-primary" aria-label={`${unreadCount} unread conversations`}>{unreadCount}</span></header>
    <div className="flex flex-1 flex-col">
      {threads.length ? <ul className="grid flex-1 auto-rows-fr divide-y divide-border">{threads.map(thread => {
        const name = thread.user.name || thread.user.email;
        const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" }).format(thread.updatedAt);
        return <li key={thread.id} className="flex"><Link href={`/support/${thread.id}`} className="group flex w-full min-w-0 items-center gap-3 px-5 py-4 transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 sm:px-6">
          <span aria-hidden="true" className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-sm font-semibold text-primary">{name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><span className="truncate text-xs font-medium text-muted-foreground">{name}</span><time dateTime={thread.updatedAt.toISOString()} className="whitespace-nowrap text-[11px] text-muted-foreground">{date}</time></span><span className="mt-1 block truncate text-sm font-semibold text-foreground group-hover:text-primary">{thread.subject}</span><span className="mt-1 block truncate text-xs leading-5 text-muted-foreground">{thread.messages[0]?.body ?? "Open this conversation to follow up."}</span></span>
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
        </Link></li>;
      })}</ul> : <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary"><Inbox aria-hidden="true" className="h-6 w-6" /></span><h3 className="text-sm font-semibold">You’re all caught up</h3><p className="mt-2 max-w-60 text-xs leading-5 text-muted-foreground">New customer messages will appear here as they arrive.</p></div>}
    </div>
    <footer className="flex min-h-16 items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:px-6"><Link href="/admin/support?view=unread" className="text-sm font-medium text-primary hover:underline">View unread inbox</Link><ArrowRight aria-hidden="true" className="h-4 w-4 text-muted-foreground" /></footer>
  </section>;
}
