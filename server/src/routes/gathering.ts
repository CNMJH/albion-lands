import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 采集资源
 * POST /api/v1/gathering/gather
 */
async function gatherResource(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId, resourceId, mapId, x, y } = request.body

    if (!characterId || !resourceId) {
      return reply.status(400).send({
        success: false,
        error: '参数不完整'
      })
    }

    // 获取角色位置
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    })

    if (!character) {
      return reply.status(404).send({
        success: false,
        error: '角色不存在'
      })
    }

    // 检查距离（防止远程采集）
    const distance = Math.sqrt(
      Math.pow(character.x - x, 2) + Math.pow(character.y - y, 2)
    )

    if (distance > 100) {
      return reply.status(400).send({
        success: false,
        error: '距离资源点太远'
      })
    }

    // 获取资源类型
    const resourceTypes: Record<string, { itemId: string; minQuantity: number; maxQuantity: number; exp: number }> = {
      'herb': { itemId: 'item_herb_001', minQuantity: 1, maxQuantity: 3, exp: 10 },
      'rare_herb': { itemId: 'item_herb_rare_001', minQuantity: 1, maxQuantity: 2, exp: 20 },
      'ore_node': { itemId: 'item_ore_001', minQuantity: 2, maxQuantity: 5, exp: 15 },
      'gold_ore': { itemId: 'item_ore_gold_001', minQuantity: 1, maxQuantity: 3, exp: 30 },
      'titanium_ore': { itemId: 'item_ore_titanium_001', minQuantity: 1, maxQuantity: 2, exp: 50 },
      'adamantite_ore': { itemId: 'item_ore_adamantite_001', minQuantity: 1, maxQuantity: 2, exp: 80 },
      'wood': { itemId: 'item_wood_001', minQuantity: 3, maxQuantity: 6, exp: 8 },
      'ancient_wood': { itemId: 'item_wood_ancient_001', minQuantity: 1, maxQuantity: 3, exp: 25 },
      'magic_wood': { itemId: 'item_wood_magic_001', minQuantity: 1, maxQuantity: 2, exp: 40 },
      'crystal': { itemId: 'item_crystal_001', minQuantity: 1, maxQuantity: 2, exp: 35 },
      'dragon_crystal': { itemId: 'item_crystal_dragon_001', minQuantity: 1, maxQuantity: 1, exp: 100 },
      'ancient_relic': { itemId: 'item_relic_001', minQuantity: 1, maxQuantity: 1, exp: 200 }
    }

    const resource = resourceTypes[resourceId]
    if (!resource) {
      return reply.status(400).send({
        success: false,
        error: '无效的资源类型'
      })
    }

    // 随机获取数量
    const quantity = Math.floor(Math.random() * (resource.maxQuantity - resource.minQuantity + 1)) + resource.minQuantity

    // 添加到背包
    await prisma.inventoryItem.upsert({
      where: {
        characterId_itemId: {
          characterId,
          itemId: resource.itemId
        }
      },
      update: {
        quantity: { increment: quantity }
      },
      create: {
        characterId,
        itemId: resource.itemId,
        quantity,
        isEquipped: false,
        durability: 100
      }
    })

    // 增加经验
    await prisma.character.update({
      where: { id: characterId },
      data: {
        exp: { increment: resource.exp }
      }
    })

    return reply.status(200).send({
      success: true,
      data: {
        resourceId,
        quantity,
        exp: resource.exp,
        itemId: resource.itemId
      }
    })
  } catch (error) {
    console.error('采集失败:', error)
    return reply.status(500).send({
      success: false,
      error: '采集失败'
    })
  }
}

/**
 * 获取地图资源点
 * GET /api/v1/gathering/resources/:mapId
 */
async function getMapResources(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { mapId } = request.params

    const map = await prisma.gameMap.findUnique({
      where: { id: mapId }
    })

    if (!map) {
      return reply.status(404).send({
        success: false,
        error: '地图不存在'
      })
    }

    const resources = map.resources ? JSON.parse(map.resources) : []

    return reply.status(200).send({
      success: true,
      resources,
      mapId
    })
  } catch (error) {
    console.error('获取资源点失败:', error)
    return reply.status(500).send({
      success: false,
      error: '获取资源点失败'
    })
  }
}

/**
 * 采集路由
 */
export async function gatheringRoutes(fastify: FastifyInstance) {
  fastify.post('/gathering/gather', gatherResource)
  fastify.get('/gathering/resources/:mapId', getMapResources)
}
