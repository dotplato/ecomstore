import Image from "next/image";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/access";
import { adminAction } from "@/actions/admin";
import { formatMoney } from "@/lib/money";
import { ActionForm } from "@/components/management/action-form";
import { Hidden } from "@/components/management/common";
import { ManageDialog } from "@/components/management/dialog";
import { ProductEditor } from "@/components/management/product-editor";
import { DataTable, FilterBar, PageHeading, StatusBadge } from "@/components/management/table";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string }> }) {
  const actor = await requireStaff();
  const { q = "", category = "", status = "" } = await searchParams;
  const where: Prisma.ProductWhereInput = {
    ...(category ? { categoryId: category } : {}),
    ...(Object.values(ProductStatus).includes(status as ProductStatus) ? { status: status as ProductStatus } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true, images: { orderBy: { sortOrder: "asc" } } }, orderBy: { updatedAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return <>
    <PageHeading title="Product inventory" description="Manage your catalog, availability and product details." action={actor.role === "SUPER_ADMIN" && <ManageDialog title="Add product" trigger="+ Add product" primary><ProductEditor categories={categories} /></ManageDialog>} />
    <FilterBar q={q} category={category} status={status} categories={categories} statuses={[{ value: "LIVE", label: "Live" }, { value: "DRAFT", label: "Draft" }, { value: "HIDDEN", label: "Hidden" }]} resetHref="/admin/products" />
    <DataTable columns={["Product", "SKU", "Category", "Price / Sale", "Stock", "Status", "Actions"]} count={products.length} empty={!products.length}>
      {products.map(product => <tr key={product.id} className="hover:bg-muted/30">
        <td><div className="flex items-center gap-3"><div className="relative h-12 w-12 shrink-0 rounded-lg bg-muted">{product.images[0] && <Image src={product.images[0].url} alt="" fill sizes="48px" className="rounded-lg object-contain p-1" />}</div><div className="max-w-64"><p className="line-clamp-2 font-medium">{product.title}</p>{product.featured && <p className="mt-1 text-xs text-muted-foreground">Featured</p>}</div></div></td>
        <td className="text-muted-foreground">{product.sku ?? "—"}</td><td>{product.category.name}</td>
        <td><p>{formatMoney(product.originalPrice)}</p>{product.discountedPrice.lessThan(product.originalPrice) && <p className="mt-1 text-xs text-green-700">Sale {formatMoney(product.discountedPrice)}</p>}</td>
        <td>{product.stock}</td><td><StatusBadge status={product.status} /></td>
        <td><div className="flex items-start gap-2"><ManageDialog title="Edit product" trigger="Edit"><ProductEditor categories={categories} product={{ ...product, originalPrice: product.originalPrice.toString(), discountedPrice: product.discountedPrice.toString() }} /></ManageDialog><ActionForm action={adminAction} label="Delete" confirm="Permanently delete this product? Existing order snapshots will be preserved."><Hidden name="operation" value="delete-product" /><Hidden name="id" value={product.id} /></ActionForm></div></td>
      </tr>)}
    </DataTable>
  </>;
}
