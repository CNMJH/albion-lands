import { FastifyPluginAsync } from 'fastify'

const auth: FastifyPluginAsync = async (fastify) => {
  // 注册
  fastify.post('/register', async (request, reply) => {
    const { email, username, password } = request.body as any

    // TODO: 实现注册逻辑
    fastify.log.info(`用户注册：${username}`)

    return {
      success: true,
      message: '注册成功',
    }
  })

  // 登录
  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body as any

    // TODO: 实现登录逻辑
    fastify.log.info(`用户登录：${username}`)

    return {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username,
        email,
      },
    }
  })

  // 登出
  fastify.post('/logout', async (request, reply) => {
    // TODO: 实现登出逻辑
    return { success: true }
  })
}

export default auth
