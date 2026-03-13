/**
 * 给所有角色添加新手装备
 * 运行：node server/scripts/give-starter-items.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function giveStarterItems() {
  try {
    console.log('🔍 查询所有角色...')
    const characters = await prisma.character.findMany()
    console.log(`找到 ${characters.length} 个角色`)

    for (const character of characters) {
      console.log(`\n📦 为角色 "${character.name}" 添加新手装备...`)

      // 检查是否已有装备
      const existingItems = await prisma.inventoryItem.findMany({
        where: { characterId: character.id },
      })

      if (existingItems.length > 0) {
        console.log(`  ⚠️  该角色已有 ${existingItems.length} 件物品，跳过`)
        continue
      }

      // 新手装备列表
      const starterItems = [
        { name: '新手剑', type: 'Weapon', slot: 'MainHand', tier: 1, rarity: 'Common', attack: 5, price: 10 },
        { name: '新手盾', type: 'Weapon', slot: 'OffHand', tier: 1, rarity: 'Common', defense: 3, price: 10 },
        { name: '新手胸甲', type: 'Armor', slot: 'Armor', tier: 1, rarity: 'Common', defense: 5, price: 15 },
        { name: '新手护腿', type: 'Armor', slot: 'Legs', tier: 1, rarity: 'Common', defense: 3, price: 10 },
        { name: '新手靴子', type: 'Armor', slot: 'Boots', tier: 1, rarity: 'Common', defense: 2, price: 8 },
        { name: '新手项链', type: 'Accessory', slot: 'Accessory', tier: 1, rarity: 'Common', hp: 10, price: 12 },
        { name: '治疗药水', type: 'Consumable', stack: 10, price: 5 },
        { name: '法力药水', type: 'Consumable', stack: 10, price: 5 },
      ]

      let addedCount = 0
      for (const itemData of starterItems) {
        // 创建物品模板（如果不存在）
        let item = await prisma.item.findFirst({
          where: { name: itemData.name },
        })

        if (!item) {
          item = await prisma.item.create({
            data: {
              name: itemData.name,
              type: itemData.type,
              slot: itemData.slot || null,
              tier: itemData.tier || 1,
              rarity: itemData.rarity || 'Common',
              price: itemData.price || 10,
              maxStackSize: itemData.stack || 1,
              stats: {
                attack: itemData.attack || 0,
                defense: itemData.defense || 0,
                hp: itemData.hp || 0,
              },
              description: `新手装备：${itemData.name}`,
            },
          })
          console.log(`  ✅ 创建物品模板：${itemData.name}`)
        }

        // 添加到角色背包
        await prisma.inventoryItem.create({
          data: {
            characterId: character.id,
            itemId: item.id,
            quantity: itemData.stack || 1,
            slot: addedCount,
          },
        })
        console.log(`  ✅ 添加：${itemData.name}`)
        addedCount++
      }

      console.log(`✅ 角色 "${character.name}" 获得 ${addedCount} 件新手装备`)
    }

    console.log('\n✨ 所有角色新手装备发放完成！')
  } catch (error) {
    console.error('❌ 错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

giveStarterItems()
