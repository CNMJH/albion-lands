import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 获取等级排行榜
 * GET /api/v1/leaderboard/level
 */
async function getLevelLeaderboard(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const limit = parseInt(request.query.limit || '50', 10)

    const characters = await prisma.character.findMany({
      orderBy: { level: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        level: true,
        exp: true,
        isBot: true
      }
    })

    return reply.status(200).send({
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
}

/**
 * 获取 PVP 排行榜
 * GET /api/v1/leaderboard/pvp
 */
async function getPVPLeaderboard(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const limit = parseInt(request.query.limit || '50', 10)

    const pvpStats = await prisma.pVPStats.findMany({
      orderBy: { rating: 'desc' },
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

    return reply.status(200).send({
      success: true,
      leaderboard: pvpStats.map((stat, index) => ({
        rank: index + 1,
        characterId: stat.characterId,
        name: stat.character.name,
        level: stat.character.level,
        rating: stat.rating,
        kills: stat.kills,
        deaths: stat.deaths,
        assists: stat.assists,
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
}

/**
 * 获取财富排行榜
 * GET /api/v1/leaderboard/wealth
 */
async function getWealthLeaderboard(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const limit = parseInt(request.query.limit || '50', 10)

    const characters = await prisma.character.findMany({
      orderBy: { silver: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        level: true,
        silver: true,
        gold: true,
        isBot: true
      }
    })

    return reply.status(200).send({
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
}

/**
 * 获取击杀排行榜
 * GET /api/v1/leaderboard/kills
 */
async function getKillsLeaderboard(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const limit = parseInt(request.query.limit || '50', 10)

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

    return reply.status(200).send({
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
}

/**
 * 获取我的排名
 * GET /api/v1/leaderboard/my-rank/:characterId
 */
async function getMyRank(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId } = request.params
    const { type = 'level' } = request.query

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

    return reply.status(200).send({
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
}

/**
 * 排行榜路由
 */
export async function leaderboardRoutes(fastify: FastifyInstance) {
  fastify.get('/leaderboard/level', getLevelLeaderboard)
  fastify.get('/leaderboard/pvp', getPVPLeaderboard)
  fastify.get('/leaderboard/wealth', getWealthLeaderboard)
  fastify.get('/leaderboard/kills', getKillsLeaderboard)
  fastify.get('/leaderboard/my-rank/:characterId', getMyRank)
}
