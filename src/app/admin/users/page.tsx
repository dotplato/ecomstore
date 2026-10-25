import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/access";
import { adminAction } from "@/actions/admin";
import { ActionForm, Field } from "@/components/management/action-form";
import { Card, Hidden } from "@/components/management/common";
export default async function UsersPage() {
  const actor = await requireStaff();
  const users = await prisma.user.findMany({ where: { role: "CUSTOMER" }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true } });
  return <><h1 className="mb-6 text-3xl font-bold">Customers</h1><div className="grid gap-5 lg:grid-cols-2">
    {actor.role === "SUPER_ADMIN" && <Card title="Add customer"><ActionForm action={adminAction} label="Create customer"><Hidden name="operation" value="create-user" /><Field name="name" label="Name" /><Field name="email" label="Email" type="email" /><Field name="password" label="Initial password (8+ characters)" type="password" /></ActionForm></Card>}
    {users.map(user => <Card key={user.id} title={user.name ?? user.email}><ActionForm action={adminAction}><Hidden name="operation" value="update-user" /><Hidden name="id" value={user.id} /><Field name="name" label="Name" value={user.name ?? ""} /><Field name="email" label="Email" type="email" value={user.email} /></ActionForm><div className="mt-5 border-t border-border pt-4"><ActionForm action={adminAction} label="Delete customer" confirm="Permanently delete this customer and all their orders, reviews and support messages?"><Hidden name="operation" value="delete-user" /><Hidden name="id" value={user.id} /><Hidden name="confirmed" value="yes" /></ActionForm></div></Card>)}
    {!users.length && <p className="text-muted-foreground">No customers yet.</p>}
  </div></>;
}
