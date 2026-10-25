import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
const base = process.env.TEST_URL ?? "http://localhost:3001";
const suffix = Date.now();
const ids = [];
const productIds = [];
function client() {
  const cookies = new Map();
  return async (path, options = {}) => {
    const response = await fetch(base + path, { ...options, redirect: "manual", headers: { Cookie: [...cookies].map(([k,v]) => k + "=" + v).join("; "), Origin: base, ...options.headers } });
    for (const cookie of response.headers.getSetCookie()) {
      const [key, ...value] = cookie.split(";")[0].split("=");
      cookies.set(key, value.join("="));
    }
    return response;
  };
}
async function login(email) {
  const request = client();
  const csrf = await (await request("/api/auth/csrf")).json();
  await request("/api/auth/callback/credentials", { method: "POST", body: new URLSearchParams({ csrfToken: csrf.csrfToken, email, password: "PortalTest123!", callbackUrl: base }) });
  const session = await (await request("/api/auth/session")).json();
  assert.equal(session.user.email, email);
  return request;
}
function decode(value) { return value.replaceAll("&quot;", '"').replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">"); }
async function submit(request, path, operation, values, sourceRequest = request) {
  const html = await (await sourceRequest(path)).text();
  const forms = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)];
  const form = forms.find(m => operation ? m[1].includes('value="' + operation + '"') : m[1].includes('name="subject"'));
  assert.ok(form, "Form not found: " + operation);
  const body = new FormData();
  for (const match of form[1].matchAll(/<input\b([^>]*)>/g)) {
    const attrs = Object.fromEntries([...match[1].matchAll(/([\w$:-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
    if (attrs.name && attrs.type === "hidden") body.append(attrs.name, attrs.value ?? "");
  }
  for (const [key,value] of Object.entries(values)) body.set(key, value);
  return request(path, { method: "POST", body });
}
try {
  for (const role of ["CUSTOMER", "CUSTOMER", "ADMIN", "SUPER_ADMIN"]) {
    const user = await db.user.create({ data: { email: "portal-" + suffix + "-" + ids.length + "@example.test", name: "Portal test", role, passwordHash: await bcrypt.hash("PortalTest123!", 4) } });
    ids.push(user.id);
  }
  const users = await db.user.findMany({ where: { id: { in: ids } } });
  const email = id => users.find(u => u.id === id).email;
  const customer = await login(email(ids[0]));
  const other = await login(email(ids[1]));
  const admin = await login(email(ids[2]));
  const root = await login(email(ids[3]));
  assert.equal((await client()("/admin")).status, 307);
  assert.equal((await customer("/admin")).status, 307);
  assert.equal((await admin("/admin")).status, 200);
  assert.equal((await admin("/admin/admins")).status, 307);
  assert.equal((await root("/admin/admins")).status, 200);
  await submit(customer, "/support", null, { subject: "Test conversation", body: "Customer question" });
  const thread = await db.supportThread.findFirstOrThrow({ where: { userId: ids[0] } });
  assert.equal((await other("/support/" + thread.id)).status, 404);
  await submit(admin, "/support/" + thread.id, "reply", { body: "Support reply" });
  assert.equal(await db.supportMessage.count({ where: { threadId: thread.id } }), 2);
  await submit(admin, "/admin/admins", "promote", { email: email(ids[1]) }, root);
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: ids[1] } })).role, "CUSTOMER", "Admin cannot forge promotion");
  await submit(other, "/support/" + thread.id, "reply", { body: "Unauthorized reply", threadId: thread.id }, admin);
  assert.equal(await db.supportMessage.count({ where: { threadId: thread.id } }), 2, "Customer cannot forge reply to another thread");
  await submit(admin, "/support/" + thread.id, "status", {});
  await submit(customer, "/support/" + thread.id, "status", { operation: "reply", body: "Closed thread reply", threadId: thread.id }, admin);
  assert.equal(await db.supportMessage.count({ where: { threadId: thread.id } }), 2);
  await submit(admin, "/support/" + thread.id, "status", {});
  const category = await db.category.findFirstOrThrow();
  const productData = { title: "Portal test product", slug: "portal-test-" + suffix, about: "Test inventory", categoryId: category.id, stock: "10", originalPrice: "20", discountedPrice: "15", images: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" };
  await submit(admin, "/admin/products", "create-product", productData, root);
  assert.equal(await db.product.count({ where: { slug: productData.slug } }), 0);
  await submit(root, "/admin/products", "create-product", productData);
  const product = await db.product.findUniqueOrThrow({ where: { slug: productData.slug } });
  productIds.push(product.id);
  await submit(admin, "/admin/products", "update-product", { ...productData, id: product.id, stock: "8" });
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 8);
  await submit(root, "/admin/orders", "create-order", { userId: ids[0], customerName: "Test recipient", address: "123 Test Street", message: "", items: JSON.stringify([{ productId: product.id, quantity: 2 }]) });
  const order = await db.order.findFirstOrThrow({ where: { userId: ids[0] } });
  assert.equal(Number(order.subtotal), 30);
  assert.equal(Number(order.total), 37.4);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 6);
  await submit(admin, "/admin/orders", "update-order", { id: order.id, customerName: "Updated recipient", address: "456 Test Street", message: "Updated", status: "CANCELLED" });
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status, "CANCELLED");
  await submit(admin, "/admin/products", "delete-product", { id: product.id });
  assert.equal((await db.orderItem.findFirstOrThrow({ where: { orderId: order.id } })).productId, null);
  await submit(admin, "/admin/orders", "delete-order", { id: order.id });
  assert.equal(await db.order.count({ where: { id: order.id } }), 0);
  await submit(admin, "/admin/support", null, { userId: ids[1], subject: "Staff outreach", body: "Hello from support" });
  const outreach = await db.supportThread.findFirstOrThrow({ where: { userId: ids[1] } });
  assert.equal((await other("/support/" + outreach.id)).status, 200);
  const outreachMessage = await db.supportMessage.findFirstOrThrow({ where: { threadId: outreach.id } });
  await submit(admin, "/support/" + outreach.id, "edit-message", { messageId: outreachMessage.id, body: "Edited support message" });
  assert.equal((await db.supportMessage.findUniqueOrThrow({ where: { id: outreachMessage.id } })).body, "Edited support message");
  await submit(admin, "/support/" + outreach.id, "delete-message", { messageId: outreachMessage.id });
  assert.equal(await db.supportMessage.count({ where: { threadId: outreach.id } }), 0);
  await submit(root, "/admin/admins", "promote", { email: email(ids[1]) });
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: ids[1] } })).role, "ADMIN");
  assert.equal((await other("/admin")).status, 200, "Existing session must pick up promotion");
  await submit(root, "/admin/admins", "demote", { id: ids[1] });
  assert.equal((await other("/admin")).status, 307, "Existing session must lose admin access");
  console.log("PASS: role gates, forged mutation denial, thread ownership and closure, support replies, inventory CRUD, order creation/totals/status/deletion, preserved snapshots, promotion and immediate demotion.");
} finally {
  await db.order.deleteMany({ where: { userId: { in: ids } } });
  await db.product.deleteMany({ where: { id: { in: productIds } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
}
