import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'
import { ItemService } from '../services/ItemService'

const inventory: FastifyPluginAsync = async (fastify) => {
  // 获取角色背包
  fastify.get('/', async (request, reply) => {
    try {
      const { characterId } = request.query as { characterId: string }
      
      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '缺少 characterId 参数',
        })
      }

      const inventoryItems = await prisma.inventoryItem.findMany({
        where: { characterId },
        include: {
          item: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      const items = inventoryItems.map((inv, index) => ({
        id: inv.id,
        slot: index,
        itemId: inv.itemId,
        quantity: inv.quantity,
        isEquipped: inv.isEquipped,
        item: {
          id: inv.item.id,
          name: inv.item.name,
          type: inv.item.type,
          rarity: inv.item.rarity,
          icon: inv.item.icon,
          stackSize: inv.item.stackSize,
          stats: inv.item.stats ? JSON.parse(inv.item.stats) : {},
        },
      }))

      reply.send({
        success: true,
        data: {
          items,
          totalSlots: 20,
          usedSlots: inventoryItems.length,
        },
      })
    } catch (error: any) {
      fastify.log.error(`获取背包失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 添加物品到背包
  fastify.post('/add', async (request, reply) => {
    try {
      const { characterId, itemId, quantity = 1 } = request.body as {
        characterId: string
        itemId: string
        quantity?: number
      }

      if (!characterId || !itemId) {
        return reply.status(400).send({
          success: false,
          error: '缺少必要参数',
        })
      }

      // 检查物品模板
      const item = await prisma.item.findUnique({
        where: { id: itemId },
      })

      if (!item) {
        return reply.status(404).send({
          success: false,
          error: '物品不存在',
        })
      }

      // 检查数量限制
      if (quantity > item.stackSize) {
        return reply.status(400).send({
          success: false,
          error: `超过最大堆叠数量 (${item.stackSize})`,
        })
      }

      // 尝试找到可堆叠的物品
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          characterId,
          itemId,
          isEquipped: false,
        },
      })

      if (existingItem && existingItem.quantity + quantity <= item.stackSize) {
        // 更新现有物品
        const updated = await prisma.inventoryItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
        })

        reply.send({
          success: true,
          message: '物品已添加到背包',
          data: {
            inventoryItem: updated,
          },
        })
      } else {
        // 创建新物品
        const created = await prisma.inventoryItem.create({
          data: {
            characterId,
            itemId,
            quantity,
            isEquipped: false,
          },
        })

        reply.send({
          success: true,
          message: '物品已添加到背包',
          data: {
            inventoryItem: created,
          },
        })
      }
    } catch (error: any) {
      fastify.log.error(`添加物品失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 移除物品
  fastify.post('/remove', async (request, reply) => {
    try {
      const { characterId, inventoryItemId, quantity = 1 } = request.body as {
        characterId: string
        inventoryItemId: string
        quantity?: number
      }

      if (!characterId || !inventoryItemId) {
        return reply.status(400).send({
          success: false,
          error: '缺少必要参数',
        })
      }

      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: inventoryItemId },
      })

      if (!inventoryItem || inventoryItem.characterId !== characterId) {
        return reply.status(404).send({
          success: false,
          error: '物品不存在',
        })
      }

      if (inventoryItem.quantity <= quantity) {
        // 删除整个物品
        await prisma.inventoryItem.delete({
          where: { id: inventoryItemId },
        })
      } else {
        // 减少数量
        await prisma.inventoryItem.update({
          where: { id: inventoryItemId },
          data: {
            quantity: inventoryItem.quantity - quantity,
          },
        })
      }

      reply.send({
        success: true,
        message: '物品已移除',
      })
    } catch (error: any) {
      fastify.log.error(`移除物品失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 装备/卸下物品
  fastify.post('/equip', async (request, reply) => {
    try {
      const { characterId, inventoryItemId, equip } = request.body as {
        characterId: string
        inventoryItemId: string
        equip: boolean
      }

      if (!characterId || !inventoryItemId || equip === undefined) {
        return reply.status(400).send({
          success: false,
          error: '缺少必要参数',
        })
      }

      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: inventoryItemId },
        include: { item: true },
      })

      if (!inventoryItem || inventoryItem.characterId !== characterId) {
        return reply.status(404).send({
          success: false,
          error: '物品不存在',
        })
      }

      // 如果装备，先卸下同类型的其他装备
      if (equip) {
        await prisma.inventoryItem.updateMany({
          where: {
            characterId,
            itemId: { not: inventoryItemId },
            isEquipped: true,
          },
          data: {
            isEquipped: false,
          },
        })
      }

      const updated = await prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          isEquipped: equip,
        },
      })

      reply.send({
        success: true,
        message: equip ? '物品已装备' : '物品已卸下',
        data: {
          inventoryItem: updated,
        },
      })
    } catch (error: any) {
      fastify.log.error(`装备物品失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 获取装备列表
  fastify.get('/equipment', async (request, reply) => {
    try {
      const { characterId } = request.query as { characterId: string }
      
      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '缺少 characterId 参数',
        })
      }

      const equipment = await prisma.inventoryItem.findMany({
        where: {
          characterId,
          isEquipped: true,
        },
        include: {
          item: true,
        },
      })

      const equipmentList = equipment.map(inv => ({
        itemId: inv.itemId,
        quantity: inv.quantity,
        item: {
          id: inv.item.id,
          name: inv.item.name,
          type: inv.item.type,
          rarity: inv.item.rarity,
          icon: inv.item.icon,
          stats: inv.item.stats ? JSON.parse(inv.item.stats) : {},
        },
      }))

      reply.send({
        success: true,
        data: {
          equipment: equipmentList,
        },
      })
    } catch (error: any) {
      fastify.log.error(`获取装备失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })
}

export default inventory
