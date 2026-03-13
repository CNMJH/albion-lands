import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * 获取每日任务
 * GET /api/v1/daily-quests/:characterId
 */
async function getDailyQuests(fastify: FastifyInstance, request: any, reply: any) {
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
    const dailyQuests = character.questProgress.filter(progress => 
      progress.quest.type === 'daily'
    )

    return reply.status(200).send({
      success: true,
      dailyQuests,
      characterId
    })
  } catch (error) {
    console.error('获取每日任务失败:', error)
    return reply.status(500).send({
      success: false,
      error: '获取每日任务失败'
    })
  }
}

/**
 * 领取每日任务
 * POST /api/v1/daily-quests/claim
 */
async function claimDailyQuest(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId, questId } = request.body

    if (!characterId || !questId) {
      return reply.status(400).send({
        success: false,
        error: '参数不完整'
      })
    }

    // 检查是否已有该任务
    const existingProgress = await prisma.questProgress.findFirst({
      where: {
        characterId,
        questId,
        status: 'active'
      }
    })

    if (existingProgress) {
      return reply.status(400).send({
        success: false,
        error: '任务已在进行中'
      })
    }

    // 创建任务进度
    const progress = await prisma.questProgress.create({
      data: {
        characterId,
        questId,
        status: 'active',
        progress: 0
      },
      include: {
        quest: true
      }
    })

    return reply.status(200).send({
      success: true,
      data: progress
    })
  } catch (error) {
    console.error('领取每日任务失败:', error)
    return reply.status(500).send({
      success: false,
      error: '领取每日任务失败'
    })
  }
}

/**
 * 提交每日任务
 * POST /api/v1/daily-quests/submit
 */
async function submitDailyQuest(fastify: FastifyInstance, request: any, reply: any) {
  try {
    const { characterId, questProgressId } = request.body

    if (!characterId || !questProgressId) {
      return reply.status(400).send({
        success: false,
        error: '参数不完整'
      })
    }

    const progress = await prisma.questProgress.findUnique({
      where: { id: questProgressId },
      include: {
        quest: true
      }
    })

    if (!progress) {
      return reply.status(404).send({
        success: false,
        error: '任务进度不存在'
      })
    }

    if (progress.characterId !== characterId) {
      return reply.status(403).send({
        success: false,
        error: '无权操作此任务'
      })
    }

    if (progress.status !== 'active') {
      return reply.status(400).send({
        success: false,
        error: '任务状态不正确'
      })
    }

    // 检查是否完成
    const target = progress.quest.target ? parseInt(progress.quest.target) : 0
    if (progress.progress < target) {
      return reply.status(400).send({
        success: false,
        error: `任务未完成 (${progress.progress}/${target})`
      })
    }

    // 更新任务状态
    await prisma.questProgress.update({
      where: { id: questProgressId },
      data: {
        status: 'completed'
      }
    })

    // 发放奖励
    const rewardSilver = progress.quest.rewardSilver || 0
    const rewardExp = progress.quest.rewardExp || 0

    await prisma.character.update({
      where: { id: characterId },
      data: {
        silver: { increment: rewardSilver },
        exp: { increment: rewardExp }
      }
    })

    // 如果有物品奖励
    if (progress.quest.rewardItemId) {
      await prisma.inventoryItem.upsert({
        where: {
          characterId_itemId: {
            characterId,
            itemId: progress.quest.rewardItemId
          }
        },
        update: {
          quantity: { increment: progress.quest.rewardItemQuantity || 1 }
        },
        create: {
          characterId,
          itemId: progress.quest.rewardItemId,
          quantity: progress.quest.rewardItemQuantity || 1,
          isEquipped: false,
          durability: 100
        }
      })
    }

    return reply.status(200).send({
      success: true,
      data: {
        questId: progress.questId,
        rewardSilver,
        rewardExp,
        rewardItemId: progress.quest.rewardItemId,
        rewardItemQuantity: progress.quest.rewardItemQuantity
      }
    })
  } catch (error) {
    console.error('提交每日任务失败:', error)
    return reply.status(500).send({
      success: false,
      error: '提交每日任务失败'
    })
  }
}

/**
 * 每日任务路由
 */
export async function dailyQuestRoutes(fastify: FastifyInstance) {
  fastify.get('/daily-quests/:characterId', getDailyQuests)
  fastify.post('/daily-quests/claim', claimDailyQuest)
  fastify.post('/daily-quests/submit', submitDailyQuest)
}
