const fs = require('fs');
const path = require('path');

const img = {
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  laptop2: 'https://images.unsplash.com/photo-1541807084-5c52b6b92e2e?w=800',
  laptop3: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
  gpu: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800',
  gpu2: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
  phone: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
  phone2: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
  phone3: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
  monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
  monitor2: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800',
  ram: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
  ssd: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
  accessory: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
  accessory2: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
  accessory3: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800',
  gaming: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
  gaming2: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',
  storage: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800',
  keyboard: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800',
  mouse: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
  cable: 'https://images.unsplash.com/photo-1580828343064-fdd4eaa4f940?w=800',
  audio: 'https://images.unsplash.com/photo-1558504094-1b91316b2511?w=800',
  cases: 'https://images.unsplash.com/photo-1603539988583-bfbb0a520fce?w=800',
  cooling: 'https://images.unsplash.com/photo-1632832810452-f32f3eaabcbe?w=800',
};

// Start generation of exactly 100 products
let idCounter = 1;

function generate(category, subcategory, brand, name, price, stock, image, specs, features, specificFields = {}, isFeatured = false) {
  const pId = `${category.substring(0,3)}-00${idCounter++}`.replace('--','-');
  return {
    id: pId,
    name,
    brand,
    price,
    image,
    category,
    ...(subcategory ? { subcategory } : {}),
    specs,
    features,
    stock,
    featured: isFeatured,
    description: `A premium ${brand} ${name} offering the best performance.`,
    ...specificFields
  };
}

const products = [];

// 1. LAPTOPS (10)
products.push(
  generate('laptops', null, 'Apple', 'MacBook Pro 16" M3 Max', 450000, 8, img.laptop, { 'CPU': 'Apple M3 Max', 'RAM': '36GB', 'Storage': '1TB SSD', 'Display': '16.2"' }, ['ProMotion 120Hz', 'MagSafe 3'], {}, true),
  generate('laptops', null, 'ASUS', 'ROG Zephyrus G16', 380000, 5, img.laptop2, { 'CPU': 'i9-14900H', 'GPU': 'RTX 4080', 'RAM': '32GB DDR5', 'Display': '16" OLED' }, ['Dolby Atmos', 'Wi-Fi 6E'], {}, true),
  generate('laptops', null, 'Lenovo', 'ThinkPad X1 Carbon', 290000, 12, img.laptop3, { 'CPU': 'i7-1365U', 'RAM': '16GB', 'Display': '14" 2.8K OLED' }, ['Carbon fiber'], {}, false),
  generate('laptops', null, 'Dell', 'XPS 15 9530', 320000, 7, img.laptop, { 'CPU': 'i7-13700H', 'GPU': 'RTX 4060', 'RAM': '32GB DDR5', 'Display': '15.6" 4K Touch' }, ['InfinityEdge', 'Thunderbolt 4'], {}, true),
  generate('laptops', null, 'HP', 'Spectre x360 14', 265000, 10, img.laptop2, { 'CPU': 'i7-1355U', 'RAM': '16GB', 'Display': '14" OLED' }, ['360 hinge'], {}, false),
  generate('laptops', null, 'Acer', 'Nitro 5', 185000, 15, img.laptop3, { 'CPU': 'i5-13420H', 'GPU': 'RTX 4060', 'RAM': '16GB', 'Display': 'FHD 144Hz' }, ['Dual fan cooling'], {}, false),
  generate('laptops', null, 'MSI', 'Creator 15', 340000, 4, img.laptop, { 'CPU': 'i9-13900H', 'GPU': 'RTX 4070', 'RAM': '32GB', 'Display': '15.6" OLED' }, ['Studio tuning'], {}, false),
  generate('laptops', null, 'Razer', 'Blade 15', 395000, 3, img.laptop2, { 'CPU': 'i9-13950HX', 'GPU': 'RTX 4080', 'RAM': '32GB', 'Display': '15.6" QHD 240Hz' }, ['CNC aluminum'], {}, false),
  generate('laptops', null, 'Samsung', 'Galaxy Book3 Ultra', 310000, 6, img.laptop3, { 'CPU': 'i9-13900H', 'GPU': 'RTX 4070', 'RAM': '32GB', 'Display': '16" 3K AMOLED' }, ['Galaxy ecosystem'], {}, false),
  generate('laptops', null, 'Alienware', 'm18 R2', 410000, 2, img.laptop, { 'CPU': 'i9-14900HX', 'GPU': 'RTX 4090', 'RAM': '64GB', 'Display': '18" QHD+ 165Hz' }, ['Cryo-tech cooling'], {}, true)
);

