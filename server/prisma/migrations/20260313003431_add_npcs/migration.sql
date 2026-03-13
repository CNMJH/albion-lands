-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NPC" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'quest',
    "zoneId" TEXT NOT NULL,
    "mapId" TEXT,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "dialogue" TEXT,
    "shopItems" TEXT,
    "quests" TEXT,
    "sprite" TEXT,
    "scale" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NPC" ("createdAt", "dialogue", "id", "name", "type", "updatedAt", "x", "y", "zoneId") SELECT "createdAt", "dialogue", "id", "name", "type", "updatedAt", "x", "y", "zoneId" FROM "NPC";
DROP TABLE "NPC";
ALTER TABLE "new_NPC" RENAME TO "NPC";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
