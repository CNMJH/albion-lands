-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weaponType" TEXT NOT NULL,
    "damageMultiplier" REAL,
    "healAmount" INTEGER,
    "cooldown" INTEGER NOT NULL,
    "energyCost" INTEGER NOT NULL,
    "range" INTEGER NOT NULL,
    "duration" INTEGER,
    "radius" INTEGER,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "slot" INTEGER NOT NULL DEFAULT -1,
    "cooldownUntil" DATETIME,
    CONSTRAINT "CharacterSkill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CharacterSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'main',
    "level" INTEGER NOT NULL DEFAULT 1,
    "difficulty" TEXT NOT NULL DEFAULT 'normal',
    "category" TEXT,
    "objectives" TEXT,
    "prerequisites" TEXT,
    "expReward" INTEGER NOT NULL DEFAULT 0,
    "silverReward" INTEGER NOT NULL DEFAULT 0,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "itemRewards" TEXT,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "repeatCooldown" INTEGER NOT NULL DEFAULT 0,
    "timeLimit" INTEGER,
    "giverId" TEXT,
    "receiverId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quest_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "NPC" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "NPC" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Quest" ("category", "createdAt", "description", "difficulty", "expReward", "giverId", "goldReward", "id", "isRepeatable", "itemRewards", "level", "name", "objectives", "prerequisites", "receiverId", "repeatCooldown", "silverReward", "timeLimit", "type", "updatedAt") SELECT "category", "createdAt", "description", "difficulty", "expReward", "giverId", "goldReward", "id", "isRepeatable", "itemRewards", "level", "name", "objectives", "prerequisites", "receiverId", "repeatCooldown", "silverReward", "timeLimit", "type", "updatedAt" FROM "Quest";
DROP TABLE "Quest";
ALTER TABLE "new_Quest" RENAME TO "Quest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Skill_weaponType_idx" ON "Skill"("weaponType");

-- CreateIndex
CREATE INDEX "Skill_type_idx" ON "Skill"("type");

-- CreateIndex
CREATE INDEX "CharacterSkill_characterId_idx" ON "CharacterSkill"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSkill_skillId_idx" ON "CharacterSkill"("skillId");

-- CreateIndex
CREATE INDEX "CharacterSkill_slot_idx" ON "CharacterSkill"("slot");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSkill_characterId_skillId_key" ON "CharacterSkill"("characterId", "skillId");
