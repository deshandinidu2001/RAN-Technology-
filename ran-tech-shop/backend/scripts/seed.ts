import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load backend/.env before importing the supabase client (which reads env at module init).
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { supabase } from '../src/lib/supabase';

const die = (message: string, error: unknown): never => {
  console.error(message, error);
  process.exit(1);
};

async function main() {
  console.log('🌱 Starting seed...');

  // Create / upsert demo user.
  const hashedPassword = await bcrypt.hash('password123', 10);
  const { data: user, error: userError } = await supabase
    .from('User')
    .upsert(
      { email: 'demo@ran-tech.com', password: hashedPassword, name: 'Demo User' },
      { onConflict: 'email' }
    )
    .select('id, email')
    .single();
  if (userError || !user) die('Failed to upsert demo user:', userError);
  console.log('✅ Created demo user:', user!.email);

  const rawProducts = [
  {
    "id": "lap-001",
    "name": "MacBook Pro 16\" M3 Max",
    "brand": "Apple",
    "price": 450000,
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "Apple M3 Max",
      "RAM": "36GB",
      "Storage": "1TB SSD",
      "Display": "16.2\""
    },
    "features": [
      "ProMotion 120Hz",
      "MagSafe 3"
    ],
    "stock": 8,
    "featured": true,
    "description": "A premium Apple MacBook Pro 16\" M3 Max offering the best performance."
  },
  {
    "id": "lap-002",
    "name": "ROG Zephyrus G16",
    "brand": "ASUS",
    "price": 380000,
    "image": "https://images.unsplash.com/photo-1541807084-5c52b6b92e2e?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i9-14900H",
      "GPU": "RTX 4080",
      "RAM": "32GB DDR5",
      "Display": "16\" OLED"
    },
    "features": [
      "Dolby Atmos",
      "Wi-Fi 6E"
    ],
    "stock": 5,
    "featured": true,
    "description": "A premium ASUS ROG Zephyrus G16 offering the best performance."
  },
  {
    "id": "lap-003",
    "name": "ThinkPad X1 Carbon",
    "brand": "Lenovo",
    "price": 290000,
    "image": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i7-1365U",
      "RAM": "16GB",
      "Display": "14\" 2.8K OLED"
    },
    "features": [
      "Carbon fiber"
    ],
    "stock": 12,
    "featured": false,
    "description": "A premium Lenovo ThinkPad X1 Carbon offering the best performance."
  },
  {
    "id": "lap-004",
    "name": "XPS 15 9530",
    "brand": "Dell",
    "price": 320000,
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i7-13700H",
      "GPU": "RTX 4060",
      "RAM": "32GB DDR5",
      "Display": "15.6\" 4K Touch"
    },
    "features": [
      "InfinityEdge",
      "Thunderbolt 4"
    ],
    "stock": 7,
    "featured": true,
    "description": "A premium Dell XPS 15 9530 offering the best performance."
  },
  {
    "id": "lap-005",
    "name": "Spectre x360 14",
    "brand": "HP",
    "price": 265000,
    "image": "https://images.unsplash.com/photo-1541807084-5c52b6b92e2e?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i7-1355U",
      "RAM": "16GB",
      "Display": "14\" OLED"
    },
    "features": [
      "360 hinge"
    ],
    "stock": 10,
    "featured": false,
    "description": "A premium HP Spectre x360 14 offering the best performance."
  },
  {
    "id": "lap-006",
    "name": "Nitro 5",
    "brand": "Acer",
    "price": 185000,
    "image": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i5-13420H",
      "GPU": "RTX 4060",
      "RAM": "16GB",
      "Display": "FHD 144Hz"
    },
    "features": [
      "Dual fan cooling"
    ],
    "stock": 15,
    "featured": false,
    "description": "A premium Acer Nitro 5 offering the best performance."
  },
  {
    "id": "lap-007",
    "name": "Creator 15",
    "brand": "MSI",
    "price": 340000,
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i9-13900H",
      "GPU": "RTX 4070",
      "RAM": "32GB",
      "Display": "15.6\" OLED"
    },
    "features": [
      "Studio tuning"
    ],
    "stock": 4,
    "featured": false,
    "description": "A premium MSI Creator 15 offering the best performance."
  },
  {
    "id": "lap-008",
    "name": "Blade 15",
    "brand": "Razer",
    "price": 395000,
    "image": "https://images.unsplash.com/photo-1541807084-5c52b6b92e2e?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i9-13950HX",
      "GPU": "RTX 4080",
      "RAM": "32GB",
      "Display": "15.6\" QHD 240Hz"
    },
    "features": [
      "CNC aluminum"
    ],
    "stock": 3,
    "featured": false,
    "description": "A premium Razer Blade 15 offering the best performance."
  },
  {
    "id": "lap-009",
    "name": "Galaxy Book3 Ultra",
    "brand": "Samsung",
    "price": 310000,
    "image": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i9-13900H",
      "GPU": "RTX 4070",
      "RAM": "32GB",
      "Display": "16\" 3K AMOLED"
    },
    "features": [
      "Galaxy ecosystem"
    ],
    "stock": 6,
    "featured": false,
    "description": "A premium Samsung Galaxy Book3 Ultra offering the best performance."
  },
  {
    "id": "lap-0010",
    "name": "m18 R2",
    "brand": "Alienware",
    "price": 410000,
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    "category": "laptops",
    "specs": {
      "CPU": "i9-14900HX",
      "GPU": "RTX 4090",
      "RAM": "64GB",
      "Display": "18\" QHD+ 165Hz"
    },
    "features": [
      "Cryo-tech cooling"
    ],
    "stock": 2,
    "featured": true,
    "description": "A premium Alienware m18 R2 offering the best performance."
  },
  {
    "id": "lap-0011",
    "name": "16GB DDR4 3200MHz",
    "brand": "Corsair",
    "price": 8900,
    "image": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800",
    "category": "laptop-accessories",
    "subcategory": "ram",
    "specs": {
      "Type": "DDR4",
      "Speed": "3200 MHz"
    },
    "features": [],
    "stock": 40,
    "featured": false,
    "description": "A premium Corsair 16GB DDR4 3200MHz offering the best performance.",
    "ramType": "DDR4",
    "ramSpeed": 3200,
    "ramCapacity": 16
  },
  {
    "id": "lap-0012",
    "name": "32GB DDR4 3600MHz",
    "brand": "G.Skill",
    "price": 16500,
    "image": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800",
    "category": "laptop-accessories",
    "subcategory": "ram",
    "specs": {
      "Type": "DDR4",
      "Speed": "3600 MHz"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium G.Skill 32GB DDR4 3600MHz offering the best performance.",
    "ramType": "DDR4",
    "ramSpeed": 3600,
    "ramCapacity": 32
  },
  {
    "id": "lap-0013",
    "name": "16GB DDR5 4800MHz",
    "brand": "Crucial",
    "price": 11900,
    "image": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800",
    "category": "laptop-accessories",
    "subcategory": "ram",
    "specs": {
      "Type": "DDR5",
      "Speed": "4800 MHz"
    },
    "features": [],
    "stock": 30,
    "featured": false,
    "description": "A premium Crucial 16GB DDR5 4800MHz offering the best performance.",
    "ramType": "DDR5",
    "ramSpeed": 4800,
    "ramCapacity": 16
  },
  {
    "id": "lap-0014",
    "name": "32GB DDR5 5600MHz",
    "brand": "Samsung",
    "price": 22500,
    "image": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800",
    "category": "laptop-accessories",
    "subcategory": "ram",
    "specs": {
      "Type": "DDR5",
      "Speed": "5600 MHz"
    },
    "features": [],
    "stock": 20,
    "featured": false,
    "description": "A premium Samsung 32GB DDR5 5600MHz offering the best performance.",
    "ramType": "DDR5",
    "ramSpeed": 5600,
    "ramCapacity": 32
  },
  {
    "id": "lap-0015",
    "name": "8GB DDR4 2666MHz",
    "brand": "Kingston",
    "price": 4500,
    "image": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800",
    "category": "laptop-accessories",
    "subcategory": "ram",
    "specs": {
      "Type": "DDR4",
      "Speed": "2666 MHz"
    },
    "features": [],
    "stock": 50,
    "featured": false,
    "description": "A premium Kingston 8GB DDR4 2666MHz offering the best performance.",
    "ramType": "DDR4",
    "ramSpeed": 2666,
    "ramCapacity": 8
  },
  {
    "id": "lap-0016",
    "name": "990 Pro 1TB NVMe",
    "brand": "Samsung",
    "price": 18500,
    "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800",
    "category": "laptop-accessories",
    "subcategory": "ssd",
    "specs": {
      "Type": "NVMe",
      "Capacity": "1TB",
      "Read": "7450 MB/s"
    },
    "features": [],
    "stock": 35,
    "featured": false,
    "description": "A premium Samsung 990 Pro 1TB NVMe offering the best performance.",
    "ssdType": "NVMe",
    "ssdCapacity": 1024
  },
  {
    "id": "lap-0017",
    "name": "Black SN850X 2TB",
    "brand": "Western Digital",
    "price": 32000,
    "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800",
    "category": "laptop-accessories",
    "subcategory": "ssd",
    "specs": {
      "Type": "NVMe",
      "Capacity": "2TB",
      "Read": "7300 MB/s"
    },
    "features": [],
    "stock": 20,
    "featured": false,
    "description": "A premium Western Digital Black SN850X 2TB offering the best performance.",
    "ssdType": "NVMe",
    "ssdCapacity": 2048
  },
  {
    "id": "lap-0018",
    "name": "MX500 500GB SATA",
    "brand": "Crucial",
    "price": 9500,
    "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800",
    "category": "laptop-accessories",
    "subcategory": "ssd",
    "specs": {
      "Type": "SATA",
      "Capacity": "500GB"
    },
    "features": [],
    "stock": 50,
    "featured": false,
    "description": "A premium Crucial MX500 500GB SATA offering the best performance.",
    "ssdType": "SATA",
    "ssdCapacity": 512
  },
  {
    "id": "lap-0019",
    "name": "NV2 1TB NVMe",
    "brand": "Kingston",
    "price": 12500,
    "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800",
    "category": "laptop-accessories",
    "subcategory": "ssd",
    "specs": {
      "Type": "NVMe",
      "Capacity": "1TB"
    },
    "features": [],
    "stock": 40,
    "featured": false,
    "description": "A premium Kingston NV2 1TB NVMe offering the best performance.",
    "ssdType": "NVMe",
    "ssdCapacity": 1024
  },
  {
    "id": "lap-0020",
    "name": "Rocket 4 Plus 4TB",
    "brand": "Sabrent",
    "price": 58000,
    "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800",
    "category": "laptop-accessories",
    "subcategory": "ssd",
    "specs": {
      "Type": "NVMe",
      "Capacity": "4TB"
    },
    "features": [],
    "stock": 8,
    "featured": false,
    "description": "A premium Sabrent Rocket 4 Plus 4TB offering the best performance.",
    "ssdType": "NVMe",
    "ssdCapacity": 4096
  },
  {
    "id": "lap-0021",
    "name": "Notepal X3",
    "brand": "Cooler Master",
    "price": 4500,
    "image": "https://images.unsplash.com/photo-1632832810452-f32f3eaabcbe?w=800",
    "category": "laptop-accessories",
    "subcategory": "cooling-pad",
    "specs": {
      "Fans": "200mm single",
      "Material": "Aluminum"
    },
    "features": [],
    "stock": 20,
    "featured": false,
    "description": "A premium Cooler Master Notepal X3 offering the best performance."
  },
  {
    "id": "lap-0022",
    "name": "Massive 20 RGB",
    "brand": "Thermaltake",
    "price": 8500,
    "image": "https://images.unsplash.com/photo-1632832810452-f32f3eaabcbe?w=800",
    "category": "laptop-accessories",
    "subcategory": "cooling-pad",
    "specs": {
      "Fans": "200mm silent",
      "LED": "RGB"
    },
    "features": [],
    "stock": 15,
    "featured": false,
    "description": "A premium Thermaltake Massive 20 RGB offering the best performance."
  },
  {
    "id": "lap-0023",
    "name": "Chill Mat",
    "brand": "Targus",
    "price": 3500,
    "image": "https://images.unsplash.com/photo-1632832810452-f32f3eaabcbe?w=800",
    "category": "laptop-accessories",
    "subcategory": "cooling-pad",
    "specs": {
      "Fans": "Dual fans",
      "Material": "Neoprene"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium Targus Chill Mat offering the best performance."
  },
  {
    "id": "lap-0024",
    "name": "Core X Chroma eGPU",
    "brand": "Razer",
    "price": 65000,
    "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
    "category": "laptop-accessories",
    "subcategory": "gpu",
    "specs": {
      "Interface": "Thunderbolt 3",
      "PSU": "700W"
    },
    "features": [],
    "stock": 5,
    "featured": false,
    "description": "A premium Razer Core X Chroma eGPU offering the best performance."
  },
  {
    "id": "lap-0025",
    "name": "Gaming Box RTX 3080 eGPU",
    "brand": "Aorus",
    "price": 180000,
    "image": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
    "category": "laptop-accessories",
    "subcategory": "gpu",
    "specs": {
      "Interface": "Thunderbolt 3",
      "GPU": "RTX 3080 Waterforce"
    },
    "features": [],
    "stock": 3,
    "featured": false,
    "description": "A premium Aorus Gaming Box RTX 3080 eGPU offering the best performance."
  },
  {
    "id": "lap-0026",
    "name": "ZenScreen 15.6\"",
    "brand": "ASUS",
    "price": 35000,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    "category": "laptop-accessories",
    "subcategory": "display",
    "specs": {
      "Resolution": "1080p",
      "Panel": "IPS",
      "Interface": "USB-C"
    },
    "features": [],
    "stock": 15,
    "featured": false,
    "description": "A premium ASUS ZenScreen 15.6\" offering the best performance."
  },
  {
    "id": "lap-0027",
    "name": "144Hz Portable Monitor",
    "brand": "Arzopa",
    "price": 28000,
    "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
    "category": "laptop-accessories",
    "subcategory": "display",
    "specs": {
      "Resolution": "1080p",
      "Refresh": "144Hz"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium Arzopa 144Hz Portable Monitor offering the best performance."
  },
  {
    "id": "lap-0028",
    "name": "Gram +View 16\"",
    "brand": "LG",
    "price": 42000,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    "category": "laptop-accessories",
    "subcategory": "display",
    "specs": {
      "Resolution": "2K WQXGA",
      "Aspect": "16:10"
    },
    "features": [],
    "stock": 10,
    "featured": false,
    "description": "A premium LG Gram +View 16\" offering the best performance."
  },
  {
    "id": "lap-0029",
    "name": "MX Keys Mini",
    "brand": "Logitech",
    "price": 19000,
    "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
    "category": "laptop-accessories",
    "subcategory": "keyboard",
    "specs": {
      "Layout": "Compact",
      "Connection": "Bluetooth"
    },
    "features": [
      "Backlit"
    ],
    "stock": 30,
    "featured": false,
    "description": "A premium Logitech MX Keys Mini offering the best performance."
  },
  {
    "id": "lap-0030",
    "name": "K3 V2 Low Profile",
    "brand": "Keychron",
    "price": 15500,
    "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
    "category": "laptop-accessories",
    "subcategory": "keyboard",
    "specs": {
      "Layout": "75%",
      "Switches": "Optical Red"
    },
    "features": [
      "Hot-swappable"
    ],
    "stock": 20,
    "featured": false,
    "description": "A premium Keychron K3 V2 Low Profile offering the best performance."
  },
  {
    "id": "lap-0031",
    "name": "BlackWidow V3 Mini",
    "brand": "Razer",
    "price": 24500,
    "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
    "category": "laptop-accessories",
    "subcategory": "keyboard",
    "specs": {
      "Layout": "65%",
      "Switches": "Yellow Linear"
    },
    "features": [
      "Chroma RGB"
    ],
    "stock": 15,
    "featured": false,
    "description": "A premium Razer BlackWidow V3 Mini offering the best performance."
  },
  {
    "id": "lap-0032",
    "name": "Air75",
    "brand": "NuPhy",
    "price": 18500,
    "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
    "category": "laptop-accessories",
    "subcategory": "keyboard",
    "specs": {
      "Layout": "75%",
      "Switches": "Gateron Low Profile"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium NuPhy Air75 offering the best performance."
  },
  {
    "id": "lap-0033",
    "name": "Magic Keyboard",
    "brand": "Apple",
    "price": 21000,
    "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
    "category": "laptop-accessories",
    "subcategory": "keyboard",
    "specs": {
      "Layout": "Compact",
      "Connection": "Bluetooth"
    },
    "features": [
      "Touch ID"
    ],
    "stock": 40,
    "featured": false,
    "description": "A premium Apple Magic Keyboard offering the best performance."
  },
  {
    "id": "lap-0034",
    "name": "MX Master 3S",
    "brand": "Logitech",
    "price": 22500,
    "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
    "category": "laptop-accessories",
    "subcategory": "mouse",
    "specs": {
      "Sensor": "8000 DPI",
      "Buttons": "7"
    },
    "features": [
      "MagSpeed scroll"
    ],
    "stock": 50,
    "featured": false,
    "description": "A premium Logitech MX Master 3S offering the best performance."
  },
  {
    "id": "lap-0035",
    "name": "MX Anywhere 3",
    "brand": "Logitech",
    "price": 14500,
    "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
    "category": "laptop-accessories",
    "subcategory": "mouse",
    "specs": {
      "Sensor": "4000 DPI",
      "Size": "Compact"
    },
    "features": [
      "Track-anywhere"
    ],
    "stock": 45,
    "featured": false,
    "description": "A premium Logitech MX Anywhere 3 offering the best performance."
  },
  {
    "id": "lap-0036",
    "name": "Pro Click Mini",
    "brand": "Razer",
    "price": 13500,
    "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
    "category": "laptop-accessories",
    "subcategory": "mouse",
    "specs": {
      "Sensor": "12000 DPI",
      "Connection": "Wireless"
    },
    "features": [
      "Silent clicks"
    ],
    "stock": 20,
    "featured": false,
    "description": "A premium Razer Pro Click Mini offering the best performance."
  },
  {
    "id": "lap-0037",
    "name": "Magic Mouse",
    "brand": "Apple",
    "price": 15000,
    "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
    "category": "laptop-accessories",
    "subcategory": "mouse",
    "specs": {
      "Connection": "Bluetooth",
      "Surface": "Multi-Touch"
    },
    "features": [],
    "stock": 35,
    "featured": false,
    "description": "A premium Apple Magic Mouse offering the best performance."
  },
  {
    "id": "lap-0038",
    "name": "PowerLine III USB-C 100W",
    "brand": "Anker",
    "price": 2500,
    "image": "https://images.unsplash.com/photo-1580828343064-fdd4eaa4f940?w=800",
    "category": "laptop-accessories",
    "subcategory": "cable",
    "specs": {
      "Length": "1.8m",
      "Power": "100W"
    },
    "features": [],
    "stock": 100,
    "featured": false,
    "description": "A premium Anker PowerLine III USB-C 100W offering the best performance."
  },
  {
    "id": "lap-0039",
    "name": "Thunderbolt 4 Cable",
    "brand": "Ugreen",
    "price": 5500,
    "image": "https://images.unsplash.com/photo-1580828343064-fdd4eaa4f940?w=800",
    "category": "laptop-accessories",
    "subcategory": "cable",
    "specs": {
      "Length": "0.8m",
      "Speed": "40Gbps"
    },
    "features": [],
    "stock": 60,
    "featured": false,
    "description": "A premium Ugreen Thunderbolt 4 Cable offering the best performance."
  },
  {
    "id": "lap-0040",
    "name": "USB-C Hub with HDMI",
    "brand": "Belkin",
    "price": 8500,
    "image": "https://images.unsplash.com/photo-1580828343064-fdd4eaa4f940?w=800",
    "category": "laptop-accessories",
    "subcategory": "cable",
    "specs": {
      "Ports": "HDMI, 2x USB-A, SD"
    },
    "features": [],
    "stock": 40,
    "featured": false,
    "description": "A premium Belkin USB-C Hub with HDMI offering the best performance."
  },
  {
    "id": "lap-0041",
    "name": "Evolve2 55 Headset",
    "brand": "Jabra",
    "price": 42000,
    "image": "https://images.unsplash.com/photo-1558504094-1b91316b2511?w=800",
    "category": "laptop-accessories",
    "subcategory": "audio",
    "specs": {
      "Type": "On-ear",
      "Mics": "8"
    },
    "features": [
      "ANC"
    ],
    "stock": 12,
    "featured": false,
    "description": "A premium Jabra Evolve2 55 Headset offering the best performance."
  },
  {
    "id": "lap-0042",
    "name": "QuietComfort Earbuds II",
    "brand": "Bose",
    "price": 48000,
    "image": "https://images.unsplash.com/photo-1558504094-1b91316b2511?w=800",
    "category": "laptop-accessories",
    "subcategory": "audio",
    "specs": {
      "Type": "In-ear TWS",
      "Battery": "6 hours"
    },
    "features": [
      "Best ANC"
    ],
    "stock": 18,
    "featured": false,
    "description": "A premium Bose QuietComfort Earbuds II offering the best performance."
  },
  {
    "id": "lap-0043",
    "name": "INZONE H9",
    "brand": "Sony",
    "price": 39000,
    "image": "https://images.unsplash.com/photo-1558504094-1b91316b2511?w=800",
    "category": "laptop-accessories",
    "subcategory": "audio",
    "specs": {
      "Type": "Over-ear",
      "Audio": "3D Spatial"
    },
    "features": [
      "ANC"
    ],
    "stock": 15,
    "featured": false,
    "description": "A premium Sony INZONE H9 offering the best performance."
  },
  {
    "id": "lap-0044",
    "name": "ICON Sleeve with Woolenex",
    "brand": "Incase",
    "price": 8500,
    "image": "https://images.unsplash.com/photo-1603539988583-bfbb0a520fce?w=800",
    "category": "laptop-accessories",
    "subcategory": "cases",
    "specs": {
      "Size": "Up to 16\"",
      "Material": "Woolenex"
    },
    "features": [],
    "stock": 30,
    "featured": false,
    "description": "A premium Incase ICON Sleeve with Woolenex offering the best performance."
  },
  {
    "id": "lap-0045",
    "name": "360° Protective Laptop Sleeve",
    "brand": "Tomtoc",
    "price": 5500,
    "image": "https://images.unsplash.com/photo-1603539988583-bfbb0a520fce?w=800",
    "category": "laptop-accessories",
    "subcategory": "cases",
    "specs": {
      "Size": "Up to 15.6\"",
      "Padding": "CornerArmor"
    },
    "features": [],
    "stock": 50,
    "featured": false,
    "description": "A premium Tomtoc 360° Protective Laptop Sleeve offering the best performance."
  },
  {
    "id": "gra-0046",
    "name": "RTX 4090 24GB",
    "brand": "NVIDIA",
    "price": 485000,
    "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "24GB GDDR6X",
      "Cores": "16384"
    },
    "features": [],
    "stock": 5,
    "featured": false,
    "description": "A premium NVIDIA RTX 4090 24GB offering the best performance."
  },
  {
    "id": "gra-0047",
    "name": "Radeon RX 7900 XTX",
    "brand": "AMD",
    "price": 295000,
    "image": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "24GB GDDR6"
    },
    "features": [],
    "stock": 8,
    "featured": false,
    "description": "A premium AMD Radeon RX 7900 XTX offering the best performance."
  },
  {
    "id": "gra-0048",
    "name": "RTX 4080 Super 16GB",
    "brand": "NVIDIA",
    "price": 320000,
    "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "16GB GDDR6X"
    },
    "features": [],
    "stock": 6,
    "featured": false,
    "description": "A premium NVIDIA RTX 4080 Super 16GB offering the best performance."
  },
  {
    "id": "gra-0049",
    "name": "Radeon RX 7900 XT",
    "brand": "AMD",
    "price": 245000,
    "image": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "20GB GDDR6"
    },
    "features": [],
    "stock": 10,
    "featured": false,
    "description": "A premium AMD Radeon RX 7900 XT offering the best performance."
  },
  {
    "id": "gra-0050",
    "name": "RTX 4070 Ti Super 16GB",
    "brand": "NVIDIA",
    "price": 265000,
    "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "16GB GDDR6X"
    },
    "features": [],
    "stock": 12,
    "featured": false,
    "description": "A premium NVIDIA RTX 4070 Ti Super 16GB offering the best performance."
  },
  {
    "id": "gra-0051",
    "name": "Radeon RX 7800 XT",
    "brand": "AMD",
    "price": 152000,
    "image": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "16GB GDDR6"
    },
    "features": [],
    "stock": 15,
    "featured": false,
    "description": "A premium AMD Radeon RX 7800 XT offering the best performance."
  },
  {
    "id": "gra-0052",
    "name": "RTX 4070 Super 12GB",
    "brand": "NVIDIA",
    "price": 195000,
    "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "12GB GDDR6X"
    },
    "features": [],
    "stock": 14,
    "featured": false,
    "description": "A premium NVIDIA RTX 4070 Super 12GB offering the best performance."
  },
  {
    "id": "gra-0053",
    "name": "Radeon RX 7700 XT",
    "brand": "AMD",
    "price": 135000,
    "image": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "12GB GDDR6"
    },
    "features": [],
    "stock": 18,
    "featured": false,
    "description": "A premium AMD Radeon RX 7700 XT offering the best performance."
  },
  {
    "id": "gra-0054",
    "name": "RTX 4060 Ti 16GB",
    "brand": "NVIDIA",
    "price": 145000,
    "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "16GB GDDR6"
    },
    "features": [],
    "stock": 20,
    "featured": false,
    "description": "A premium NVIDIA RTX 4060 Ti 16GB offering the best performance."
  },
  {
    "id": "gra-0055",
    "name": "RTX 4060 8GB",
    "brand": "NVIDIA",
    "price": 99000,
    "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
    "category": "graphics-cards",
    "specs": {
      "Memory": "8GB GDDR6"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium NVIDIA RTX 4060 8GB offering the best performance."
  },
  {
    "id": "sma-0056",
    "name": "iPhone 15 Pro Max",
    "brand": "Apple",
    "price": 285000,
    "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "256GB"
    },
    "features": [],
    "stock": 20,
    "featured": false,
    "description": "A premium Apple iPhone 15 Pro Max offering the best performance."
  },
  {
    "id": "sma-0057",
    "name": "Galaxy S24 Ultra",
    "brand": "Samsung",
    "price": 310000,
    "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "256GB"
    },
    "features": [],
    "stock": 15,
    "featured": false,
    "description": "A premium Samsung Galaxy S24 Ultra offering the best performance."
  },
  {
    "id": "sma-0058",
    "name": "Pixel 8 Pro",
    "brand": "Google",
    "price": 235000,
    "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "128GB"
    },
    "features": [],
    "stock": 18,
    "featured": false,
    "description": "A premium Google Pixel 8 Pro offering the best performance."
  },
  {
    "id": "sma-0059",
    "name": "12 256GB",
    "brand": "OnePlus",
    "price": 195000,
    "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "256GB"
    },
    "features": [],
    "stock": 12,
    "featured": false,
    "description": "A premium OnePlus 12 256GB offering the best performance."
  },
  {
    "id": "sma-0060",
    "name": "14 Ultra",
    "brand": "Xiaomi",
    "price": 225000,
    "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "256GB"
    },
    "features": [],
    "stock": 8,
    "featured": false,
    "description": "A premium Xiaomi 14 Ultra offering the best performance."
  },
  {
    "id": "sma-0061",
    "name": "Phone (2)",
    "brand": "Nothing",
    "price": 145000,
    "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "256GB"
    },
    "features": [],
    "stock": 22,
    "featured": false,
    "description": "A premium Nothing Phone (2) offering the best performance."
  },
  {
    "id": "sma-0062",
    "name": "iPhone 15",
    "brand": "Apple",
    "price": 195000,
    "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "128GB"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium Apple iPhone 15 offering the best performance."
  },
  {
    "id": "sma-0063",
    "name": "Galaxy Z Fold 5",
    "brand": "Samsung",
    "price": 385000,
    "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "512GB"
    },
    "features": [],
    "stock": 10,
    "featured": false,
    "description": "A premium Samsung Galaxy Z Fold 5 offering the best performance."
  },
  {
    "id": "sma-0064",
    "name": "Galaxy A54 5G",
    "brand": "Samsung",
    "price": 98000,
    "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "128GB"
    },
    "features": [],
    "stock": 30,
    "featured": false,
    "description": "A premium Samsung Galaxy A54 5G offering the best performance."
  },
  {
    "id": "sma-0065",
    "name": "GT 5 Pro",
    "brand": "Realme",
    "price": 128000,
    "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
    "category": "smartphones",
    "specs": {
      "Storage": "256GB"
    },
    "features": [],
    "stock": 20,
    "featured": false,
    "description": "A premium Realme GT 5 Pro offering the best performance."
  },
  {
    "id": "acc-0066",
    "name": "WH-1000XM5",
    "brand": "Sony",
    "price": 79500,
    "image": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
    "category": "accessories",
    "specs": {
      "Type": "Over-ear"
    },
    "features": [],
    "stock": 35,
    "featured": false,
    "description": "A premium Sony WH-1000XM5 offering the best performance."
  },
  {
    "id": "acc-0067",
    "name": "Q1 Pro Keyboard",
    "brand": "Keychron",
    "price": 45000,
    "image": "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800",
    "category": "accessories",
    "specs": {
      "Layout": "75%"
    },
    "features": [],
    "stock": 30,
    "featured": false,
    "description": "A premium Keychron Q1 Pro Keyboard offering the best performance."
  },
  {
    "id": "acc-0068",
    "name": "AirPods Pro 2nd Gen",
    "brand": "Apple",
    "price": 69500,
    "image": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
    "category": "accessories",
    "specs": {
      "Type": "TWS"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium Apple AirPods Pro 2nd Gen offering the best performance."
  },
  {
    "id": "acc-0069",
    "name": "Galaxy Watch 6 Classic",
    "brand": "Samsung",
    "price": 55000,
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
    "category": "accessories",
    "specs": {
      "Size": "43mm"
    },
    "features": [],
    "stock": 20,
    "featured": false,
    "description": "A premium Samsung Galaxy Watch 6 Classic offering the best performance."
  },
  {
    "id": "acc-0070",
    "name": "737 GaN Charger 120W",
    "brand": "Anker",
    "price": 12500,
    "image": "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800",
    "category": "accessories",
    "specs": {
      "Power": "120W"
    },
    "features": [],
    "stock": 60,
    "featured": false,
    "description": "A premium Anker 737 GaN Charger 120W offering the best performance."
  },
  {
    "id": "acc-0071",
    "name": "Stream Deck MK.2",
    "brand": "Elgato",
    "price": 32000,
    "image": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
    "category": "accessories",
    "specs": {
      "Platform": "PC/Mac"
    },
    "features": [],
    "stock": 15,
    "featured": false,
    "description": "A premium Elgato Stream Deck MK.2 offering the best performance."
  },
  {
    "id": "acc-0072",
    "name": "Brio 4K Webcam",
    "brand": "Logitech",
    "price": 41000,
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
    "category": "accessories",
    "specs": {
      "Resolution": "4K"
    },
    "features": [],
    "stock": 12,
    "featured": false,
    "description": "A premium Logitech Brio 4K Webcam offering the best performance."
  },
  {
    "id": "acc-0073",
    "name": "Yeti X Microphone",
    "brand": "Blue",
    "price": 38000,
    "image": "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800",
    "category": "accessories",
    "specs": {
      "Pattern": "Multi"
    },
    "features": [],
    "stock": 18,
    "featured": false,
    "description": "A premium Blue Yeti X Microphone offering the best performance."
  },
  {
    "id": "acc-0074",
    "name": "PSA1 Boom Arm",
    "brand": "Rode",
    "price": 22000,
    "image": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
    "category": "accessories",
    "specs": {
      "Type": "Mount"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium Rode PSA1 Boom Arm offering the best performance."
  },
  {
    "id": "acc-0075",
    "name": "Drop XL Wireless Charger",
    "brand": "Native Union",
    "price": 18000,
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
    "category": "accessories",
    "specs": {
      "Power": "15W"
    },
    "features": [],
    "stock": 22,
    "featured": false,
    "description": "A premium Native Union Drop XL Wireless Charger offering the best performance."
  },
  {
    "id": "mon-0076",
    "name": "UltraGear 27\" OLED 240Hz",
    "brand": "LG",
    "price": 225000,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    "category": "monitors",
    "specs": {
      "Size": "27\"",
      "Panel": "OLED"
    },
    "features": [],
    "stock": 10,
    "featured": false,
    "description": "A premium LG UltraGear 27\" OLED 240Hz offering the best performance."
  },
  {
    "id": "mon-0077",
    "name": "Odyssey G9 49\" DQHD",
    "brand": "Samsung",
    "price": 295000,
    "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
    "category": "monitors",
    "specs": {
      "Size": "49\"",
      "Panel": "VA"
    },
    "features": [],
    "stock": 5,
    "featured": false,
    "description": "A premium Samsung Odyssey G9 49\" DQHD offering the best performance."
  },
  {
    "id": "mon-0078",
    "name": "UltraSharp 27\" 4K",
    "brand": "Dell",
    "price": 145000,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    "category": "monitors",
    "specs": {
      "Size": "27\"",
      "Panel": "IPS"
    },
    "features": [],
    "stock": 14,
    "featured": false,
    "description": "A premium Dell UltraSharp 27\" 4K offering the best performance."
  },
  {
    "id": "mon-0079",
    "name": "ROG Swift 32\" 4K",
    "brand": "ASUS",
    "price": 198000,
    "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
    "category": "monitors",
    "specs": {
      "Size": "32\"",
      "Panel": "Fast IPS"
    },
    "features": [],
    "stock": 8,
    "featured": false,
    "description": "A premium ASUS ROG Swift 32\" 4K offering the best performance."
  },
  {
    "id": "mon-0080",
    "name": "PD2705UA 27\" Creator",
    "brand": "BenQ",
    "price": 118000,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    "category": "monitors",
    "specs": {
      "Size": "27\"",
      "Panel": "IPS"
    },
    "features": [],
    "stock": 12,
    "featured": false,
    "description": "A premium BenQ PD2705UA 27\" Creator offering the best performance."
  },
  {
    "id": "mon-0081",
    "name": "MAG 274QRFDE 27\"",
    "brand": "MSI",
    "price": 88000,
    "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
    "category": "monitors",
    "specs": {
      "Size": "27\"",
      "Panel": "Rapid IPS"
    },
    "features": [],
    "stock": 16,
    "featured": false,
    "description": "A premium MSI MAG 274QRFDE 27\" offering the best performance."
  },
  {
    "id": "mon-0082",
    "name": "VX2479-HD-PRO 24\"",
    "brand": "ViewSonic",
    "price": 52000,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    "category": "monitors",
    "specs": {
      "Size": "24\"",
      "Panel": "IPS"
    },
    "features": [],
    "stock": 22,
    "featured": false,
    "description": "A premium ViewSonic VX2479-HD-PRO 24\" offering the best performance."
  },
  {
    "id": "mon-0083",
    "name": "Studio Display 27\"",
    "brand": "Apple",
    "price": 382000,
    "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
    "category": "monitors",
    "specs": {
      "Size": "27\"",
      "Panel": "IPS"
    },
    "features": [],
    "stock": 4,
    "featured": false,
    "description": "A premium Apple Studio Display 27\" offering the best performance."
  },
  {
    "id": "mon-0084",
    "name": "Predator X34 34\"",
    "brand": "Acer",
    "price": 175000,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    "category": "monitors",
    "specs": {
      "Size": "34\"",
      "Panel": "OLED"
    },
    "features": [],
    "stock": 9,
    "featured": false,
    "description": "A premium Acer Predator X34 34\" offering the best performance."
  },
  {
    "id": "mon-0085",
    "name": "M28U 28\" 4K",
    "brand": "Gigabyte",
    "price": 125000,
    "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
    "category": "monitors",
    "specs": {
      "Size": "28\"",
      "Panel": "IPS"
    },
    "features": [],
    "stock": 15,
    "featured": false,
    "description": "A premium Gigabyte M28U 28\" 4K offering the best performance."
  },
  {
    "id": "sto-0086",
    "name": "IronWolf 4TB NAS HDD",
    "brand": "Seagate",
    "price": 32000,
    "image": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800",
    "category": "storage",
    "specs": {
      "Capacity": "4TB",
      "Type": "HDD"
    },
    "features": [],
    "stock": 25,
    "featured": false,
    "description": "A premium Seagate IronWolf 4TB NAS HDD offering the best performance."
  },
  {
    "id": "sto-0087",
    "name": "Extreme Pro 2TB Portable",
    "brand": "SanDisk",
    "price": 42000,
    "image": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800",
    "category": "storage",
    "specs": {
      "Capacity": "2TB",
      "Type": "External SSD"
    },
    "features": [],
    "stock": 20,
    "featured": false,
    "description": "A premium SanDisk Extreme Pro 2TB Portable offering the best performance."
  },
  {
    "id": "sto-0088",
    "name": "X8 1TB Portable SSD",
    "brand": "Crucial",
    "price": 18500,
    "image": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800",
    "category": "storage",
    "specs": {
      "Capacity": "1TB",
      "Type": "External SSD"
    },
    "features": [],
    "stock": 35,
    "featured": false,
    "description": "A premium Crucial X8 1TB Portable SSD offering the best performance."
  },
  {
    "id": "sto-0089",
    "name": "ArmorATD 2TB Portable HDD",
    "brand": "G-Technology",
    "price": 28000,
    "image": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800",
    "category": "storage",
    "specs": {
      "Capacity": "2TB",
      "Type": "External HDD"
    },
    "features": [],
    "stock": 18,
    "featured": false,
    "description": "A premium G-Technology ArmorATD 2TB Portable HDD offering the best performance."
  },
  {
    "id": "sto-0090",
    "name": "T7 Shield 1TB Portable SSD",
    "brand": "Samsung",
    "price": 22000,
    "image": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800",
    "category": "storage",
    "specs": {
      "Capacity": "1TB",
      "Type": "External SSD"
    },
    "features": [],
    "stock": 28,
    "featured": false,
    "description": "A premium Samsung T7 Shield 1TB Portable SSD offering the best performance."
  },
  {
    "id": "sto-0091",
    "name": "My Passport 4TB",
    "brand": "Western Digital",
    "price": 26000,
    "image": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800",
    "category": "storage",
    "specs": {
      "Capacity": "4TB",
      "Type": "External HDD"
    },
    "features": [],
    "stock": 32,
    "featured": false,
    "description": "A premium Western Digital My Passport 4TB offering the best performance."
  },
  {
    "id": "sto-0092",
    "name": "Rugged Mini 2TB",
    "brand": "LaCie",
    "price": 24000,
    "image": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800",
    "category": "storage",
    "specs": {
      "Capacity": "2TB",
      "Type": "External HDD"
    },
    "features": [],
    "stock": 24,
    "featured": false,
    "description": "A premium LaCie Rugged Mini 2TB offering the best performance."
  },
  {
    "id": "sto-0093",
    "name": "XS2000 1TB Portable SSD",
    "brand": "Kingston",
    "price": 21000,
    "image": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800",
    "category": "storage",
    "specs": {
      "Capacity": "1TB",
      "Type": "External SSD"
    },
    "features": [],
    "stock": 26,
    "featured": false,
    "description": "A premium Kingston XS2000 1TB Portable SSD offering the best performance."
  },
  {
    "id": "gam-0094",
    "name": "PlayStation 5 Disc",
    "brand": "Sony",
    "price": 119000,
    "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800",
    "category": "gaming",
    "specs": {
      "Storage": "825GB"
    },
    "features": [],
    "stock": 12,
    "featured": false,
    "description": "A premium Sony PlayStation 5 Disc offering the best performance."
  },
  {
    "id": "gam-0095",
    "name": "Xbox Series X 1TB",
    "brand": "Microsoft",
    "price": 112000,
    "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800",
    "category": "gaming",
    "specs": {
      "Storage": "1TB"
    },
    "features": [],
    "stock": 10,
    "featured": false,
    "description": "A premium Microsoft Xbox Series X 1TB offering the best performance."
  },
  {
    "id": "gam-0096",
    "name": "Steam Deck OLED 512GB",
    "brand": "Valve",
    "price": 128000,
    "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800",
    "category": "gaming",
    "specs": {
      "Storage": "512GB"
    },
    "features": [],
    "stock": 8,
    "featured": false,
    "description": "A premium Valve Steam Deck OLED 512GB offering the best performance."
  },
  {
    "id": "gam-0097",
    "name": "Switch OLED",
    "brand": "Nintendo",
    "price": 68000,
    "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800",
    "category": "gaming",
    "specs": {
      "Storage": "64GB"
    },
    "features": [],
    "stock": 18,
    "featured": false,
    "description": "A premium Nintendo Switch OLED offering the best performance."
  },
  {
    "id": "gam-0098",
    "name": "DeathAdder V3 Pro",
    "brand": "Razer",
    "price": 18500,
    "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800",
    "category": "gaming",
    "specs": {
      "Sensor": "30K DPI"
    },
    "features": [],
    "stock": 30,
    "featured": false,
    "description": "A premium Razer DeathAdder V3 Pro offering the best performance."
  },
  {
    "id": "gam-0099",
    "name": "Arctis Nova Pro Wireless",
    "brand": "SteelSeries",
    "price": 48000,
    "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800",
    "category": "gaming",
    "specs": {
      "Type": "Headset"
    },
    "features": [],
    "stock": 15,
    "featured": false,
    "description": "A premium SteelSeries Arctis Nova Pro Wireless offering the best performance."
  },
  {
    "id": "gam-00100",
    "name": "G Pro X Superlight",
    "brand": "Logitech",
    "price": 24000,
    "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800",
    "category": "gaming",
    "specs": {
      "Weight": "63g"
    },
    "features": [],
    "stock": 40,
    "featured": false,
    "description": "A premium Logitech G Pro X Superlight offering the best performance."
  }
];

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

  // Delete existing data first. neq('id', '') matches all rows (Supabase delete
  // requires a filter clause as a safety guard).
  await supabase.from('OrderItem').delete().neq('id', '');
  await supabase.from('Order').delete().neq('id', '');
  await supabase.from('Review').delete().neq('id', '');
  await supabase.from('Product').delete().neq('id', '');
  console.log('🗑️ Cleared existing data');

  let count = 0;
  for (const product of productsToSeed) {
    const { error } = await supabase.from('Product').insert(product as any);
    if (error) die(`Failed to insert product ${(product as any).id}:`, error);
    count++;
  }
  console.log('✅ Created ' + count + ' products');

  // ─── PC components. processors, motherboards, GPUs, RAM, storage,
  //     coolers, PSUs, cases. These power both the Shop filter sidebar
  //     and the Custom Build configurator. Categories/subcategories
  //     match the slugs the frontend filters on. ──────────────────────
  const componentProducts = [
    // ── PROCESSORS ────────────────────────────────────────────────
    { id: 'cpu-001', name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', price: 165000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'components', subcategory: 'processor', stock: 12, featured: true, description: '8-core / 16-thread Zen 4 gaming CPU with 3D V-Cache for top-tier FPS.', specs: { Cores: '8', Threads: '16', 'Base Clock': '4.2 GHz', 'Boost Clock': '5.0 GHz', Socket: 'AM5', TDP: '120W' } },
    { id: 'cpu-002', name: 'AMD Ryzen 9 7950X', brand: 'AMD', price: 215000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'components', subcategory: 'processor', stock: 8, featured: true, description: '16-core / 32-thread workstation flagship for content creation and gaming.', specs: { Cores: '16', Threads: '32', 'Base Clock': '4.5 GHz', 'Boost Clock': '5.7 GHz', Socket: 'AM5', TDP: '170W' } },
    { id: 'cpu-003', name: 'AMD Ryzen 5 7600X', brand: 'AMD', price: 78000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'components', subcategory: 'processor', stock: 22, featured: false, description: '6-core / 12-thread mainstream Zen 4 chip for crisp 1080p / 1440p gaming.', specs: { Cores: '6', Threads: '12', 'Base Clock': '4.7 GHz', 'Boost Clock': '5.3 GHz', Socket: 'AM5', TDP: '105W' } },
    { id: 'cpu-004', name: 'Intel Core i9-14900K', brand: 'Intel', price: 245000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'components', subcategory: 'processor', stock: 10, featured: true, description: '24-core hybrid (8P+16E) flagship desktop CPU on LGA1700.', specs: { Cores: '24', Threads: '32', 'Base Clock': '3.2 GHz', 'Boost Clock': '6.0 GHz', Socket: 'LGA1700', TDP: '125W' } },
    { id: 'cpu-005', name: 'Intel Core i7-14700K', brand: 'Intel', price: 175000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'components', subcategory: 'processor', stock: 14, featured: true, description: '20-core hybrid (8P+12E), excellent value for serious gamers and creators.', specs: { Cores: '20', Threads: '28', 'Base Clock': '3.4 GHz', 'Boost Clock': '5.6 GHz', Socket: 'LGA1700', TDP: '125W' } },
    { id: 'cpu-006', name: 'Intel Core i5-14600K', brand: 'Intel', price: 102000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'components', subcategory: 'processor', stock: 20, featured: false, description: '14-core mid-range CPU, an ideal sweet spot for high-refresh gaming.', specs: { Cores: '14', Threads: '20', 'Base Clock': '3.5 GHz', 'Boost Clock': '5.3 GHz', Socket: 'LGA1700', TDP: '125W' } },

    // ── MOTHERBOARDS ──────────────────────────────────────────────
    { id: 'mb-001', name: 'ASUS ROG STRIX B650-A Gaming WiFi', brand: 'ASUS', price: 78000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', category: 'components', subcategory: 'motherboard', stock: 14, featured: true, description: 'AM5 ATX board with DDR5, PCIe 5.0 M.2 and Wi-Fi 6E.', specs: { Socket: 'AM5', Chipset: 'B650', 'Form Factor': 'ATX', Memory: 'DDR5', 'M.2 Slots': '3' } },
    { id: 'mb-002', name: 'MSI MAG Z790 Tomahawk WiFi', brand: 'MSI', price: 92000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', category: 'components', subcategory: 'motherboard', stock: 10, featured: true, description: 'LGA1700 ATX with DDR5, robust VRM, dual 2.5G LAN and Wi-Fi 6E.', specs: { Socket: 'LGA1700', Chipset: 'Z790', 'Form Factor': 'ATX', Memory: 'DDR5', 'M.2 Slots': '4' } },
    { id: 'mb-003', name: 'Gigabyte AORUS B650 Elite AX', brand: 'Gigabyte', price: 72000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', category: 'components', subcategory: 'motherboard', stock: 16, featured: false, description: 'Affordable AM5 board with onboard Wi-Fi and PCIe 5.0 storage.', specs: { Socket: 'AM5', Chipset: 'B650', 'Form Factor': 'ATX', Memory: 'DDR5' } },
    { id: 'mb-004', name: 'ASUS TUF Gaming X670E-Plus', brand: 'ASUS', price: 115000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', category: 'components', subcategory: 'motherboard', stock: 8, featured: false, description: 'High-end AM5 platform with full PCIe 5.0 across CPU + storage.', specs: { Socket: 'AM5', Chipset: 'X670E', 'Form Factor': 'ATX', Memory: 'DDR5' } },

    // ── GRAPHICS CARDS (also visible in Shop > Graphics Cards) ────
    { id: 'gpu-101', name: 'NVIDIA GeForce RTX 4070 Super', brand: 'NVIDIA', price: 195000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'graphics-cards', subcategory: 'gpu', stock: 9, featured: true, description: '12GB GDDR6X graphics card with excellent 1440p performance and DLSS 3.', specs: { Memory: '12GB GDDR6X', Chipset: 'RTX 4070 Super', 'Boost Clock': '2475 MHz', 'Power Connector': '1× 16-pin' }, gpuMemory: 12, gpuChipset: 'RTX 4070 Super' },
    { id: 'gpu-102', name: 'NVIDIA GeForce RTX 4080 Super', brand: 'NVIDIA', price: 360000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'graphics-cards', subcategory: 'gpu', stock: 6, featured: true, description: '16GB GDDR6X high-end GPU built for 4K gaming and creator workloads.', specs: { Memory: '16GB GDDR6X', Chipset: 'RTX 4080 Super', 'Boost Clock': '2550 MHz' }, gpuMemory: 16, gpuChipset: 'RTX 4080 Super' },
    { id: 'gpu-103', name: 'AMD Radeon RX 7900 XT', brand: 'AMD', price: 285000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'graphics-cards', subcategory: 'gpu', stock: 5, featured: false, description: '20GB GDDR6. RDNA 3 high-performance GPU for high-refresh 1440p / 4K.', specs: { Memory: '20GB GDDR6', Chipset: 'RX 7900 XT' }, gpuMemory: 20, gpuChipset: 'RX 7900 XT' },
    { id: 'gpu-104', name: 'NVIDIA GeForce RTX 4060 Ti 16GB', brand: 'NVIDIA', price: 145000, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'graphics-cards', subcategory: 'gpu', stock: 12, featured: false, description: '16GB GDDR6 mainstream GPU with solid 1080p / 1440p frame generation.', specs: { Memory: '16GB GDDR6', Chipset: 'RTX 4060 Ti' }, gpuMemory: 16, gpuChipset: 'RTX 4060 Ti' },

    // ── RAM (laptop-accessories > ram) ────────────────────────────
    { id: 'ram-101', name: 'Corsair Vengeance 32GB DDR5-6000', brand: 'Corsair', price: 28000, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', category: 'laptop-accessories', subcategory: 'ram', stock: 30, featured: true, description: '2×16GB DDR5 6000MT/s, a sweet spot for AM5 and LGA1700 builds.', specs: { Capacity: '32GB (2×16)', Type: 'DDR5', Speed: '6000 MT/s', Latency: 'CL30' }, ramType: 'DDR5', ramSpeed: 6000, ramCapacity: 32 },
    { id: 'ram-102', name: 'G.Skill Trident Z5 32GB DDR5-6400', brand: 'G.Skill', price: 34000, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', category: 'laptop-accessories', subcategory: 'ram', stock: 20, featured: false, description: 'Premium DDR5 with low CL32 latency for enthusiast builds.', specs: { Capacity: '32GB (2×16)', Type: 'DDR5', Speed: '6400 MT/s', Latency: 'CL32' }, ramType: 'DDR5', ramSpeed: 6400, ramCapacity: 32 },
    { id: 'ram-103', name: 'Kingston Fury Beast 16GB DDR4-3200', brand: 'Kingston', price: 12500, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', category: 'laptop-accessories', subcategory: 'ram', stock: 50, featured: false, description: '2×8GB DDR4, a reliable budget upgrade for older boards.', specs: { Capacity: '16GB (2×8)', Type: 'DDR4', Speed: '3200 MHz' }, ramType: 'DDR4', ramSpeed: 3200, ramCapacity: 16 },
    { id: 'ram-104', name: 'G.Skill Ripjaws S5 64GB DDR5-5600', brand: 'G.Skill', price: 56000, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', category: 'laptop-accessories', subcategory: 'ram', stock: 14, featured: false, description: '2×32GB DDR5, content-creation grade memory.', specs: { Capacity: '64GB (2×32)', Type: 'DDR5', Speed: '5600 MT/s' }, ramType: 'DDR5', ramSpeed: 5600, ramCapacity: 64 },

    // ── STORAGE / SSDs ────────────────────────────────────────────
    { id: 'ssd-101', name: 'Samsung 990 Pro 1TB NVMe', brand: 'Samsung', price: 32000, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80', category: 'storage', subcategory: 'ssd', stock: 28, featured: true, description: 'Top-tier PCIe 4.0 NVMe SSD with up to 7,450 MB/s sequential read.', specs: { Capacity: '1TB', Type: 'NVMe', Interface: 'PCIe 4.0', Read: '7450 MB/s' }, ssdType: 'NVMe', ssdCapacity: 1024 },
    { id: 'ssd-102', name: 'WD Black SN850X 2TB NVMe', brand: 'Western Digital', price: 58000, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80', category: 'storage', subcategory: 'ssd', stock: 18, featured: true, description: 'Gen4 NVMe SSD tuned for gaming with DirectStorage support.', specs: { Capacity: '2TB', Type: 'NVMe', Interface: 'PCIe 4.0', Read: '7300 MB/s' }, ssdType: 'NVMe', ssdCapacity: 2048 },
    { id: 'ssd-103', name: 'Crucial T700 1TB PCIe 5.0', brand: 'Crucial', price: 48000, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80', category: 'storage', subcategory: 'ssd', stock: 10, featured: false, description: 'Cutting-edge PCIe 5.0 NVMe SSD with up to 11,700 MB/s read.', specs: { Capacity: '1TB', Type: 'NVMe', Interface: 'PCIe 5.0', Read: '11700 MB/s' }, ssdType: 'NVMe', ssdCapacity: 1024 },
    { id: 'ssd-104', name: 'Samsung 870 EVO 1TB SATA', brand: 'Samsung', price: 22000, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80', category: 'storage', subcategory: 'ssd', stock: 35, featured: false, description: '2.5-inch SATA SSD, perfect drop-in upgrade for laptops and desktops.', specs: { Capacity: '1TB', Type: 'SATA', Interface: 'SATA III', Read: '560 MB/s' }, ssdType: 'SATA', ssdCapacity: 1024 },

    // ── COOLERS (laptop-accessories > cooling-pad) ────────────────
    { id: 'cool-101', name: 'Cooler Master Hyper 212 Black Edition', brand: 'Cooler Master', price: 12000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'laptop-accessories', subcategory: 'cooling-pad', stock: 30, featured: true, description: 'Reliable single-tower air cooler with great value.', specs: { Type: 'Air', 'Fan Size': '120mm', Sockets: 'AM5/AM4/LGA1700/1200' } },
    { id: 'cool-102', name: 'Noctua NH-D15', brand: 'Noctua', price: 38000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'laptop-accessories', subcategory: 'cooling-pad', stock: 14, featured: true, description: 'Dual-tower premium air cooler with performance close to 240mm AIOs.', specs: { Type: 'Air', 'Fan Size': '2× 140mm', Sockets: 'AM5/AM4/LGA1700/1200' } },
    { id: 'cool-103', name: 'Arctic Liquid Freezer III 360', brand: 'Arctic', price: 42000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'laptop-accessories', subcategory: 'cooling-pad', stock: 12, featured: false, description: '360mm AIO liquid cooler with VRM fan and exceptional thermal headroom.', specs: { Type: 'AIO', 'Radiator Size': '360mm' } },
    { id: 'cool-104', name: 'NZXT Kraken X63 RGB', brand: 'NZXT', price: 56000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'laptop-accessories', subcategory: 'cooling-pad', stock: 9, featured: false, description: '280mm AIO with infinity-mirror display.', specs: { Type: 'AIO', 'Radiator Size': '280mm' } },

    // ── LAPTOP BATTERIES ──────────────────────────────────────────
    { id: 'bat-101', name: 'Dell Inspiron 15 Replacement Battery', brand: 'Dell', price: 9500, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'laptop-accessories', subcategory: 'battery', stock: 18, featured: true, description: 'Compatible replacement battery for selected Dell Inspiron 15 models.', specs: { Compatibility: 'Dell Inspiron 15', Capacity: '42Wh', Warranty: '6 months' } },
    { id: 'bat-102', name: 'HP Pavilion 14 Replacement Battery', brand: 'HP', price: 10500, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'laptop-accessories', subcategory: 'battery', stock: 14, featured: false, description: 'Reliable laptop battery for selected HP Pavilion 14 models.', specs: { Compatibility: 'HP Pavilion 14', Capacity: '41Wh', Warranty: '6 months' } },
    { id: 'bat-103', name: 'Lenovo ThinkPad T Series Battery', brand: 'Lenovo', price: 12500, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'laptop-accessories', subcategory: 'battery', stock: 10, featured: false, description: 'Replacement battery for selected Lenovo ThinkPad T series laptops.', specs: { Compatibility: 'Lenovo ThinkPad T Series', Capacity: '48Wh', Warranty: '6 months' } },
    { id: 'bat-104', name: 'ASUS VivoBook Replacement Battery', brand: 'ASUS', price: 11500, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', category: 'laptop-accessories', subcategory: 'battery', stock: 12, featured: false, description: 'Replacement laptop battery for selected ASUS VivoBook models.', specs: { Compatibility: 'ASUS VivoBook', Capacity: '37Wh', Warranty: '6 months' } },

    // ── POWER SUPPLIES ────────────────────────────────────────────
    { id: 'psu-101', name: 'Corsair RM850x 850W 80+ Gold', brand: 'Corsair', price: 48000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'components', subcategory: 'psu', stock: 18, featured: true, description: 'Fully modular ATX PSU with quiet, efficient power and a 10-year warranty.', specs: { Wattage: '850W', Rating: '80+ Gold', Modularity: 'Fully Modular' } },
    { id: 'psu-102', name: 'ASUS ROG Strix 1000W 80+ Platinum', brand: 'ASUS', price: 78000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'components', subcategory: 'psu', stock: 8, featured: true, description: 'High-efficiency 1000W PSU with native ATX 3.0 / 12VHPWR cable.', specs: { Wattage: '1000W', Rating: '80+ Platinum', Modularity: 'Fully Modular' } },
    { id: 'psu-103', name: 'Cooler Master MWE 750 V2', brand: 'Cooler Master', price: 28000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'components', subcategory: 'psu', stock: 22, featured: false, description: 'Dependable 750W bronze-rated PSU for mainstream builds.', specs: { Wattage: '750W', Rating: '80+ Bronze', Modularity: 'Non-modular' } },
    { id: 'psu-104', name: 'EVGA SuperNOVA 850 GA', brand: 'EVGA', price: 52000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'components', subcategory: 'psu', stock: 12, featured: false, description: '850W gold-rated, fully modular, 10-year warranty.', specs: { Wattage: '850W', Rating: '80+ Gold', Modularity: 'Fully Modular' } },

    // ── CASES (also visible in Shop subcategory "cases") ──────────
    { id: 'case-101', name: 'Lian Li Lancool 216', brand: 'Lian Li', price: 38000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'components', subcategory: 'case', stock: 20, featured: true, description: 'Mid-tower with mesh front, pre-installed with 3 high-airflow fans.', specs: { 'Form Factor': 'ATX', 'Pre-installed Fans': '3', 'Front IO': 'USB-C' } },
    { id: 'case-102', name: 'NZXT H7 Flow', brand: 'NZXT', price: 45000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'components', subcategory: 'case', stock: 15, featured: true, description: 'Airflow-focused mid-tower with sleek minimal design.', specs: { 'Form Factor': 'ATX', 'Front IO': 'USB-C' } },
    { id: 'case-103', name: 'Corsair 4000D Airflow', brand: 'Corsair', price: 32000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'components', subcategory: 'case', stock: 24, featured: false, description: 'High-airflow ATX mid-tower, a community favorite for value builds.', specs: { 'Form Factor': 'ATX' } },
    { id: 'case-104', name: 'Fractal Design North', brand: 'Fractal Design', price: 56000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', category: 'components', subcategory: 'case', stock: 10, featured: false, description: 'Premium wood-accent ATX case, handsome on the desk.', specs: { 'Form Factor': 'ATX' } },

    // ── ACCESSORIES. keyboards, mice, audio, cables, displays ────
    // (these populate the Shop filter sidebar subcategory chips)
    { id: 'acc-kb-001', name: 'Logitech G Pro X TKL Keyboard', brand: 'Logitech', price: 32000, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', category: 'accessories', subcategory: 'keyboard', stock: 18, featured: true, description: 'Tournament-grade tenkeyless mechanical keyboard with Lightspeed wireless.', specs: { Switches: 'GX Tactile', Layout: 'TKL', Connection: 'Wireless' } },
    { id: 'acc-kb-002', name: 'Keychron Q1 Pro', brand: 'Keychron', price: 48000, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', category: 'accessories', subcategory: 'keyboard', stock: 12, featured: false, description: 'Premium aluminum 75% mechanical keyboard, hot-swappable, QMK/VIA.', specs: { Switches: 'Hot-swap', Layout: '75%' } },
    { id: 'acc-mouse-001', name: 'Logitech G Pro X Superlight', brand: 'Logitech', price: 24000, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', category: 'accessories', subcategory: 'mouse', stock: 24, featured: true, description: 'Ultra-light 63g esports wireless mouse with HERO 25K sensor.', specs: { Sensor: 'HERO 25K', Weight: '63g', Connection: 'Wireless' } },
    { id: 'acc-mouse-002', name: 'Razer DeathAdder V3 Pro', brand: 'Razer', price: 18500, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', category: 'accessories', subcategory: 'mouse', stock: 30, featured: false, description: 'Ergonomic wireless gaming mouse with Focus Pro 30K sensor.', specs: { Sensor: 'Focus Pro 30K', Weight: '63g' } },
    { id: 'acc-aud-001', name: 'SteelSeries Arctis Nova Pro Wireless', brand: 'SteelSeries', price: 48000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', category: 'accessories', subcategory: 'audio', stock: 14, featured: true, description: 'Premium wireless gaming headset with hot-swap battery & active noise cancellation.', specs: { Driver: '40mm', 'Battery Life': '36h' } },
    { id: 'acc-aud-002', name: 'Sony WH-1000XM5', brand: 'Sony', price: 92000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', category: 'accessories', subcategory: 'audio', stock: 8, featured: false, description: 'Class-leading wireless ANC headphones for music & calls.', specs: { ANC: 'Yes', 'Battery Life': '30h' } },
    { id: 'acc-cab-001', name: 'Anker USB-C Cable 2m (100W)', brand: 'Anker', price: 3500, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80', category: 'accessories', subcategory: 'cable', stock: 80, featured: false, description: 'Braided 2m USB-C to USB-C cable supporting 100W PD and 480 Mbps.', specs: { Length: '2m', Power: '100W' } },
    { id: 'acc-cab-002', name: 'UGREEN HDMI 2.1 Cable 2m', brand: 'UGREEN', price: 4500, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80', category: 'accessories', subcategory: 'cable', stock: 60, featured: false, description: '8K @ 60Hz HDMI 2.1 cable, perfect for the latest GPUs and consoles.', specs: { Length: '2m', Spec: 'HDMI 2.1' } },
    { id: 'acc-disp-001', name: 'LG UltraGear 27GP850-B 27" QHD 180Hz', brand: 'LG', price: 145000, image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80', category: 'monitors', subcategory: 'display', stock: 9, featured: true, description: '27-inch 1440p Nano IPS gaming monitor with 1ms response time.', specs: { Size: '27"', Resolution: 'QHD 2560×1440', Refresh: '180Hz', Panel: 'IPS' }, displaySize: 27, displayRes: 'QHD', displayType: 'IPS' },
    { id: 'acc-disp-002', name: 'Samsung Odyssey G7 32" QHD 240Hz', brand: 'Samsung', price: 195000, image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80', category: 'monitors', subcategory: 'display', stock: 6, featured: true, description: '32-inch curved QHD VA gaming monitor with 240Hz / 1ms.', specs: { Size: '32"', Resolution: 'QHD 2560×1440', Refresh: '240Hz', Panel: 'VA' }, displaySize: 32, displayRes: 'QHD', displayType: 'VA' },
    { id: 'acc-cases-001', name: 'STM Dux Laptop Sleeve 14"', brand: 'STM', price: 8500, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', category: 'accessories', subcategory: 'cases', stock: 40, featured: false, description: 'Rugged 14-inch laptop sleeve with shock-absorbing edges.', specs: { Size: '14"', Material: 'Polycarbonate' } },
    { id: 'acc-cases-002', name: 'Targus CityGear 15.6" Backpack', brand: 'Targus', price: 12500, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', category: 'accessories', subcategory: 'cases', stock: 35, featured: false, description: 'Padded 15.6-inch laptop backpack with TSA-friendly layout.', specs: { Size: '15.6"', Type: 'Backpack' } },
  ];

  for (const c of componentProducts) {
    const { error } = await supabase.from('Product').insert({
      id: c.id,
      name: c.name,
      description: c.description,
      price: c.price,
      category: c.category,
      subcategory: c.subcategory,
      image: c.image,
      images: JSON.stringify([c.image]),
      stock: c.stock,
      featured: c.featured,
      brand: c.brand,
      sku: 'RAN-' + c.id.toUpperCase(),
      specs: JSON.stringify(c.specs || {}),
      features: JSON.stringify([]),
      ramType: (c as any).ramType ?? null,
      ramSpeed: (c as any).ramSpeed ?? null,
      ramCapacity: (c as any).ramCapacity ?? null,
      ssdType: (c as any).ssdType ?? null,
      ssdCapacity: (c as any).ssdCapacity ?? null,
      gpuMemory: (c as any).gpuMemory ?? null,
      gpuChipset: (c as any).gpuChipset ?? null,
      displaySize: (c as any).displaySize ?? null,
      displayRes: (c as any).displayRes ?? null,
      displayType: (c as any).displayType ?? null,
      isService: false,
    });
    if (error) die(`Failed to insert component ${c.id}:`, error);
  }
  console.log('✅ Created ' + componentProducts.length + ' components & accessories');

  // Reviews
  const reviews = [
    { productId: rawProducts[0].id, userName: 'John D.', rating: 5, comment: 'Incredible performance!' },
    { productId: rawProducts[1].id, userName: 'Sarah M.', rating: 5, comment: 'Great for gaming.' },
    { productId: rawProducts[80].id, userName: 'Mike R.', rating: 4, comment: 'Beautiful display.' },
  ];

  for (const review of reviews) {
    const { error } = await supabase.from('Review').insert(review);
    if (error) die('Failed to insert product review:', error);
  }
  console.log('✅ Created ' + reviews.length + ' reviews');

  // ─── Repair services (Product rows with isService=true) ───
  const serviceItems = [
    // REPAIR
    { id: 'svc-001', name: 'Laptop Screen Replacement', serviceType: 'repair', price: 8500, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1600&q=80', description: 'Genuine LCD/LED panel replacement for all major laptop brands with full warranty.', featured: true },
    { id: 'svc-002', name: 'Battery Replacement', serviceType: 'repair', price: 9500, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600&q=80', description: 'Genuine battery replacement for laptops with health check and calibration.', featured: true },
    { id: 'svc-003', name: 'Motherboard Diagnostics & Repair', serviceType: 'repair', price: 12000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80', description: 'Component-level motherboard repair with chip-level diagnosis, BGA reflow, and capacitor replacement.', featured: true },
    { id: 'svc-004', name: 'Charging Port Repair', serviceType: 'repair', price: 4500, image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=1600&q=80', description: 'Repair or replace damaged DC jacks and USB-C charging ports.', featured: false },
    { id: 'svc-005', name: 'Laptop Keyboard Replacement', serviceType: 'repair', price: 6500, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600&q=80', description: 'Full laptop keyboard replacement with original or premium aftermarket parts.', featured: false },
    { id: 'svc-006', name: 'Phone Screen Repair', serviceType: 'repair', price: 7500, image: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=1600&q=80', description: 'Smartphone screen repair for all major brands with same-day service available.', featured: true },
    { id: 'svc-007', name: 'Monitor Repair', serviceType: 'repair', price: 5500, image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1600&q=80', description: 'Dead pixels, backlight failures, and power issues fixed by certified technicians.', featured: false },
    { id: 'svc-008', name: 'Power Supply Repair', serviceType: 'repair', price: 6000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80', description: 'Desktop PSU diagnosis and replacement with quality power supplies.', featured: false },

    // UPGRADE
    { id: 'svc-101', name: 'RAM Upgrade', serviceType: 'upgrade', price: 4000, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1600&q=80', description: 'Boost performance with DDR4/DDR5 RAM upgrade. Compatibility check included.', featured: true },
    { id: 'svc-102', name: 'SSD Upgrade', serviceType: 'upgrade', price: 7500, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1600&q=80', description: 'Replace HDD with fast NVMe / SATA SSD. Includes data migration.', featured: true },
    { id: 'svc-103', name: 'Cooling Upgrade', serviceType: 'upgrade', price: 3500, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80', description: 'Better thermal management with premium thermal paste, new pads, and fan replacement.', featured: true },
    { id: 'svc-104', name: 'GPU Upgrade Consultation', serviceType: 'upgrade', price: 2500, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600&q=80', description: 'Honest GPU upgrade advice with PSU and case compatibility check.', featured: false },
    { id: 'svc-105', name: 'Custom PC Build', serviceType: 'upgrade', price: 15000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80', description: 'Complete custom PC building with cable management and stress testing.', featured: false },

    // MAINTENANCE
    { id: 'svc-201', name: 'Deep Cleaning Service', serviceType: 'maintenance', price: 3500, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600&q=80', description: 'Full disassembly, dust removal, thermal pad replacement, and reassembly.', featured: false },
    { id: 'svc-202', name: 'Software Optimization', serviceType: 'maintenance', price: 2500, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80', description: 'Bloatware removal, fresh OS install, driver updates, and tune-up.', featured: false },
    { id: 'svc-203', name: 'Boot / Startup Issue Fix', serviceType: 'maintenance', price: 4500, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80', description: 'Diagnose and fix BSOD, boot loops, and startup repair issues.', featured: false },
    { id: 'svc-204', name: 'Driver & Firmware Update', serviceType: 'maintenance', price: 2500, image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80', description: 'Update all drivers, BIOS/UEFI firmware to the latest stable versions.', featured: false },
    { id: 'svc-205', name: 'Desktop PC Tune-Up', serviceType: 'maintenance', price: 4000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80', description: 'Internal cleaning, cable management, fan check, and software optimization.', featured: false },

    // DATA
    { id: 'svc-301', name: 'Data Recovery', serviceType: 'data', price: 8500, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1600&q=80', description: 'Recover lost files from failed drives, formatted partitions, or damaged storage.', featured: false },
    { id: 'svc-302', name: 'Accidental File Deletion Recovery', serviceType: 'data', price: 5000, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80', description: 'Recover accidentally deleted or formatted files using professional tools.', featured: false },
    { id: 'svc-303', name: 'Data Migration', serviceType: 'data', price: 3500, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1600&q=80', description: 'Seamless data migration between drives, devices, or cloud platforms.', featured: false },
  ];

  for (const s of serviceItems) {
    const { error } = await supabase.from('Product').insert({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      category: 'services',
      subcategory: s.serviceType,
      image: s.image,
      images: JSON.stringify([s.image]),
      stock: 999,
      featured: s.featured,
      sku: 'RAN-' + s.id.toUpperCase(),
      specs: JSON.stringify({}),
      features: JSON.stringify([]),
      isService: true,
      serviceType: s.serviceType,
    });
    if (error) die(`Failed to insert service ${s.id}:`, error);
  }
  console.log('✅ Created ' + serviceItems.length + ' repair services');

  // ─── Repair reviews. local Sri Lankan customers around Wellawaya / Monaragala ───
  await supabase.from('RepairReview').delete().neq('id', '');
  const repairReviews = [
    {
      serviceType: 'repair',
      serviceName: 'Laptop Screen Replacement',
      userName: 'Chamara Bandara (Monaragala)',
      rating: 5,
      comment: 'Replaced my Dell Inspiron screen the same day. Fair price, original part, very professional service. Best in Monaragala area.',
    },
    {
      serviceType: 'upgrade',
      serviceName: 'RAM Upgrade',
      userName: 'Nadeeka Perera (Wellawaya)',
      rating: 5,
      comment: 'Upgraded my ASUS VivoBook RAM from 8GB to 16GB. Drove from Wellawaya, totally worth the trip. Laptop runs like new now.',
    },
    {
      serviceType: 'repair',
      serviceName: 'Cooling System Service',
      userName: 'Pradeep Kumara (Buttala)',
      rating: 5,
      comment: 'My ROG Strix was overheating badly. They cleaned the fans, repasted the CPU/GPU. Temperatures dropped 20°C. Excellent work.',
    },
    {
      serviceType: 'upgrade',
      serviceName: 'SSD Upgrade',
      userName: 'Sanduni Jayawardena (Monaragala)',
      rating: 5,
      comment: 'NVMe SSD upgrade on my HP Pavilion. Boots in 8 seconds now. Staff explained everything clearly. Highly recommended!',
    },
    {
      serviceType: 'repair',
      serviceName: 'Motherboard Repair',
      userName: 'Ruwan Dissanayake (Wellawaya)',
      rating: 5,
      comment: 'My Lenovo ThinkPad motherboard was dead. Three other shops in Badulla refused. RAN diagnosed and repaired it. Saved me Rs. 80,000.',
    },
    {
      serviceType: 'repair',
      serviceName: 'Battery Replacement',
      userName: 'Asanka Weerasinghe (Bibile)',
      rating: 5,
      comment: 'Genuine battery for my MacBook Air. Now lasts the full work day. Came from Bibile and got it done in 2 hours.',
    },
    {
      serviceType: 'repair',
      serviceName: 'Phone Screen Repair',
      userName: 'Kavindi Senanayake (Monaragala)',
      rating: 4,
      comment: 'Fixed my Samsung A54 cracked screen perfectly. Price was reasonable compared to Colombo. Would recommend to anyone.',
    },
    {
      serviceType: 'maintenance',
      serviceName: 'Deep Cleaning Service',
      userName: 'Tharindu Rathnayake (Kataragama)',
      rating: 5,
      comment: 'Deep cleaned my 4-year-old gaming laptop. Removed years of dust, replaced thermal pads. Much quieter and cooler now.',
    },
    {
      serviceType: 'data',
      serviceName: 'Data Recovery',
      userName: 'Hasini Fernando (Wellawaya)',
      rating: 5,
      comment: 'Recovered all my university project files from a dead hard drive. Thought everything was lost. Cannot thank them enough!',
    },
    {
      serviceType: 'upgrade',
      serviceName: 'Custom PC Build',
      userName: 'Dinuka Madushanka (Monaragala)',
      rating: 5,
      comment: 'Built a complete gaming PC for me. RTX 4060, Ryzen 5. Cable management is beautiful. No need to go to Colombo for builds anymore.',
    },
    {
      serviceType: 'repair',
      serviceName: 'Charging Port Repair',
      userName: 'Sachini Liyanage (Siyambalanduwa)',
      rating: 5,
      comment: 'My HP laptop charging port was loose. Fixed properly with original part. Very honest and skilled technicians.',
    },
    {
      serviceType: 'upgrade',
      serviceName: 'GPU Upgrade Consultation',
      userName: 'Janith Wickramasinghe (Wellawaya)',
      rating: 4,
      comment: 'Helped me upgrade my desktop GPU. Gave honest advice instead of pushing the most expensive option. Trustworthy.',
    },
    {
      serviceType: 'repair',
      serviceName: 'Keyboard Replacement',
      userName: 'Nimali Gunawardena (Buttala)',
      rating: 5,
      comment: 'Replaced damaged keys on my Acer laptop. Quick service and the new keyboard feels great. Coming back for any future issues.',
    },
    {
      serviceType: 'maintenance',
      serviceName: 'Software Optimization',
      userName: 'Kasun Hettiarachchi (Monaragala)',
      rating: 5,
      comment: 'Cleaned up my old laptop, removed bloatware, fresh Windows install. Feels brand new again. Excellent value for money.',
    },
    {
      serviceType: 'repair',
      serviceName: 'Power Supply Repair',
      userName: 'Lakshan Ratnayake (Wellawaya)',
      rating: 5,
      comment: 'Desktop PSU died during a power surge. They diagnosed and replaced it same day. Genuine parts, honest pricing.',
    },
  ];

  for (const review of repairReviews) {
    const { error } = await supabase.from('RepairReview').insert(review);
    if (error) die('Failed to insert repair review:', error);
  }
  console.log('✅ Created ' + repairReviews.length + ' repair reviews (Sri Lanka)');
}

main()
  .then(() => {
    console.log('🎉 Seed complete.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
