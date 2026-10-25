"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchForm({
  className,
  placeholder = "Search products...",
  compact = false,
}: {
  className?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    const category = searchParams.get("category");
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          compact ? "h-4 w-4" : "h-4.5 w-4.5",
        )}
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-10", compact && "h-10 bg-muted/70")}
        aria-label="Search products"
      />
    </form>
  );
}
