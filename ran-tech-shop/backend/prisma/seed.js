"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    // Create demo user
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
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
//# sourceMappingURL=seed.js.map