// 2. LAPTOP ACCESSORIES (35)
// subcategory: ram (5)
products.push(
  generate('laptop-accessories', 'ram', 'Corsair', '16GB DDR4 3200MHz', 8900, 40, img.ram, { 'Type': 'DDR4', 'Speed': '3200 MHz' }, [], { ramType: 'DDR4', ramSpeed: 3200, ramCapacity: 16 }),
  generate('laptop-accessories', 'ram', 'G.Skill', '32GB DDR4 3600MHz', 16500, 25, img.ram, { 'Type': 'DDR4', 'Speed': '3600 MHz' }, [], { ramType: 'DDR4', ramSpeed: 3600, ramCapacity: 32 }),
  generate('laptop-accessories', 'ram', 'Crucial', '16GB DDR5 4800MHz', 11900, 30, img.ram, { 'Type': 'DDR5', 'Speed': '4800 MHz' }, [], { ramType: 'DDR5', ramSpeed: 4800, ramCapacity: 16 }),
  generate('laptop-accessories', 'ram', 'Samsung', '32GB DDR5 5600MHz', 22500, 20, img.ram, { 'Type': 'DDR5', 'Speed': '5600 MHz' }, [], { ramType: 'DDR5', ramSpeed: 5600, ramCapacity: 32 }),
  generate('laptop-accessories', 'ram', 'Kingston', '8GB DDR4 2666MHz', 4500, 50, img.ram, { 'Type': 'DDR4', 'Speed': '2666 MHz' }, [], { ramType: 'DDR4', ramSpeed: 2666, ramCapacity: 8 })
);
// subcategory: ssd (5)
products.push(
  generate('laptop-accessories', 'ssd', 'Samsung', '990 Pro 1TB NVMe', 18500, 35, img.ssd, { 'Type': 'NVMe', 'Capacity': '1TB', 'Read': '7450 MB/s' }, [], { ssdType: 'NVMe', ssdCapacity: 1024 }),
  generate('laptop-accessories', 'ssd', 'Western Digital', 'Black SN850X 2TB', 32000, 20, img.ssd, { 'Type': 'NVMe', 'Capacity': '2TB', 'Read': '7300 MB/s' }, [], { ssdType: 'NVMe', ssdCapacity: 2048 }),
  generate('laptop-accessories', 'ssd', 'Crucial', 'MX500 500GB SATA', 9500, 50, img.ssd, { 'Type': 'SATA', 'Capacity': '500GB' }, [], { ssdType: 'SATA', ssdCapacity: 512 }),
  generate('laptop-accessories', 'ssd', 'Kingston', 'NV2 1TB NVMe', 12500, 40, img.ssd, { 'Type': 'NVMe', 'Capacity': '1TB' }, [], { ssdType: 'NVMe', ssdCapacity: 1024 }),
  generate('laptop-accessories', 'ssd', 'Sabrent', 'Rocket 4 Plus 4TB', 58000, 8, img.ssd, { 'Type': 'NVMe', 'Capacity': '4TB' }, [], { ssdType: 'NVMe', ssdCapacity: 4096 })
);
// subcategory: cooling-pad (3)
products.push(
  generate('laptop-accessories', 'cooling-pad', 'Cooler Master', 'Notepal X3', 4500, 20, img.cooling, { 'Fans': '200mm single', 'Material': 'Aluminum' }, [], {}),
  generate('laptop-accessories', 'cooling-pad', 'Thermaltake', 'Massive 20 RGB', 8500, 15, img.cooling, { 'Fans': '200mm silent', 'LED': 'RGB' }, [], {}),
  generate('laptop-accessories', 'cooling-pad', 'Targus', 'Chill Mat', 3500, 25, img.cooling, { 'Fans': 'Dual fans', 'Material': 'Neoprene' }, [], {})
);
// subcategory: gpu (eGpu) (2)
products.push(
  generate('laptop-accessories', 'gpu', 'Razer', 'Core X Chroma eGPU', 65000, 5, img.gpu, { 'Interface': 'Thunderbolt 3', 'PSU': '700W' }, [], {}),
  generate('laptop-accessories', 'gpu', 'Aorus', 'Gaming Box RTX 3080 eGPU', 180000, 3, img.gpu2, { 'Interface': 'Thunderbolt 3', 'GPU': 'RTX 3080 Waterforce' }, [], {})
);
// subcategory: display (portable) (3)
products.push(
  generate('laptop-accessories', 'display', 'ASUS', 'ZenScreen 15.6"', 35000, 15, img.monitor, { 'Resolution': '1080p', 'Panel': 'IPS', 'Interface': 'USB-C' }, [], {}),
  generate('laptop-accessories', 'display', 'Arzopa', '144Hz Portable Monitor', 28000, 25, img.monitor2, { 'Resolution': '1080p', 'Refresh': '144Hz' }, [], {}),
  generate('laptop-accessories', 'display', 'LG', 'Gram +View 16"', 42000, 10, img.monitor, { 'Resolution': '2K WQXGA', 'Aspect': '16:10' }, [], {})
);
// subcategory: keyboard (5)
products.push(
  generate('laptop-accessories', 'keyboard', 'Logitech', 'MX Keys Mini', 19000, 30, img.keyboard, { 'Layout': 'Compact', 'Connection': 'Bluetooth' }, ['Backlit'], {}),
  generate('laptop-accessories', 'keyboard', 'Keychron', 'K3 V2 Low Profile', 15500, 20, img.keyboard, { 'Layout': '75%', 'Switches': 'Optical Red' }, ['Hot-swappable'], {}),
  generate('laptop-accessories', 'keyboard', 'Razer', 'BlackWidow V3 Mini', 24500, 15, img.keyboard, { 'Layout': '65%', 'Switches': 'Yellow Linear' }, ['Chroma RGB'], {}),
  generate('laptop-accessories', 'keyboard', 'NuPhy', 'Air75', 18500, 25, img.keyboard, { 'Layout': '75%', 'Switches': 'Gateron Low Profile' }, [], {}),
  generate('laptop-accessories', 'keyboard', 'Apple', 'Magic Keyboard', 21000, 40, img.keyboard, { 'Layout': 'Compact', 'Connection': 'Bluetooth' }, ['Touch ID'], {})
);
// subcategory: mouse (4)
products.push(
  generate('laptop-accessories', 'mouse', 'Logitech', 'MX Master 3S', 22500, 50, img.mouse, { 'Sensor': '8000 DPI', 'Buttons': '7' }, ['MagSpeed scroll'], {}),
  generate('laptop-accessories', 'mouse', 'Logitech', 'MX Anywhere 3', 14500, 45, img.mouse, { 'Sensor': '4000 DPI', 'Size': 'Compact' }, ['Track-anywhere'], {}),
  generate('laptop-accessories', 'mouse', 'Razer', 'Pro Click Mini', 13500, 20, img.mouse, { 'Sensor': '12000 DPI', 'Connection': 'Wireless' }, ['Silent clicks'], {}),
  generate('laptop-accessories', 'mouse', 'Apple', 'Magic Mouse', 15000, 35, img.mouse, { 'Connection': 'Bluetooth', 'Surface': 'Multi-Touch' }, [], {})
);
// subcategory: cable (3)
products.push(
  generate('laptop-accessories', 'cable', 'Anker', 'PowerLine III USB-C 100W', 2500, 100, img.cable, { 'Length': '1.8m', 'Power': '100W' }, [], {}),
  generate('laptop-accessories', 'cable', 'Ugreen', 'Thunderbolt 4 Cable', 5500, 60, img.cable, { 'Length': '0.8m', 'Speed': '40Gbps' }, [], {}),
  generate('laptop-accessories', 'cable', 'Belkin', 'USB-C Hub with HDMI', 8500, 40, img.cable, { 'Ports': 'HDMI, 2x USB-A, SD' }, [], {})
);
// subcategory: audio (3)
products.push(
  generate('laptop-accessories', 'audio', 'Jabra', 'Evolve2 55 Headset', 42000, 12, img.audio, { 'Type': 'On-ear', 'Mics': '8' }, ['ANC'], {}),
  generate('laptop-accessories', 'audio', 'Bose', 'QuietComfort Earbuds II', 48000, 18, img.audio, { 'Type': 'In-ear TWS', 'Battery': '6 hours' }, ['Best ANC'], {}),
  generate('laptop-accessories', 'audio', 'Sony', 'INZONE H9', 39000, 15, img.audio, { 'Type': 'Over-ear', 'Audio': '3D Spatial' }, ['ANC'], {})
);
// subcategory: cases (2)
products.push(
  generate('laptop-accessories', 'cases', 'Incase', 'ICON Sleeve with Woolenex', 8500, 30, img.cases, { 'Size': 'Up to 16"', 'Material': 'Woolenex' }, [], {}),
  generate('laptop-accessories', 'cases', 'Tomtoc', '360° Protective Laptop Sleeve', 5500, 50, img.cases, { 'Size': 'Up to 15.6"', 'Padding': 'CornerArmor' }, [], {})
);


