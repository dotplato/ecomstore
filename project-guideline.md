# E Seller Store — Project Guideline

This document is the single source of truth for how the project is structured and which technical approaches are used. Any new developer should read this before changing code so the app stays consistent.

---

## 1. Product Overview

**E Seller Store** is a full-stack ecommerce web app:

- Browse products by category, search, and product detail pages
- User signup / login (required before adding to cart)
- Cart and a simple checkout (name, address, message) — **no payment gateway**
- Orders store line items, subtotal, shipping, tax, and total
- Products support: title, about, category, original & discounted price, rating, reviews, multiple images

Design reference: the provided UI screenshots (home hero, shop grid with category pills, product detail with gallery). Match layout, spacing, and interaction patterns; do not invent a different visual system.

---

## 2. Tech Stack (locked)

| Layer | Choice | Notes |
|-------|--------|--------|
| Framework | **Next.js (App Router)** | Frontend + backend (Route Handlers / Server Actions) |
| Language | **TypeScript** (strict) | No plain JS source files |
| Styling | **Tailwind CSS** | Utility-first; no new CSS frameworks |
| UI primitives | **shadcn/ui** (copy-paste under `components/ui`) | Compose; do not casually edit primitives |
| ORM | **Prisma** | Single schema in `prisma/schema.prisma` |
| Database | **PostgreSQL** | Via Docker Compose in local/dev |
| Auth | **Auth.js (NextAuth v5)** credentials provider | Session-based; JWT strategy |
| Passwords | **bcryptjs** | Hash on signup; never store plaintext |
| Images | Next.js `Image` + remote URLs (seed/CDN) | Product images are URL strings in DB |
| Containerization | **Docker Compose** | Postgres (+ optional app service) |
| Package manager | **npm** | Lockfile committed |

Do **not** introduce Redux/Zustand unless a clear need appears. Prefer:

1. Local React state  
2. URL search params (filters, search)  
3. Server state via Prisma + Server Components / Server Actions  

---

## 3. Repository Layout

```
eseller/
├── project-guideline.md          # This file — keep updated when architecture changes
├── docker-compose.yml            # Postgres (+ optional web)
├── Dockerfile                    # App image (production-oriented)
├── .env.example                  # Documented env vars (no secrets)
├── .env                          # Local secrets (gitignored)
├── package.json
├── prisma/
│   ├── schema.prisma             # Canonical data model
│   ├── seed.ts                   # Demo categories, products, reviews
│   └── migrations/               # Prisma migrations only — never hand-edit applied ones
├── public/                       # Static assets (logo, placeholders)
└── src/
    ├── app/                      # App Router routes only
    │   ├── (shop)/               # Public storefront layout (header/footer)
    │   │   ├── page.tsx          # Home
    │   │   ├── shop/             # Product listing + category filter + search
    │   │   ├── categories/       # Category index
    │   │   ├── product/[slug]/  # Product detail
    │   │   ├── cart/
    │   │   ├── checkout/
    │   │   └── wishlist/
    │   ├── (auth)/               # Login / signup (minimal chrome)
    │   │   ├── login/
    │   │   └── signup/
    │   ├── api/auth/[...nextauth]/
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── ui/                   # shadcn primitives
    │   ├── layout/               # Header, Footer, Search
    │   ├── product/              # ProductCard, Gallery, Price, Rating
    │   ├── cart/                 # Cart line items, quantity
    │   └── home/                 # Hero carousel, category strip
    ├── lib/
    │   ├── prisma.ts             # Singleton PrismaClient
    │   ├── auth.ts               # Auth.js config + helpers
    │   ├── cart.ts               # Cart server helpers
    │   ├── money.ts              # Price / tax / shipping helpers
    │   └── utils.ts              # cn() and small shared utils
    ├── actions/                  # Server Actions (mutations)
    │   ├── auth.ts
    │   ├── cart.ts
    │   ├── checkout.ts
    │   └── wishlist.ts
    └── types/                    # Shared TS types (non-Prisma DTOs)
```

### Conventions

- **Server Components by default.** Add `"use client"` only for interactivity (carousel, quantity stepper, client forms).
- **Mutations** go through **Server Actions** in `src/actions/`, not ad-hoc fetch to random APIs (except Auth.js routes).
- **Data reads** prefer Server Components calling Prisma directly via `lib/prisma.ts`.
- Route groups `(shop)` / `(auth)` share layouts without affecting URLs.

