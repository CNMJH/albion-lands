/*
  Warnings:

  - You are about to drop the column `userId` on the `Friend` table. All the data in the column will be lost.
  - Added the required column `characterId` to the `Friend` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Friend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Friend_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Friend" ("createdAt", "friendId", "id", "status") SELECT "createdAt", "friendId", "id", "status" FROM "Friend";
DROP TABLE "Friend";
ALTER TABLE "new_Friend" RENAME TO "Friend";
CREATE UNIQUE INDEX "Friend_characterId_friendId_key" ON "Friend"("characterId", "friendId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
