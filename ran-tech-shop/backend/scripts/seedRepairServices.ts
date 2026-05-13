/**
 * Wipe all existing repair services + repair categories and reseed a fresh
 * catalogue covering Desktop, Laptop and Mobile repairs.
 *
 * Pricing modes:
 *   - fixed : show a single price
 *   - range : show min – max; admin sends final quote after inspection
 *   - quote : hide price entirely; admin sends a quote
 *
 * Usage: `npm run seed:repair-services`
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { supabase } from '../src/lib/supabase';

type Device = 'desktop' | 'laptop' | 'mobile';

type CategorySeed = { name: string; slug: string; order: number };

const CATEGORIES: Record<Device, CategorySeed[]> = {
  desktop: [
    { name: 'Hardware',      slug: 'hardware',     order: 0 },
    { name: 'Upgrade',       slug: 'upgrade',      order: 1 },
    { name: 'Software',      slug: 'software',     order: 2 },
    { name: 'Data Recovery', slug: 'data',         order: 3 },
    { name: 'Cleaning',      slug: 'cleaning',     order: 4 },
  ],
  laptop: [
    { name: 'Hardware',      slug: 'hardware',     order: 0 },
    { name: 'Display',       slug: 'display',      order: 1 },
    { name: 'Battery',       slug: 'battery',      order: 2 },
    { name: 'Upgrade',       slug: 'upgrade',      order: 3 },
    { name: 'Software',      slug: 'software',     order: 4 },
    { name: 'Cleaning',      slug: 'cleaning',     order: 5 },
  ],
  mobile: [
    { name: 'Screen',        slug: 'screen',       order: 0 },
    { name: 'Battery',       slug: 'battery',      order: 1 },
    { name: 'Charging',      slug: 'charging',     order: 2 },
    { name: 'Water Damage',  slug: 'water-damage', order: 3 },
    { name: 'Software',      slug: 'software',     order: 4 },
    { name: 'Data',          slug: 'data',         order: 5 },
  ],
};

type ServiceSeed = {
  name: string;
  description: string;
  price: number;             // ignored when priceMode === 'quote'
  priceMax?: number;
  priceMode: 'fixed' | 'range' | 'quote';
  category: string;          // matches one of the CATEGORIES slugs above for the device
  deviceType: Device;
  image: string;
  featured?: boolean;
};

// Stable Unsplash repair / hardware photos — replace with your own Cloudinary URLs later.
const IMG = {
  laptop_open:     'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80&auto=format&fit=crop',
  laptop_repair:   'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80&auto=format&fit=crop',
  laptop_battery:  'https://images.unsplash.com/photo-1609692814859-c91dcdd86d5e?w=600&q=80&auto=format&fit=crop',
  laptop_screen:   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&auto=format&fit=crop',
  ram:             'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=600&q=80&auto=format&fit=crop',
  ssd:             'https://images.unsplash.com/photo-1601737487795-dab272f52420?w=600&q=80&auto=format&fit=crop',
  motherboard:     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop',
  desktop_pc:      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80&auto=format&fit=crop',
  windows:         'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=600&q=80&auto=format&fit=crop',
  mobile_screen:   'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=600&q=80&auto=format&fit=crop',
  mobile_battery:  'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80&auto=format&fit=crop',
  mobile_repair:   'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80&auto=format&fit=crop',
  mobile_water:    'https://images.unsplash.com/photo-1620207418302-439b387441b0?w=600&q=80&auto=format&fit=crop',
  cleaning:        'https://images.unsplash.com/photo-1591808216268-ce0b82787efe?w=600&q=80&auto=format&fit=crop',
  data:            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80&auto=format&fit=crop',
  virus:           'https://images.unsplash.com/photo-1614064548237-02f9c5b1f95a?w=600&q=80&auto=format&fit=crop',
};

const services: ServiceSeed[] = [
  // ─── Desktop ─────────────────────────────────────────────
  { name: 'Windows 11 Upgrade', description: 'Clean install / in-place upgrade to Windows 11 with drivers and updates.',
    price: 4500, priceMode: 'fixed', category: 'software', deviceType: 'desktop',
    image: IMG.windows, featured: true },
  { name: 'Desktop Diagnostic', description: 'Full hardware diagnostic with detailed health report.',
    price: 2500, priceMode: 'fixed', category: 'hardware', deviceType: 'desktop',
    image: IMG.desktop_pc },
  { name: 'PSU Replacement', description: 'Replace failed or under-powered PSU. Final price depends on wattage.',
    price: 8000, priceMax: 25000, priceMode: 'range', category: 'hardware', deviceType: 'desktop',
    image: IMG.motherboard },
  { name: 'Motherboard Repair', description: 'Component-level diagnosis & repair. Final price after inspection.',
    price: 0, priceMode: 'quote', category: 'hardware', deviceType: 'desktop',
    image: IMG.motherboard },
  { name: 'Desktop Thermal Service', description: 'Deep clean, repaste CPU/GPU, fan service.',
    price: 4000, priceMode: 'fixed', category: 'cleaning', deviceType: 'desktop',
    image: IMG.cleaning },
  { name: 'SSD / Storage Upgrade', description: 'Install a new SSD/HDD from our shop and migrate your OS and data. Pick which SSD when booking.',
    price: 3000, priceMode: 'fixed', category: 'upgrade', deviceType: 'desktop',
    image: IMG.ssd },
  { name: 'RAM Upgrade', description: 'Add or replace RAM modules from our shop. Pick which RAM when booking.',
    price: 2500, priceMode: 'fixed', category: 'upgrade', deviceType: 'desktop',
    image: IMG.ram },
  { name: 'Data Recovery (Desktop)', description: 'Recover lost files from failing drives. Price after we inspect the drive.',
    price: 0, priceMode: 'quote', category: 'data', deviceType: 'desktop',
    image: IMG.data },

  // ─── Laptop ──────────────────────────────────────────────
  { name: 'Laptop Diagnostic', description: 'Full diagnostic for hardware, battery, screen and ports.',
    price: 2500, priceMode: 'fixed', category: 'hardware', deviceType: 'laptop',
    image: IMG.laptop_open },
  { name: 'Laptop Battery Replacement', description: 'OEM-grade battery replacement. Final price depends on model.',
    price: 10000, priceMax: 30000, priceMode: 'range', category: 'battery', deviceType: 'laptop',
    image: IMG.laptop_battery, featured: true },
  { name: 'Laptop Screen Replacement', description: 'LCD / LED panel replacement. Final price by model.',
    price: 18000, priceMax: 75000, priceMode: 'range', category: 'display', deviceType: 'laptop',
    image: IMG.laptop_screen },
  { name: 'Laptop Keyboard Replacement', description: 'Replace damaged or unresponsive keyboard.',
    price: 7500, priceMax: 22000, priceMode: 'range', category: 'hardware', deviceType: 'laptop',
    image: IMG.laptop_repair },
  { name: 'Laptop Thermal Service', description: 'Deep clean, repaste CPU/GPU, fan re-bearing.',
    price: 5500, priceMode: 'fixed', category: 'cleaning', deviceType: 'laptop',
    image: IMG.cleaning },
  { name: 'Laptop RAM Upgrade', description: 'Add or replace laptop RAM from our shop. Pick the module when booking.',
    price: 2500, priceMode: 'fixed', category: 'upgrade', deviceType: 'laptop',
    image: IMG.ram },
  { name: 'Laptop SSD Upgrade', description: 'Install a faster SSD from our shop. Pick the drive when booking.',
    price: 3000, priceMode: 'fixed', category: 'upgrade', deviceType: 'laptop',
    image: IMG.ssd },
  { name: 'OS Reinstall + Drivers', description: 'Fresh Windows install with all drivers and essential apps.',
    price: 4500, priceMode: 'fixed', category: 'software', deviceType: 'laptop',
    image: IMG.windows },
  { name: 'Virus & Malware Removal', description: 'Complete clean-up with antivirus install and tuning.',
    price: 3500, priceMode: 'fixed', category: 'software', deviceType: 'laptop',
    image: IMG.virus },
  { name: 'Laptop Motherboard Repair', description: 'Component-level board repair. Price after inspection.',
    price: 0, priceMode: 'quote', category: 'hardware', deviceType: 'laptop',
    image: IMG.motherboard },

  // ─── Mobile ──────────────────────────────────────────────
  { name: 'Mobile Diagnostic', description: 'Full hardware + software diagnostic.',
    price: 1500, priceMode: 'fixed', category: 'software', deviceType: 'mobile',
    image: IMG.mobile_repair },
  { name: 'Mobile Screen Replacement', description: 'Replace cracked or unresponsive screen. Final price by model.',
    price: 8000, priceMax: 90000, priceMode: 'range', category: 'screen', deviceType: 'mobile',
    image: IMG.mobile_screen, featured: true },
  { name: 'Mobile Battery Replacement', description: 'Replace degraded battery. Final price by model.',
    price: 4500, priceMax: 22000, priceMode: 'range', category: 'battery', deviceType: 'mobile',
    image: IMG.mobile_battery },
  { name: 'Charging Port Repair', description: 'Replace damaged charging port / fix loose connection.',
    price: 4000, priceMax: 14000, priceMode: 'range', category: 'charging', deviceType: 'mobile',
    image: IMG.mobile_repair },
  { name: 'Water Damage Service', description: 'Cleaning, drying and component-level repair after liquid damage. Price after inspection.',
    price: 0, priceMode: 'quote', category: 'water-damage', deviceType: 'mobile',
    image: IMG.mobile_water },
  { name: 'Factory Reset & Setup', description: 'Wipe and set up your phone safely with data backup.',
    price: 1500, priceMode: 'fixed', category: 'software', deviceType: 'mobile',
    image: IMG.windows },
  { name: 'Mobile Data Recovery', description: 'Recover photos, contacts and messages from a damaged phone.',
    price: 8000, priceMax: 45000, priceMode: 'range', category: 'data', deviceType: 'mobile',
    image: IMG.data },
];

async function reseedCategories() {
  console.log('🧹 Removing existing repair categories...');
  const { error: delErr } = await supabase.from('RepairCategory').delete().not('id', 'is', null);
  if (delErr) {
    console.error('Failed to clear categories:', delErr);
    process.exit(1);
  }

  const rows: any[] = [];
  for (const device of Object.keys(CATEGORIES) as Device[]) {
    for (const c of CATEGORIES[device]) {
      rows.push({ name: c.name, slug: c.slug, order: c.order, deviceType: device });
    }
  }
  const { error: insErr, data } = await supabase.from('RepairCategory').insert(rows).select('id');
  if (insErr) {
    console.error('Failed to insert categories:', insErr);
    process.exit(1);
  }
  console.log(`   Inserted ${data?.length ?? 0} categories.`);
}

async function reseedServices() {
  console.log('🧹 Removing existing services...');
  const { error: delErr, count } = await supabase
    .from('Product')
    .delete({ count: 'exact' })
    .eq('isService', true);
  if (delErr) {
    console.error('Failed to clear existing services:', delErr);
    process.exit(1);
  }
  console.log(`   Deleted ${count ?? 0} service rows.`);

  console.log(`🌱 Inserting ${services.length} new repair services...`);
  const rows = services.map(s => ({
    name: s.name,
    description: s.description,
    price: s.price,
    priceMax: s.priceMode === 'range' ? (s.priceMax ?? null) : null,
    priceMode: s.priceMode,
    category: 'services',
    subcategory: s.category,
    image: s.image,
    stock: 999,
    featured: !!s.featured,
    isService: true,
    serviceType: s.category,
    deviceType: s.deviceType,
  }));

  const { error: insErr, data } = await supabase.from('Product').insert(rows).select('id');
  if (insErr) {
    console.error('Failed to insert services:', insErr);
    process.exit(1);
  }
  console.log(`   Inserted ${data?.length ?? 0} services.`);
}

async function main() {
  await reseedCategories();
  await reseedServices();
  console.log('✅ Repair categories + services seeded.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
