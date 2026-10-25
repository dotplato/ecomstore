import assert from "node:assert/strict";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { unlink } from "node:fs/promises";
import path from "node:path";
const db = new PrismaClient();
const base = process.env.TEST_URL ?? "http://localhost:3000";
const suffix = Date.now();
const ids = [];
const productIds = [];
const categoryIds = [];
const sectionIds = [];
const uploadedUrls = [];
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
  const form = forms.find(m => operation === "pricing" ? m[1].includes('name="percentage"') : operation ? m[1].includes('value="' + operation + '"') : m[1].includes('name="subject"'));
  assert.ok(form, "Form not found: " + operation);
  const body = new FormData();
  for (const match of form[1].matchAll(/<input\b([^>]*)>/g)) {
    const attrs = Object.fromEntries([...match[1].matchAll(/([\w$:-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
    if (attrs.name && attrs.type === "hidden") body.append(attrs.name, attrs.value ?? "");
  }
  for (const [key,value] of Object.entries(values)) { body.delete(key); for (const item of Array.isArray(value) ? value : [value]) body.append(key, item); }
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
  const adminOverview = await (await admin("/admin")).text();
  assert.ok(adminOverview.includes("Quick actions"));
  assert.ok(adminOverview.includes("Manage inventory"));
  assert.ok(adminOverview.includes("New support messages"));
  assert.ok(adminOverview.includes('href="/support/' + thread.id + '"'));
  assert.equal((await db.supportThread.findUniqueOrThrow({ where: { id: thread.id } })).staffUnread, true, "Overview must not mark messages read");
  const rootOverview = await (await root("/admin")).text();
  assert.ok(rootOverview.includes("Add product") && rootOverview.includes("Create order"));
  assert.ok(rootOverview.includes("Curate storefront sections"));
  assert.equal((await other("/support/" + thread.id)).status, 404);
  await submit(admin, "/support/" + thread.id, "reply", { body: "Support reply" });
  assert.equal(await db.supportMessage.count({ where: { threadId: thread.id } }), 2);
  assert.ok(!(await (await admin("/admin")).text()).includes('href="/support/' + thread.id + '"'), "Read conversations must leave the overview new-message list");
  assert.equal((await db.supportThread.findUniqueOrThrow({ where: { id: thread.id } })).staffUnread, false, "Staff reply marks read");
  await submit(customer, "/support/" + thread.id, "reply", { body: "Another customer reply" });
  assert.equal((await db.supportThread.findUniqueOrThrow({ where: { id: thread.id } })).staffUnread, true);
  await submit(admin, "/admin/support", "mark-read", { threadId: thread.id });
  assert.equal((await db.supportThread.findUniqueOrThrow({ where: { id: thread.id } })).staffUnread, false);
  await submit(admin, "/admin/admins", "promote", { email: email(ids[1]) }, root);
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: ids[1] } })).role, "CUSTOMER", "Admin cannot forge promotion");
  await submit(other, "/support/" + thread.id, "reply", { body: "Unauthorized reply", threadId: thread.id }, admin);
  assert.equal(await db.supportMessage.count({ where: { threadId: thread.id } }), 3, "Customer cannot forge reply to another thread");
  await submit(admin, "/support/" + thread.id, "status", {});
  await submit(customer, "/support/" + thread.id, "status", { operation: "reply", body: "Closed thread reply", threadId: thread.id }, admin);
  assert.equal(await db.supportMessage.count({ where: { threadId: thread.id } }), 3);
  await submit(admin, "/support/" + thread.id, "status", {});
  assert.equal((await admin("/admin/sections")).status, 307);
  assert.equal((await customer("/admin/categories")).status, 307);
  assert.equal((await admin("/admin/categories")).status, 200);
  await submit(admin, "/admin/categories", "create-category", { name: "Test category A", slug: "test-cat-a-" + suffix, imageUrl: "" });
  await submit(root, "/admin/categories", "create-category", { name: "Test category B", slug: "test-cat-b-" + suffix, imageUrl: "" });
  const category = await db.category.findUniqueOrThrow({ where: { slug: "test-cat-a-" + suffix } });
  const otherCategory = await db.category.findUniqueOrThrow({ where: { slug: "test-cat-b-" + suffix } });
  await submit(admin, "/admin/categories", "update-category", { id: category.id, name: "Updated test category A", slug: category.slug, imageUrl: "" });
  assert.equal((await db.category.findUniqueOrThrow({ where: { id: category.id } })).name, "Updated test category A");
  await submit(customer, "/admin/categories", "delete-category", { id: category.id }, admin);
  assert.equal(await db.category.count({ where: { id: category.id } }), 1);
  categoryIds.push(category.id, otherCategory.id);
  const productData = { title: "Portal test product", slug: "portal-test-" + suffix, about: "Test inventory", categoryId: category.id, stock: "10", status: "LIVE", sku: "TEST-" + suffix, featured: "on", originalPrice: "20", discountedPrice: "15", images: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" };
  await submit(admin, "/admin/products", "create-product", productData, root);
  assert.equal(await db.product.count({ where: { slug: productData.slug } }), 0);
  await submit(root, "/admin/products", "create-product", productData);
  const product = await db.product.findUniqueOrThrow({ where: { slug: productData.slug } });
  productIds.push(product.id);
  assert.equal(product.sku, productData.sku);
  assert.equal(product.featured, true);
  assert.equal((await customer("/product/" + product.slug)).status, 200);
  for (const status of ["DRAFT", "HIDDEN"]) {
    await submit(admin, "/admin/products", "update-product", { ...productData, id: product.id, status });
    assert.equal((await customer("/product/" + product.slug)).status, 404, "Non-live product details must be unavailable");
    const shop = await (await customer("/shop?q=" + encodeURIComponent(productData.title))).text();
    assert.ok(!shop.includes(productData.slug), "Non-live products must not appear in search");
  }
  await submit(admin, "/admin/products", "update-product", { ...productData, id: product.id, stock: "8" });
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 8);
  const second = await db.product.create({ data: { title: "Second pricing fixture", slug: "pricing-fixture-" + suffix, about: "Test", originalPrice: 30, discountedPrice: 30, status: "LIVE", categoryId: otherCategory.id, stock: 10 } });
  productIds.push(second.id);
  const selection = { scope: "products", percentage: "10", productId: [product.id, second.id] };
  await submit(customer, "/admin/pricing", "pricing", selection, admin);
  assert.equal(Number((await db.product.findUniqueOrThrow({ where: { id: product.id } })).discountedPrice), 15, "Customer must not change pricing");
  for (let attempt = 0; attempt < 2; attempt++) {
    await submit(admin, "/admin/pricing", "pricing", selection);
    assert.equal(Number((await db.product.findUniqueOrThrow({ where: { id: product.id } })).discountedPrice), 18, "Discount must not compound");
    assert.equal(Number((await db.product.findUniqueOrThrow({ where: { id: second.id } })).discountedPrice), 27);
  }
  await submit(admin, "/admin/pricing", "pricing", { scope: "products", percentage: "150", productId: product.id });
  assert.equal(Number((await db.product.findUniqueOrThrow({ where: { id: product.id } })).discountedPrice), 18);
  await submit(admin, "/admin/pricing", "pricing", { scope: "category", percentage: "25", categoryId: category.id });
  assert.equal(Number((await db.product.findUniqueOrThrow({ where: { id: product.id } })).discountedPrice), 15);
  assert.equal(Number((await db.product.findUniqueOrThrow({ where: { id: second.id } })).discountedPrice), 27, "Category pricing must not affect another category");
  await submit(admin, "/admin/pricing", "pricing", { scope: "products", percentage: "100", productId: second.id });
  assert.equal(Number((await db.product.findUniqueOrThrow({ where: { id: second.id } })).discountedPrice), 0);
  await submit(admin, "/admin/pricing", "pricing", { scope: "products", percentage: "0", productId: second.id });
  assert.equal(Number((await db.product.findUniqueOrThrow({ where: { id: second.id } })).discountedPrice), 30);
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=", "base64");
  await submit(admin, "/admin/products", "update-product", { ...productData, id: product.id, stock: "8", images: "https://m.media-amazon.com/images/I/test.jpg", uploads: new File([png], "test.png", { type: "image/png" }) });
  const image = await db.productImage.findFirstOrThrow({ where: { productId: product.id, url: { startsWith: "/api/uploads/" } } });
  uploadedUrls.push(image.url);
  const mediaResponse = await customer(image.url);
  assert.equal(mediaResponse.status, 200);
  assert.equal(mediaResponse.headers.get("content-type"), "image/png");
  assert.equal(mediaResponse.headers.get("x-content-type-options"), "nosniff");
  await submit(admin, "/admin/products", "update-product", { ...productData, id: product.id, uploads: new File(["<svg onload='alert(1)'/>"], "fake.png", { type: "image/png" }) });
  assert.equal(await db.productImage.count({ where: { productId: product.id } }), 2, "Invalid file signatures must be rejected without replacing images");
  const filteredProducts = await (await admin("/admin/products?category=" + category.id + "&status=LIVE")).text();
  assert.ok(filteredProducts.includes(productData.title));
  assert.ok(!filteredProducts.includes(second.title));
  const firstName = "QA section A " + suffix;
  const secondName = "QA section B " + suffix;
  await submit(admin, "/admin/sections", "create-section", { name: firstName, productId: product.id }, root);
  assert.equal(await db.storefrontSection.count({ where: { name: firstName } }), 0, "Admins cannot create storefront sections");
  await submit(root, "/admin/sections", "create-section", { name: firstName, productId: [product.id, second.id] });
  const sectionA = await db.storefrontSection.findUniqueOrThrow({ where: { name: firstName } });
  sectionIds.push(sectionA.id);
  await submit(root, "/admin/sections", "create-section", { name: secondName, productId: second.id });
  const sectionB = await db.storefrontSection.findUniqueOrThrow({ where: { name: secondName } });
  sectionIds.push(sectionB.id);
  await db.product.update({ where: { id: second.id }, data: { status: "DRAFT" } });
  let home = await (await customer("/")).text();
  assert.ok(home.includes('id="section-' + sectionA.id + '"'));
  assert.ok(!home.includes('id="section-' + sectionB.id + '"'), "Sections with no Live products must not appear");
  assert.ok(!home.includes(second.slug), "A selected Draft product must not leak to the homepage");
  await db.product.update({ where: { id: second.id }, data: { status: "LIVE" } });
  await submit(root, "/admin/sections", "move-section", { id: sectionB.id, direction: "up" });
  home = await (await customer("/")).text();
  assert.ok(home.indexOf('id="section-' + sectionB.id + '"') < home.indexOf('id="section-' + sectionA.id + '"'), "Homepage must respect section ordering");
  assert.ok(home.indexOf(">Categories</h2>") < home.indexOf('id="section-' + sectionB.id + '"'));
  await submit(root, "/admin/sections", "update-section", { id: sectionA.id, name: firstName + " renamed", productId: second.id });
  assert.deepEqual((await db.storefrontSectionProduct.findMany({ where: { sectionId: sectionA.id } })).map(item => item.productId), [second.id]);
  await submit(admin, "/admin/categories", "delete-category", { id: category.id, replacementId: "" });
  assert.equal(await db.category.count({ where: { id: category.id } }), 1, "Populated categories require a replacement");
  await submit(admin, "/admin/categories", "delete-category", { id: category.id, replacementId: otherCategory.id });
  assert.equal(await db.category.count({ where: { id: category.id } }), 0);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: product.id } })).categoryId, otherCategory.id);
  await submit(root, "/admin/sections", "delete-section", { id: sectionA.id });
  await submit(root, "/admin/sections", "delete-section", { id: sectionB.id });
  assert.equal(await db.storefrontSection.count({ where: { id: { in: sectionIds } } }), 0);
  assert.equal(await db.product.count({ where: { id: { in: [product.id, second.id] } } }), 2, "Deleting a section must preserve products");
  const revenueBefore = (await db.order.aggregate({ where: { status: "COMPLETED" }, _sum: { total: true } }))._sum.total ?? new Prisma.Decimal(0);
  await submit(root, "/admin/orders", "create-order", { userId: ids[0], customerName: "Test recipient", address: "123 Test Street", message: "", items: JSON.stringify([{ productId: product.id, quantity: 2 }]) });
  const order = await db.order.findFirstOrThrow({ where: { userId: ids[0] } });
  assert.equal(Number(order.subtotal), 30);
  assert.equal(Number(order.total), 37.4);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 6);
  assert.equal((await client()("/profile")).status, 307);
  assert.equal((await customer("/profile/orders/" + order.id)).status, 200);
  assert.equal((await other("/profile/orders/" + order.id)).status, 404, "Customers must not see someone else's order");
  assert.ok((await (await customer("/profile")).text()).includes(order.id));
  assert.equal(await db.orderStatusEvent.count({ where: { orderId: order.id, status: "PLACED" } }), 1);
  const changedOrder = { id: order.id, customerName: "Updated recipient", address: "456 Test Street", message: "Updated" };
  await submit(customer, "/admin/orders", "update-order", { ...changedOrder, status: "COMPLETED" }, admin);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status, "PLACED", "Customer cannot forge a status update");
  for (const [status, label] of [["PROCESSING", "Processing"], ["IN_TRANSIT", "In transit"], ["COMPLETED", "Completed"], ["CANCELLED", "Cancelled"]]) {
    await submit(admin, "/admin/orders", "update-order", { ...changedOrder, status });
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status, status);
    assert.equal(await db.orderStatusEvent.count({ where: { orderId: order.id, status } }), 1);
    const tracked = await (await customer("/profile/orders/" + order.id)).text();
    assert.ok(tracked.includes(label));
    assert.ok(tracked.includes("Shipping details"));
    assert.ok(tracked.includes("Tracking updates"));
    const filtered = await (await admin("/admin/orders?status=" + status)).text();
    assert.ok(filtered.includes(order.id));
    const overview = await (await admin("/admin")).text();
    const revenueCard = overview.match(/<a[^>]+href="\/admin\/orders\?status=COMPLETED"[^>]*>([\s\S]*?)<\/a>/)?.[1];
    const expectedRevenue = status === "COMPLETED" ? revenueBefore.plus(order.total) : revenueBefore;
    assert.ok(revenueCard?.includes(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(expectedRevenue))), "Revenue must include Completed orders only");
  }
  await submit(admin, "/admin/orders", "update-order", { ...changedOrder, status: "CANCELLED" });
  assert.equal(await db.orderStatusEvent.count({ where: { orderId: order.id } }), 5, "Editing without a status change must not duplicate tracking events");
  await submit(admin, "/admin/orders", "update-order", { ...changedOrder, status: "DELIVERED" });
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status, "CANCELLED", "Unknown statuses must be rejected");
  assert.ok(!(await (await customer("/profile?status=PROCESSING")).text()).includes(order.id));
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
  console.log("PASS: role permissions, private support/read states, Live/Draft/Hidden visibility, SKU/featured fields, secure uploads and external URLs, category filters, non-compounding cross-category discounts (0–100%), order totals, all five order statuses, tracking history, private customer profiles, inventory CRUD, curated section permissions/ordering, safe category reassignment, completed-order revenue and admin assignment.");
} finally {
  await db.storefrontSection.deleteMany({ where: { id: { in: sectionIds } } });
  await db.order.deleteMany({ where: { userId: { in: ids } } });
  await db.product.deleteMany({ where: { id: { in: productIds } } });
  await db.category.deleteMany({ where: { id: { in: categoryIds } } });
  for (const url of uploadedUrls) await unlink(path.join(process.env.UPLOAD_DIR || "uploads", url.split("/").pop())).catch(() => {});
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
}
