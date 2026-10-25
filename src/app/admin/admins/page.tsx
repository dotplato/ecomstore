import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/access";
import { adminAction } from "@/actions/admin";
import { ActionForm, Field } from "@/components/management/action-form";
import { Card, Hidden } from "@/components/management/common";
export default async function AdminsPage() {
  await requireStaff(true);
  const users = await prisma.user.findMany({ where: { role: { not: "CUSTOMER" } }, select: { id: true, email: true, name: true, role: true }, orderBy: { email: "asc" } });
  return <><h1 className="mb-6 text-3xl font-bold">Administrators</h1><div className="mb-6 max-w-xl"><Card title="Assign an admin"><p className="mb-4 text-sm text-muted-foreground">Enter an existing customer’s email to grant admin access.</p><ActionForm action={adminAction} label="Assign admin"><Hidden name="operation" value="promote" /><Field name="email" label="Existing account email" type="email" /></ActionForm></Card></div><div className="grid gap-4 sm:grid-cols-2">{users.map(user => <Card key={user.id} title={user.name ?? user.email}><p>{user.email}</p><p className="mb-4 text-sm text-muted-foreground">{user.role}</p>{user.role === "ADMIN" && <div className="space-y-4"><ActionForm action={adminAction}><Hidden name="operation" value="update-admin" /><Hidden name="id" value={user.id} /><Field name="name" label="Name" value={user.name ?? ""} /><Field name="email" label="Email" type="email" value={user.email} /></ActionForm><ActionForm action={adminAction} label="Remove admin access" confirm="Return this admin to a customer account?"><Hidden name="operation" value="demote" /><Hidden name="id" value={user.id} /></ActionForm><ActionForm action={adminAction} label="Delete admin account" confirm="Permanently delete this admin and their orders and messages?"><Hidden name="operation" value="delete-admin" /><Hidden name="id" value={user.id} /></ActionForm></div>}</Card>)}</div></>;
}
