const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔧 给测试玩家添加大喇叭道具...\n')

  // 查找所有测试角色
  const testChars = await prisma.character.findMany({
    where: {
      name: {
        contains: '测试玩家',
      },
    },
  })

  if (testChars.length === 0) {
    console.log('⚠️  未找到测试角色')
    return
  }

  console.log(`找到 ${testChars.length} 个测试角色\n`)

  for (const char of testChars) {
    console.log(`处理角色：${char.name} (${char.id})`)

    // 检查是否已有大喇叭
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        characterId: char.id,
        itemId: 'world_horn',
      },
    })

    if (existing) {
      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + 10 },
      })
      console.log(`  ✅ 已有大喇叭，增加到 ${existing.quantity + 10} 个`)
    } else {
      await prisma.inventoryItem.create({
        data: {
          characterId: char.id,
          itemId: 'world_horn',
          quantity: 10,
        },
      })
      console.log(`  ✅ 给予 10 个大喇叭`)
    }
  }

  console.log('\n🎉 完成！')
}

main()
  .catch((e) => {
    console.error('❌ 失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