---

## 4. Data Model (Prisma)

Core entities:

- **User** — email (unique), name, passwordHash, timestamps  
- **Category** — name, slug, imageUrl  
- **Product** — title, slug, about, originalPrice, discountedPrice, stock, categoryId, ratingAvg, reviewCount  
- **ProductImage** — productId, url, sortOrder  
- **Review** — productId, userId, rating (1–5), comment, createdAt  
- **Cart** / **CartItem** — one cart per user; items have productId + quantity  
- **WishlistItem** — userId + productId (unique pair)  
- **Order** — userId, customerName, address, message, subtotal, shipping, tax, total, status  
- **OrderItem** — snapshot of title, unitPrice, quantity, productId  

### Pricing rules

- Display **discountedPrice** as the selling price when set; show **originalPrice** struck through when `discountedPrice < originalPrice`.
- Discount badge % = `round((1 - discounted/original) * 100)`.
- All money stored as **Decimal** in Prisma (map to string/number carefully in UI); format with a single helper in `lib/money.ts`.

### Checkout totals

```
subtotal = sum(line.unitPrice * quantity)
shipping = fixed fee (constant in lib/money.ts, e.g. $5.00) — document if changed
tax      = subtotal * TAX_RATE (constant, e.g. 0.08)
total    = subtotal + shipping + tax
```

No payment provider. Order status starts as `PENDING` / `PLACED` and is enough for v1.

### Reviews & rating

- Creating a review updates the product’s aggregated `ratingAvg` and `reviewCount` in the same transaction.
- Guest users may **view** ratings; posting a review requires login (same as cart).

---

## 5. Auth & Access Control

- **Auth.js (NextAuth v5)** with Credentials provider.
- Session strategy: **JWT**.
- Signup creates a User with bcrypt-hashed password; then signs the user in.
- **Protected actions:** add to cart, update cart, wishlist toggle, place order, post review.
- Unauthenticated add-to-cart → redirect to `/login?callbackUrl=...`.
- Middleware may protect `/cart`, `/checkout`, `/wishlist` (or check inside pages/actions — pick one approach and keep it consistent: **middleware for page routes + action-level checks for mutations**).

Never log passwords, hashes, or session secrets. Never commit `.env`.

---

## 6. Feature Map → Routes

| Feature | Route / action | Notes |
|---------|----------------|--------|
| Home (hero + categories) | `/` | Hero carousel client component; categories from DB |
| Shop listing | `/shop` | Query: `?category=slug&q=search` |
| Categories index | `/categories` | Grid linking to `/shop?category=...` |
| Product detail | `/product/[slug]` | Gallery, qty, add to cart, buy now → checkout path |
| Login / Signup | `/login`, `/signup` | Credentials forms |
| Cart | `/cart` | Auth required |
| Checkout | `/checkout` | Fields: name, address, message; show lines + totals |
| Wishlist | `/wishlist` | Auth required |
| Order confirmation | `/checkout/success?orderId=` | After place-order action |

---

## 7. UI / Design Consistency

Aligned with the reference screenshots:

- **Brand:** “E Seller Store” + cart mark in header  
- **Header:** logo | Home, Shop, Categories | search | wishlist, cart, profile, Sign in/out  
- **Shop:** title “Shop”, search, horizontal **category pills** (active = filled dark)  
- **Product card:** image, discount badge, title, stars + count, price pair, circular add-to-cart  
- **Product detail:** breadcrumbs, main image + thumbnail row, title, stars, prices, stock, qty, Add to cart / Buy now / wishlist  
- **Home:** full-bleed dark lifestyle hero, serif headline, “Shop the look” CTA, category strip  

### Styling rules

- Tailwind utilities only for layout/spacing; CSS variables for brand colors in `globals.css`
- Prefer existing `components/ui` primitives; wrap rather than mutate shadcn files
- No random hex in components — use theme tokens (`bg-primary`, etc.)
- Keep spacing and type scale consistent across pages
- Responsive: mobile-first; shop grid 2 → 3 → 4 columns

**Brand tokens (suggested):**

- Primary (buttons / active pill): deep blue (~`#1e3a5f` / navy)
- Accent discount badge: amber/yellow
- Surfaces: white / light gray (`#f3f4f6` for pills and search)

