// 简化版 leaderboard 路由 - 移除严格类型注解
import { prisma } from '../prisma'

/**
 * 排行榜路由
 * GET /api/v1/leaderboard/pvp - PVP 排行榜
 * GET /api/v1/leaderboard/pve - PVE 排行榜
 * GET /api/v1/leaderboard/wealth - 财富排行榜
 */
export async function leaderboardRoutes(fastify: any) {
  // PVP 排行榜
  fastify.get('/leaderboard/pvp', async (request: any, reply: any) => {
    try {
      const limit = parseInt(request.query.limit) || 100
      
      const leaderboard = await prisma.pVPStats.findMany({
        include: {
          character: {
            select: {
              id: true,
              name: true,
              level: true
            }
          }
        },
        orderBy: {
          kills: 'desc'
        },
        take: limit
      })

      return reply.send({
        success: true,
        leaderboard: leaderboard.map((entry: any) => ({
          characterId: entry.characterId,
          characterName: entry.character.name,
          level: entry.character.level,
          kills: entry.kills,
          deaths: entry.deaths,
          assists: entry.assists,
          honorPoints: entry.honorPoints,
          kd: entry.deaths > 0 ? (entry.kills / entry.deaths).toFixed(2) : entry.kills
        }))
      })
    } catch (error: any) {
      fastify.log.error('获取 PVP 排行榜失败：' + String(error))
      return reply.status(500).send({
        success: false,
        error: '获取 PVP 排行榜失败'
      })
    }
  })

  // PVE 排行榜
  fastify.get('/leaderboard/pve', async (request: any, reply: any) => {
    try {
      const limit = parseInt(request.query.limit) || 100
      
      const leaderboard = await prisma.character.findMany({
        select: {
          id: true,
          name: true,
          level: true,
          exp: true
        },
        orderBy: {
          exp: 'desc'
        },
        take: limit
      })

      return reply.send({
        success: true,
        leaderboard
      })
    } catch (error: any) {
      fastify.log.error('获取 PVE 排行榜失败：' + String(error))
      return reply.status(500).send({
        success: false,
        error: '获取 PVE 排行榜失败'
      })
    }
  })

  // 财富排行榜
  fastify.get('/leaderboard/wealth', async (request: any, reply: any) => {
    try {
      const limit = parseInt(request.query.limit) || 100
      
      const leaderboard = await prisma.character.findMany({
        select: {
          id: true,
          name: true,
          level: true,
          silver: true,
          gold: true
        },
        orderBy: {
          silver: 'desc'
        },
        take: limit
      })

      return reply.send({
        success: true,
        leaderboard: leaderboard.map((char: any) => ({
          characterId: char.id,
          characterName: char.name,
          level: char.level,
          silver: char.silver,
          gold: char.gold,
          total: char.silver + char.gold * 1000
        }))
      })
    } catch (error: any) {
      fastify.log.error('获取财富排行榜失败：' + String(error))
      return reply.status(500).send({
        success: false,
        error: '获取财富排行榜失败'
      })
    }
  })
}
