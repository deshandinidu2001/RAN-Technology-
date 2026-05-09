// Seed PC build components + repair services so PCBuild and RepairBooking pages show data.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PLACEHOLDER = 'https://via.placeholder.com/400x400.png?text=';

const components = [
  // Processors
  { name: 'Intel Core i5-13400F', brand: 'Intel', price: 58000, category: 'components', subcategory: 'processor', stock: 12, description: '10-core (6P+4E) desktop processor, LGA1700 socket, ideal mid-range gaming chip.' },
  { name: 'Intel Core i7-13700K', brand: 'Intel', price: 132000, category: 'components', subcategory: 'processor', stock: 8, description: '16-core unlocked processor, LGA1700, top-tier gaming and content creation.' },
  { name: 'Intel Core i9-14900K', brand: 'Intel', price: 215000, category: 'components', subcategory: 'processor', stock: 4, description: '24-core flagship desktop CPU, unlocked multiplier.' },
  { name: 'AMD Ryzen 5 7600X', brand: 'AMD', price: 79000, category: 'components', subcategory: 'processor', stock: 10, description: '6-core 12-thread Zen 4 CPU, AM5 socket, 4.7GHz base clock.' },
  { name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', price: 165000, category: 'components', subcategory: 'processor', stock: 6, description: '8-core Zen 4 with 3D V-Cache — best gaming CPU on AM5.' },
  { name: 'AMD Ryzen 9 7950X', brand: 'AMD', price: 198000, category: 'components', subcategory: 'processor', stock: 5, description: '16-core 32-thread flagship Zen 4 CPU.' },

  // Motherboards
  { name: 'ASUS ROG Strix B650E-F', brand: 'ASUS', price: 95000, category: 'components', subcategory: 'motherboard', stock: 7, description: 'AM5 ATX motherboard with PCIe 5.0, DDR5, WiFi 6E.' },
  { name: 'MSI MAG B760 Tomahawk', brand: 'MSI', price: 62000, category: 'components', subcategory: 'motherboard', stock: 9, description: 'LGA1700 ATX board, DDR5, robust VRM, 2.5G LAN.' },
  { name: 'Gigabyte Z790 AORUS Elite', brand: 'Gigabyte', price: 88000, category: 'components', subcategory: 'motherboard', stock: 6, description: 'Z790 ATX board with PCIe 5.0 x16 and DDR5 support.' },
  { name: 'ASRock X670E Steel Legend', brand: 'ASRock', price: 115000, category: 'components', subcategory: 'motherboard', stock: 4, description: 'X670E AM5 board with dual PCIe 5.0 M.2 slots.' },

  // Power Supplies
  { name: 'Corsair RM750x', brand: 'Corsair', price: 38000, category: 'components', subcategory: 'psu', stock: 14, description: '750W 80+ Gold fully modular ATX PSU, 10-year warranty.' },
  { name: 'Seasonic Focus GX-850', brand: 'Seasonic', price: 46000, category: 'components', subcategory: 'psu', stock: 8, description: '850W 80+ Gold modular PSU, hybrid fan mode.' },
  { name: 'be quiet! Pure Power 12 M 650W', brand: 'be quiet!', price: 28500, category: 'components', subcategory: 'psu', stock: 10, description: '650W 80+ Gold modular PSU, ATX 3.0 ready.' },
  { name: 'Cooler Master MWE Gold 1000 V2', brand: 'Cooler Master', price: 52000, category: 'components', subcategory: 'psu', stock: 5, description: '1000W 80+ Gold ATX 3.0 PSU with 12VHPWR connector.' },

  // PC Cases
  { name: 'NZXT H7 Flow', brand: 'NZXT', price: 42000, category: 'components', subcategory: 'case', stock: 8, description: 'Mid-tower ATX case with mesh front panel for high airflow.' },
  { name: 'Lian Li Lancool 216', brand: 'Lian Li', price: 36000, category: 'components', subcategory: 'case', stock: 10, description: 'ATX mid-tower with two 160mm front fans included.' },
  { name: 'Fractal North', brand: 'Fractal Design', price: 49000, category: 'components', subcategory: 'case', stock: 6, description: 'Premium walnut-accented ATX case with mesh side.' },
  { name: 'Corsair 4000D Airflow', brand: 'Corsair', price: 32000, category: 'components', subcategory: 'case', stock: 12, description: 'Popular mid-tower with high-airflow front panel.' },
];

const services = [
  // Hardware / Repair
  { name: 'Laptop Screen Replacement', serviceType: 'repair', price: 12500, description: 'Replace a cracked or dead laptop display. Includes part fitting and calibration.' },
  { name: 'Laptop Keyboard Replacement', serviceType: 'repair', price: 6500, description: 'Replace damaged or non-responsive laptop keyboards.' },
  { name: 'Battery Replacement', serviceType: 'repair', price: 8500, description: 'Genuine battery replacement for laptops with health check.' },
  { name: 'Motherboard Diagnostics & Repair', serviceType: 'repair', price: 9500, description: 'Component-level board diagnostics and chip-level repair where possible.' },
  { name: 'Charging Port Repair', serviceType: 'repair', price: 4500, description: 'Repair or replace damaged DC jacks and USB-C charging ports.' },

  // Software
  { name: 'OS Installation & Setup', serviceType: 'software', price: 3500, description: 'Clean install of Windows / macOS / Linux with drivers and essential apps.' },
  { name: 'Virus & Malware Removal', serviceType: 'software', price: 4000, description: 'Deep system scan, cleanup, and protection setup.' },
  { name: 'Driver & Firmware Update', serviceType: 'software', price: 2500, description: 'Update all drivers, BIOS/UEFI firmware to the latest stable versions.' },
  { name: 'Boot / Startup Issue Fix', serviceType: 'software', price: 4500, description: 'Diagnose and fix BSOD, boot loops, and startup repair issues.' },

  // Data Recovery
  { name: 'HDD Data Recovery', serviceType: 'data', price: 9000, description: 'Recover data from failing or corrupted hard drives. No-fix, no-fee.' },
  { name: 'SSD Data Recovery', serviceType: 'data', price: 12000, description: 'Specialized SSD data recovery from failed NVMe / SATA drives.' },
  { name: 'Accidental File Deletion Recovery', serviceType: 'data', price: 5000, description: 'Recover accidentally deleted or formatted files.' },

  // Upgrades
  { name: 'RAM Upgrade Service', serviceType: 'upgrade', price: 1500, description: 'Professional RAM installation. Part cost not included.' },
  { name: 'SSD Upgrade & Cloning', serviceType: 'upgrade', price: 3500, description: 'Install a new SSD and clone your existing OS / data over.' },
  { name: 'GPU Upgrade & Install', serviceType: 'upgrade', price: 2500, description: 'Install a new graphics card and verify drivers, thermals, and power.' },

  // Cleaning / Maintenance
  { name: 'Laptop Deep Cleaning & Repaste', serviceType: 'maintenance', price: 5500, description: 'Full disassembly, dust removal, fan service, and CPU/GPU thermal repaste.' },
  { name: 'Desktop PC Tune-Up', serviceType: 'maintenance', price: 4000, description: 'Internal cleaning, cable management, fan check, and software optimization.' },
  { name: 'Liquid Damage Cleaning', serviceType: 'cleaning', price: 7500, description: 'Ultrasonic board cleaning after liquid spill incidents.' },
];

async function main() {
  let added = 0, skipped = 0;

  for (const c of components) {
    const exists = await prisma.product.findFirst({ where: { name: c.name } });
    if (exists) { skipped++; continue; }
    await prisma.product.create({
      data: {
        ...c,
        image: PLACEHOLDER + encodeURIComponent(c.name),
        featured: false,
        isService: false,
      },
    });
    added++;
  }

  for (const s of services) {
    const exists = await prisma.product.findFirst({ where: { name: s.name } });
    if (exists) { skipped++; continue; }
    await prisma.product.create({
      data: {
        name: s.name,
        description: s.description,
        price: s.price,
        category: 'services',
        subcategory: s.serviceType,
        image: PLACEHOLDER + encodeURIComponent(s.name),
        stock: 999,
        featured: false,
        isService: true,
        serviceType: s.serviceType,
      },
    });
    added++;
  }

  console.log(`Done. Added: ${added}, Skipped (already existed): ${skipped}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
