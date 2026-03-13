import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 复活点路由
 */
export async function respawnRoutes(fastify: FastifyInstance) {
  // 绑定复活点
  fastify.post('/respawn/bind', async (request: any, reply: any) => {
    try {
      const { characterId, mapId, x, y } = request.body as { characterId: string; mapId: string; x: number; y: number }

      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '角色 ID 不能为空'
        })
      }

      await prisma.character.upsert({
        where: { id: characterId },
        update: {
          respawnMapId: mapId,
          respawnX: x,
          respawnY: y
        },
        create: {
          id: characterId,
          userId: characterId,
          name: 'Unknown',
          level: 1,
          exp: 0,
          silver: 0,
          gold: 0,
          zoneId: mapId,
          x: 0,
          y: 0,
          respawnMapId: mapId,
          respawnX: x,
          respawnY: y
        }
      })

      return reply.status(200).send({
        success: true,
        message: '复活点绑定成功',
        data: { mapId, x, y }
      })
    } catch (error) {
      console.error('绑定复活点失败:', error)
      return reply.status(500).send({
        success: false,
        error: '绑定复活点失败'
      })
    }
  })

  // 获取绑定的复活点
  fastify.get('/respawn/:characterId', async (request: any, reply: any) => {
    try {
      const { characterId } = request.params

      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: {
          respawnMapId: true,
          respawnX: true,
          respawnY: true
        }
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      return reply.status(200).send({
        success: true,
        data: {
          mapId: character.respawnMapId,
          x: character.respawnX,
          y: character.respawnY
        }
      })
    } catch (error) {
      console.error('获取复活点失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取复活点失败'
      })
    }
  })

  // 重置复活点
  fastify.post('/respawn/reset', async (request: any, reply: any) => {
    try {
      const { characterId } = request.body as { characterId: string }

      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '角色 ID 不能为空'
        })
      }

      await prisma.character.update({
        where: { id: characterId },
        data: {
          respawnMapId: 'starter_city',
          respawnX: 0,
          respawnY: 0
        }
      })

      return reply.status(200).send({
        success: true,
        message: '复活点已重置到初始城市',
        data: { mapId: 'starter_city', x: 0, y: 0 }
      })
    } catch (error) {
      console.error('重置复活点失败:', error)
      return reply.status(500).send({
        success: false,
        error: '重置复活点失败'
      })
    }
  })
}