// 3. GRAPHICS CARDS (10)
products.push(
  generate('graphics-cards', null, 'NVIDIA', 'RTX 4090 24GB', 485000, 5, img.gpu, { 'Memory': '24GB GDDR6X', 'Cores': '16384' }, [], {}),
  generate('graphics-cards', null, 'AMD', 'Radeon RX 7900 XTX', 295000, 8, img.gpu2, { 'Memory': '24GB GDDR6' }, [], {}),
  generate('graphics-cards', null, 'NVIDIA', 'RTX 4080 Super 16GB', 320000, 6, img.gpu, { 'Memory': '16GB GDDR6X' }, [], {}),
  generate('graphics-cards', null, 'AMD', 'Radeon RX 7900 XT', 245000, 10, img.gpu2, { 'Memory': '20GB GDDR6' }, [], {}),
  generate('graphics-cards', null, 'NVIDIA', 'RTX 4070 Ti Super 16GB', 265000, 12, img.gpu, { 'Memory': '16GB GDDR6X' }, [], {}),
  generate('graphics-cards', null, 'AMD', 'Radeon RX 7800 XT', 152000, 15, img.gpu2, { 'Memory': '16GB GDDR6' }, [], {}),
  generate('graphics-cards', null, 'NVIDIA', 'RTX 4070 Super 12GB', 195000, 14, img.gpu, { 'Memory': '12GB GDDR6X' }, [], {}),
  generate('graphics-cards', null, 'AMD', 'Radeon RX 7700 XT', 135000, 18, img.gpu2, { 'Memory': '12GB GDDR6' }, [], {}),
  generate('graphics-cards', null, 'NVIDIA', 'RTX 4060 Ti 16GB', 145000, 20, img.gpu, { 'Memory': '16GB GDDR6' }, [], {}),
  generate('graphics-cards', null, 'NVIDIA', 'RTX 4060 8GB', 99000, 25, img.gpu, { 'Memory': '8GB GDDR6' }, [], {})
);

