/**
 * 添加测试装备到背包
 * 用于测试装备系统
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addTestItems() {
  console.log('🎁 开始添加测试装备...')

  // 测试玩家 1
  const character1 = await prisma.character.findUnique({
    where: { id: '1fc5bfa9-a54b-406c-abaa-adb032a3f59a' },
    include: { inventory: true }
  })

  if (!character1) {
    console.error('❌ 测试玩家 1 不存在')
    return
  }

  console.log(`📦 玩家 1 当前背包物品：${character1.inventory.length}`)

  // 测试装备列表
  const testItems = [
    { itemId: 'sword_001', quantity: 1, slot: 'main_hand' },
    { itemId: 'shield_001', quantity: 1, slot: 'off_hand' },
    { itemId: 'chest_001', quantity: 1, slot: 'chest' },
    { itemId: 'legs_001', quantity: 1, slot: 'legs' },
    { itemId: 'boots_001', quantity: 1, slot: 'boots' },
    { itemId: 'accessory_001', quantity: 1, slot: 'accessory' },
    { itemId: 'potion_hp_001', quantity: 10 },
    { itemId: 'potion_mp_001', quantity: 10 },
  ]

  let added = 0
  for (const itemData of testItems) {
    try {
      const existing = character1.inventory.find(
        inv => inv.itemId === itemData.itemId
      )

      if (existing) {
        console.log(`⏭️  物品 ${itemData.itemId} 已存在，跳过`)
        continue
      }

      await prisma.inventoryItem.create({
        data: {
          characterId: character1.id,
          itemId: itemData.itemId,
          quantity: itemData.quantity || 1,
          slot: itemData.slot || null,
          durability: 100,
        }
      })

      console.log(`✅ 添加 ${itemData.itemId} ×${itemData.quantity}`)
      added++
    } catch (error) {
      console.error(`❌ 添加 ${itemData.itemId} 失败:`, error.message)
    }
  }

  console.log(`\n🎉 成功添加 ${added} 件新物品到玩家 1 背包`)

  // 测试玩家 2
  const character2 = await prisma.character.findUnique({
    where: { id: 'd066765f-7f8a-4c00-a72f-0a29113a843b' },
    include: { inventory: true }
  })

  if (character2) {
    console.log(`\n📦 玩家 2 当前背包物品：${character2.inventory.length}`)
    
    for (const itemData of testItems) {
      try {
        const existing = character2.inventory.find(
          inv => inv.itemId === itemData.itemId
        )

        if (existing) continue

        await prisma.inventoryItem.create({
          data: {
            characterId: character2.id,
            itemId: itemData.itemId,
            quantity: itemData.quantity || 1,
            slot: itemData.slot || null,
            durability: 100,
          }
        })

        console.log(`✅ 添加 ${itemData.itemId} ×${itemData.quantity} 到玩家 2`)
      } catch (error) {
        console.error(`❌ 添加 ${itemData.itemId} 失败:`, error.message)
      }
    }
  }

  console.log('\n✅ 测试装备添加完成！')
}

addTestItems()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
