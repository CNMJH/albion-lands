-- CreateTable
CREATE TABLE "NPC" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'quest',
    "zoneId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "dialogue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Quest" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NPCQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "npcId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'give',
    CONSTRAINT "NPCQuest_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPC" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NPCQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "progress" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "failedAt" DATETIME,
    "abandonedAt" DATETIME,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedAt" DATETIME,
    CONSTRAINT "QuestProgress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestProgress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'daily',
    "pool" TEXT,
    "refreshTime" TEXT NOT NULL DEFAULT '00:00',
    "expReward" INTEGER NOT NULL DEFAULT 0,
    "silverReward" INTEGER NOT NULL DEFAULT 0,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "itemRewards" TEXT,
    "maxPerDay" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetCount" INTEGER NOT NULL DEFAULT 1,
    "expReward" INTEGER NOT NULL DEFAULT 0,
    "silverReward" INTEGER NOT NULL DEFAULT 0,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "badge" TEXT,
    "prerequisites" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AchievementProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AchievementProgress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AchievementProgress_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "NPCQuest_npcId_idx" ON "NPCQuest"("npcId");

-- CreateIndex
CREATE INDEX "NPCQuest_questId_idx" ON "NPCQuest"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "NPCQuest_npcId_questId_key" ON "NPCQuest"("npcId", "questId");

-- CreateIndex
CREATE INDEX "QuestProgress_characterId_idx" ON "QuestProgress"("characterId");

-- CreateIndex
CREATE INDEX "QuestProgress_questId_idx" ON "QuestProgress"("questId");

-- CreateIndex
CREATE INDEX "QuestProgress_status_idx" ON "QuestProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "QuestProgress_characterId_questId_key" ON "QuestProgress"("characterId", "questId");

-- CreateIndex
CREATE INDEX "DailyQuest_type_idx" ON "DailyQuest"("type");

-- CreateIndex
CREATE INDEX "DailyQuest_pool_idx" ON "DailyQuest"("pool");

-- CreateIndex
CREATE INDEX "Achievement_category_idx" ON "Achievement"("category");

-- CreateIndex
CREATE INDEX "Achievement_type_idx" ON "Achievement"("type");

-- CreateIndex
CREATE INDEX "AchievementProgress_characterId_idx" ON "AchievementProgress"("characterId");

-- CreateIndex
CREATE INDEX "AchievementProgress_achievementId_idx" ON "AchievementProgress"("achievementId");

-- CreateIndex
CREATE INDEX "AchievementProgress_completed_idx" ON "AchievementProgress"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementProgress_characterId_achievementId_key" ON "AchievementProgress"("characterId", "achievementId");
