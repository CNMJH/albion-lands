import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 地图路由
 */
export async function mapRoutes(fastify: FastifyInstance) {
  // 获取所有地图
  fastify.get('/maps', async (request: any, reply: any) => {
    try {
      const maps = await prisma.gameMap.findMany({
        orderBy: { safetyLevel: 'desc' }
      })

      return reply.status(200).send({ success: true, maps })
    } catch (error) {
      console.error('获取地图失败:', error)
      return reply.status(500).send({ success: false, error: '获取地图失败' })
    }
  })

  // 获取指定地图详情
  fastify.get('/maps/:mapId', async (request: any, reply: any) => {
    try {
      const { mapId } = request.params
      const map = await prisma.gameMap.findUnique({ where: { id: mapId } })

      if (!map) {
        return reply.status(404).send({ success: false, error: '地图不存在' })
      }

      return reply.status(200).send({ success: true, map })
    } catch (error) {
      console.error('获取地图详情失败:', error)
      return reply.status(500).send({ success: false, error: '获取地图详情失败' })
    }
  })

  // 获取地图上的掉落物
  fastify.get('/maps/:mapId/drops', async (request: any, reply: any) => {
    try {
      const { mapId } = request.params
      const drops = await prisma.droppedItem.findMany({
        where: { mapId },
        include: { item: { select: { id: true, name: true, icon: true, rarity: true } } }
      })

      return reply.status(200).send({ success: true, drops, total: drops.length })
    } catch (error) {
      console.error('获取地图掉落物失败:', error)
      return reply.status(500).send({ success: false, error: '获取地图掉落物失败' })
    }
  })
}
