// 手动创建 BankItem 表（临时方案，直到 Prisma 迁移正常工作）
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('创建 BankItem 表...')
  
  try {
    // 尝试查询 BankItem，如果表不存在会抛出错误
    await prisma.$queryRaw`SELECT 1 FROM BankItem LIMIT 1`
    console.log('✅ BankItem 表已存在')
  } catch (error) {
    console.log('⚠️ BankItem 表不存在，尝试创建...')
    
    // 使用 db push 创建表
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BankItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "characterId" TEXT NOT NULL,
        "itemId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BankItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "BankItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    
    console.log('✅ BankItem 表创建成功')
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
