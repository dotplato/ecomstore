# E Seller Store

Full-stack ecommerce store built with Next.js, Prisma, PostgreSQL, and Docker.

See **[project-guideline.md](./project-guideline.md)** for architecture, conventions, and how to keep the project consistent across developers.

## Quick start

```bash
# 1. Start Postgres
docker compose up -d db

# 2. Install & configure
cp .env.example .env   # or use the committed local .env for docker defaults
npm install

# 3. Migrate & seed
npx prisma migrate dev --name init
npx prisma db seed

# 4. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo login:** `demo@eseller.com` / `password123`

## Full stack via Docker

```bash
export AUTH_SECRET="$(openssl rand -base64 32)"
docker compose up --build
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Features

- Products with categories, images, original/discounted prices, ratings & reviews
- Signup / login (required for cart, wishlist, checkout)
- Cart + checkout (name, address, message) — **no payment**
- Totals: subtotal + shipping + tax

## Administration and support

Customers can open private conversations at `/support`. Staff manage customers,
inventory, orders and support at `/admin`.

Sign up an account first, then bootstrap the initial super admin from a trusted terminal:

```bash
npm run admin:bootstrap -- your-existing@email.com
```

For the full Docker stack, run the same command with
`docker compose exec web npm run admin:bootstrap -- your-existing@email.com`.

In **Admin → Admins**, enter an existing customer's email to promote them.
Only super admins can add customers, products and orders, edit/delete admin accounts,
or assign/remove admin roles. Admins can read, edit and delete customers, products,
orders and support messages, and reply to support conversations. Role changes take
effect immediately. Customer deletion also deletes their orders and conversations;
product deletion preserves order item snapshots.

Apply database changes with `npx prisma migrate deploy` before starting an updated instance.

Integration checks (with the app and database running):

```bash
TEST_URL=http://localhost:3000 node tests/portal-smoke.mjs
```

The suite creates temporary accounts and inventory, exercises permission boundaries
and management workflows, and removes its records afterward.

## Catalog and pricing

- Inventory, Orders, and Users have searchable tables and create/edit dialogs.
  Inventory and Orders also filter by category and status.
- Products support SKU, featured placement, multiple HTTPS image URLs or uploads,
  optional sale prices, and Live / Draft / Hidden visibility. Existing products
  remain Live after migration; newly created products default to Draft.
- Only Live products appear in the storefront or can be purchased.
- **Admin → Pricing** applies a percentage discount to selected products across
  categories or all products in one category. Discounts replace the current sale
  price and use the original price; 0% clears a discount.
- **Admin → Support** provides All / Unread-New / Read tabs and message previews.
  Read states are shared by staff and reset when a customer replies.
- Uploaded JPEG/PNG/WebP/GIF images are stored in `./uploads` (override with
  `UPLOAD_DIR`). Docker persists them in the `eseller_uploads` volume.
  Limits: 5 MB per image, 20 MB total and 20 images per product.

## Order tracking

Click an admin order row (or its View button) to see the full order, recipient,
address, message, line items, totals and tracking history. Edit offers five statuses:
Placed, Processing, In transit, Completed and Cancelled.

Customers open their profile via the account icon or `/profile`, and track an
individual order at `/profile/orders/[id]`. These pages only show the signed-in
customer's orders. Updates refresh every 30 seconds while visible, or on demand.

Actual status changes are recorded transactionally. Existing placement dates are
preserved; older transition dates are not fabricated. Cancellation is displayed
separately from delivery completion. Status edits do not adjust inventory.

## Storefront sections, categories and revenue

Super admins manage **Storefront Sections** at `/admin/sections`: create/delete
sections, edit their names and product selections, and move them up/down.
Editor's Picks, New Arrival and Onsale start with curated defaults. Only selected
Live products appear, in saved section order, immediately after homepage Categories.
Empty sections are not displayed. Deleting sections never deletes their products.

Both staff roles manage **Categories** at `/admin/categories` using searchable
tables and add/edit/delete dialogs. Deleting a category that contains products
requires choosing a replacement; its inventory is moved atomically.

Overview **Revenue** is the all-time sum of totals for Completed orders. Its card
links to the completed-order list. Every admin navigation tab has an icon.
