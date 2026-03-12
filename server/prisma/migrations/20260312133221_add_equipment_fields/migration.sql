-- AlterTable
ALTER TABLE "Character" ADD COLUMN "stats" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "stats" TEXT,
    "slot" TEXT,
    "equipmentType" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "stackSize" INTEGER NOT NULL DEFAULT 99,
    "basePrice" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'T1',
    "quality" TEXT NOT NULL DEFAULT 'Common',
    "specialEffect" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Item" ("basePrice", "createdAt", "description", "icon", "id", "minLevel", "name", "rarity", "slot", "stackSize", "stats", "type") SELECT "basePrice", "createdAt", "description", "icon", "id", "minLevel", "name", "rarity", "slot", "stackSize", "stats", "type" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
