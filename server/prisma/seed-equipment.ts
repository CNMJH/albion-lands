import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 装备数据种子
 * 创建 T1-T5 各等级装备示例
 */

interface ItemData {
  name: string
  type: string
  equipmentType: string
  slot: string
  tier: string
  quality: string
  minLevel: number
  stats: Record<string, number>
  basePrice: number
  description: string
}

const items: ItemData[] = [
  // ==================== T1 新手装备 ====================
  // T1 武器
  {
    name: '铜剑',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T1',
    quality: 'Common',
    minLevel: 1,
    stats: { attack: 10, attackSpeed: 1.0 },
    basePrice: 50,
    description: '新手用的铜剑，略微锋利'
  },
  {
    name: '铜斧',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T1',
    quality: 'Common',
    minLevel: 1,
    stats: { attack: 12, attackSpeed: 0.9 },
    basePrice: 55,
    description: '沉重的铜斧，伤害较高但攻速慢'
  },
  {
    name: '木盾',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'OffHand',
    tier: 'T1',
    quality: 'Common',
    minLevel: 1,
    stats: { defense: 5, hp: 20 },
    basePrice: 40,
    description: '简易的木制盾牌'
  },

  // T1 防具
  {
    name: '布衣',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Armor',
    tier: 'T1',
    quality: 'Common',
    minLevel: 1,
    stats: { defense: 5, hp: 20 },
    basePrice: 40,
    description: '粗糙的布制衣服'
  },
  {
    name: '布裤',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Legs',
    tier: 'T1',
    quality: 'Common',
    minLevel: 1,
    stats: { defense: 3, hp: 15 },
    basePrice: 30,
    description: '粗糙的布制裤子'
  },
  {
    name: '布鞋',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Boots',
    tier: 'T1',
    quality: 'Common',
    minLevel: 1,
    stats: { defense: 2, hp: 10, moveSpeed: 5 },
    basePrice: 25,
    description: '粗糙的布制鞋子'
  },

  // ==================== T2 入门装备 ====================
  // T2 武器
  {
    name: '铁剑',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T2',
    quality: 'Common',
    minLevel: 6,
    stats: { attack: 25, attackSpeed: 1.0 },
    basePrice: 150,
    description: '普通的铁剑'
  },
  {
    name: '铁斧',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T2',
    quality: 'Common',
    minLevel: 6,
    stats: { attack: 30, attackSpeed: 0.9 },
    basePrice: 160,
    description: '沉重的铁斧'
  },
  {
    name: '铁盾',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'OffHand',
    tier: 'T2',
    quality: 'Common',
    minLevel: 6,
    stats: { defense: 12, hp: 50 },
    basePrice: 120,
    description: '坚固的铁盾'
  },

  // T2 防具
  {
    name: '皮甲',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Armor',
    tier: 'T2',
    quality: 'Common',
    minLevel: 6,
    stats: { defense: 12, hp: 50 },
    basePrice: 120,
    description: '皮革制成的护甲'
  },
  {
    name: '皮裤',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Legs',
    tier: 'T2',
    quality: 'Common',
    minLevel: 6,
    stats: { defense: 8, hp: 35 },
    basePrice: 90,
    description: '皮革制成的裤子'
  },
  {
    name: '皮鞋',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Boots',
    tier: 'T2',
    quality: 'Common',
    minLevel: 6,
    stats: { defense: 5, hp: 25, moveSpeed: 10 },
    basePrice: 70,
    description: '皮革制成的鞋子'
  },

  // ==================== T3 进阶装备 ====================
  // T3 武器
  {
    name: '钢剑',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T3',
    quality: 'Common',
    minLevel: 16,
    stats: { attack: 50, attackSpeed: 1.0 },
    basePrice: 500,
    description: '精钢打造的利剑'
  },
  {
    name: '钢斧',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T3',
    quality: 'Common',
    minLevel: 16,
    stats: { attack: 60, attackSpeed: 0.9 },
    basePrice: 520,
    description: '沉重的钢斧'
  },
  {
    name: '骑士盾',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'OffHand',
    tier: 'T3',
    quality: 'Uncommon',
    minLevel: 16,
    stats: { defense: 30, hp: 120 },
    basePrice: 800,
    description: '骑士专用的盾牌'
  },

  // T3 防具
  {
    name: '锁甲',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Armor',
    tier: 'T3',
    quality: 'Common',
    minLevel: 16,
    stats: { defense: 30, hp: 120 },
    basePrice: 600,
    description: '锁子甲，提供良好的保护'
  },
  {
    name: '锁甲裤',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Legs',
    tier: 'T3',
    quality: 'Common',
    minLevel: 16,
    stats: { defense: 20, hp: 80 },
    basePrice: 450,
    description: '锁子甲裤子'
  },
  {
    name: '锁甲鞋',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Boots',
    tier: 'T3',
    quality: 'Common',
    minLevel: 16,
    stats: { defense: 12, hp: 50, moveSpeed: 15 },
    basePrice: 350,
    description: '锁子甲鞋子'
  },

  // ==================== T4 专家装备 ====================
  // T4 武器
  {
    name: '秘银剑',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T4',
    quality: 'Common',
    minLevel: 26,
    stats: { attack: 75, attackSpeed: 1.0 },
    basePrice: 1500,
    description: '秘银打造的轻盈利剑'
  },
  {
    name: '秘银斧',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T4',
    quality: 'Common',
    minLevel: 26,
    stats: { attack: 90, attackSpeed: 0.9 },
    basePrice: 1600,
    description: '沉重的秘银巨斧'
  },
  {
    name: '守护者之盾',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'OffHand',
    tier: 'T4',
    quality: 'Uncommon',
    minLevel: 26,
    stats: { defense: 50, hp: 200 },
    basePrice: 2000,
    description: '守护者的传奇盾牌'
  },

  // T4 防具
  {
    name: '板甲',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Armor',
    tier: 'T4',
    quality: 'Common',
    minLevel: 26,
    stats: { defense: 50, hp: 200 },
    basePrice: 1800,
    description: '厚重的板甲'
  },
  {
    name: '板甲裤',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Legs',
    tier: 'T4',
    quality: 'Common',
    minLevel: 26,
    stats: { defense: 35, hp: 140 },
    basePrice: 1350,
    description: '板甲裤子'
  },
  {
    name: '板甲鞋',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Boots',
    tier: 'T4',
    quality: 'Common',
    minLevel: 26,
    stats: { defense: 20, hp: 90, moveSpeed: 20 },
    basePrice: 1050,
    description: '板甲鞋子'
  },

  // ==================== T5 大师装备 ====================
  // T5 武器
  {
    name: '龙牙剑',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T5',
    quality: 'Legendary',
    minLevel: 40,
    stats: { attack: 150, attackSpeed: 1.5 },
    basePrice: 10000,
    description: '用巨龙之牙打造的传奇之剑',
  },
  {
    name: '世界树之斧',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'MainHand',
    tier: 'T5',
    quality: 'Legendary',
    minLevel: 40,
    stats: { attack: 180, attackSpeed: 1.2 },
    basePrice: 12000,
    description: '世界树枝干打造的巨斧',
  },
  {
    name: '神之盾',
    type: 'Weapon',
    equipmentType: 'Weapon',
    slot: 'OffHand',
    tier: 'T5',
    quality: 'Legendary',
    minLevel: 40,
    stats: { defense: 100, hp: 500 },
    basePrice: 15000,
    description: '神明赐予的盾牌',
  },

  // T5 防具
  {
    name: '龙鳞甲',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Armor',
    tier: 'T5',
    quality: 'Legendary',
    minLevel: 40,
    stats: { defense: 100, hp: 500 },
    basePrice: 12000,
    description: '用巨龙鳞片编织的护甲',
  },
  {
    name: '龙鳞裤',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Legs',
    tier: 'T5',
    quality: 'Legendary',
    minLevel: 40,
    stats: { defense: 70, hp: 350 },
    basePrice: 9000,
    description: '龙鳞护腿',
  },
  {
    name: '龙鳞靴',
    type: 'Armor',
    equipmentType: 'Armor',
    slot: 'Boots',
    tier: 'T5',
    quality: 'Legendary',
    minLevel: 40,
    stats: { defense: 40, hp: 200, moveSpeed: 50 },
    basePrice: 7000,
    description: '轻盈的龙鳞战靴',
  },
]

