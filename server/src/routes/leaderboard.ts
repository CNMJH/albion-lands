import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../prisma'

/**
 * 排行榜路由
 * GET /api/v1/leaderboard/level - 等级排行榜
 * GET /api/v1/leaderboard/pvp - PVP 排行榜
 * GET /api/v1/leaderboard/wealth - 财富排行榜
 * GET /api/v1/leaderboard/kills - 击杀排行榜
 * GET /api/v1/leaderboard/my-rank/:characterId - 我的排名
 */
export async function leaderboardRoutes(fastify: FastifyInstance) {
  // 等级排行榜
  fastify.get('/leaderboard/level', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { limit?: string }
      const limit = parseInt(query.limit || '50', 10)

      const characters = await prisma.character.findMany({
        orderBy: { level: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          level: true,
          exp: true
        }
      })

      return reply.send({
        success: true,
        leaderboard: characters.map((char, index) => ({
          rank: index + 1,
          ...char
        }))
      })
    } catch (error) {
      console.error('获取等级排行榜失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取排行榜失败'
      })
    }
  })

  // PVP 排行榜
  fastify.get('/leaderboard/pvp', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { limit?: string }
      const limit = parseInt(query.limit || '50', 10)

      const pvpStats = await prisma.pVPStats.findMany({
        orderBy: { kills: 'desc' },
        take: limit,
        include: {
          character: {
            select: {
              id: true,
              name: true,
              level: true
            }
          }
        }
      })

      return reply.send({
        success: true,
        leaderboard: pvpStats.map((stat, index) => ({
          rank: index + 1,
          characterId: stat.characterId,
          name: stat.character.name,
          level: stat.character.level,
          kills: stat.kills,
          deaths: stat.deaths,
          assists: stat.assists,
          honorPoints: stat.honorPoints,
          kda: stat.kills > 0 ? ((stat.kills + stat.assists) / Math.max(1, stat.deaths)).toFixed(2) : '0.00'
        }))
      })
    } catch (error) {
      console.error('获取 PVP 排行榜失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取排行榜失败'
      })
    }
  })

  // 财富排行榜
  fastify.get('/leaderboard/wealth', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { limit?: string }
      const limit = parseInt(query.limit || '50', 10)

      const characters = await prisma.character.findMany({
        orderBy: { silver: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          level: true,
          silver: true,
          gold: true
        }
      })

      return reply.send({
        success: true,
        leaderboard: characters.map((char, index) => ({
          rank: index + 1,
          ...char,
          totalWealth: char.silver + char.gold * 1000
        }))
      })
    } catch (error) {
      console.error('获取财富排行榜失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取排行榜失败'
      })
    }
  })

  // 击杀排行榜
  fastify.get('/leaderboard/kills', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { limit?: string }
      const limit = parseInt(query.limit || '50', 10)

      const pvpStats = await prisma.pVPStats.findMany({
        orderBy: { kills: 'desc' },
        take: limit,
        include: {
          character: {
            select: {
              id: true,
              name: true,
              level: true
            }
          }
        }
      })

      return reply.send({
        success: true,
        leaderboard: pvpStats.map((stat, index) => ({
          rank: index + 1,
          characterId: stat.characterId,
          name: stat.character.name,
          level: stat.character.level,
          kills: stat.kills,
          deaths: stat.deaths
        }))
      })
    } catch (error) {
      console.error('获取击杀排行榜失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取排行榜失败'
      })
    }
  })

  // 我的排名
  fastify.get('/leaderboard/my-rank/:characterId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { characterId: string }
      const query = request.query as { type?: string }
      const { characterId } = params
      const type = query.type || 'level'

      const character = await prisma.character.findUnique({
        where: { id: characterId }
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      let rank = 0
      let total = 0

      if (type === 'level') {
        total = await prisma.character.count()
        const higher = await prisma.character.count({
          where: { level: { gt: character.level } }
        })
        rank = higher + 1
      } else if (type === 'wealth') {
        total = await prisma.character.count()
        const higher = await prisma.character.count({
          where: { silver: { gt: character.silver } }
        })
        rank = higher + 1
      } else if (type === 'pvp') {
        const pvpStat = await prisma.pVPStats.findUnique({
          where: { characterId }
        })
        if (pvpStat) {
          total = await prisma.pVPStats.count()
          const higher = await prisma.pVPStats.count({
            where: { rating: { gt: pvpStat.rating } }
          })
          rank = higher + 1
        }
      }

      return reply.send({
        success: true,
        data: {
          characterId,
          type,
          rank,
          total,
          percentile: total > 0 ? ((rank / total) * 100).toFixed(2) : '0.00'
        }
      })
    } catch (error) {
      console.error('获取我的排名失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取排名失败'
      })
    }
  })
}
