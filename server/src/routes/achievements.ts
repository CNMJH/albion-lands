// 简化版 achievement 路由 - 移除严格类型注解
import { prisma } from '../prisma'

/**
 * 成就路由
 * GET /api/v1/achievements/:characterId - 获取角色成就
 * POST /api/v1/achievements/update - 更新成就进度
 */
export async function achievementRoutes(fastify: any) {
  // 获取角色成就
  fastify.get('/achievements/:characterId', async (request: any, reply: any) => {
    try {
      const { characterId } = request.params

      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '缺少 characterId 参数'
        })
      }

      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: {
          achievementProgress: {
            include: {
              achievement: true
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

      const achievements = character.achievementProgress.map((progress: any) => ({
        achievementId: progress.achievementId,
        name: progress.achievement.name,
        description: progress.achievement.description,
        target: progress.achievement.target,
        reward: progress.achievement.reward,
        progress: progress.progress,
        completed: progress.completed,
        completedAt: progress.completedAt
      }))

      return reply.send({
        success: true,
        achievements
      })
    } catch (error: any) {
      fastify.log.error('获取成就失败：' + String(error))
      return reply.status(500).send({
        success: false,
        error: '获取成就失败'
      })
    }
  })

  // 更新成就进度
  fastify.post('/achievements/update', async (request: any, reply: any) => {
    try {
      const { characterId, type, value } = request.body

      if (!characterId || !type || value === undefined) {
        return reply.status(400).send({
          success: false,
          error: '参数不完整'
        })
      }

      // 查找对应类型的成就
      const achievements = await prisma.achievement.findMany({
        where: { type }
      })

      const updates = []
      for (const achievement of achievements) {
        const progress = await prisma.achievementProgress.upsert({
          where: {
            characterId_achievementId: {
              characterId,
              achievementId: achievement.id
            }
          },
          update: {
            current: {
              increment: value
            }
          },
          create: {
            characterId,
            achievementId: achievement.id,
            current: value,
            completed: false
          }
        })

        // 检查是否完成
        if (progress.current >= 1 && !progress.completed) {
          await prisma.achievementProgress.update({
            where: { id: progress.id },
            data: { completed: true, completedAt: new Date() }
          })
          
          // 发放奖励 (简化版)
          console.log(`成就已完成：${progress.achievementId}`)
        }

        updates.push(progress)
      }

      return reply.send({
        success: true,
        updates
      })
    } catch (error: any) {
      fastify.log.error('更新成就失败：' + String(error))
      return reply.status(500).send({
        success: false,
        error: '更新成就失败'
      })
    }
  })
}
