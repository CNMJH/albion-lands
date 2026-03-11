// 呼噜大陆 - 初始数据种子脚本（SQLite 版本）
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始播种初始数据...')

  // 1. 创建 5 个区域
  console.log('📍 创建区域...')
  const zones = await Promise.all([
    prisma.zone.create({
      data: {
        id: 'zone_1',
        name: '新手村庄',
        safetyLevel: 10,
        minLevel: 1,
        maxLevel: 10,
        pvpEnabled: false,
        portals: JSON.stringify([{ toZoneId: 'zone_2', x: 500, y: 0 }]),
      },
    }),
    prisma.zone.create({
      data: {
        id: 'zone_2',
        name: '平原旷野',
        safetyLevel: 8,
        minLevel: 10,
        maxLevel: 25,
        pvpEnabled: false,
        portals: JSON.stringify([
          { toZoneId: 'zone_1', x: 0, y: 0 },
          { toZoneId: 'zone_3', x: 500, y: 500 }
        ]),
      },
    }),
    prisma.zone.create({
      data: {
        id: 'zone_3',
        name: '迷雾森林',
        safetyLevel: 4,
        minLevel: 25,
        maxLevel: 40,
        pvpEnabled: true,
        portals: JSON.stringify([
          { toZoneId: 'zone_2', x: 0, y: 0 },
          { toZoneId: 'zone_4', x: 500, y: 500 }
        ]),
      },
    }),
    prisma.zone.create({
      data: {
        id: 'zone_4',
        name: '巨龙山脉',
        safetyLevel: 2,
        minLevel: 40,
        maxLevel: 60,
        pvpEnabled: true,
        portals: JSON.stringify([
          { toZoneId: 'zone_3', x: 0, y: 0 },
          { toZoneId: 'zone_5', x: 500, y: 500 }
        ]),
      },
    }),
    prisma.zone.create({
      data: {
        id: 'zone_5',
        name: '深渊遗迹',
        safetyLevel: 0,
        minLevel: 60,
        maxLevel: 80,
        pvpEnabled: true,
        portals: JSON.stringify([{ toZoneId: 'zone_4', x: 0, y: 0 }]),
      },
    }),
  ])
  console.log(`✅ 创建 ${zones.length} 个区域`)

  // 2. 创建基础物品
  console.log('🎒 创建基础物品...')
  const items = await Promise.all([
    prisma.item.create({
      data: { id: 'item_sword_t1', name: '铜剑', type: 'Weapon', rarity: 'Common', slot: 'MainHand', minLevel: 1, basePrice: 50, stats: JSON.stringify({ attack: 5 }) },
    }),
    prisma.item.create({
      data: { id: 'item_axe_t1', name: '铜斧', type: 'Weapon', rarity: 'Common', slot: 'MainHand', minLevel: 1, basePrice: 50, stats: JSON.stringify({ attack: 7 }) },
    }),
    prisma.item.create({
      data: { id: 'item_staff_t1', name: '橡木法杖', type: 'Weapon', rarity: 'Common', slot: 'MainHand', minLevel: 1, basePrice: 50, stats: JSON.stringify({ magic: 8 }) },
    }),
    prisma.item.create({
      data: { id: 'item_bow_t1', name: '木弓', type: 'Weapon', rarity: 'Common', slot: 'MainHand', minLevel: 1, basePrice: 50, stats: JSON.stringify({ attack: 6, range: 10 }) },
    }),
    prisma.item.create({
      data: { id: 'item_cloth_armor_t1', name: '布甲', type: 'Armor', rarity: 'Common', slot: 'Armor', minLevel: 1, basePrice: 40, stats: JSON.stringify({ defense: 3, magicDefense: 5 }) },
    }),
    prisma.item.create({
      data: { id: 'item_leather_armor_t1', name: '皮甲', type: 'Armor', rarity: 'Common', slot: 'Armor', minLevel: 1, basePrice: 40, stats: JSON.stringify({ defense: 5, critRate: 0.02 }) },
    }),
    prisma.item.create({
      data: { id: 'item_plate_armor_t1', name: '板甲', type: 'Armor', rarity: 'Common', slot: 'Armor', minLevel: 1, basePrice: 40, stats: JSON.stringify({ defense: 8, hp: 20 }) },
    }),
    prisma.item.create({
      data: { id: 'mat_copper_ore', name: '铜矿石', type: 'Material', rarity: 'Common', basePrice: 5, stackSize: 99 },
    }),
    prisma.item.create({
      data: { id: 'mat_wood', name: '橡木', type: 'Material', rarity: 'Common', basePrice: 5, stackSize: 99 },
    }),
    prisma.item.create({
      data: { id: 'mat_cotton', name: '棉花', type: 'Material', rarity: 'Common', basePrice: 5, stackSize: 99 },
    }),
    prisma.item.create({
      data: { id: 'cons_health_potion', name: '生命药水', type: 'Consumable', rarity: 'Common', basePrice: 10, stackSize: 99, stats: JSON.stringify({ healing: 50 }) },
    }),
    prisma.item.create({
      data: { id: 'cons_mana_potion', name: '魔力药水', type: 'Consumable', rarity: 'Common', basePrice: 10, stackSize: 99, stats: JSON.stringify({ mana: 30 }) },
    }),
    prisma.item.create({
      data: { id: 'tool_pickaxe', name: '镐', type: 'Tool', rarity: 'Common', basePrice: 20, stats: JSON.stringify({ miningSpeed: 1 }) },
    }),
    prisma.item.create({
      data: { id: 'tool_axe', name: '斧', type: 'Tool', rarity: 'Common', basePrice: 20, stats: JSON.stringify({ choppingSpeed: 1 }) },
    }),
    prisma.item.create({
      data: { id: 'tool_sickle', name: '镰刀', type: 'Tool', rarity: 'Common', basePrice: 20, stats: JSON.stringify({ gatheringSpeed: 1 }) },
    }),
  ])
  console.log(`✅ 创建 ${items.length} 个物品`)

  // 3. 创建测试用户
  console.log('👤 创建测试用户...')
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'password123',
      character: {
        create: {
          name: '测试角色',
          level: 10,
          exp: 1000,
          silver: 1000,
          gold: 100,
          zoneId: 'zone_1',
          x: 100,
          y: 100,
          equipment: JSON.stringify({
            mainHand: 'item_sword_t1',
            armor: 'item_plate_armor_t1',
          }),
        },
      },
    },
    include: {
      character: true,
    },
  })
  console.log(`✅ 创建测试用户：${testUser.email}`)
  console.log(`   角色名：${testUser.character?.name}`)
  console.log(`   等级：${testUser.character?.level}`)

  console.log('')
  console.log('🎉 播种完成！')
  console.log('')
  console.log('📊 数据统计:')
  console.log(`   - 区域：5 个`)
  console.log(`   - 物品：${items.length} 个`)
  console.log(`   - 测试用户：1 个`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
