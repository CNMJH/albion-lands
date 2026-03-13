import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 制造物品
 * POST /api/v1/crafting/craft
 */
async function craftItem(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId, recipeId } = request.body

    if (!characterId || !recipeId) {
      return reply.status(400).send({
        success: false,
        error: '参数不完整'
      })
    }

    // 配方定义
    const recipes: Record<string, { 
      name: string
      outputItemId: string
      outputQuantity: number
      materials: Array<{ itemId: string; quantity: number }>
      exp: number
      craftTime: number
      requiredLevel: number
    }> = {
      // 药水配方
      'health_potion_t1': {
        name: '初级生命药水',
        outputItemId: 'item_potion_health_t1',
        outputQuantity: 1,
        materials: [
          { itemId: 'item_herb_001', quantity: 3 }
        ],
        exp: 20,
        craftTime: 3000,
        requiredLevel: 1
      },
      'health_potion_t2': {
        name: '中级生命药水',
        outputItemId: 'item_potion_health_t2',
        outputQuantity: 1,
        materials: [
          { itemId: 'item_herb_rare_001', quantity: 3 },
          { itemId: 'item_crystal_001', quantity: 1 }
        ],
        exp: 40,
        craftTime: 5000,
        requiredLevel: 20
      },
      // 武器配方
      'iron_sword': {
        name: '铁剑',
        outputItemId: 'item_weapon_sword_iron',
        outputQuantity: 1,
        materials: [
          { itemId: 'item_ore_001', quantity: 10 },
          { itemId: 'item_wood_001', quantity: 5 }
        ],
        exp: 50,
        craftTime: 10000,
        requiredLevel: 5
      },
      'steel_sword': {
        name: '钢剑',
        outputItemId: 'item_weapon_sword_steel',
        outputQuantity: 1,
        materials: [
          { itemId: 'item_ore_gold_001', quantity: 8 },
          { itemId: 'item_wood_ancient_001', quantity: 5 }
        ],
        exp: 100,
        craftTime: 20000,
        requiredLevel: 30
      },
      'titanium_sword': {
        name: '钛金剑',
        outputItemId: 'item_weapon_sword_titanium',
        outputQuantity: 1,
        materials: [
          { itemId: 'item_ore_titanium_001', quantity: 10 },
          { itemId: 'item_crystal_001', quantity: 5 }
        ],
        exp: 200,
        craftTime: 30000,
        requiredLevel: 50
      },
      // 护甲配方
      'leather_armor': {
        name: '皮甲',
        outputItemId: 'item_armor_leather',
        outputQuantity: 1,
        materials: [
          { itemId: 'item_leather_001', quantity: 10 }
        ],
        exp: 40,
        craftTime: 8000,
        requiredLevel: 10
      },
      'chain_armor': {
        name: '锁子甲',
        outputItemId: 'item_armor_chain',
        outputQuantity: 1,
        materials: [
          { itemId: 'item_ore_001', quantity: 15 }
        ],
        exp: 80,
        craftTime: 15000,
        requiredLevel: 25
      },
      'plate_armor': {
        name: '板甲',
        outputItemId: 'item_armor_plate',
        outputQuantity: 1,
        materials: [
          { itemId: 'item_ore_titanium_001', quantity: 20 },
          { itemId: 'item_crystal_dragon_001', quantity: 2 }
        ],
        exp: 300,
        craftTime: 60000,
        requiredLevel: 60
      }
    }

    const recipe = recipes[recipeId]
    if (!recipe) {
      return reply.status(400).send({
        success: false,
        error: '无效的合成配方'
      })
    }

    // 检查角色等级
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    })

    if (!character) {
      return reply.status(404).send({
        success: false,
        error: '角色不存在'
      })
    }

    if (character.level < recipe.requiredLevel) {
      return reply.status(400).send({
        success: false,
        error: `等级不足，需要 Lv.${recipe.requiredLevel}`
      })
    }

    // 检查材料
    const characterItems = await prisma.inventoryItem.findMany({
      where: { characterId }
    })

    for (const material of recipe.materials) {
      const owned = characterItems.find(item => item.itemId === material.itemId)
      if (!owned || owned.quantity < material.quantity) {
        return reply.status(400).send({
          success: false,
          error: `材料不足：${material.itemId} x${material.quantity}`
        })
      }
    }

    // 扣除材料
    for (const material of recipe.materials) {
      await prisma.inventoryItem.update({
        where: {
          characterId_itemId: {
            characterId,
            itemId: material.itemId
          }
        },
        data: {
          quantity: { decrement: material.quantity }
        }
      })

      // 删除数量为 0 的物品
      const updated = await prisma.inventoryItem.findUnique({
        where: {
          characterId_itemId: {
            characterId,
            itemId: material.itemId
          }
        }
      })

      if (updated && updated.quantity <= 0) {
        await prisma.inventoryItem.delete({
          where: { id: updated.id }
        })
      }
    }

    // 添加成品
    await prisma.inventoryItem.upsert({
      where: {
        characterId_itemId: {
          characterId,
          itemId: recipe.outputItemId
        }
      },
      update: {
        quantity: { increment: recipe.outputQuantity }
      },
      create: {
        characterId,
        itemId: recipe.outputItemId,
        quantity: recipe.outputQuantity,
        isEquipped: false,
        durability: 100
      }
    })

    // 增加经验
    await prisma.character.update({
      where: { id: characterId },
      data: {
        exp: { increment: recipe.exp }
      }
    })

    return reply.status(200).send({
      success: true,
      data: {
        recipeId,
        recipeName: recipe.name,
        outputItemId: recipe.outputItemId,
        outputQuantity: recipe.outputQuantity,
        exp: recipe.exp,
        craftTime: recipe.craftTime
      }
    })
  } catch (error) {
    console.error('制造失败:', error)
    return reply.status(500).send({
      success: false,
      error: '制造失败'
    })
  }
}

/**
 * 获取所有配方
 * GET /api/v1/crafting/recipes
 */
async function getRecipes(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const recipes = [
      { id: 'health_potion_t1', name: '初级生命药水', category: 'potion', requiredLevel: 1 },
      { id: 'health_potion_t2', name: '中级生命药水', category: 'potion', requiredLevel: 20 },
      { id: 'iron_sword', name: '铁剑', category: 'weapon', requiredLevel: 5 },
      { id: 'steel_sword', name: '钢剑', category: 'weapon', requiredLevel: 30 },
      { id: 'titanium_sword', name: '钛金剑', category: 'weapon', requiredLevel: 50 },
      { id: 'leather_armor', name: '皮甲', category: 'armor', requiredLevel: 10 },
      { id: 'chain_armor', name: '锁子甲', category: 'armor', requiredLevel: 25 },
      { id: 'plate_armor', name: '板甲', category: 'armor', requiredLevel: 60 }
    ]

    return reply.status(200).send({
      success: true,
      recipes
    })
  } catch (error) {
    console.error('获取配方失败:', error)
    return reply.status(500).send({
      success: false,
      error: '获取配方失败'
    })
  }
}

/**
 * 制造路由
 */
export async function craftingRoutes(fastify: FastifyInstance) {
  fastify.post('/crafting/craft', craftItem)
  fastify.get('/crafting/recipes', getRecipes)
}