// 4. SMARTPHONES (10)
products.push(
  generate('smartphones', null, 'Apple', 'iPhone 15 Pro Max', 285000, 20, img.phone, { 'Storage': '256GB' }, [], {}),
  generate('smartphones', null, 'Samsung', 'Galaxy S24 Ultra', 310000, 15, img.phone2, { 'Storage': '256GB' }, [], {}),
  generate('smartphones', null, 'Google', 'Pixel 8 Pro', 235000, 18, img.phone3, { 'Storage': '128GB' }, [], {}),
  generate('smartphones', null, 'OnePlus', '12 256GB', 195000, 12, img.phone2, { 'Storage': '256GB' }, [], {}),
  generate('smartphones', null, 'Xiaomi', '14 Ultra', 225000, 8, img.phone, { 'Storage': '256GB' }, [], {}),
  generate('smartphones', null, 'Nothing', 'Phone (2)', 145000, 22, img.phone3, { 'Storage': '256GB' }, [], {}),
  generate('smartphones', null, 'Apple', 'iPhone 15', 195000, 25, img.phone, { 'Storage': '128GB' }, [], {}),
  generate('smartphones', null, 'Samsung', 'Galaxy Z Fold 5', 385000, 10, img.phone2, { 'Storage': '512GB' }, [], {}),
  generate('smartphones', null, 'Samsung', 'Galaxy A54 5G', 98000, 30, img.phone2, { 'Storage': '128GB' }, [], {}),
  generate('smartphones', null, 'Realme', 'GT 5 Pro', 128000, 20, img.phone3, { 'Storage': '256GB' }, [], {})
);

