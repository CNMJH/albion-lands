import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma'

/**
 * 技能路由
 * 提供技能相关 API
 */
export const skillsRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取所有技能
  fastify.get('/skills', async (_request, reply) => {
    try {
      // 临时返回空数组，等待技能表创建
      reply.send({
        success: true,
        data: [],
        message: '技能系统开发中',
      })
    } catch (error) {
      fastify.log.error(`获取技能列表失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取技能列表失败',
      })
    }
  })

  // 获取单个技能
  fastify.get('/skills/:skillId', async (_request, reply) => {
    try {
      reply.send({
        success: true,
        data: null,
        message: '技能系统开发中',
      })
    } catch (error) {
      fastify.log.error(`获取技能失败：${error}`)
      reply.status(500).send({
        success: false,
        error: '获取技能失败',
      })
    }
  })
}
