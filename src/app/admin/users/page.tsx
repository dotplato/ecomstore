import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/access";
import { adminAction } from "@/actions/admin";
import { ActionForm, Field } from "@/components/management/action-form";
import { Hidden } from "@/components/management/common";
import { ManageDialog } from "@/components/management/dialog";
import { DataTable, FilterBar, PageHeading } from "@/components/management/table";
export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const actor = await requireStaff();
  const { q = "" } = await searchParams;
  const where: Prisma.UserWhereInput = { role: "CUSTOMER", ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}) };
  const users = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, createdAt: true, _count: { select: { orders: true } } } });
  return <>
    <PageHeading title="Users" description="View and manage customer accounts." action={actor.role === "SUPER_ADMIN" && <ManageDialog title="Add customer" trigger="+ Add customer" primary><ActionForm action={adminAction} label="Create customer"><Hidden name="operation" value="create-user" /><Field name="name" label="Name" /><Field name="email" label="Email" type="email" /><Field name="password" label="Initial password (8+ characters)" type="password" /></ActionForm></ManageDialog>} />
    <FilterBar q={q} resetHref="/admin/users" />
    <DataTable columns={["Name", "Email", "Joined", "Orders", "Actions"]} count={users.length} empty={!users.length}>
      {users.map(user => <tr key={user.id} className="hover:bg-muted/30"><td className="font-medium">{user.name ?? "—"}</td><td>{user.email}</td><td className="text-muted-foreground">{user.createdAt.toLocaleDateString("en-US")}</td><td>{user._count.orders}</td><td><div className="flex items-start gap-2">
        <ManageDialog title="Edit customer" trigger="Edit"><ActionForm action={adminAction} label="Save changes"><Hidden name="operation" value="update-user" /><Hidden name="id" value={user.id} /><Field name="name" label="Name" value={user.name ?? ""} /><Field name="email" label="Email" type="email" value={user.email} /></ActionForm></ManageDialog>
        <ActionForm action={adminAction} label="Delete" confirm="Permanently delete this customer and their orders, reviews and support messages?"><Hidden name="operation" value="delete-user" /><Hidden name="id" value={user.id} /><Hidden name="confirmed" value="yes" /></ActionForm>
      </div></td></tr>)}
    </DataTable>
  </>;
}