// 5. ACCESSORIES (10) (General items not specific to laptops)
products.push(
  generate('accessories', null, 'Sony', 'WH-1000XM5', 79500, 35, img.accessory, { 'Type': 'Over-ear' }, [], {}),
  generate('accessories', null, 'Keychron', 'Q1 Pro Keyboard', 45000, 30, img.accessory3, { 'Layout': '75%' }, [], {}),
  generate('accessories', null, 'Apple', 'AirPods Pro 2nd Gen', 69500, 25, img.accessory, { 'Type': 'TWS' }, [], {}),
  generate('accessories', null, 'Samsung', 'Galaxy Watch 6 Classic', 55000, 20, img.accessory2, { 'Size': '43mm' }, [], {}),
  generate('accessories', null, 'Anker', '737 GaN Charger 120W', 12500, 60, img.accessory3, { 'Power': '120W' }, [], {}),
  generate('accessories', null, 'Elgato', 'Stream Deck MK.2', 32000, 15, img.accessory, { 'Platform': 'PC/Mac' }, [], {}),
  generate('accessories', null, 'Logitech', 'Brio 4K Webcam', 41000, 12, img.accessory2, { 'Resolution': '4K' }, [], {}),
  generate('accessories', null, 'Blue', 'Yeti X Microphone', 38000, 18, img.accessory3, { 'Pattern': 'Multi' }, [], {}),
  generate('accessories', null, 'Rode', 'PSA1 Boom Arm', 22000, 25, img.accessory, { 'Type': 'Mount' }, [], {}),
  generate('accessories', null, 'Native Union', 'Drop XL Wireless Charger', 18000, 22, img.accessory2, { 'Power': '15W' }, [], {})
);

