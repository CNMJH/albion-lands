import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 获取物品详情
 * GET /api/v1/item-details/:itemId
 */
async function getItemDetail(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { itemId } = request.params

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        inventoryItems: {
          take: 5,
          select: {
            characterId: true,
            quantity: true,
            isEquipped: true,
            durability: true,
            character: {
              select: {
                name: true
              }
            }
          }
        },
        marketOrders: {
          where: {
            status: 'ACTIVE',
            type: 'SELL'
          },
          take: 10,
          orderBy: {
            unitPrice: 'asc'
          },
          include: {
            seller: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!item) {
      return reply.status(404).send({
        success: false,
        error: '物品不存在'
      })
    }

    // 解析 stats JSON
    let stats = {}
    try {
      stats = item.stats ? JSON.parse(item.stats) : {}
    } catch (e) {
      stats = {}
    }

    // 计算平均价格
    const activeOrders = item.marketOrders.filter(o => o.status === 'ACTIVE' && o.type === 'SELL')
    const avgPrice = activeOrders.length > 0
      ? Math.floor(activeOrders.reduce((sum, o) => sum + o.unitPrice, 0) / activeOrders.length)
      : item.basePrice

    // 获取拥有该物品的玩家数量
    const ownerCount = await prisma.inventoryItem.groupBy({
      by: ['characterId'],
      where: { itemId },
      _count: true
    })

    return reply.status(200).send({
      success: true,
      item: {
        ...item,
        stats,
        avgPrice,
        ownerCount: ownerCount.length,
        listedCount: activeOrders.length,
        lowestPrice: activeOrders.length > 0 ? Math.min(...activeOrders.map(o => o.unitPrice)) : null,
        highestPrice: activeOrders.length > 0 ? Math.max(...activeOrders.map(o => o.unitPrice)) : null
      }
    })
  } catch (error) {
    console.error('获取物品详情失败:', error)
    return reply.status(500).send({
      success: false,
      error: '获取物品详情失败'
    })
  }
}

/**
 * 获取物品比较
 * GET /api/v1/items/compare
 */
async function compareItems(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { itemId1, itemId2 } = request.query

    if (!itemId1 || !itemId2) {
      return reply.status(400).send({
        success: false,
        error: '缺少物品 ID'
      })
    }

    const [item1, item2] = await Promise.all([
      prisma.item.findUnique({ where: { id: itemId1 } }),
      prisma.item.findUnique({ where: { id: itemId2 } })
    ])

    if (!item1 || !item2) {
      return reply.status(404).send({
        success: false,
        error: '物品不存在'
      })
    }

    // 解析 stats
    const parseStats = (statsStr: string | null) => {
      try {
        return statsStr ? JSON.parse(statsStr) : {}
      } catch {
        return {}
      }
    }

    const stats1 = parseStats(item1.stats)
    const stats2 = parseStats(item2.stats)

    return reply.status(200).send({
      success: true,
      comparison: {
        item1: {
          ...item1,
          stats: stats1
        },
        item2: {
          ...item2,
          stats: stats2
        }
      }
    })
  } catch (error) {
    console.error('比较物品失败:', error)
    return reply.status(500).send({
      success: false,
      error: '比较物品失败'
    })
  }
}

/**
 * 物品详情路由
 */
export async function itemDetailRoutes(fastify: FastifyInstance) {
  fastify.get('/item-details/:itemId', getItemDetail)
  fastify.get('/item-details/compare', compareItems)
}
