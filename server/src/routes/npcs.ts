import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma'

/**
 * NPC 路由
 */
export async function npcRoutes(fastify: FastifyInstance) {
  // 获取所有 NPC
  fastify.get('/npcs', async (request: any, reply: any) => {
    try {
      const npcs = await prisma.nPC.findMany({
        orderBy: { id: 'asc' }
      })

      return reply.status(200).send({
        success: true,
        npcs
      })
    } catch (error) {
      console.error('获取 NPC 失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取 NPC 失败'
      })
    }
  })

  // 获取指定 NPC 详情
  fastify.get('/npcs/:npcId', async (request: any, reply: any) => {
    try {
      const { npcId } = request.params

      const npc = await prisma.nPC.findUnique({
        where: { id: npcId }
      })

      if (!npc) {
        return reply.status(404).send({
          success: false,
          error: 'NPC 不存在'
        })
      }

      return reply.status(200).send({
        success: true,
        npc
      })
    } catch (error) {
      console.error('获取 NPC 详情失败:', error)
      return reply.status(500).send({
        success: false,
        error: '获取 NPC 详情失败'
      })
    }
  })

  // 与 NPC 交互
  fastify.post('/npcs/:npcId/interact', async (request: any, reply: any) => {
    try {
      const { npcId } = request.params
      const { characterId, action } = request.body

      if (!characterId) {
        return reply.status(400).send({
          success: false,
          error: '角色 ID 不能为空'
        })
      }

      const npc = await prisma.nPC.findUnique({
        where: { id: npcId }
      })

      if (!npc) {
        return reply.status(404).send({
          success: false,
          error: 'NPC 不存在'
        })
      }

      let response: any = {
        npcId,
        npcName: npc.name,
        action,
        dialogue: []
      }

      if (action === 'talk') {
        response.dialogue = npc.dialogue ? JSON.parse(npc.dialogue) : ['你好，旅行者！']
      } else if (action === 'trade') {
        if (npc.type !== 'merchant' && npc.type !== 'black_market') {
          return reply.status(400).send({
            success: false,
            error: '该 NPC 不提供交易服务'
          })
        }
        response.shop = npc.shopItems ? JSON.parse(npc.shopItems) : []
      } else if (action === 'quest') {
        if (npc.type !== 'quest_giver' && npc.type !== 'quest') {
          return reply.status(400).send({
            success: false,
            error: '该 NPC 不提供任务'
          })
        }
        response.quests = npc.quests ? JSON.parse(npc.quests) : []
      }

      return reply.status(200).send({
        success: true,
        data: response
      })
    } catch (error) {
      console.error('与 NPC 交互失败:', error)
      return reply.status(500).send({
        success: false,
        error: '与 NPC 交互失败'
      })
    }
  })
}
