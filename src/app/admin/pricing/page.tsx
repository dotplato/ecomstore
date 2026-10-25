import { requireStaff } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PricingEditor } from "@/components/management/pricing-editor";
import { PageHeading } from "@/components/management/table";
export default async function PricingPage() {
  await requireStaff();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: { select: { name: true } } }, orderBy: { title: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return <><PageHeading title="Pricing" description="Apply a discount to individual products, a selection across categories, or an entire category." /><PricingEditor categories={categories} products={products.map(product => ({ id: product.id, title: product.title, categoryId: product.categoryId, categoryName: product.category.name, status: product.status, originalPrice: Number(product.originalPrice), discountedPrice: Number(product.discountedPrice) }))} /></>;
}
