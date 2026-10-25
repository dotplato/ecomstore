import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { sectionAction } from "@/actions/sections";
import { ActionForm } from "@/components/management/action-form";
import { Hidden } from "@/components/management/common";
import { ManageDialog } from "@/components/management/dialog";
import { SectionEditor } from "@/components/management/section-editor";
import { DataTable, PageHeading } from "@/components/management/table";

export default async function SectionsPage() {
  await requireStaff(true);
  const [sections, products, categories] = await Promise.all([
    prisma.storefrontSection.findMany({ include: { products: { orderBy: { sortOrder: "asc" }, include: { product: { select: { title: true, status: true } } } } }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.product.findMany({ select: { id: true, title: true, categoryId: true, status: true, category: { select: { name: true } } }, orderBy: { title: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const choices = products.map(product => ({ id: product.id, title: product.title, status: product.status, categoryId: product.categoryId, categoryName: product.category.name }));
  return <>
    <PageHeading title="Storefront Sections" description="Curate the product collections shown after Categories on your homepage." action={<ManageDialog title="Add storefront section" trigger="+ Add section" primary><SectionEditor products={choices} categories={categories} /></ManageDialog>} />
    <div className="mb-5 rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground">Move sections up or down to set their homepage order. Only selected Live products are shown.</div>
    <DataTable columns={["Order", "Section", "Products", "Homepage", "Reorder", "Actions"]} count={sections.length} empty={!sections.length}>
      {sections.map((section, index) => {
        const live = section.products.filter(item => item.product.status === "LIVE").length;
        return <tr key={section.id} className="hover:bg-muted/30">
          <td className="font-mono text-muted-foreground">{index + 1}</td><td className="font-semibold">{section.name}</td>
          <td><p>{section.products.length} selected · {live} Live</p><p className="mt-1 max-w-72 truncate text-xs text-muted-foreground">{section.products.map(item => item.product.title).join(", ") || "No products selected"}</p></td>
          <td className="text-sm text-muted-foreground">{live ? "Visible" : "Hidden (no Live products)"}</td>
          <td><div className="flex items-start gap-2">{(["up", "down"] as const).map(direction => <ActionForm key={direction} action={sectionAction} label={direction === "up" ? "Move up" : "Move down"} disabled={direction === "up" ? index === 0 : index === sections.length - 1}><Hidden name="operation" value="move-section" /><Hidden name="id" value={section.id} /><Hidden name="direction" value={direction} /></ActionForm>)}</div></td>
          <td><div className="flex items-start gap-2"><ManageDialog title={"Edit " + section.name} trigger="Edit"><SectionEditor products={choices} categories={categories} section={{ id: section.id, name: section.name, productIds: section.products.map(item => item.productId) }} /></ManageDialog><ActionForm action={sectionAction} label="Delete" confirm="Delete this storefront section? Its products will remain in inventory."><Hidden name="operation" value="delete-section" /><Hidden name="id" value={section.id} /></ActionForm></div></td>
        </tr>;
      })}
    </DataTable>
  </>;
}
