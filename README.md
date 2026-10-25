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
TEST_URL=http://localhost:3001 node tests/portal-smoke.mjs
```

The suite creates temporary accounts and inventory, exercises permission boundaries
and management workflows, and removes its records afterward.
