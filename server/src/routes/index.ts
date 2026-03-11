import { FastifyInstance } from 'fastify'

/**
 * 注册所有 HTTP 路由
 */
export function registerRoutes(fastify: FastifyInstance): void {
  // 健康检查
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: Date.now() }
  })

  // API 版本
  fastify.get('/api/v1', async (request, reply) => {
    return { 
      name: 'Hulu Lands API',
      version: '1.0.0',
      status: 'running'
    }
  })

  // 认证路由
  fastify.register(require('./routes/auth'), { prefix: '/api/v1/auth' })
  
  // 用户路由
  fastify.register(require('./routes/users'), { prefix: '/api/v1/users' })
  
  // 角色路由
  fastify.register(require('./routes/characters'), { prefix: '/api/v1/characters' })
  
  // 物品路由
  fastify.register(require('./routes/items'), { prefix: '/api/v1/items' })
  
  // 市场路由
  fastify.register(require('./routes/market'), { prefix: '/api/v1/market' })
}
