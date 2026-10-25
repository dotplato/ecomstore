import { categoryAction } from "@/actions/categories";
import { ActionForm, Field } from "./action-form";
import { Hidden } from "./common";
export function CategoryEditor({ category }: { category?: { id: string; name: string; slug: string; imageUrl: string | null } }) {
  return <ActionForm action={categoryAction} label={category ? "Save category" : "Create category"}>
    <Hidden name="operation" value={category ? "update-category" : "create-category"} />
    {category && <Hidden name="id" value={category.id} />}
    <Field name="name" label="Name" value={category?.name} />
    <Field name="slug" label="Slug (optional, generated from name)" value={category?.slug} required={false} />
    <Field name="imageUrl" label="Image URL (optional)" value={category?.imageUrl ?? ""} required={false} />
    <p className="text-xs text-muted-foreground">The slug is used in shop links. Category images can use HTTPS image URLs.</p>
  </ActionForm>;
}
