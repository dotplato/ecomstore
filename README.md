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
