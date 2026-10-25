"use client";
import { useId, useRef } from "react";
import { X } from "lucide-react";
export function OrderRow({ id, children, details, actions }: { id: string; children: React.ReactNode; details: React.ReactNode; actions: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  function open() { dialog.current?.showModal(); }
  return <tr className="cursor-pointer hover:bg-muted/40" onClick={event => {
    if (!(event.target instanceof Element) || event.target.closest("button,a,form,input,select,textarea,dialog")) return;
    open();
  }}>
    <td><button type="button" onClick={open} aria-label={`View order ${id}`} className="rounded text-left font-mono text-xs text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary" title={id}>#{id.slice(-8)}</button></td>
    {children}
    <td><div className="flex items-start gap-2"><button type="button" onClick={open} className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-muted">View</button>{actions}</div>
      <dialog ref={dialog} aria-labelledby={titleId} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-border bg-white p-0 text-foreground shadow-xl backdrop:bg-foreground/40">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4"><h2 id={titleId} className="text-lg font-semibold">Order #{id.slice(-8)}</h2><button type="button" aria-label="Close order details" onClick={() => dialog.current?.close()} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div>
        <div className="p-6">{details}<button type="button" onClick={() => dialog.current?.close()} className="mt-6 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Close</button></div>
      </dialog>
    </td>
  </tr>;
}
