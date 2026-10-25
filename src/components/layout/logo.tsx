import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="text-lg font-bold leading-none">E</span>
        <ShoppingCart className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-amber-400" />
      </span>
      <span className="hidden text-base font-semibold tracking-tight text-foreground sm:inline">
        E Seller Store
      </span>
    </Link>
  );
}
