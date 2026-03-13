-- CreateTable
CREATE TABLE "GameMap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "safetyLevel" INTEGER NOT NULL DEFAULT 5,
    "type" TEXT NOT NULL DEFAULT 'open_world',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 100,
    "width" INTEGER NOT NULL DEFAULT 1000,
    "height" INTEGER NOT NULL DEFAULT 1000,
    "resources" TEXT,
    "monsters" TEXT,
    "npcs" TEXT,
    "portals" TEXT,
    "bgm" TEXT,
    "tileTexture" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeathRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "killerId" TEXT,
    "mapId" TEXT NOT NULL,
    "safetyLevel" INTEGER NOT NULL,
    "droppedItems" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeathRecord_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeathRecord_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "GameMap" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DeathRecord" ("characterId", "createdAt", "droppedItems", "id", "killerId", "mapId", "safetyLevel") SELECT "characterId", "createdAt", "droppedItems", "id", "killerId", "mapId", "safetyLevel" FROM "DeathRecord";
DROP TABLE "DeathRecord";
ALTER TABLE "new_DeathRecord" RENAME TO "DeathRecord";
CREATE TABLE "new_DroppedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mapId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "itemId" TEXT NOT NULL,
    "ownerId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "expireAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DroppedItem_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "GameMap" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DroppedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DroppedItem" ("createdAt", "expireAt", "id", "itemId", "mapId", "ownerId", "quantity", "x", "y") SELECT "createdAt", "expireAt", "id", "itemId", "mapId", "ownerId", "quantity", "x", "y" FROM "DroppedItem";
DROP TABLE "DroppedItem";
ALTER TABLE "new_DroppedItem" RENAME TO "DroppedItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "GameMap_safetyLevel_idx" ON "GameMap"("safetyLevel");

-- CreateIndex
CREATE INDEX "GameMap_type_idx" ON "GameMap"("type");
