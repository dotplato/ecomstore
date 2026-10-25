import { ORDER_STATUS_OPTIONS, orderStatusLabel } from "@/lib/order-status";
import Link from "next/link";
export const controlClass = "h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20";
export function PageHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>{action}</div>;
}
export function DataTable({ columns, children, empty, count }: { columns: string[]; children: React.ReactNode; empty: boolean; count: number }) {
  return <div className="overflow-hidden rounded-2xl border border-border bg-white">
    <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
      <thead className="border-b border-border bg-muted/60"><tr>{columns.map(column => <th key={column} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{column}</th>)}</tr></thead>
      <tbody className="divide-y divide-border [&_td]:px-5 [&_td]:py-4">{empty ? <tr><td colSpan={columns.length} className="py-16! text-center text-muted-foreground">No results. Try adjusting your filters.</td></tr> : children}</tbody>
    </table></div>
    <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">{count} result{count === 1 ? "" : "s"}</div>
  </div>;
}
export function StatusBadge({ status }: { status: string }) {
  const positive = ["LIVE", "COMPLETED", "Read"].includes(status);
  const attention = ["DRAFT", "PLACED", "PROCESSING", "Unread / New", "OPEN"].includes(status);
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${positive ? "bg-green-50 text-green-800" : attention ? "bg-amber-50 text-amber-800" : status === "IN_TRANSIT" ? "bg-primary/10 text-primary" : status === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-muted text-muted-foreground"}`}>{ORDER_STATUS_OPTIONS.some(option => option.value === status) ? orderStatusLabel(status) : status === "Unread / New" || status === "Read" ? status : status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}
export function FilterBar({ q, category, status, categories, statuses, resetHref }: {
  q?: string; category?: string; status?: string;
  categories?: { id: string; name: string }[];
  statuses?: { value: string; label: string }[];
  resetHref: string;
}) {
  return <form className="mb-5 flex flex-wrap items-center gap-3" method="get">
    <label className="min-w-48 flex-1"><span className="sr-only">Search</span><input className={controlClass + " w-full"} name="q" placeholder="Search…" defaultValue={q} /></label>
    {categories && <label><span className="sr-only">Category</span><select name="category" defaultValue={category ?? ""} className={controlClass}><option value="">All categories</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
    {statuses && <label><span className="sr-only">Status</span><select name="status" defaultValue={status ?? ""} className={controlClass}><option value="">All statuses</option>{statuses.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
    <button className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-white">Apply filters</button>
    <Link href={resetHref} className="px-2 text-sm text-muted-foreground hover:underline">Reset</Link>
  </form>;
}
