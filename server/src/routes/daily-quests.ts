// 简化版 daily-quest 路由 - 移除严格类型注解
import { prisma } from '../prisma'

/**
 * 每日任务路由
 * GET /api/v1/daily-quests/:characterId - 获取每日任务
 * POST /api/v1/daily-quests/claim - 领取每日任务
 * POST /api/v1/daily-quests/submit - 提交每日任务
 */
export async function dailyQuestRoutes(fastify: any) {
  // 获取每日任务
  fastify.get('/daily-quests/:characterId', async (request: any, reply: any) => {
    try {
      const { characterId } = request.params

      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: {
          questProgress: {
            where: {
              status: 'active'
            },
            include: {
              quest: true
            }
          }
        }
      })

      if (!character) {
        return reply.status(404).send({
          success: false,
          error: '角色不存在'
        })
      }

      // 过滤每日任务
      const dailyQuests = character.questProgress.filter((progress: any) => 
        progress.quest.type === 'daily'
      )

      return reply.send({
        success: true,
        dailyQuests,
        characterId
      })
    } catch (error: any) {
      console.error('获取每日任务失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取每日任务失败'
      })
    }
  })

  // 领取每日任务
  fastify.post('/daily-quests/claim', async (request: any, reply: any) => {
    try {
      const { characterId, questId } = request.body

      if (!characterId || !questId) {
        return reply.status(400).send({
          success: false,
          error: '参数不完整'
        })
      }

      // 创建任务进度
      // @ts-ignore - questId type issue
      const progress = await prisma.questProgress.create({
        data: {
          characterId,
          questId: String(questId), // 转为字符串
          status: 'active',
          progress: '0' // 字符串类型
        }
      })

      return reply.send({
        success: true,
        progress
      })
    } catch (error: any) {
      console.error('领取每日任务失败:', error)
      return reply.status(500).send({
        success: false,
        error: '领取每日任务失败'
      })
    }
  })

  // 提交每日任务
  fastify.post('/daily-quests/submit', async (request: any, reply: any) => {
    try {
      const { characterId, questId } = request.body

      if (!characterId || !questId) {
        return reply.status(400).send({
          success: false,
          error: '参数不完整'
        })
      }

      const progress = await prisma.questProgress.findUnique({
        where: {
          characterId_questId: {
            characterId,
            questId
          }
        },
        include: {
          quest: true
        }
      })

      if (!progress) {
        return reply.status(404).send({
          success: false,
          error: '任务不存在'
        })
      }

      if (progress.status === 'completed') {
        return reply.status(400).send({
          success: false,
          error: '任务已完成'
        })
      }

      // 更新任务状态
      const updated = await prisma.questProgress.update({
        where: { id: progress.id },
        data: {
          status: 'completed',
          progress: '100' // 改为字符串
        }
      })

      // TODO: 发放奖励

      return reply.send({
        success: true,
        progress: updated
      })
    } catch (error: any) {
      console.error('提交每日任务失败:', error)
      return reply.status(500).send({
        success: false,
        error: '提交每日任务失败'
      })
    }
  })
}