async function seedEquipment() {
  console.log('🔧 开始创建装备数据...')

  // 清空现有装备数据（可选）
  // await prisma.item.deleteMany({
  //   where: {
  //     type: 'Weapon'
  //   }
  // })
  // console.log('🗑️  已清空现有装备数据')

  let created = 0
  let skipped = 0

  for (const itemData of items) {
    try {
      // 检查是否已存在
      const existing = await prisma.item.findFirst({
        where: {
          name: itemData.name
        }
      })

      if (existing) {
        console.log(`⏭️  跳过：${itemData.name} (已存在)`)
        skipped++
        continue
      }

      // 创建物品
      await prisma.item.create({
        data: {
          name: itemData.name,
          type: itemData.type,
          equipmentType: itemData.equipmentType,
          slot: itemData.slot,
          tier: itemData.tier,
          quality: itemData.quality,
          minLevel: itemData.minLevel,
          stats: JSON.stringify(itemData.stats),
          basePrice: itemData.basePrice,
          description: itemData.description,
          stackSize: 1,
          icon: `/assets/items/${itemData.slot.toLowerCase()}.png`
        }
      })

      console.log(`✅ 创建：${itemData.name} (${itemData.tier} ${itemData.quality})`)
      created++
    } catch (error: any) {
      console.error(`❌ 创建失败 ${itemData.name}:`, error.message)
    }
  }

  console.log(`\n📊 装备数据创建完成`)
  console.log(`   ✅ 创建：${created} 个`)
  console.log(`   ⏭️  跳过：${skipped} 个`)
  console.log(`   📦 总计：${items.length} 个`)
}

// 执行种子
seedEquipment()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
