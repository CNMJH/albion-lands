import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 获取角色成就
 * GET /api/v1/achievements/:characterId
 */
async function getAchievements(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId } = request.params

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

    return reply.status(200).send({
      success: true,
      achievements: character.achievementProgress,
      characterId
    })
  } catch (error) {
    console.error('获取成就失败:', error)
    return reply.status(500).send({
      success: false,
      error: '获取成就失败'
    })
  }
}

/**
 * 更新成就进度
 * POST /api/v1/achievements/update
 */
async function updateAchievement(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId, type, value } = request.body

    if (!characterId || !type) {
      return reply.status(400).send({
        success: false,
        error: '参数不完整'
      })
    }

    // 成就类型定义
    const achievementTypes: Record<string, { name: string; description: string; targets: number[]; rewardSilver: number[]; rewardExp: number[] }> = {
      'monster_kill': {
        name: '怪物猎手',
        description: '累计击杀怪物',
        targets: [10, 50, 100, 500, 1000],
        rewardSilver: [100, 500, 1000, 5000, 10000],
        rewardExp: [50, 200, 500, 2000, 5000]
      },
      'player_kill': {
        name: 'PVP 勇士',
        description: '累计击杀玩家',
        targets: [1, 5, 10, 50, 100],
        rewardSilver: [500, 2000, 5000, 20000, 50000],
        rewardExp: [200, 800, 2000, 8000, 20000]
      },
      'death': {
        name: '不屈意志',
        description: '累计死亡次数',
        targets: [10, 50, 100, 500, 1000],
        rewardSilver: [50, 200, 500, 2000, 5000],
        rewardExp: [20, 100, 200, 1000, 2000]
      },
      'level': {
        name: '成长之路',
        description: '角色等级',
        targets: [10, 20, 30, 50, 100],
        rewardSilver: [200, 1000, 2000, 10000, 50000],
        rewardExp: [100, 500, 1000, 5000, 20000]
      },
      'silver': {
        name: '财富积累',
        description: '累计银币（千）',
        targets: [10, 50, 100, 500, 1000],
        rewardSilver: [100, 500, 1000, 5000, 10000],
        rewardExp: [50, 200, 500, 2000, 5000]
      },
      'item_craft': {
        name: '工匠大师',
        description: '累计制造物品',
        targets: [10, 50, 100, 500, 1000],
        rewardSilver: [100, 500, 1000, 5000, 10000],
        rewardExp: [50, 200, 500, 2000, 5000]
      },
      'resource_gather': {
        name: '采集专家',
        description: '累计采集资源',
        targets: [50, 200, 500, 2000, 5000],
        rewardSilver: [50, 200, 500, 2000, 5000],
        rewardExp: [20, 100, 200, 1000, 2000]
      }
    }

    const achievementData = achievementTypes[type]
    if (!achievementData) {
      return reply.status(400).send({
        success: false,
        error: '无效的成就类型'
      })
    }

    // 检查当前进度
    let progress = await prisma.achievementProgress.findFirst({
      where: {
        characterId,
        achievement: {
          type
        }
      },
      include: {
        achievement: true
      }
    })

    // 如果没有进度记录，创建初始记录
    if (!progress) {
      // 先创建成就定义（如果不存在）
      let achievement = await prisma.achievement.findFirst({
        where: { type }
      })

      if (!achievement) {
        achievement = await prisma.achievement.create({
          data: {
            type,
            name: achievementData.name,
            description: achievementData.description,
            category: 'general',
            target: achievementData.targets[4].toString(),
            rewardSilver: achievementData.rewardSilver[4],
            rewardExp: achievementData.rewardExp[4]
          }
        })
      }

      progress = await prisma.achievementProgress.create({
        data: {
          characterId,
          achievementId: achievement.id,
          progress: value,
          completed: false
        },
        include: {
          achievement: true
        }
      })
    }

    // 更新进度
    const newProgress = Math.max(progress.progress, value)
    await prisma.achievementProgress.update({
      where: { id: progress.id },
      data: {
        progress: newProgress
      }
    })

    // 检查是否达成成就
    const rewards: Array<{ tier: number; silver: number; exp: number }> = []
    
    for (let i = achievementData.targets.length - 1; i >= 0; i--) {
      if (newProgress >= achievementData.targets[i] && !progress.completed) {
        // 达成新 tier
        rewards.push({
          tier: i + 1,
          silver: achievementData.rewardSilver[i],
          exp: achievementData.rewardExp[i]
        })

        // 发放奖励
        await prisma.character.update({
          where: { id: characterId },
          data: {
            silver: { increment: achievementData.rewardSilver[i] },
            exp: { increment: achievementData.rewardExp[i] }
          }
        })

        // 更新完成状态
        await prisma.achievementProgress.update({
          where: { id: progress.id },
          data: {
            completed: true,
            completedAt: new Date()
          }
        })
      }
    }

    return reply.status(200).send({
      success: true,
      data: {
        type,
        progress: newProgress,
        rewards
      }
    })
  } catch (error) {
    console.error('更新成就失败:', error)
    return reply.status(500).send({
      success: false,
      error: '更新成就失败'
    })
  }
}

/**
 * 成就路由
 */
export async function achievementRoutes(fastify: FastifyInstance) {
  fastify.get('/achievements/:characterId', getAchievements)
  fastify.post('/achievements/update', updateAchievement)
}
