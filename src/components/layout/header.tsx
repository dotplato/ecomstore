import Link from "next/link";
import { Heart, ShoppingCart, User } from "lucide-react";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { currentUser } from "@/lib/access";
import { getCartWithItems } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/layout/logo";
import { SearchForm } from "@/components/layout/search-form";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/support", label: "Support" },
];

export async function Header() {
  const session = await auth();
  const user = await currentUser();
  let cartCount = 0;
  let wishCount = 0;

  if (session?.user?.id) {
    const [{ itemCount }, wishes] = await Promise.all([
      getCartWithItems(session.user.id),
      prisma.wishlistItem.count({ where: { userId: session.user.id } }),
    ]);
    cartCount = itemCount;
    wishCount = wishes;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-5 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mx-2 hidden flex-1 md:block lg:mx-6">
          <Suspense fallback={<div className="h-11 rounded-full bg-muted" />}>
            <SearchForm />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {user && user.role !== "CUSTOMER" && <Link href="/admin" className="px-2 text-sm font-medium text-primary">Admin</Link>}
          <Link
            href="/wishlist"
            className="relative rounded-full p-2 text-foreground/80 transition hover:bg-muted hover:text-foreground"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-foreground/80 transition hover:bg-muted hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href={session ? "/wishlist" : "/login"}
            className="rounded-full p-2 text-foreground/80 transition hover:bg-muted hover:text-foreground"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          {session ? (
            <form action={logoutAction}>
              <Button type="submit" variant="link" size="sm" className="px-2">
                Sign out
              </Button>
            </form>
          ) : (
            <Link
              href="/login"
              className="px-2 text-sm font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-border/40 px-4 py-2 md:hidden">
        <Suspense fallback={<div className="h-10 rounded-full bg-muted" />}>
          <SearchForm compact />
        </Suspense>
        <nav className="mt-2 flex gap-4 text-sm font-medium">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-foreground/80">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
