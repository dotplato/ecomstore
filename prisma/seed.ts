import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Bags", slug: "bags", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care", imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop" },
  { name: "Books", slug: "books", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop" },
  { name: "Clothes", slug: "clothes", imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop" },
  { name: "Electronics", slug: "electronics", imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop" },
  { name: "Fashion", slug: "fashion", imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop" },
  { name: "Headphones & Audio", slug: "headphones-audio", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
  { name: "Health & Wellness", slug: "health-wellness", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop" },
  { name: "Home & Kitchen", slug: "home-kitchen", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop" },
  { name: "Keyboards & Mice", slug: "keyboards-mice", imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop" },
  { name: "Laptops", slug: "laptops", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop" },
  { name: "Mobiles & Accessories", slug: "mobiles-accessories", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" },
  { name: "Office Supplies", slug: "office-supplies", imageUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=400&fit=crop" },
  { name: "Remotes", slug: "remotes", imageUrl: "https://images.unsplash.com/photo-1593359677197-fd8711620a9a?w=400&h=400&fit=crop" },
  { name: "Sports & Outdoors", slug: "sports-outdoors", imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop" },
  { name: "Tablets", slug: "tablets", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop" },
  { name: "Toys & Games", slug: "toys-games", imageUrl: "https://images.unsplash.com/photo-1558060370-7c3519f473ba?w=400&h=400&fit=crop" },
  { name: "Under Garments", slug: "under-garments", imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop" },
  { name: "Women Accessories", slug: "women-accessories", imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop" },
  { name: "Women Clothes", slug: "women-clothes", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop" },
];

type SeedProduct = {
  title: string;
  slug: string;
  about: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  categorySlug: string;
  images: string[];
};

const products: SeedProduct[] = [
  {
    title: "Outdoor Ventures Men's Rain Jacket Waterproof Lightweight Packable",
    slug: "outdoor-ventures-mens-rain-jacket",
    about:
      "Stay dry on the trail with this lightweight, packable rain jacket. Waterproof shell, adjustable hood, and zippered pockets make it ideal for hiking and commuting.",
    originalPrice: 36.99,
    discountedPrice: 29.59,
    stock: 24,
    categorySlug: "sports-outdoors",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1521223890153-f9f8f2f0e9e1?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "KICKOUTOR Mosquito Repellent Bracelet Pest Control Outdoor",
    slug: "kickoutor-mosquito-repellent",
    about:
      "DEET-free mosquito repellent bracelet for camping, hiking, and backyard BBQs. Soft silicone band fits most wrists.",
    originalPrice: 14.99,
    discountedPrice: 11.99,
    stock: 80,
    categorySlug: "sports-outdoors",
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84a?w=800&h=800&fit=crop",
    ],
  },
  {
    title:
      "Portal Outdoor Rocking Chair Camping Folding Portable Rocker with Cup Holder Side Pocket Carry Bag",
    slug: "portal-outdoor-rocking-chair",
    about:
      "Relax anywhere with this portable folding rocking chair. Includes cup holder, side pocket, and carry bag. Supports up to 300 lbs. Perfect for camping, patio, and festivals.",
    originalPrice: 69.99,
    discountedPrice: 59.49,
    stock: 9,
    categorySlug: "sports-outdoors",
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1445307806294-bff7f67ff421?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "FISHEAL Men's Long Sleeve Shirt UPF 50+ Sun Protection Fishing Hiking",
    slug: "fisheal-mens-long-sleeve-shirt",
    about:
      "Breathable long-sleeve performance shirt with UPF 50+ sun protection. Ideal for fishing, hiking, and outdoor work.",
    originalPrice: 14.99,
    discountedPrice: 12.34,
    stock: 45,
    categorySlug: "sports-outdoors",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842fbf?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "shevalues Hiking Sandals Women Arch Support Outdoor Water Sandals",
    slug: "shevalues-hiking-sandals",
    about:
      "Comfortable hiking sandals with arch support and quick-dry straps. Great for trails, rivers, and casual summer wear.",
    originalPrice: 42.99,
    discountedPrice: 34.99,
    stock: 18,
    categorySlug: "sports-outdoors",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1603808033192-082dcf315d3f?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "Tool Set - 8V Cordless Drill Driver Kit Compact Power Tool",
    slug: "cordless-drill-tool-set",
    about:
      "Compact 8V cordless drill with battery, charger, and bit set. Lightweight design for DIY home projects.",
    originalPrice: 69.99,
    discountedPrice: 49.97,
    stock: 12,
    categorySlug: "home-kitchen",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "Wireless Over-Ear Headphones Noise Cancelling Bluetooth",
    slug: "wireless-over-ear-headphones",
    about:
      "Premium wireless headphones with active noise cancelling, 30-hour battery life, and plush ear cushions for all-day comfort.",
    originalPrice: 129.99,
    discountedPrice: 89.99,
    stock: 30,
    categorySlug: "headphones-audio",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "Smart Watch Fitness Tracker Heart Rate Sleep Monitor",
    slug: "smart-watch-fitness-tracker",
    about:
      "Track workouts, heart rate, and sleep with this sleek smartwatch. Water-resistant design with customizable watch faces.",
    originalPrice: 79.99,
    discountedPrice: 59.99,
    stock: 40,
    categorySlug: "electronics",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "Leather Crossbody Bag Everyday Travel Shoulder Bag",
    slug: "leather-crossbody-bag",
    about:
      "Genuine-feel leather crossbody with adjustable strap and multiple compartments. Perfect for daily commute and travel.",
    originalPrice: 54.99,
    discountedPrice: 39.99,
    stock: 22,
    categorySlug: "bags",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "Ceramic Nonstick Cookware Set 10-Piece Kitchen Essentials",
    slug: "ceramic-cookware-set",
    about:
      "Complete 10-piece ceramic nonstick cookware set. PFOA-free coating, even heat distribution, dishwasher-safe lids.",
    originalPrice: 149.99,
    discountedPrice: 99.99,
    stock: 15,
    categorySlug: "home-kitchen",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1584990347449-39b3ac1eec1b?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "Mechanical Gaming Keyboard RGB Backlit Wired",
    slug: "mechanical-gaming-keyboard",
    about:
      "Tactile mechanical switches with full RGB lighting. Durable construction for gaming and productivity.",
    originalPrice: 89.99,
    discountedPrice: 64.99,
    stock: 28,
    categorySlug: "keyboards-mice",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&h=800&fit=crop",
    ],
  },
  {
    title: "14-Inch Ultrabook Laptop 16GB RAM 512GB SSD",
    slug: "14-inch-ultrabook-laptop",
    about:
      "Slim ultrabook with bright display, 16GB RAM, and fast SSD storage. All-day battery for work and study.",
    originalPrice: 899.99,
    discountedPrice: 749.99,
    stock: 8,
    categorySlug: "laptops",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac882e75?w=800&h=800&fit=crop",
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  const existing = await prisma.product.count();
  if (existing > 0 && process.env.FORCE_SEED !== "1") {
    console.log(
      `Database already has ${existing} products. Skipping seed (set FORCE_SEED=1 to reseed).`,
    );
    return;
  }

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const demo = await prisma.user.create({
    data: {
      email: "demo@eseller.com",
      name: "Demo User",
      passwordHash,
      cart: { create: {} },
    },
  });

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }

  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) throw new Error(`Missing category ${p.categorySlug}`);

    await prisma.product.create({
      data: {
        status: "LIVE",
        featured: true,
        title: p.title,
        slug: p.slug,
        about: p.about,
        originalPrice: p.originalPrice,
        discountedPrice: p.discountedPrice,
        stock: p.stock,
        categoryId,
        images: {
          create: p.images.map((url, i) => ({ url, sortOrder: i })),
        },
      },
    });
  }

  // Migration creates defaults once. Populate only defaults that still exist;
  // normal idempotent seed runs return above and never recreate deleted sections.
  const seedProducts = await prisma.product.findMany({ where: { status: "LIVE" }, orderBy: [{ createdAt: "desc" }, { id: "asc" }] });
  for (const [id, selected] of [
    ["default-editors-picks", seedProducts.filter(product => product.featured).slice(0, 8)],
    ["default-new-arrival", seedProducts.slice(0, 8)],
    ["default-onsale", seedProducts.filter(product => product.discountedPrice.lessThan(product.originalPrice)).slice(0, 8)],
  ] as const) {
    if (await prisma.storefrontSection.findUnique({ where: { id } })) {
      await prisma.storefrontSection.update({ where: { id }, data: { products: { deleteMany: {}, create: selected.map((product, sortOrder) => ({ productId: product.id, sortOrder })) } } });
    }
  }

  console.log(`Seeded ${categories.length} categories, ${products.length} products`);
  console.log(`Demo user: ${demo.email} / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
