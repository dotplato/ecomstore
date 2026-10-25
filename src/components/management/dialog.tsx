"use client";
import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
export function ManageDialog({ title, trigger, children, primary = false, triggerContent, triggerClassName }: {
  title: string; trigger: string; children: React.ReactNode; primary?: boolean; triggerContent?: React.ReactNode; triggerClassName?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [session, setSession] = useState(0);
  return <>
    <button type="button" onClick={() => { setSession(value => value + 1); dialog.current?.showModal(); }} className={triggerClassName ?? (primary
      ? "inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      : "rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-muted")}>{triggerContent ?? trigger}</button>
    <dialog ref={dialog} aria-labelledby={titleId} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-border bg-white p-0 text-foreground shadow-xl backdrop:bg-foreground/40">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <button type="button" aria-label="Close dialog" onClick={() => dialog.current?.close()} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
      </div>
      <div key={session} className="p-6">{children}<button type="button" onClick={() => dialog.current?.close()} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel / close</button></div>
    </dialog>
  </>;
}
