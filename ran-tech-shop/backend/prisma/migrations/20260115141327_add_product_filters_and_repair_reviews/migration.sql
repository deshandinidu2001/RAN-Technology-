-- CreateTable
CREATE TABLE "RepairReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "image" TEXT NOT NULL,
    "images" TEXT,
    "stock" INTEGER NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "brand" TEXT,
    "sku" TEXT,
    "specs" TEXT,
    "features" TEXT,
    "ramType" TEXT,
    "ramSpeed" INTEGER,
    "ramCapacity" INTEGER,
    "ssdType" TEXT,
    "ssdCapacity" INTEGER,
    "ssdSpeed" INTEGER,
    "gpuMemory" INTEGER,
    "gpuChipset" TEXT,
    "displaySize" REAL,
    "displayRes" TEXT,
    "displayType" TEXT,
    "compatibility" TEXT,
    "isService" BOOLEAN NOT NULL DEFAULT false,
    "serviceType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("brand", "category", "createdAt", "description", "featured", "features", "id", "image", "images", "name", "price", "sku", "specs", "stock", "updatedAt") SELECT "brand", "category", "createdAt", "description", "featured", "features", "id", "image", "images", "name", "price", "sku", "specs", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_RepairBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "deviceType" TEXT,
    "services" TEXT,
    "products" TEXT,
    "totalAmount" REAL,
    "issueDescription" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "estimatedCost" REAL,
    "actualCost" REAL,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_RepairBooking" ("actualCost", "completedAt", "createdAt", "customerEmail", "customerName", "customerPhone", "date", "deviceType", "estimatedCost", "id", "issueDescription", "notes", "status", "timeSlot", "updatedAt") SELECT "actualCost", "completedAt", "createdAt", "customerEmail", "customerName", "customerPhone", "date", "deviceType", "estimatedCost", "id", "issueDescription", "notes", "status", "timeSlot", "updatedAt" FROM "RepairBooking";
DROP TABLE "RepairBooking";
ALTER TABLE "new_RepairBooking" RENAME TO "RepairBooking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
