import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'

/**
 * 排行榜路由
 * 提供排行榜相关 API
 */
export const leaderboardRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取综合排行榜
  fastify.get('/leaderboard', async (_request, reply) => {
    try {
      const characters = await prisma.character.findMany({
        orderBy: [
          { level: 'desc' },
          { exp: 'desc' },
        ],
        take: 100,
        select: {
          id: true,
          name: true,
          level: true,
          exp: true,
          silver: true,
          gold: true,
          createdAt: true,
        },
      })
      
      reply.send({
        success: true,
        data: characters,
      })
    } catch (error) {
      fastify.log.error(`获取排行榜失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取排行榜失败',
      })
    }
  })

  // 获取等级排行榜
  fastify.get('/leaderboard/level', async (_request, reply) => {
    try {
      const characters = await prisma.character.findMany({
        orderBy: [
          { level: 'desc' },
          { exp: 'desc' },
        ],
        take: 100,
        select: {
          id: true,
          name: true,
          level: true,
          exp: true,
        },
      })
      
      reply.send({
        success: true,
        data: characters,
      })
    } catch (error) {
      fastify.log.error(`获取等级排行榜失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取等级排行榜失败',
      })
    }
  })

  // 获取财富排行榜
  fastify.get('/leaderboard/wealth', async (_request, reply) => {
    try {
      const characters = await prisma.character.findMany({
        orderBy: [
          { gold: 'desc' },
          { silver: 'desc' },
        ],
        take: 100,
        select: {
          id: true,
          name: true,
          gold: true,
          silver: true,
        },
      })
      
      reply.send({
        success: true,
        data: characters,
      })
    } catch (error) {
      fastify.log.error(`获取财富排行榜失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取财富排行榜失败',
      })
    }
  })

  // 获取 PVP 排行榜
  fastify.get('/leaderboard/pvp', async (_request, reply) => {
    try {
      const pvpStats = await prisma.pVPStats.findMany({
        orderBy: { kills: 'desc' },
        take: 100,
        include: {
          character: {
            select: {
              id: true,
              name: true,
              level: true,
            },
          },
        },
      })
      
      const data = pvpStats.map(stat => ({
        characterId: stat.characterId,
        name: stat.character?.name || 'Unknown',
        level: stat.character?.level || 1,
        kills: stat.kills,
        deaths: stat.deaths,
        assists: stat.assists || 0,
        honorPoints: stat.honorPoints || 0,
      }))
      
      reply.send({
        success: true,
        data,
      })
    } catch (error) {
      fastify.log.error(`获取 PVP 排行榜失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取 PVP 排行榜失败',
      })
    }
  })

  // 获取 PVE 排行榜
  fastify.get('/leaderboard/pve', async (_request, reply) => {
    try {
      const characters = await prisma.character.findMany({
        orderBy: { stats: 'desc' },
        take: 100,
        select: {
          id: true,
          name: true,
          level: true,
          stats: true,
        },
      })
      
      reply.send({
        success: true,
        data: characters,
      })
    } catch (error) {
      fastify.log.error(`获取 PVE 排行榜失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取 PVE 排行榜失败',
      })
    }
  })

  // 获取角色排名
  fastify.get('/characters/:characterId/rank', async (request, reply) => {
    try {
      const { characterId } = request.params as { characterId: string }
      
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      })
      
      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在',
        })
      }
      
      // 计算等级排名
      const levelRank = await prisma.character.count({
        where: {
          OR: [
            { level: { gt: character.level } },
            { level: character.level, exp: { gt: character.exp } },
          ],
        },
      })
      
      reply.send({
        success: true,
        data: {
          characterId,
          name: character.name,
          level: character.level,
          levelRank: levelRank + 1,
        },
      })
    } catch (error) {
      fastify.log.error(`获取角色排名失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取角色排名失败',
      })
    }
  })
}
