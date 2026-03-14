import { FastifyPluginAsync } from 'fastify'

/**
 * 成就路由
 * 提供成就相关 API
 */
export const achievementRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取所有成就
  fastify.get('/achievements', async (_request, reply) => {
    try {
      // 临时返回空数组，等待成就表创建
      reply.send({
        success: true,
        data: [],
        message: '成就系统开发中',
      })
    } catch (error) {
      fastify.log.error(`获取成就列表失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取成就列表失败',
      })
    }
  })

  // 获取单个成就
  fastify.get('/achievements/:achievementId', async (_request, reply) => {
    try {
      reply.send({
        success: true,
        data: null,
        message: '成就系统开发中',
      })
    } catch (error) {
      fastify.log.error(`获取成就失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取成就失败',
      })
    }
  })

  // 获取角色成就进度
  fastify.get('/characters/:characterId/achievements', async (_request, reply) => {
    try {
      reply.send({
        success: true,
        data: [],
        message: '成就系统开发中',
      })
    } catch (error) {
      fastify.log.error(`获取角色成就失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取角色成就失败',
      })
    }
  })

  // 更新成就进度
  fastify.post('/characters/:characterId/achievements/:achievementId/progress', async (_request, reply) => {
    try {
      reply.send({
        success: true,
        message: '成就进度已更新（开发中）',
      })
    } catch (error) {
      fastify.log.error(`更新成就进度失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '更新成就进度失败',
      })
    }
  })

  // 完成成就
  fastify.post('/characters/:characterId/achievements/:achievementId/complete', async (_request, reply) => {
    try {
      reply.send({
        success: true,
        message: '成就已完成（开发中）',
      })
    } catch (error) {
      fastify.log.error(`完成成就失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '完成成就失败',
      })
    }
  })
}
