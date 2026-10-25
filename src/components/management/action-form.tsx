"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
export type FormResult = { ok: boolean; error?: string; message?: string };
export function ActionForm({ action, children, label = "Save", confirm, disabled = false }: {
  action: (state: FormResult | null, data: FormData) => Promise<FormResult>;
  children?: React.ReactNode; label?: string; confirm?: string; disabled?: boolean;
}) {
  const [state, submit, pending] = useActionState(action, null);
  return <form action={submit} onSubmit={e => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }} className="space-y-3">
    {children}
    {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    {state?.ok && <p role="status" className="text-sm text-green-700">{state.message ?? "Saved successfully."}</p>}
    <Button type="submit" size="sm" disabled={pending || disabled}>{pending ? "Saving…" : label}</Button>
  </form>;
}
export function Field({ name, label, value, type = "text", required = true }: { name: string; label: string; value?: string | number; type?: string; required?: boolean }) {
  return <label className="block text-sm font-medium">{label}<input name={name} type={type} defaultValue={value} required={required} step={type === "number" ? "0.01" : undefined} className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 font-normal" /></label>;
}
