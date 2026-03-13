// 简化版 bank 路由 - 移除严格类型注解
import { prisma } from '../prisma'

/**
 * 仓库路由
 * GET /api/v1/bank/:characterId - 获取仓库物品
 * POST /api/v1/bank/deposit - 存入物品
 * POST /api/v1/bank/withdraw - 取出物品
 */
export async function bankRoutes(fastify: any) {
  // 获取仓库物品
  fastify.get('/bank/:characterId', async (request: any, reply: any) => {
    try {
      const { characterId } = request.params

      const character = await prisma.character.findUnique({
        where: { id: characterId }
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      const bankItems = await prisma.bankItem.findMany({
        where: { characterId },
        include: {
          item: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return reply.send({
        success: true,
        bankItems,
        capacity: 100,
        used: bankItems.length
      })
    } catch (error: any) {
      console.error('获取仓库物品失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取仓库物品失败'
      })
    }
  })

  // 存入物品
  fastify.post('/bank/deposit', async (request: any, reply: any) => {
    try {
      const { characterId, itemId, quantity } = request.body

      if (!characterId || !itemId || !quantity) {
        return reply.status(400).send({
          success: false,
          error: '参数不完整'
        })
      }

      // 检查仓库容量
      const bankItems = await prisma.bankItem.findMany({
        where: { characterId }
      })

      if (bankItems.length >= 100) {
        return reply.status(400).send({
          success: false,
          error: '仓库已满'
        })
      }

      // 检查背包是否有足够物品
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: {
          inventory: true
        }
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      const invItem = character.inventory.find((inv: any) => inv.itemId === itemId)

      if (!invItem || invItem.quantity < quantity) {
        return reply.status(400).send({
          success: false,
          error: '物品不足'
        })
      }

      // 存入仓库
      await prisma.bankItem.create({
        data: {
          characterId,
          itemId,
          quantity
        }
      })

      // 从背包移除
      if (invItem.quantity === quantity) {
        await prisma.inventoryItem.delete({
          where: { id: invItem.id }
        })
      } else {
        await prisma.inventoryItem.update({
          where: { id: invItem.id },
          data: {
            quantity: invItem.quantity - quantity
          }
        })
      }

      return reply.send({
        success: true,
        message: '存入成功'
      })
    } catch (error: any) {
      console.error('存入物品失败:', error)
      return reply.status(500).send({
        success: false,
        error: '存入物品失败'
      })
    }
  })

  // 取出物品
  fastify.post('/bank/withdraw', async (request: any, reply: any) => {
    try {
      const { characterId, bankItemId, quantity } = request.body

      if (!characterId || !bankItemId || !quantity) {
        return reply.status(400).send({
          success: false,
          error: '参数不完整'
        })
      }

      // 获取仓库物品
      const bankItem = await prisma.bankItem.findUnique({
        where: { id: bankItemId }
      })

      if (!bankItem || bankItem.characterId !== characterId) {
        return reply.status(404).send({
          success: false,
          error: '物品不存在'
        })
      }

      if (bankItem.quantity < quantity) {
        return reply.status(400).send({
          success: false,
          error: '物品不足'
        })
      }

      // 检查背包空间
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: {
          inventory: true
        }
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      if (character.inventory.length >= 50) {
        return reply.status(400).send({
          success: false,
          error: '背包已满'
        })
      }

      // 从仓库移除
      if (bankItem.quantity === quantity) {
        await prisma.bankItem.delete({
          where: { id: bankItemId }
        })
      } else {
        await prisma.bankItem.update({
          where: { id: bankItemId },
          data: {
            quantity: bankItem.quantity - quantity
          }
        })
      }

      // 添加到背包
      const slots = character.inventory.map((inv: any) => inv.slot)
      let emptySlot = 0
      while (slots.includes(emptySlot)) {
        emptySlot++
      }

      await prisma.inventoryItem.create({
        data: {
          characterId,
          itemId: bankItem.itemId,
          slot: emptySlot,
          quantity
        }
      })

      return reply.send({
        success: true,
        message: '取出成功'
      })
    } catch (error: any) {
      console.error('取出物品失败:', error)
      return reply.status(500).send({
        success: false,
        error: '取出物品失败'
      })
    }
  })
}