// 6. MONITORS (10)
products.push(
  generate('monitors', null, 'LG', 'UltraGear 27" OLED 240Hz', 225000, 10, img.monitor, { 'Size': '27"', 'Panel': 'OLED' }, [], {}),
  generate('monitors', null, 'Samsung', 'Odyssey G9 49" DQHD', 295000, 5, img.monitor2, { 'Size': '49"', 'Panel': 'VA' }, [], {}),
  generate('monitors', null, 'Dell', 'UltraSharp 27" 4K', 145000, 14, img.monitor, { 'Size': '27"', 'Panel': 'IPS' }, [], {}),
  generate('monitors', null, 'ASUS', 'ROG Swift 32" 4K', 198000, 8, img.monitor2, { 'Size': '32"', 'Panel': 'Fast IPS' }, [], {}),
  generate('monitors', null, 'BenQ', 'PD2705UA 27" Creator', 118000, 12, img.monitor, { 'Size': '27"', 'Panel': 'IPS' }, [], {}),
  generate('monitors', null, 'MSI', 'MAG 274QRFDE 27"', 88000, 16, img.monitor2, { 'Size': '27"', 'Panel': 'Rapid IPS' }, [], {}),
  generate('monitors', null, 'ViewSonic', 'VX2479-HD-PRO 24"', 52000, 22, img.monitor, { 'Size': '24"', 'Panel': 'IPS' }, [], {}),
  generate('monitors', null, 'Apple', 'Studio Display 27"', 382000, 4, img.monitor2, { 'Size': '27"', 'Panel': 'IPS' }, [], {}),
  generate('monitors', null, 'Acer', 'Predator X34 34"', 175000, 9, img.monitor, { 'Size': '34"', 'Panel': 'OLED' }, [], {}),
  generate('monitors', null, 'Gigabyte', 'M28U 28" 4K', 125000, 15, img.monitor2, { 'Size': '28"', 'Panel': 'IPS' }, [], {})
);

// 7. STORAGE (8)
products.push(
  generate('storage', null, 'Seagate', 'IronWolf 4TB NAS HDD', 32000, 25, img.storage, { 'Capacity': '4TB', 'Type': 'HDD' }, [], {}),
  generate('storage', null, 'SanDisk', 'Extreme Pro 2TB Portable', 42000, 20, img.storage, { 'Capacity': '2TB', 'Type': 'External SSD' }, [], {}),
  generate('storage', null, 'Crucial', 'X8 1TB Portable SSD', 18500, 35, img.storage, { 'Capacity': '1TB', 'Type': 'External SSD' }, [], {}),
  generate('storage', null, 'G-Technology', 'ArmorATD 2TB Portable HDD', 28000, 18, img.storage, { 'Capacity': '2TB', 'Type': 'External HDD' }, [], {}),
  generate('storage', null, 'Samsung', 'T7 Shield 1TB Portable SSD', 22000, 28, img.storage, { 'Capacity': '1TB', 'Type': 'External SSD' }, [], {}),
  generate('storage', null, 'Western Digital', 'My Passport 4TB', 26000, 32, img.storage, { 'Capacity': '4TB', 'Type': 'External HDD' }, [], {}),
  generate('storage', null, 'LaCie', 'Rugged Mini 2TB', 24000, 24, img.storage, { 'Capacity': '2TB', 'Type': 'External HDD' }, [], {}),
  generate('storage', null, 'Kingston', 'XS2000 1TB Portable SSD', 21000, 26, img.storage, { 'Capacity': '1TB', 'Type': 'External SSD' }, [], {})
);

// 8. GAMING (7)
products.push(
  generate('gaming', null, 'Sony', 'PlayStation 5 Disc', 119000, 12, img.gaming, { 'Storage': '825GB' }, [], {}),
  generate('gaming', null, 'Microsoft', 'Xbox Series X 1TB', 112000, 10, img.gaming2, { 'Storage': '1TB' }, [], {}),
  generate('gaming', null, 'Valve', 'Steam Deck OLED 512GB', 128000, 8, img.gaming, { 'Storage': '512GB' }, [], {}),
  generate('gaming', null, 'Nintendo', 'Switch OLED', 68000, 18, img.gaming2, { 'Storage': '64GB' }, [], {}),
  generate('gaming', null, 'Razer', 'DeathAdder V3 Pro', 18500, 30, img.gaming2, { 'Sensor': '30K DPI' }, [], {}),
  generate('gaming', null, 'SteelSeries', 'Arctis Nova Pro Wireless', 48000, 15, img.gaming, { 'Type': 'Headset' }, [], {}),
  generate('gaming', null, 'Logitech', 'G Pro X Superlight', 24000, 40, img.gaming2, { 'Weight': '63g' }, [], {})
);

