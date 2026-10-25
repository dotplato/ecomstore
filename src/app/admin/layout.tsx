import { AdminNav } from "@/components/management/admin-nav";
import Link from "next/link";
import { requireStaff } from "@/lib/access";
import { Logo } from "@/components/layout/logo";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return <div className="min-h-screen bg-muted/40">
    <header className="border-b border-border bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 p-5"><Logo /><div className="text-sm">{user.name} · {user.role === "SUPER_ADMIN" ? "Super admin" : "Admin"} · <Link href="/" className="text-primary underline">Visit store</Link></div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <AdminNav superAdmin={user.role === "SUPER_ADMIN"} />
      {children}
    </div>
  </div>;
}
