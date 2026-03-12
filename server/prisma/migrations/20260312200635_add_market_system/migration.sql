/*
  Warnings:

  - Added the required column `expiresAt` to the `MarketOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TransactionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionHistory_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MarketOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SELL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MarketOrder_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketOrder_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MarketOrder" ("createdAt", "id", "itemId", "quantity", "sellerId", "status", "unitPrice", "updatedAt") SELECT "createdAt", "id", "itemId", "quantity", "sellerId", "status", "unitPrice", "updatedAt" FROM "MarketOrder";
DROP TABLE "MarketOrder";
ALTER TABLE "new_MarketOrder" RENAME TO "MarketOrder";
CREATE INDEX "MarketOrder_sellerId_idx" ON "MarketOrder"("sellerId");
CREATE INDEX "MarketOrder_itemId_idx" ON "MarketOrder"("itemId");
CREATE INDEX "MarketOrder_status_idx" ON "MarketOrder"("status");
CREATE INDEX "MarketOrder_type_idx" ON "MarketOrder"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TransactionHistory_orderId_idx" ON "TransactionHistory"("orderId");

-- CreateIndex
CREATE INDEX "TransactionHistory_buyerId_idx" ON "TransactionHistory"("buyerId");

-- CreateIndex
CREATE INDEX "TransactionHistory_sellerId_idx" ON "TransactionHistory"("sellerId");

-- CreateIndex
CREATE INDEX "TransactionHistory_createdAt_idx" ON "TransactionHistory"("createdAt");
