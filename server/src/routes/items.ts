import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'

const items: FastifyPluginAsync = async (fastify) => {
  // 获取物品列表
  fastify.get('/', async (request, reply) => {
    try {
      const { type, rarity, minLevel, maxLevel } = request.query as {
        type?: string
        rarity?: string
        minLevel?: string
        maxLevel?: string
      }

      const where: any = {}
      if (type) where.type = type
      if (rarity) where.rarity = rarity
      if (minLevel || maxLevel) {
        where.minLevel = {}
        if (minLevel) where.minLevel.gte = parseInt(minLevel, 10)
        if (maxLevel) where.minLevel.lte = parseInt(maxLevel, 10)
      }

      const items = await prisma.item.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
      })

      reply.send({
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          rarity: item.rarity,
          minLevel: item.minLevel,
          stackSize: item.stackSize,
          basePrice: item.basePrice,
          icon: item.icon,
          slot: item.slot,
          stats: item.stats ? JSON.parse(item.stats) : {},
        })),
        total: items.length,
      })
    } catch (error: any) {
      fastify.log.error(`获取物品列表失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 获取物品详情
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      const item = await prisma.item.findUnique({
        where: { id },
      })

      if (!item) {
        return reply.status(404).send({
          success: false,
          error: '物品不存在',
        })
      }

      reply.send({
        id: item.id,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        minLevel: item.minLevel,
        stackSize: item.stackSize,
        basePrice: item.basePrice,
        icon: item.icon,
        slot: item.slot,
        description: item.description,
        stats: item.stats ? JSON.parse(item.stats) : {},
      })
    } catch (error: any) {
      fastify.log.error(`获取物品详情失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })
}

export default items
