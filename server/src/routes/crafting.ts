// 简化版 crafting 路由 - 移除严格类型注解
import { prisma } from '../prisma'

/**
 * 制造路由
 * GET /api/v1/crafting/recipes - 获取所有配方
 * POST /api/v1/crafting/craft - 制造物品
 */
export async function craftingRoutes(fastify: any) {
  // 获取所有配方
  fastify.get('/crafting/recipes', async (request: any, reply: any) => {
    try {
      // 临时返回空列表，等待配方系统实现
      return reply.send({
        success: true,
        recipes: []
      })
    } catch (error: any) {
      fastify.log.error('获取配方失败：' + String(error))
      return reply.status(500).send({
        success: false,
        error: '获取配方失败'
      })
    }
  })

  // 制造物品
  fastify.post('/crafting/craft', async (request: any, reply: any) => {
    try {
      const { characterId, recipeId, quantity } = request.body

      if (!characterId || !recipeId) {
        return reply.status(400).send({
          success: false,
          error: '参数不完整'
        })
      }

      // 临时返回成功，等待配方系统实现
      return reply.send({
        success: true,
        message: '制造功能开发中，请稍后'
      })
    } catch (error: any) {
      fastify.log.error('制造物品失败：' + String(error))
      return reply.status(500).send({
        success: false,
        error: '制造物品失败'
      })
    }
  })
}
