"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, LayoutGrid, Layers, ShoppingBag, BadgePercent, MessagesSquare, ShieldCheck } from "lucide-react";
export function AdminNav({ superAdmin }: { superAdmin: boolean }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
    ...(superAdmin ? [{ href: "/admin/sections", label: "Storefront Sections", icon: Layers }] : []),
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/pricing", label: "Pricing", icon: BadgePercent },
    { href: "/admin/support", label: "Support", icon: MessagesSquare },
    ...(superAdmin ? [{ href: "/admin/admins", label: "Admins", icon: ShieldCheck }] : []),
  ];
  return <nav aria-label="Administration" className="mb-8 flex flex-wrap gap-2">
    {links.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground hover:bg-muted"}`}><Icon aria-hidden="true" className="h-4 w-4 shrink-0" />{label}</Link>;
    })}
  </nav>;
}
