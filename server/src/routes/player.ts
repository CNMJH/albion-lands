// 简化版 player 路由 - 移除严格类型注解
import { prisma } from '../prisma'

/**
 * 玩家路由
 * POST /api/v1/player/disconnect - 玩家断线
 * POST /api/v1/player/reconnect - 玩家重连
 * GET /api/v1/player/offline-rewards/:characterId - 获取离线奖励
 * POST /api/v1/player/claim-offline-rewards - 领取离线奖励
 */
export async function playerRoutes(fastify: any) {
  // 玩家断线
  fastify.post('/player/disconnect', async (request: any, reply: any) => {
    try {
      const { characterId } = request.body

      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '缺少角色 ID'
        })
      }

      // 保存当前位置
      const character = await prisma.character.findUnique({
        where: { id: characterId }
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      // 更新离线状态
      await prisma.character.update({
        where: { id: characterId },
        data: {
          isOnline: false,
          lastLoginAt: new Date()
        }
      })

      return reply.send({
        success: true,
        message: '断线保存成功',
        position: {
          zoneId: character.zoneId,
          x: character.x,
          y: character.y
        }
      })
    } catch (error: any) {
      console.error('玩家断线失败:', error)
      return reply.status(500).send({
        success: false,
        error: '断线保存失败'
      })
    }
  })

  // 玩家重连
  fastify.post('/player/reconnect', async (request: any, reply: any) => {
    try {
      const { characterId } = request.body

      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '缺少角色 ID'
        })
      }

      // 更新在线状态
      await prisma.character.update({
        where: { id: characterId },
        data: {
          isOnline: true,
          lastLoginAt: new Date()
        }
      })

      // 获取角色完整信息
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: {
          inventory: {
            include: {
              item: true
            }
          }
        }
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      return reply.send({
        success: true,
        character: {
          id: character.id,
          name: character.name,
          level: character.level,
          exp: character.exp,
          zoneId: character.zoneId,
          x: character.x,
          y: character.y,
          silver: character.silver,
          gold: character.gold,
          inventory: character.inventory
        }
      })
    } catch (error: any) {
      console.error('玩家重连失败:', error)
      return reply.status(500).send({
        success: false,
        error: '重连失败'
      })
    }
  })

  // 获取离线奖励
  fastify.get('/player/offline-rewards/:characterId', async (request: any, reply: any) => {
    try {
      const { characterId } = request.params

      const character = await prisma.character.findUnique({
        where: { id: characterId }
      })

      if (!character || !character.lastLoginAt) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      // 计算离线时间 (毫秒)
      const offlineMs = Date.now() - character.lastLoginAt.getTime()
      const offlineMinutes = Math.floor(offlineMs / 60000)

      // 离线奖励：每分钟 1 银币，最多 24 小时
      const maxMinutes = 24 * 60
      const rewardMinutes = Math.min(offlineMinutes, maxMinutes)
      const silverReward = rewardMinutes * 1

      return reply.send({
        success: true,
        offlineMinutes,
        rewardMinutes,
        silverReward
      })
    } catch (error: any) {
      console.error('获取离线奖励失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取离线奖励失败'
      })
    }
  })

  // 领取离线奖励
  fastify.post('/player/claim-offline-rewards', async (request: any, reply: any) => {
    try {
      const { characterId } = request.body

      const character = await prisma.character.findUnique({
        where: { id: characterId }
      })

      if (!character || !character.lastLoginAt) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      // 计算离线奖励
      const offlineMs = Date.now() - character.lastLoginAt.getTime()
      const offlineMinutes = Math.floor(offlineMs / 60000)
      const maxMinutes = 24 * 60
      const rewardMinutes = Math.min(offlineMinutes, maxMinutes)
      const silverReward = rewardMinutes * 1

      // 发放奖励
      await prisma.character.update({
        where: { id: characterId },
        data: {
          silver: character.silver + silverReward
        }
      })

      return reply.send({
        success: true,
        silverReward
      })
    } catch (error: any) {
      console.error('领取离线奖励失败:', error)
      return reply.status(500).send({
        success: false,
        error: '领取离线奖励失败'
      })
    }
  })
}
