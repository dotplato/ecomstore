"use client";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
export function RefreshOrders() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    function refresh() { if (document.visibilityState === "visible") router.refresh(); }
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [router]);
  return <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />{pending ? "Refreshing…" : "Refresh updates"}</button>;
}
