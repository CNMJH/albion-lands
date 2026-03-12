import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'

const market: FastifyPluginAsync = async (fastify) => {
  // 获取市场订单列表
  fastify.get('/orders', async (request, reply) => {
    try {
      const { itemId, status, sellerId } = request.query as {
        itemId?: string
        status?: string
        sellerId?: string
      }

      const where: any = {}
      if (itemId) where.itemId = itemId
      if (status) where.status = status
      if (sellerId) where.sellerId = sellerId

      const orders = await prisma.marketOrder.findMany({
        where,
        include: {
          item: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      reply.send({
        orders: orders.map(order => ({
          id: order.id,
          sellerId: order.sellerId,
          itemId: order.itemId,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          item: {
            id: order.item.id,
            name: order.item.name,
            type: order.item.type,
            rarity: order.item.rarity,
            icon: order.item.icon,
          },
        })),
        total: orders.length,
      })
    } catch (error: any) {
      fastify.log.error(`获取市场订单失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 创建订单
  fastify.post('/orders', async (request, reply) => {
    try {
      const { sellerId, itemId, quantity, unitPrice } = request.body as {
        sellerId: string
        itemId: string
        quantity: number
        unitPrice: number
      }

      if (!sellerId || !itemId || !quantity || !unitPrice) {
        return reply.status(400).send({
          success: false,
          error: '缺少必要参数',
        })
      }

      // 检查物品是否存在
      const item = await prisma.item.findUnique({
        where: { id: itemId },
      })

      if (!item) {
        return reply.status(404).send({
          success: false,
          error: '物品不存在',
        })
      }

      // 检查卖家背包是否有足够物品
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: {
          characterId: sellerId,
          itemId,
        },
      })

      if (!inventoryItem || inventoryItem.quantity < quantity) {
        return reply.status(400).send({
          success: false,
          error: '背包中物品数量不足',
        })
      }

      // 创建订单
      const order = await prisma.marketOrder.create({
        data: {
          sellerId,
          itemId,
          quantity,
          unitPrice,
          status: 'Pending',
        },
        include: {
          item: true,
        },
      })

      // 从背包移除物品（托管）
      if (inventoryItem.quantity === quantity) {
        await prisma.inventoryItem.delete({
          where: { id: inventoryItem.id },
        })
      } else {
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: inventoryItem.quantity - quantity,
          },
        })
      }

      reply.send({
        success: true,
        message: '订单已创建',
        order: {
          id: order.id,
          sellerId: order.sellerId,
          itemId: order.itemId,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          status: order.status,
          createdAt: order.createdAt,
          item: {
            id: order.item.id,
            name: order.item.name,
            type: order.item.type,
            rarity: order.item.rarity,
          },
        },
      })
    } catch (error: any) {
      fastify.log.error(`创建市场订单失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 取消订单
  fastify.delete('/orders/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      const order = await prisma.marketOrder.findUnique({
        where: { id },
      })

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: '订单不存在',
        })
      }

      if (order.status !== 'Pending') {
        return reply.status(400).send({
          success: false,
          error: '只能取消待处理的订单',
        })
      }

      // 更新订单状态
      await prisma.marketOrder.update({
        where: { id },
        data: {
          status: 'Cancelled',
        },
      })

      // 归还物品给卖家
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          characterId: order.sellerId,
          itemId: order.itemId,
        },
      })

      if (existingItem) {
        await prisma.inventoryItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + order.quantity,
          },
        })
      } else {
        await prisma.inventoryItem.create({
          data: {
            characterId: order.sellerId,
            itemId: order.itemId,
            quantity: order.quantity,
            isEquipped: false,
          },
        })
      }

      reply.send({
        success: true,
        message: '订单已取消',
      })
    } catch (error: any) {
      fastify.log.error(`取消市场订单失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 购买订单
  fastify.post('/orders/:id/buy', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { buyerId } = request.body as { buyerId: string }

      if (!buyerId) {
        return reply.status(400).send({
          success: false,
          error: '缺少 buyerId 参数',
        })
      }

      const order = await prisma.marketOrder.findUnique({
        where: { id },
        include: {
          item: true,
        },
      })

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: '订单不存在',
        })
      }

      if (order.status !== 'Pending') {
        return reply.status(400).send({
          success: false,
          error: '订单不可购买',
        })
      }

      const totalPrice = order.unitPrice * order.quantity

      // 检查买家金币
      const buyer = await prisma.character.findUnique({
        where: { id: buyerId },
      })

      if (!buyer || buyer.gold < totalPrice) {
        return reply.status(400).send({
          success: false,
          error: '金币不足',
        })
      }

      // 扣除买家金币
      await prisma.character.update({
        where: { id: buyerId },
        data: {
          gold: buyer.gold - totalPrice,
        },
      })

      // 添加卖家金币
      const seller = await prisma.character.findUnique({ where: { id: order.sellerId } })
      if (seller) {
        await prisma.character.update({
          where: { id: order.sellerId },
          data: {
            gold: seller.gold + totalPrice,
          },
        })
      }

      // 更新订单状态
      await prisma.marketOrder.update({
        where: { id },
        data: {
          status: 'Completed',
        },
      })

      // 添加物品给买家
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          characterId: buyerId,
          itemId: order.itemId,
        },
      })

      if (existingItem) {
        await prisma.inventoryItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + order.quantity,
          },
        })
      } else {
        await prisma.inventoryItem.create({
          data: {
            characterId: buyerId,
            itemId: order.itemId,
            quantity: order.quantity,
            isEquipped: false,
          },
        })
      }

      reply.send({
        success: true,
        message: '购买成功',
        order: {
          id: order.id,
          status: 'Completed',
        },
      })
    } catch (error: any) {
      fastify.log.error(`购买订单失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })
}

export default market
