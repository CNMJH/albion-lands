-- DropIndex
DROP INDEX "CharacterSkill_slot_idx";

-- DropIndex
DROP INDEX "CharacterSkill_skillId_idx";

-- CreateTable
CREATE TABLE "PVPStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "honorPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PVPStats_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerKill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "killerId" TEXT NOT NULL,
    "victimId" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerKill_killerId_fkey" FOREIGN KEY ("killerId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerKill_victimId_fkey" FOREIGN KEY ("victimId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PVPStats_characterId_key" ON "PVPStats"("characterId");

-- CreateIndex
CREATE INDEX "PlayerKill_killerId_idx" ON "PlayerKill"("killerId");

-- CreateIndex
CREATE INDEX "PlayerKill_victimId_idx" ON "PlayerKill"("victimId");

-- CreateIndex
CREATE INDEX "PlayerKill_timestamp_idx" ON "PlayerKill"("timestamp");
