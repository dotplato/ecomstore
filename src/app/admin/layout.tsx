import Link from "next/link";
import { requireStaff } from "@/lib/access";
import { Logo } from "@/components/layout/logo";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const links = ["", "users", "products", "orders", "support", ...(user.role === "SUPER_ADMIN" ? ["admins"] : [])];
  return <div className="min-h-screen bg-muted/40">
    <header className="border-b border-border bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 p-5"><Logo /><div className="text-sm">{user.name} · {user.role === "SUPER_ADMIN" ? "Super admin" : "Admin"} · <Link href="/" className="text-primary underline">Visit store</Link></div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <nav aria-label="Administration" className="mb-8 flex flex-wrap gap-2">{links.map(link => <Link className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium capitalize hover:bg-primary hover:text-white" key={link} href={`/admin${link ? "/" + link : ""}`}>{link || "Overview"}</Link>)}</nav>
      {children}
    </div>
  </div>;
}
