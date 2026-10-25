export function Hidden({ name, value }: { name: string; value: string }) { return <input type="hidden" name={name} value={value} />; }
export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-white p-5"><h2 className="mb-4 text-lg font-semibold">{title}</h2>{children}</section>;
}
export function Area({ name, label, value = "", required = false }: { name: string; label: string; value?: string; required?: boolean }) {
  return <label className="block text-sm font-medium">{label}<textarea name={name} defaultValue={value} required={required} rows={3} className="mt-1 block w-full rounded-xl border border-border bg-white p-3 font-normal" /></label>;
}
