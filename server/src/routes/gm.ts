import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../prisma'
import { ItemService } from '../services/ItemService'
import { GatheringService } from '../services/GatheringService'
import { CraftingService } from '../services/CraftingService'

/**
 * GM 工具路由
 * 提供游戏管理功能
 */
export async function gmRoutes(fastify: FastifyInstance): Promise<void> {
  // 所有 GM 路由都需要认证（临时跳过）
  
  /**
   * 获取 GM 面板数据
   */
  fastify.get('/dashboard', async (request, reply) => {
    try {
      const [
        playerCount,
        onlineCount,
        totalItems,
        totalOrders,
        recentLogs
      ] = await Promise.all([
        prisma.character.count(),
        prisma.character.count({ where: { isOnline: true } }),
        prisma.item.count(),
        prisma.marketOrder.count(),
        prisma.gameLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      ])

      reply.send({
        success: true,
        data: {
          playerCount,
          onlineCount,
          totalItems,
          totalOrders,
          recentLogs,
        },
      })
    } catch (error) {
      fastify.log.error('获取 GM 面板数据失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 获取所有玩家列表
   */
  fastify.get('/players', async (request, reply) => {
    try {
      const players = await prisma.character.findMany({
        include: {
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              inventory: true,
            },
          },
        },
        orderBy: {
          lastLoginAt: 'desc',
        },
      })

      reply.send({
        success: true,
        data: {
          players,
        },
      })
    } catch (error) {
      fastify.log.error('获取玩家列表失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 获取玩家详情
   */
  fastify.get('/players/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const player = await prisma.character.findUnique({
        where: { id },
        include: {
          user: true,
          inventory: {
            include: {
              item: true,
            },
          },
        },
      })

      if (!player) {
        return reply.status(404).send({
          success: false,
          error: '玩家不存在',
        })
      }

      reply.send({
        success: true,
        data: {
          player,
        },
      })
    } catch (error) {
      fastify.log.error('获取玩家详情失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 修改玩家等级
   */
  fastify.post('/players/:id/level', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { level } = request.body as { level: number }

      if (!level || level < 1 || level > 100) {
        return reply.status(400).send({
          success: false,
          error: '等级必须在 1-100 之间',
        })
      }

      const player = await prisma.character.update({
        where: { id },
        data: {
          level,
          exp: 0,
        },
      })

      // 记录 GM 操作
      await prisma.gameLog.create({
        data: {
          type: 'GM_ACTION',
          message: `GM 修改玩家等级为 ${level}`,
          characterId: id,
          data: JSON.stringify({ level }),
        },
      })

      reply.send({
        success: true,
        data: {
          player,
        },
      })
    } catch (error) {
      fastify.log.error('修改玩家等级失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 给予玩家物品
   */
  fastify.post('/players/:id/items', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { itemId, quantity = 1 } = request.body as { 
        itemId: string
        quantity?: number
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

      // 给予物品
      const success = await ItemService.giveItem(id, itemId, quantity)

      if (!success) {
        return reply.status(400).send({
          success: false,
          error: '给予物品失败（背包已满？）',
        })
      }

      // 记录 GM 操作
      await prisma.gameLog.create({
        data: {
          type: 'GM_ACTION',
          message: `GM 给予物品：${item.name} x${quantity}`,
          characterId: id,
          data: JSON.stringify({ itemId, quantity }),
        },
      })

      reply.send({
        success: true,
        message: `给予 ${item.name} x${quantity} 成功`,
      })
    } catch (error) {
      fastify.log.error('给予物品失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 给予玩家货币
   */
  fastify.post('/players/:id/currency', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { silver = 0, gold = 0 } = request.body as {
        silver?: number
        gold?: number
      }

      const player = await prisma.character.update({
        where: { id },
        data: {
          silver: {
            increment: silver,
          },
          gold: {
            increment: gold,
          },
        },
      })

      // 记录 GM 操作
      await prisma.gameLog.create({
        data: {
          type: 'GM_ACTION',
          message: `GM 给予货币：银币 ${silver}, 金币 ${gold}`,
          characterId: id,
          data: JSON.stringify({ silver, gold }),
        },
      })

      reply.send({
        success: true,
        data: {
          silver: player.silver,
          gold: player.gold,
        },
      })
    } catch (error) {
      fastify.log.error('给予货币失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 传送玩家
   */
  fastify.post('/players/:id/teleport', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { zoneId, x, y } = request.body as {
        zoneId: string
        x: number
        y: number
      }

      const player = await prisma.character.update({
        where: { id },
        data: {
          zoneId,
          x,
          y,
        },
      })

      // 记录 GM 操作
      await prisma.gameLog.create({
        data: {
          type: 'GM_ACTION',
          message: `GM 传送玩家到 ${zoneId} (${x}, ${y})`,
          characterId: id,
          data: JSON.stringify({ zoneId, x, y }),
        },
      })

      reply.send({
        success: true,
        message: `传送玩家到 ${zoneId} (${x}, ${y}) 成功`,
      })
    } catch (error) {
      fastify.log.error('传送玩家失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 获取所有物品列表
   */
  fastify.get('/items', async (request, reply) => {
    try {
      const items = await prisma.item.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      })

      reply.send({
        success: true,
        data: {
          items,
        },
      })
    } catch (error) {
      fastify.log.error('获取物品列表失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 创建新物品
   */
  fastify.post('/items', async (request, reply) => {
    try {
      const {
        name,
        type,
        rarity = 'Common',
        stats = {},
        slot,
        minLevel = 1,
        stackSize = 99,
        basePrice = 0,
      } = request.body as {
        name: string
        type: string
        rarity?: string
        stats?: any
        slot?: string
        minLevel?: number
        stackSize?: number
        basePrice?: number
      }

      const item = await prisma.item.create({
        data: {
          name,
          type,
          rarity,
          stats: JSON.stringify(stats),
          slot,
          minLevel,
          stackSize,
          basePrice,
        },
      })

      // 记录 GM 操作
      await prisma.gameLog.create({
        data: {
          type: 'GM_ACTION',
          message: `GM 创建物品：${name}`,
          data: JSON.stringify({ itemId: item.id }),
        },
      })

      reply.send({
        success: true,
        data: {
          item,
        },
      })
    } catch (error) {
      fastify.log.error('创建物品失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 获取市场订单
   */
  fastify.get('/market', async (request, reply) => {
    try {
      const orders = await prisma.marketOrder.findMany({
        include: {
          item: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      })

      reply.send({
        success: true,
        data: {
          orders,
        },
      })
    } catch (error) {
      fastify.log.error('获取市场订单失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 获取游戏日志
   */
  fastify.get('/logs', async (request, reply) => {
    try {
      const { type, limit = 100 } = request.query as {
        type?: string
        limit?: number
      }

      const where: any = {}
      if (type) {
        where.type = type
      }

      const logs = await prisma.gameLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limitNum,
      })

      reply.send({
        success: true,
        data: {
          logs,
        },
      })
    } catch (error) {
      fastify.log.error('获取游戏日志失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 获取资源节点状态
   */
  fastify.get('/resources', async (request, reply) => {
    try {
      const nodes = GatheringService.getAllActiveNodes()

      reply.send({
        success: true,
        data: {
          nodes,
        },
      })
    } catch (error) {
      fastify.log.error('获取资源节点失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 获取配方列表
   */
  fastify.get('/recipes', async (request, reply) => {
    try {
      const recipes = CraftingService.getAllRecipes()

      reply.send({
        success: true,
        data: {
          recipes,
        },
      })
    } catch (error) {
      fastify.log.error('获取配方失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 全服广播消息
   */
  fastify.post('/broadcast', async (request, reply) => {
    try {
      const { message } = request.body as { message: string }

      // 简化处理：暂时只记录日志
      // 实际项目中应通过 WebSocket 广播
      console.log('[GM 广播]:', message)

      // 记录 GM 操作
      await prisma.gameLog.create({
        data: {
          type: 'GM_BROADCAST',
          message,
        },
      })

      reply.send({
        success: true,
        message: '广播发送成功',
      })
    } catch (error) {
      fastify.log.error('发送广播失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 重置玩家背包
   */
  fastify.post('/players/:id/inventory/reset', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      // 删除所有背包物品
      await prisma.inventoryItem.deleteMany({
        where: {
          characterId: id,
        },
      })

      // 记录 GM 操作
      await prisma.gameLog.create({
        data: {
          type: 'GM_ACTION',
          message: 'GM 重置玩家背包',
          characterId: id,
        },
      })

      reply.send({
        success: true,
        message: '重置背包成功',
      })
    } catch (error) {
      fastify.log.error('重置背包失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 删除玩家
   */
  fastify.delete('/players/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      // 先删除背包物品
      await prisma.inventoryItem.deleteMany({
        where: {
          characterId: id,
        },
      })

      // 删除角色
      await prisma.character.delete({
        where: { id },
      })

      // 记录 GM 操作
      await prisma.gameLog.create({
        data: {
          type: 'GM_ACTION',
          message: 'GM 删除玩家',
          characterId: id,
        },
      })

      reply.send({
        success: true,
        message: '删除玩家成功',
      })
    } catch (error) {
      fastify.log.error('删除玩家失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 获取服务器状态
   */
  fastify.get('/server/status', async (request, reply) => {
    try {
      const uptime = process.uptime()
      const memoryUsage = process.memoryUsage()

      reply.send({
        success: true,
        data: {
          uptime: Math.floor(uptime),
          memoryUsage: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          },
          platform: process.platform,
          nodeVersion: process.version,
        },
      })
    } catch (error: any) {
      console.error('获取服务器状态失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 社交系统管理
   */

  // 获取玩家好友列表
  fastify.get('/players/:id/friends', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const friends = await prisma.friend.findMany({
        where: {
          OR: [
            { characterId: id },
            { friendId: id },
          ],
        },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              level: true,
              isOnline: true,
            },
          },
          friend: {
            select: {
              id: true,
              name: true,
              level: true,
              isOnline: true,
            },
          },
        },
      })

      reply.send({
        success: true,
        data: {
          friends: friends.map(f => ({
            id: f.id,
            characterId: f.characterId,
            friendId: f.friendId,
            status: f.status,
            character: f.character,
            friend: f.friend,
          })),
        },
      })
    } catch (error: any) {
      console.error('获取玩家好友失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 获取玩家队伍信息
  fastify.get('/players/:id/party', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const partyMember = await prisma.partyMember.findFirst({
        where: {
          characterId: id,
        },
        include: {
          party: {
            include: {
              members: {
                include: {
                  character: {
                    select: {
                      id: true,
                      name: true,
                      level: true,
                      isOnline: true,
                      zoneId: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      reply.send({
        success: true,
        data: {
          party: partyMember?.party || null,
        },
      })
    } catch (error: any) {
      console.error('获取玩家队伍失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 获取聊天记录
  fastify.get('/chat/history', async (request, reply) => {
    try {
      const { type, characterId, limit } = request.query as {
        type?: string
        characterId?: string
        limit?: string
      }

      const limitNum = limit ? parseInt(limit, 10) : 100

      const where: any = {}
      if (type) {
        where.type = type
      }
      if (characterId) {
        where.OR = [
          { senderId: characterId },
          { receiverId: characterId },
        ]
      }

      const messages = await prisma.chatMessage.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              level: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limitNum,
      })

      reply.send({
        success: true,
        data: {
          messages,
        },
      })
    } catch (error: any) {
      console.error('获取聊天记录失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 删除聊天消息
  fastify.delete('/chat/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      await prisma.chatMessage.delete({
        where: { id },
      })

      reply.send({
        success: true,
        message: '消息已删除',
      })
    } catch (error: any) {
      console.error('删除聊天消息失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 禁言玩家
  fastify.post('/players/:id/mute', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { duration } = request.body as { duration: number } // 分钟
      
      // 简化处理：记录到 GameLog
      // 实际项目中需要添加 muteUntil 字段到 Character 模型
      await prisma.gameLog.create({
        data: {
          type: 'mute',
          message: `玩家被禁言 ${duration} 分钟`,
          characterId: id,
          data: JSON.stringify({ duration }),
        },
      })

      reply.send({
        success: true,
        message: `玩家已禁言 ${duration} 分钟`,
      })
    } catch (error: any) {
      console.error('禁言玩家失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 道具管理
   */

  // 给予玩家大喇叭
  fastify.post('/players/:id/give-horn', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { quantity = 10 } = request.body as { quantity?: number }
      
      // 检查物品是否存在
      const horn = await prisma.item.findUnique({
        where: { id: 'world_horn' },
      })

      if (!horn) {
        reply.status(404).send({
          success: false,
          error: '大喇叭物品不存在',
        })
        return
      }

      // 检查玩家是否已有大喇叭
      const existing = await prisma.inventoryItem.findFirst({
        where: {
          characterId: id,
          itemId: 'world_horn',
        },
      })

      if (existing) {
        // 增加数量
        await prisma.inventoryItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + quantity,
          },
        })
      } else {
        // 创建新物品
        await prisma.inventoryItem.create({
          data: {
            characterId: id,
            itemId: 'world_horn',
            quantity,
          },
        })
      }

      // 记录日志
      await prisma.gameLog.create({
        data: {
          type: 'gm_give_item',
          message: `GM 给予玩家 ${quantity} 个大喇叭`,
          characterId: id,
          data: JSON.stringify({ itemId: 'world_horn', quantity }),
        },
      })

      reply.send({
        success: true,
        message: `已给予玩家 ${quantity} 个大喇叭`,
      })
    } catch (error: any) {
      console.error('给予大喇叭失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 获取全服大喇叭统计
  fastify.get('/items/world-horn/stats', async (request, reply) => {
    try {
      // 统计大喇叭分布
      const stats = await prisma.inventoryItem.groupBy({
        by: ['characterId'],
        where: {
          itemId: 'world_horn',
        },
        _sum: {
          quantity: true,
        },
      })

      const totalHorns = stats.reduce((sum, s) => sum + (s._sum.quantity || 0), 0)
      const playerCount = stats.length

      reply.send({
        success: true,
        data: {
          totalHorns,
          playerCount,
          distribution: stats.map(s => ({
            characterId: s.characterId,
            quantity: s._sum.quantity || 0,
          })),
        },
      })
    } catch (error: any) {
      console.error('获取大喇叭统计失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })
}
