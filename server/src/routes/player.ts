import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 玩家断线
 * POST /api/v1/player/disconnect
 */
async function playerDisconnect(fastify: FastifyInstance, request: any, reply: any) {
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

    return reply.status(200).send({
      success: true,
      message: '断线保存成功',
      position: {
        mapId: character.mapId,
        x: character.x,
        y: character.y
      }
    })
  } catch (error) {
    console.error('玩家断线失败:', error)
    return reply.status(500).send({
      success: false,
      error: '断线保存失败'
    })
  }
}

/**
 * 玩家重连
 * POST /api/v1/player/reconnect
 */
async function playerReconnect(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId } = request.body

    if (!characterId) {
      return reply.status(400).send({
        success: false,
        error: '缺少角色 ID'
      })
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        user: true
      }
    })

    if (!character) {
      return reply.status(404).send({
        success: false,
        error: '角色不存在'
      })
    }

    // 检查是否已经在在线
    if (character.isOnline) {
      return reply.status(400).send({
        success: false,
        error: '角色已在线'
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

    return reply.status(200).send({
      success: true,
      message: '重连成功',
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
        mapId: character.mapId,
        x: character.x,
        y: character.y,
        isOnline: true
      }
    })
  } catch (error) {
    console.error('玩家重连失败:', error)
    return reply.status(500).send({
      success: false,
      error: '重连失败'
    })
  }
}

/**
 * 获取离线奖励
 * GET /api/v1/player/offline-rewards/:characterId
 */
async function getOfflineRewards(fastify: FastifyInstance, request: any, reply: any) {
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

    const lastLogin = character.lastLoginAt || character.createdAt
    const offlineSeconds = Math.floor((Date.now() - lastLogin.getTime()) / 1000)
    
    // 最多计算 24 小时的离线奖励
    const cappedSeconds = Math.min(offlineSeconds, 86400)
    const offlineHours = cappedSeconds / 3600

    // 每小时奖励：10 银币 + 50 经验
    const silverReward = Math.floor(offlineHours * 10)
    const expReward = Math.floor(offlineHours * 50)

    return reply.status(200).send({
      success: true,
      data: {
        offlineSeconds,
        offlineHours: offlineHours.toFixed(2),
        silverReward,
        expReward,
        capped: offlineSeconds > 86400
      }
    })
  } catch (error) {
    console.error('获取离线奖励失败:', error)
    return reply.status(500).send({
      success: false,
      error: '获取离线奖励失败'
    })
  }
}

/**
 * 领取离线奖励
 * POST /api/v1/player/claim-offline-rewards
 */
async function claimOfflineRewards(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId } = request.body

    if (!characterId) {
      return reply.status(400).send({
        success: false,
        error: '缺少角色 ID'
      })
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId }
    })

    if (!character) {
      return reply.status(404).send({
        success: false,
        error: '角色不存在'
      })
    }

    const lastLogin = character.lastLoginAt || character.createdAt
    const offlineSeconds = Math.floor((Date.now() - lastLogin.getTime()) / 1000)
    
    // 最多计算 24 小时的离线奖励
    const cappedSeconds = Math.min(offlineSeconds, 86400)
    const offlineHours = cappedSeconds / 3600

    const silverReward = Math.floor(offlineHours * 10)
    const expReward = Math.floor(offlineHours * 50)

    if (silverReward <= 0 && expReward <= 0) {
      return reply.status(400).send({
        success: false,
        error: '没有可领取的奖励'
      })
    }

    // 发放奖励
    await prisma.character.update({
      where: { id: characterId },
      data: {
        silver: { increment: silverReward },
        exp: { increment: expReward },
        lastLoginAt: new Date()
      }
    })

    return reply.status(200).send({
      success: true,
      message: '领取成功',
      rewards: {
        silver: silverReward,
        exp: expReward
      }
    })
  } catch (error) {
    console.error('领取离线奖励失败:', error)
    return reply.status(500).send({
      success: false,
      error: '领取离线奖励失败'
    })
  }
}

/**
 * 玩家路由
 */
export async function playerRoutes(fastify: FastifyInstance) {
  fastify.post('/player/disconnect', playerDisconnect)
  fastify.post('/player/reconnect', playerReconnect)
  fastify.get('/player/offline-rewards/:characterId', getOfflineRewards)
  fastify.post('/player/claim-offline-rewards', claimOfflineRewards)
}
