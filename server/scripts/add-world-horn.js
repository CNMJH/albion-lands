const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔧 添加大喇叭道具...')

  // 添加大喇叭物品
  const horn = await prisma.item.upsert({
    where: { id: 'world_horn' },
    update: {},
    create: {
      id: 'world_horn',
      name: '大喇叭',
      type: 'Consumable',
      rarity: 'Common',
      basePrice: 100,
      stackSize: 99,
      stats: JSON.stringify({ effect: 'global_chat', cooldown: 10 }),
    },
  })
  console.log(`✅ 大喇叭已添加：${horn.name}`)

  // 给测试角色添加 10 个大喇叭
  const testChar = await prisma.character.findFirst({
    where: { name: '测试角色' },
  })

  if (testChar) {
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        characterId: testChar.id,
        itemId: 'world_horn',
      },
    })

    if (existing) {
      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + 10 },
      })
      console.log(`✅ 测试角色已有大喇叭，增加到 ${existing.quantity + 10} 个`)
    } else {
      await prisma.inventoryItem.create({
        data: {
          characterId: testChar.id,
          itemId: 'world_horn',
          quantity: 10,
        },
      })
      console.log(`✅ 给予测试角色 10 个大喇叭`)
    }
  } else {
    console.log('⚠️  未找到测试角色')
  }

  console.log('🎉 完成！')
}

main()
  .catch((e) => {
    console.error('❌ 失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