console.log('Total generated products:', products.length);

const mockDataContent = `// ─── Shared Mock Product Data (${products.length} products) ──────────────────────────────────
// Used by ProductShowcase, Shop page, FilterSidebar, and Repair page when API is unavailable.

export interface MockProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  specs: Record<string, string>;
  features?: string[];
  stock: number;
  featured: boolean;
  description: string;
  ramType?: string;
  ramSpeed?: number;
  ramCapacity?: number;
  ssdType?: string;
  ssdCapacity?: number;
  compatibility?: string[];
}

export const allProducts: MockProduct[] = ${JSON.stringify(products, null, 2)};

// Helpers to get products by category
export const getByCategory = (category: string) =>
  allProducts.filter(p => p.category === category);

export const getFeatured = (limit = 6) =>
  allProducts.filter(p => p.featured).slice(0, limit);

export const getLaptops = () => getByCategory('laptops');

export const getFilterCategories = () => [
  { name: 'laptops', slug: 'laptops', count: allProducts.filter(p => p.category === 'laptops').length },
  { name: 'laptop accessories', slug: 'laptop-accessories', count: allProducts.filter(p => p.category === 'laptop-accessories').length },
  { name: 'graphics cards', slug: 'graphics-cards', count: allProducts.filter(p => p.category === 'graphics-cards').length },
  { name: 'smartphones', slug: 'smartphones', count: allProducts.filter(p => p.category === 'smartphones').length },
  { name: 'accessories', slug: 'accessories', count: allProducts.filter(p => p.category === 'accessories').length },
  { name: 'monitors', slug: 'monitors', count: allProducts.filter(p => p.category === 'monitors').length },
  { name: 'storage', slug: 'storage', count: allProducts.filter(p => p.category === 'storage').length },
  { name: 'gaming', slug: 'gaming', count: allProducts.filter(p => p.category === 'gaming').length },
];

export default allProducts;
`;

const seedContent = `import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@ran-tech.com' },
    update: {},
    create: {
      email: 'demo@ran-tech.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });
  console.log('✅ Created demo user:', user.email);

  const rawProducts = ${JSON.stringify(products, null, 2)};

  // Convert fields for Prisma schema
  const productsToSeed = rawProducts.map(p => {
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      subcategory: p.subcategory || null,
      image: p.image,
      images: JSON.stringify([p.image]),
      stock: p.stock,
      featured: p.featured,
      brand: p.brand,
      sku: 'RAN-' + p.id.toUpperCase(),
      specs: JSON.stringify(p.specs || {}),
      features: JSON.stringify(p.features || []),
      ramType: p.ramType || null,
      ramSpeed: p.ramSpeed || null,
      ramCapacity: p.ramCapacity || null,
      ssdType: p.ssdType || null,
      ssdCapacity: p.ssdCapacity || null,
    };
  });

  // Delete existing data first
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('🗑️ Cleared existing data');

  let count = 0;
  for (const product of productsToSeed) {
    await prisma.product.create({
      data: product
    });
    count++;
  }
  console.log('✅ Created ' + count + ' products');

  // Reviews
  const reviews = [
    { productId: rawProducts[0].id, userName: 'John D.', rating: 5, comment: 'Incredible performance!' },
    { productId: rawProducts[1].id, userName: 'Sarah M.', rating: 5, comment: 'Great for gaming.' },
    { productId: rawProducts[80].id, userName: 'Mike R.', rating: 4, comment: 'Beautiful display.' },
  ];

  for (const review of reviews) {
    await prisma.review.create({ data: review });
  }
  console.log('✅ Created ' + reviews.length + ' reviews');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

fs.writeFileSync(path.join(__dirname, 'frontend/src/utils/mockData.ts'), mockDataContent);
fs.writeFileSync(path.join(__dirname, 'backend/prisma/seed.ts'), seedContent);

console.log('Successfully wrote to frontend mockData.ts and backend seed.ts');
