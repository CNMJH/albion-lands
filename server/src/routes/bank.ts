import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../prisma'

/**
 * 仓库路由
 * GET /api/v1/bank/:characterId - 获取仓库物品
 * POST /api/v1/bank/deposit - 存入物品
 * POST /api/v1/bank/withdraw - 取出物品
 */
export async function bankRoutes(fastify: FastifyInstance) {
  // 获取仓库物品
  fastify.get('/bank/:characterId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { characterId: string }
      const { characterId } = params

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
    } catch (error) {
      console.error('获取仓库物品失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取仓库物品失败'
      })
    }
  })

  // 存入物品
  fastify.post('/bank/deposit', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as { characterId: string; itemId: string; quantity: number }
      const { characterId, itemId, quantity } = body

      if (!characterId || !itemId || !quantity) {
        return reply.status(400).send({
          success: false,
          error: '参数不完整'
        })
      }

      if (quantity < 1) {
        return reply.status(400).send({
          success: false,
          error: '数量必须大于 0'
        })
      }

      // 检查仓库容量
      const bankItemCount = await prisma.bankItem.count({
        where: { characterId }
      })

      if (bankItemCount >= 100) {
        return reply.status(400).send({
          success: false,
          error: '仓库已满'
        })
      }

      // 检查背包是否有足够物品
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: {
          characterId,
          itemId
        }
      })

      if (!inventoryItem || inventoryItem.quantity < quantity) {
        return reply.status(400).send({
          success: false,
          error: '背包物品不足'
        })
      }

      // 事务处理：背包减少，仓库增加
      const result = await prisma.$transaction(async (tx) => {
        // 从背包移除
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: { decrement: quantity }
          }
        })

        // 删除数量为 0 的物品
        await tx.inventoryItem.deleteMany({
          where: {
            id: inventoryItem.id,
            quantity: 0
          }
        })

        // 添加到仓库
        const existingBankItem = await tx.bankItem.findFirst({
          where: {
            characterId,
            itemId
          }
        })

        let bankItem
        if (existingBankItem) {
          bankItem = await tx.bankItem.update({
            where: { id: existingBankItem.id },
            data: {
              quantity: { increment: quantity }
            },
            include: { item: true }
          })
        } else {
          bankItem = await tx.bankItem.create({
            data: {
              characterId,
              itemId,
              quantity
            },
            include: { item: true }
          })
        }

        return bankItem
      })

      return reply.send({
        success: true,
        message: '存入成功',
        bankItem: result
      })
    } catch (error) {
      console.error('存入物品失败:', error)
      return reply.status(500).send({
        success: false,
        error: '存入物品失败'
      })
    }
  })

  // 取出物品
  fastify.post('/bank/withdraw', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as { characterId: string; itemId: string; quantity: number }
      const { characterId, itemId, quantity } = body

      if (!characterId || !itemId || !quantity) {
        return reply.status(400).send({
          success: false,
          error: '参数不完整'
        })
      }

      if (quantity < 1) {
        return reply.status(400).send({
          success: false,
          error: '数量必须大于 0'
        })
      }

      // 检查仓库是否有足够物品
      const bankItem = await prisma.bankItem.findFirst({
        where: {
          characterId,
          itemId
        }
      })

      if (!bankItem || bankItem.quantity < quantity) {
        return reply.status(400).send({
          success: false,
          error: '仓库物品不足'
        })
      }

      // 检查背包容量
      const inventoryCount = await prisma.inventoryItem.count({
        where: { characterId }
      })

      if (inventoryCount >= 50) {
        return reply.status(400).send({
          success: false,
          error: '背包已满'
        })
      }

      // 事务处理：仓库减少，背包增加
      const result = await prisma.$transaction(async (tx) => {
        // 从仓库移除
        await tx.bankItem.update({
          where: { id: bankItem.id },
          data: {
            quantity: { decrement: quantity }
          }
        })

        // 删除数量为 0 的物品
        await tx.bankItem.deleteMany({
          where: {
            id: bankItem.id,
            quantity: 0
          }
        })

        // 添加到背包
        const existingInventoryItem = await tx.inventoryItem.findFirst({
          where: {
            characterId,
            itemId
          }
        })

        let inventoryItem
        if (existingInventoryItem) {
          inventoryItem = await tx.inventoryItem.update({
            where: { id: existingInventoryItem.id },
            data: {
              quantity: { increment: quantity }
            },
            include: { item: true }
          })
        } else {
          inventoryItem = await tx.inventoryItem.create({
            data: {
              characterId,
              itemId,
              quantity
            },
            include: { item: true }
          })
        }

        return inventoryItem
      })

      return reply.send({
        success: true,
        message: '取出成功',
        inventoryItem: result
      })
    } catch (error) {
      console.error('取出物品失败:', error)
      return reply.status(500).send({
        success: false,
        error: '取出物品失败'
      })
    }
  })
}
