import { adminAction } from "@/actions/admin";
import { ActionForm, Field } from "./action-form";
import { Area, Hidden } from "./common";
import { ProductMedia } from "./product-media";
import { controlClass } from "./table";
export type EditableProduct = {
  id: string; title: string; slug: string; about: string;
  originalPrice: string; discountedPrice: string;
  stock: number; sku: string | null; categoryId: string;
  status: string; featured: boolean; images: { url: string }[];
};
export function ProductEditor({ product, categories }: { product?: EditableProduct; categories: { id: string; name: string }[] }) {
  return <ActionForm action={adminAction} label={product ? "Save changes" : "Create product"}>
    <Hidden name="operation" value={product ? "update-product" : "create-product"} />
    {product && <Hidden name="id" value={product.id} />}
    <div className="grid gap-4 sm:grid-cols-2">
      <Field name="title" label="Name" value={product?.title} />
      <Field name="slug" label="Slug" value={product?.slug} />
      <Field name="originalPrice" label="Price (USD)" type="number" value={product?.originalPrice} />
      <Field name="discountedPrice" label="Sale price (optional)" type="number" required={false} value={product && Number(product.discountedPrice) !== Number(product.originalPrice) ? product.discountedPrice : ""} />
      <Field name="stock" label="Stock" type="number" value={product?.stock ?? 0} />
      <Field name="sku" label="SKU (optional)" required={false} value={product?.sku ?? ""} />
      <label className="block text-sm font-medium">Category<select required name="categoryId" defaultValue={product?.categoryId} className={controlClass + " mt-1 block w-full"}>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="block text-sm font-medium">Status<select name="status" defaultValue={product?.status ?? "DRAFT"} className={controlClass + " mt-1 block w-full"}><option value="LIVE">Live</option><option value="DRAFT">Draft</option><option value="HIDDEN">Hidden</option></select></label>
      <div className="sm:col-span-2"><Area name="about" label="Description" value={product?.about} required /></div>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="featured" defaultChecked={product?.featured} className="h-4 w-4 accent-primary" />Featured</label>
      <div className="sm:col-span-2"><ProductMedia initialUrls={product?.images.map(image => image.url)} /></div>
    </div>
  </ActionForm>;
}
