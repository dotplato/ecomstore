import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryPills({
  categories,
  activeSlug,
  searchQuery,
}: {
  categories: { name: string; slug: string }[];
  activeSlug?: string | null;
  searchQuery?: string | null;
}) {
  function hrefFor(slug: string | null) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (searchQuery) params.set("q", searchQuery);
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={hrefFor(null)}
        className={cn(
          "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
          !activeSlug
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground/80 hover:bg-muted/80",
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={hrefFor(cat.slug)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
            activeSlug === cat.slug
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground/80 hover:bg-muted/80",
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
