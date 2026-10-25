import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function currentUser() {
  const session = await auth();
  return session?.user?.id ? prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  }) : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
export async function requireStaff(superOnly = false) {
  const user = await requireUser();
  if (user.role === "CUSTOMER" || (superOnly && user.role !== "SUPER_ADMIN")) redirect("/");
  return user;
}
