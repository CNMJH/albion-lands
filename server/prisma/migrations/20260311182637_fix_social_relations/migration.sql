-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT,
    "partyId" TEXT,
    "zoneId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChatMessage" ("content", "createdAt", "id", "partyId", "receiverId", "senderId", "type", "zoneId") SELECT "content", "createdAt", "id", "partyId", "receiverId", "senderId", "type", "zoneId" FROM "ChatMessage";
DROP TABLE "ChatMessage";
ALTER TABLE "new_ChatMessage" RENAME TO "ChatMessage";
CREATE TABLE "new_Friend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Friend" ("createdAt", "friendId", "id", "status", "userId") SELECT "createdAt", "friendId", "id", "status", "userId" FROM "Friend";
DROP TABLE "Friend";
ALTER TABLE "new_Friend" RENAME TO "Friend";
CREATE UNIQUE INDEX "Friend_userId_friendId_key" ON "Friend"("userId", "friendId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