---

## 8. Docker & Environment

### Services (`docker-compose.yml`)

1. **db** — `postgres:16-alpine`, volume for data, port `5432`
2. **web** (optional for full stack) — builds Dockerfile, depends on db, runs migrate + start

Local recommended workflow:

```bash
docker compose up -d db          # start Postgres
cp .env.example .env             # set DATABASE_URL, AUTH_SECRET
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Required env vars

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_URL` / `NEXTAUTH_URL` | App origin, e.g. `http://localhost:3000` |
| `SHIPPING_FEE` | Optional override (default in code) |
| `TAX_RATE` | Optional override (default in code) |

---

## 9. Server Actions Patterns

- File: `src/actions/*.ts` with `"use server"` at top
- Always re-check session inside mutations (do not trust the client)
- Validate inputs with **Zod** schemas colocated or under `src/lib/validators.ts`
- On success: `revalidatePath` for affected routes
- Return `{ ok: true, data }` / `{ ok: false, error }` — avoid throwing opaque errors to the UI

---

## 10. Seeding

`prisma/seed.ts` loads:

- Categories matching the shop UI (Bags, Electronics, Home & Kitchen, Sports & Outdoors, etc.)
- Sample products with multiple images, original/discounted prices, stock
- Optional demo user: `demo@eseller.com` / `password123` (document in README)

Seed is for **development only**. Production uses migrations without demo passwords unless explicitly requested.

---

## 11. What We Explicitly Do Not Build (v1)

- Payment gateways (Stripe, etc.)
- Email notifications
- Inventory reservations beyond simple stock decrement on order
- Multi-currency
- Guest checkout

If adding any of the above later, update this guideline first.

---

## 12. Coding Standards for Future Devs

1. Match existing folder patterns before inventing new ones.  
2. Ask before: new dependencies, schema changes, auth changes, env vars, Docker/CI changes.  
3. Prefer small, composable components over god components.  
4. No magic numbers for money — use `lib/money.ts`.  
5. Keep commits scoped (feature/fix/chore).  
6. After schema changes: `prisma migrate dev` + update seed if needed + update this doc’s data model section.  
7. Do not redesign UI unless asked — extend the current visual language.

---

## 13. How to Run (quick reference)

```bash
docker compose up -d db
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
# → http://localhost:3000
```

Full stack via Docker:

```bash
docker compose up --build
```

---

## 14. Changelog of Architecture Decisions

| Date | Decision |
|------|----------|
| 2026-03-25 | Initial guideline: Next.js App Router, Prisma, Postgres, Auth.js credentials, Server Actions, Docker Compose, Tailwind + shadcn, no payments |
| 2026-10-25 | Implemented v1 storefront; Prisma pinned to v6; seed is idempotent unless `FORCE_SEED=1` |

When you change a locked decision, append a row here and update the relevant section above.

## 15. Administration and customer support

Roles: CUSTOMER (signup default), ADMIN, SUPER_ADMIN. Authorization always reads the current user from PostgreSQL at each protected page and mutation; JWT claims are not a role authority. Admins manage customer records, inventory, orders, and support conversations. Only super admins create records and manage admin roles; promotion accepts an existing account email. Staff cannot modify or delete other staff through customer management, and super admins cannot delete/demote themselves. Bootstrap the first super admin through `npm run admin:bootstrap -- email@example.com` after that account signs up; no default privileged credentials.

Customer support uses private threads with messages and OPEN/CLOSED state. Customers can create, view and reply to their own threads. Staff can read/reply, edit/delete messages, and close/reopen/delete threads. Every mutation checks ownership or staff authorization. Routes: `/support`, `/support/[id]`, `/admin`, `/admin/users`, `/admin/products`, `/admin/orders`, `/admin/support`, `/admin/admins`. Form validation uses Zod; errors are displayed inline. User deletion removes their dependent data, including orders, after explicit confirmation. Product deletion preserves order line snapshots. Admin order creation computes totals on the server; order status changes do not adjust stock (stock updates happen on order creation only).

### CSS compilation and local port

Tailwind v4 runs through `@tailwindcss/postcss` in `postcss.config.mjs`, shared by Turbopack and webpack. Do not use a bundler-specific CSS loader. The development script explicitly uses port 3000; stop an existing instance before starting another.

