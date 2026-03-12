import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'

const users: FastifyPluginAsync = async (fastify) => {
  // 获取用户列表
  fastify.get('/', async (request, reply) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          character: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      return {
        users: users.map(u => ({
          id: u.id,
          email: u.email,
          createdAt: u.createdAt,
          character: u.character ? {
            id: u.character.id,
            name: u.character.name,
            level: u.character.level,
          } : null,
        })),
        total: users.length,
      }
    } catch (error: any) {
      fastify.log.error(`获取用户列表失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })

  // 获取用户详情
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          character: true,
        },
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: '用户不存在',
        })
      }

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        character: user.character ? {
          id: user.character.id,
          name: user.character.name,
          level: user.character.level,
          zoneId: user.character.zoneId,
          isOnline: user.character.isOnline,
        } : null,
      }
    } catch (error: any) {
      fastify.log.error(`获取用户详情失败：${error.message}`)
      reply.status(500).send({
        success: false,
        error: '服务器错误',
      })
    }
  })
}

export default users
