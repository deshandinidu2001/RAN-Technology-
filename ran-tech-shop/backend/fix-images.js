// Replace broken via.placeholder.com URLs with curated Unsplash images by category/service.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Curated Unsplash photo IDs (free to use, hotlink allowed via images.unsplash.com)
const IMG = {
  // Components
  processor: [
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  ],
  motherboard: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    'https://images.unsplash.com/photo-1601737487795-dab272f52420?w=800&q=80',
    'https://images.unsplash.com/photo-1592664474505-fe1ee0e88c41?w=800&q=80',
  ],
  psu: [
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
    'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80',
    'https://images.unsplash.com/photo-1624705013725-8a6e0f0fea96?w=800&q=80',
  ],
  case: [
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
    'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800&q=80',
    'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800&q=80',
  ],

  // Services (illustrative repair imagery)
  repair: [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
    'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=800&q=80',
    'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=800&q=80',
  ],
  software: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
  ],
  data: [
    'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=80',
    'https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&q=80',
    'https://images.unsplash.com/photo-1551703599-6b3e8379aa8d?w=800&q=80',
  ],
  upgrade: [
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  ],
  maintenance: [
    'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=800&q=80',
    'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&q=80',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
  ],
  cleaning: [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    'https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?w=800&q=80',
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80',
  ],
};

const FALLBACK = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';

async function main() {
  const broken = await prisma.product.findMany({
    where: { image: { contains: 'via.placeholder' } },
  });
  console.log(`Found ${broken.length} products with broken images.`);

  let i = 0;
  for (const p of broken) {
    let pool;
    if (p.isService) {
      pool = IMG[p.serviceType] || IMG.repair;
    } else {
      pool = IMG[p.subcategory] || null;
    }
    const url = (pool && pool[i % pool.length]) || FALLBACK;
    await prisma.product.update({ where: { id: p.id }, data: { image: url } });
    i++;
  }

  console.log(`Updated ${broken.length} images.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
