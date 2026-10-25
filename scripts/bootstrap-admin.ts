import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run admin:bootstrap -- existing@email.com");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Account not found. Sign up first.");
  await prisma.user.update({ where: { id: user.id }, data: { role: "SUPER_ADMIN" } });
  console.log(`Super admin assigned to ${email}`);
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
