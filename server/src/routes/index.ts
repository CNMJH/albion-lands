import { FastifyInstance } from 'fastify'
import authRoutes from './auth'
import usersRoutes from './users'
import charactersRoutes from './characters'
import itemsRoutes from './items'
import marketRoutes from './market'
import inventoryRoutes from './inventory'
import { gmRoutes } from './gm'
import { socialRoutes } from './social'

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
  fastify.register(authRoutes, { prefix: '/api/v1/auth' })
  
  // 用户路由
  fastify.register(usersRoutes, { prefix: '/api/v1/users' })
  
  // 角色路由
  fastify.register(charactersRoutes, { prefix: '/api/v1/characters' })
  
  // 物品路由
  fastify.register(itemsRoutes, { prefix: '/api/v1/items' })
  
  // 市场路由
  fastify.register(marketRoutes, { prefix: '/api/v1/market' })
  
  // 背包路由
  fastify.register(inventoryRoutes, { prefix: '/api/v1/inventory' })
  
  // GM 工具路由
  fastify.register(gmRoutes, { prefix: '/api/v1/gm' })
  
  // 社交路由
  fastify.register(socialRoutes, { prefix: '/api/v1/social' })
}
