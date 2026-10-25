"use client";
import { useState } from "react";
import { applyPricing } from "@/actions/pricing";
import { ActionForm } from "./action-form";
import { controlClass, StatusBadge } from "./table";
import { formatMoney } from "@/lib/money";
type Product = { id: string; title: string; categoryId: string; categoryName: string; status: string; originalPrice: number; discountedPrice: number };
export function PricingEditor({ products, categories }: { products: Product[]; categories: { id: string; name: string }[] }) {
  const [scope, setScope] = useState("products");
  const [categoryId, setCategoryId] = useState("");
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState("");
  const [percentage, setPercentage] = useState("10");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const target = products.filter(product => scope === "category" ? product.categoryId === categoryId : selected.has(product.id));
  const visible = products.filter(product => (!((scope === "category" ? categoryId : filter)) || product.categoryId === (scope === "category" ? categoryId : filter)) && product.title.toLowerCase().includes(q.toLowerCase()));
  const categoryCount = new Set(target.map(product => product.categoryId)).size;
  const percent = Number(percentage);
  const valid = percentage !== "" && Number.isFinite(percent) && percent >= 0 && percent <= 100;
  function toggle(id: string) { setSelected(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  const allVisible = visible.length > 0 && visible.every(product => selected.has(product.id));
  return <ActionForm disabled={!valid || !target.length} action={applyPricing} label={`Apply discount to ${target.length} product${target.length === 1 ? "" : "s"}`} confirm={`Apply ${percentage}% off the original price to ${target.length} products? This replaces existing sale prices.`}>
    <input type="hidden" name="scope" value={scope} />
    {scope === "products" && [...selected].map(id => <input key={id} type="hidden" name="productId" value={id} />)}
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm font-medium">Apply to<select value={scope} onChange={event => setScope(event.target.value)} className={controlClass + " mt-2 block w-full"}><option value="products">Selected products</option><option value="category">Entire category</option></select></label>
        <label className="block text-sm font-medium">Discount percentage<input name="percentage" type="number" min="0" max="100" step="0.01" required value={percentage} onChange={event => setPercentage(event.target.value)} className={controlClass + " mt-2 block w-full"} /></label>
        {scope === "category" ? <label className="block text-sm font-medium">Category<select name="categoryId" required value={categoryId} onChange={event => setCategoryId(event.target.value)} className={controlClass + " mt-2 block w-full"}><option value="">Choose a category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label> : <div className="text-sm"><p className="font-medium">Selection</p><p className="mt-3">{selected.size} product{selected.size === 1 ? "" : "s"} across {categoryCount} categor{categoryCount === 1 ? "y" : "ies"}</p></div>}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Discounts use the original price, replace existing sale prices, and apply to all selected statuses. Enter 0% to remove a discount.</p>
    </div>
    <div className="flex flex-wrap items-center gap-3 py-2">
      <input aria-label="Search products" placeholder="Search products…" value={q} onChange={event => setQ(event.target.value)} className={controlClass + " min-w-48 flex-1"} />
      {scope === "products" && <><select aria-label="Filter products by category" value={filter} onChange={event => setFilter(event.target.value)} className={controlClass}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select><button type="button" onClick={() => setSelected(new Set())} className="text-sm text-muted-foreground underline">Clear selection</button></>}
    </div>
    <div className="overflow-x-auto rounded-2xl border border-border bg-white">
      <table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-border bg-muted/60"><tr>
        {scope === "products" && <th className="p-4"><input type="checkbox" aria-label="Select all visible products" checked={allVisible} onChange={() => setSelected(previous => { const next = new Set(previous); visible.forEach(product => { if (allVisible) next.delete(product.id); else next.add(product.id); }); return next; })} /></th>}
        {["Product", "Category", "Status", "Original", "Current", "After discount"].map(title => <th key={title} className="p-4 text-xs font-semibold text-muted-foreground">{title}</th>)}
      </tr></thead><tbody className="divide-y divide-border">{visible.map(product => <tr key={product.id} className={selected.has(product.id) && scope === "products" ? "bg-primary/5" : ""}>
        {scope === "products" && <td className="p-4"><input type="checkbox" aria-label={`Select ${product.title}`} checked={selected.has(product.id)} onChange={() => toggle(product.id)} /></td>}
        <td className="max-w-64 p-4 font-medium">{product.title}</td><td className="p-4">{product.categoryName}</td><td className="p-4"><StatusBadge status={product.status} /></td><td className="p-4">{formatMoney(product.originalPrice)}</td><td className="p-4">{formatMoney(product.discountedPrice)}</td><td className="p-4 font-medium text-primary">{valid && (scope === "category" ? product.categoryId === categoryId : selected.has(product.id)) ? formatMoney(Math.round(product.originalPrice * (100 - percent)) / 100) : "—"}</td>
      </tr>)}{!visible.length && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No products match your filters.</td></tr>}</tbody></table>
    </div>
    <p className="text-sm font-medium">{target.length} product{target.length === 1 ? "" : "s"} will be updated. Selections are kept when you switch category filters.</p>
  </ActionForm>;
}
