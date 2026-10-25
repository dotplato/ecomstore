import Image from "next/image";
import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { categoryAction } from "@/actions/categories";
import { ActionForm } from "@/components/management/action-form";
import { Hidden } from "@/components/management/common";
import { ManageDialog } from "@/components/management/dialog";
import { CategoryEditor } from "@/components/management/category-editor";
import { DataTable, FilterBar, PageHeading, controlClass } from "@/components/management/table";

export default async function CategoriesAdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaff();
  const { q = "" } = await searchParams;
  const [categories, choices] = await Promise.all([
    prisma.category.findMany({
      where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : {},
      include: { _count: { select: { products: true } } }, orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return <>
    <PageHeading title="Categories" description="Organize your catalog and manage the categories customers browse." action={<ManageDialog title="Add category" trigger="+ Add category" primary><CategoryEditor /></ManageDialog>} />
    <FilterBar q={q} resetHref="/admin/categories" />
    <DataTable columns={["Image", "Name", "Slug", "Products", "Actions"]} count={categories.length} empty={!categories.length}>
      {categories.map(category => <tr key={category.id} className="hover:bg-muted/30">
        <td><div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-muted">{category.imageUrl ? <Image src={category.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : <span className="text-lg font-medium text-muted-foreground">{category.name.slice(0, 1)}</span>}</div></td>
        <td className="font-medium">{category.name}</td><td className="font-mono text-xs text-muted-foreground">{category.slug}</td><td>{category._count.products}</td>
        <td><div className="flex items-start gap-2">
          <ManageDialog title="Edit category" trigger="Edit"><CategoryEditor category={category} /></ManageDialog>
          <ManageDialog title={"Delete " + category.name} trigger="Delete"><p className="mb-4 text-sm text-muted-foreground">{category._count.products ? `This category contains ${category._count.products} products. Choose where to move them before deleting it.` : "This category is empty and can be removed."} Products and order history will be preserved.</p>
            <ActionForm action={categoryAction} label="Delete category" confirm="Permanently delete this category and move its products to the selected replacement?" disabled={category._count.products > 0 && choices.length < 2}>
              <Hidden name="operation" value="delete-category" /><Hidden name="id" value={category.id} />
              {category._count.products > 0 && <label className="block text-sm font-medium">Move products to<select name="replacementId" required defaultValue="" className={controlClass + " mt-1 block w-full"}><option value="">Choose a replacement category</option>{choices.filter(item => item.id !== category.id).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
              {category._count.products > 0 && choices.length < 2 && <p className="text-sm text-amber-800">Add another category first so these products have a home.</p>}
            </ActionForm>
          </ManageDialog>
        </div></td>
      </tr>)}
    </DataTable>
  </>;
}
