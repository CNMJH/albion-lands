-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PartyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partyId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartyMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PartyMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PartyMember" ("characterId", "id", "joinedAt", "partyId", "role") SELECT "characterId", "id", "joinedAt", "partyId", "role" FROM "PartyMember";
DROP TABLE "PartyMember";
ALTER TABLE "new_PartyMember" RENAME TO "PartyMember";
CREATE UNIQUE INDEX "PartyMember_partyId_characterId_key" ON "PartyMember"("partyId", "characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