## 16. Catalog management, pricing and inbox updates (2026-10-26)

- Admin Products, Orders and Customers use semantic tables, URL-based filters, and accessible dialogs for create/edit/delete actions. Existing role restrictions remain: only super admins create users/products/orders; both staff roles edit inventory and apply pricing.
- Products add optional unique SKU, featured flag and LIVE/DRAFT/HIDDEN status. Existing catalog products migrate to LIVE; new products default to DRAFT. Only LIVE products are public or purchasable, including previously saved carts and wishlists.
- Optional sale price is stored as original price when blank. Zero is a valid sale price for a 100% discount. Bulk pricing accepts explicit product IDs across categories or an entire category, always computes against original price, rounds to cents, and updates atomically. 0% clears a discount; no compounding.
- Product media accepts HTTPS URLs and uploaded JPEG/PNG/WebP/GIF files. Validate actual file signatures, at most 5 MB per file and 20 MB per submission. Store uploads outside public/ under UPLOAD_DIR (default ./uploads), with generated filenames; serve via /api/uploads/[filename] with fixed content types and nosniff. Docker uses a persistent volume. Remote images load directly in the browser (Next Image unoptimized) so arbitrary hosts do not trigger server-side URL fetching.
- Support inbox is shared by staff. Customer messages mark a thread Unread/New; opening a conversation or explicitly marking it read clears that state. Staff replies count as read. A read marker includes the viewed thread timestamp to avoid clearing a newer incoming reply. Read/unread is separate from OPEN/CLOSED.

## 17. Order details and customer tracking (2026-10-26)

- Order statuses are PLACED, PROCESSING, IN_TRANSIT, COMPLETED and CANCELLED; labels and normal delivery steps live in src/lib/order-status.ts.
- Admin order rows open a read-only full-details dialog on click; a keyboard-accessible View button opens the same dialog. Edit/Delete controls remain separate. Staff can change all five statuses.
- OrderStatusEvent records each actual status change transactionally and initial placement on creation. Existing orders receive their known placement timestamp; no historical transition timestamps are invented. Skipped steps show progress without fabricated dates.
- Customers use /profile for order history and /profile/orders/[id] for full tracking/details. Every customer detail query includes the authenticated userId, even for staff using the customer profile. Status refresh is read-only.
- Cancellation is a separate terminal state, not a completed delivery. Existing status-edit inventory behavior is preserved (no automatic restock).

## 18. Storefront sections and category management (2026-10-26)

- /admin/sections is restricted to SUPER_ADMIN on both reads and mutations. StorefrontSection owns a name and sortOrder; StorefrontSectionProduct stores explicit product selections and their selection order. Defaults are Editor's Picks, New Arrival and Onsale. Defaults are created by migration/initial seed only; deleted sections never reappear on restart.
- Homepage renders these curated sections immediately after Categories in saved sortOrder, replacing the old Featured products block. Only selected LIVE products are shown; sections without visible products are omitted. Defaults initially select featured/recent/sale products; subsequent membership is manual, not an automatic rule.
- Creating, renaming, selecting products, moving and deleting sections are transactional. Moving renumbers the list; the UI uses accessible up/down controls. Selections persist across category/search/status filters in the editor.
- /admin/categories is a searchable table available to ADMIN and SUPER_ADMIN, with add/edit/delete dialogs. Name, slug and optional HTTPS image URL follow existing category fields. Deleting a populated category requires a different replacement category; products are reassigned atomically, never deleted. Empty categories can be deleted directly. All storefront/admin reads are invalidated after a mutation.

### Admin navigation and revenue
Every admin tab has a labelled Lucide icon and active-page styling; role-based navigation is backed by server authorization. Overview Revenue is the all-time sum of Order.total for COMPLETED orders only (including stored shipping/tax), formatted through lib/money.ts. No date window applies. The card links to completed orders and replaces Open conversations.

### Overview quick actions and new messages
Below the four metric cards, the overview uses an aligned responsive two-panel grid.
Quick actions open the existing product/order/category dialogs for super admins;
admins receive inventory/order links plus category creation and pricing. The support
panel shows up to four most recently updated unread threads and a total unread
conversation count, linking to private thread pages and the unread inbox. Opening
the overview never marks threads read. Support mutations invalidate /admin as well.
