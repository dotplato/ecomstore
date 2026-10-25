"use client";
import { useState } from "react";
import { sectionAction } from "@/actions/sections";
import { ActionForm, Field } from "./action-form";
import { Hidden } from "./common";
import { StatusBadge, controlClass } from "./table";
type Product = { id: string; title: string; categoryId: string; categoryName: string; status: string };
export function SectionEditor({ section, products, categories }: {
  section?: { id: string; name: string; productIds: string[] };
  products: Product[]; categories: { id: string; name: string }[];
}) {
  const [selected, setSelected] = useState<string[]>(section?.productIds ?? []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const visible = products.filter(product => product.title.toLowerCase().includes(query.toLowerCase()) && (!category || product.categoryId === category) && (!status || product.status === status));
  const allSelected = visible.length > 0 && visible.every(product => selected.includes(product.id));
  const visibleSelected = products.filter(product => selected.includes(product.id) && product.status === "LIVE").length;
  function toggle(id: string) { setSelected(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]); }
  return <ActionForm action={sectionAction} label={section ? "Save section" : "Create section"}>
    <Hidden name="operation" value={section ? "update-section" : "create-section"} />
    {section && <Hidden name="id" value={section.id} />}
    {selected.map(id => <Hidden key={id} name="productId" value={id} />)}
    <Field name="name" label="Section name" value={section?.name} />
    <p className="text-sm text-muted-foreground">{selected.length} selected · {visibleSelected} Live. Only Live products appear on the homepage. Sections with no Live products are hidden.</p>
    <div className="flex flex-wrap gap-2">
      <input aria-label="Search section products" placeholder="Search products…" value={query} onChange={event => setQuery(event.target.value)} className={controlClass + " min-w-40 flex-1"} />
      <select aria-label="Filter section products by category" value={category} onChange={event => setCategory(event.target.value)} className={controlClass}><option value="">All categories</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <select aria-label="Filter section products by status" value={status} onChange={event => setStatus(event.target.value)} className={controlClass}><option value="">All statuses</option><option value="LIVE">Live</option><option value="DRAFT">Draft</option><option value="HIDDEN">Hidden</option></select>
    </div>
    <div className="flex items-center justify-between gap-3 text-sm">
      <button type="button" onClick={() => setSelected(previous => allSelected ? previous.filter(id => !visible.some(product => product.id === id)) : [...new Set([...previous, ...visible.map(product => product.id)])])} className="font-medium text-primary hover:underline">{allSelected ? "Deselect visible" : "Select visible"}</button>
      <button type="button" onClick={() => setSelected([])} className="text-muted-foreground hover:underline">Clear selection</button>
    </div>
    <div className="max-h-80 overflow-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm"><thead className="sticky top-0 bg-muted"><tr><th className="p-3"><span className="sr-only">Select</span></th><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Status</th></tr></thead>
        <tbody className="divide-y divide-border">{visible.map(product => <tr key={product.id} className={selected.includes(product.id) ? "bg-primary/5" : ""}>
          <td className="p-3"><input type="checkbox" className="h-4 w-4 accent-primary" aria-label={`Include ${product.title}`} checked={selected.includes(product.id)} onChange={() => toggle(product.id)} /></td>
          <td className="p-3">{product.title}</td><td className="p-3 text-muted-foreground">{product.categoryName}</td><td className="p-3"><StatusBadge status={product.status} /></td>
        </tr>)}{!visible.length && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No matching products.</td></tr>}</tbody>
      </table>
    </div>
    <p className="text-xs text-muted-foreground">Your selections are kept when filters change. Products appear in the order they were selected.</p>
  </ActionForm>;
}
