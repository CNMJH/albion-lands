-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT,
    "partyId" TEXT,
    "zoneId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Friend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Friend" ("createdAt", "friendId", "id", "userId") SELECT "createdAt", "friendId", "id", "userId" FROM "Friend";
DROP TABLE "Friend";
ALTER TABLE "new_Friend" RENAME TO "Friend";
CREATE UNIQUE INDEX "Friend_userId_friendId_key" ON "Friend"("userId", "friendId");
CREATE TABLE "new_Party" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaderId" TEXT NOT NULL,
    "name" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 3,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Party" ("createdAt", "id", "leaderId", "updatedAt") SELECT "createdAt", "id", "leaderId", "updatedAt" FROM "Party";
DROP TABLE "Party";
ALTER TABLE "new_Party" RENAME TO "Party";
CREATE TABLE "new_PartyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partyId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartyMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PartyMember" ("characterId", "id", "joinedAt", "partyId", "role") SELECT "characterId", "id", "joinedAt", "partyId", "role" FROM "PartyMember";
DROP TABLE "PartyMember";
ALTER TABLE "new_PartyMember" RENAME TO "PartyMember";
CREATE UNIQUE INDEX "PartyMember_partyId_characterId_key" ON "PartyMember"("partyId", "characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
