import { FastifyPluginAsync } from 'fastify'

const users: FastifyPluginAsync = async (fastify) => {
  // 获取用户列表
  fastify.get('/', async (request, reply) => {
    // TODO: 从数据库获取
    return {
      users: [],
      total: 0,
    }
  })

  // 获取用户详情
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any

    // TODO: 从数据库获取
    return {
      id,
      username: 'demo',
      email: 'demo@example.com',
    }
  })
}

export default users
