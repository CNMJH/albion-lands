import { FastifyInstance } from 'fastify'
import { FriendService } from '../services/FriendService'
import { PartyService } from '../services/PartyService'
import { ChatService } from '../services/ChatService'

/**
 * 社交系统路由
 * 好友、组队、聊天
 */
export async function socialRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * 好友系统
   */

  // 获取好友列表 (路径参数版本)
  fastify.get('/friends/:characterId', async (request, reply) => {
    try {
      const params = request.params as { characterId: string }
      const { characterId } = params
      
      const friends = await FriendService.getFriendList(characterId)
      
      reply.send({
        success: true,
        data: {
          friends,
        },
      })
    } catch (error: any) {
      console.error('获取好友列表失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 获取好友列表 (查询参数版本 - 向后兼容)
  fastify.get('/friends', async (request, reply) => {
    try {
      const { characterId } = request.query as { characterId: string }
      
      const friends = await FriendService.getFriendList(characterId)
      
      reply.send({
        success: true,
        data: {
          friends,
        },
      })
    } catch (error: any) {
      console.error('获取好友列表失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 发送好友请求
  fastify.post('/friends/request', async (request, reply) => {
    try {
      const { characterId, friendCharacterId } = request.body as {
        characterId: string
        friendCharacterId: string
      }

      const result = await FriendService.sendRequest(characterId, friendCharacterId)
      
      if (result.success) {
        reply.send({ success: true, message: '好友请求已发送' })
      } else {
        reply.status(400).send({ success: false, error: result.error })
      }
    } catch (error: any) {
      console.error('发送好友请求失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 接受好友请求
  fastify.post('/friends/accept', async (request, reply) => {
    try {
      const { characterId, friendCharacterId } = request.body as {
        characterId: string
        friendCharacterId: string
      }

      const result = await FriendService.acceptRequest(characterId, friendCharacterId)
      
      if (result.success) {
        reply.send({ success: true, message: '已添加为好友' })
      } else {
        reply.status(400).send({ success: false, error: result.error })
      }
    } catch (error: any) {
      console.error('接受好友请求失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 拒绝好友请求
  fastify.post('/friends/reject', async (request, reply) => {
    try {
      const { characterId, friendCharacterId } = request.body as {
        characterId: string
        friendCharacterId: string
      }

      const result = await FriendService.rejectRequest(characterId, friendCharacterId)
      
      reply.send({
        success: result.success,
        message: '已拒绝好友请求',
      })
    } catch (error: any) {
      console.error('拒绝好友请求失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 删除好友
  fastify.delete('/friends/:friendCharacterId', async (request, reply) => {
    try {
      const { characterId } = request.query as { characterId: string }
      const { friendCharacterId } = request.params as { friendCharacterId: string }

      const result = await FriendService.removeFriend(characterId, friendCharacterId)
      
      reply.send({
        success: result.success,
        message: '已删除好友',
      })
    } catch (error: any) {
      console.error('删除好友失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 获取待处理请求
  fastify.get('/friends/pending', async (request, reply) => {
    try {
      const { characterId } = request.query as { characterId: string }
      
      const requests = await FriendService.getPendingRequests(characterId)
      
      reply.send({
        success: true,
        data: {
          requests,
        },
      })
    } catch (error: any) {
      console.error('获取好友请求失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 获取拉黑列表
  fastify.get('/friends/blocked', async (request, reply) => {
    try {
      const { characterId } = request.query as { characterId: string }
      
      const blocks = await FriendService.getBlockList(characterId)
      
      reply.send({
        success: true,
        data: {
          blocks,
        },
      })
    } catch (error: any) {
      console.error('获取拉黑列表失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 拉黑用户
  fastify.post('/friends/block', async (request, reply) => {
    try {
      const { characterId, targetUserId } = request.body as {
        characterId: string
        targetUserId: string
      }

      const result = await FriendService.blockUser(characterId, targetUserId)
      
      reply.send({
        success: result.success,
        message: '已拉黑用户',
      })
    } catch (error: any) {
      console.error('拉黑用户失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 取消拉黑
  fastify.post('/friends/unblock', async (request, reply) => {
    try {
      const { characterId, targetUserId } = request.body as {
        characterId: string
        targetUserId: string
      }

      const result = await FriendService.unblockUser(characterId, targetUserId)
      
      reply.send({
        success: result.success,
        message: '已取消拉黑',
      })
    } catch (error: any) {
      console.error('取消拉黑失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 组队系统
   */

  // 创建队伍
  fastify.post('/party', async (request, reply) => {
    try {
      const { leaderId, name, isPublic } = request.body as {
        leaderId: string
        name?: string
        isPublic?: boolean
      }

      const party = await PartyService.createParty(leaderId, name, isPublic)
      
      reply.send({
        success: true,
        data: {
          party,
        },
      })
    } catch (error) {
      console.error('创建队伍失败:', error)
      reply.status(400).send({ success: false, error: (error as any).message })
    }
  })

  // 获取队伍信息
  fastify.get('/party/:partyId', async (request, reply) => {
    try {
      const { partyId } = request.params as { partyId: string }
      
      const party = await PartyService.getPartyInfo(partyId)
      
      reply.send({
        success: true,
        data: {
          party,
        },
      })
    } catch (error) {
      console.error('获取队伍信息失败:', error)
      reply.status(404).send({ success: false, error: '队伍不存在' })
    }
  })

  // 获取玩家的队伍
  fastify.get('/party/member/:characterId', async (request, reply) => {
    try {
      const { characterId } = request.params as { characterId: string }
      
      const party = await PartyService.getPlayerParty(characterId)
      
      reply.send({
        success: true,
        data: {
          party,
        },
      })
    } catch (error) {
      console.error('获取玩家队伍失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 加入队伍
  fastify.post('/party/:partyId/join', async (request, reply) => {
    try {
      const { partyId } = request.params as { partyId: string }
      const { characterId } = request.body as { characterId: string }

      const result = await PartyService.joinParty(partyId, characterId)
      
      if (result.success) {
        reply.send({ success: true, message: '已加入队伍' })
      } else {
        reply.status(400).send({ success: false, error: result.error })
      }
    } catch (error) {
      console.error('加入队伍失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 离开队伍
  fastify.post('/party/:partyId/leave', async (request, reply) => {
    try {
      const { partyId } = request.params as { partyId: string }
      const { characterId } = request.body as { characterId: string }

      const result = await PartyService.leaveParty(partyId, characterId)
      
      reply.send({
        success: result.success,
        data: result,
      })
    } catch (error) {
      console.error('离开队伍失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 踢出队伍
  fastify.post('/party/:partyId/kick', async (request, reply) => {
    try {
      const { partyId } = request.params as { partyId: string }
      const { leaderId, targetId } = request.body as {
        leaderId: string
        targetId: string
      }

      const result = await PartyService.kickMember(partyId, leaderId, targetId)
      
      if (result.success) {
        reply.send({ success: true, message: '已踢出队伍' })
      } else {
        reply.status(400).send({ success: false, error: result.error })
      }
    } catch (error) {
      console.error('踢出队伍失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 解散队伍
  fastify.delete('/party/:partyId', async (request, reply) => {
    try {
      const { partyId } = request.params as { partyId: string }

      const result = await PartyService.disbandParty(partyId)
      
      reply.send({
        success: result.success,
        message: '队伍已解散',
      })
    } catch (error) {
      console.error('解散队伍失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 获取公开队伍列表
  fastify.get('/party/public', async (_request, reply) => {
    try {
      const parties = await PartyService.getPublicParties()
      
      reply.send({
        success: true,
        data: {
          parties,
        },
      })
    } catch (error) {
      console.error('获取公开队伍失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  /**
   * 聊天系统
   */

  // 发送私聊
  fastify.post('/chat/whisper', async (request, reply) => {
    try {
      const { senderId, receiverId, content } = request.body as {
        senderId: string
        receiverId: string
        content: string
      }

      const result = await ChatService.sendWhisper(senderId, receiverId, content)
      
      if (result.success) {
        reply.send({ success: true, message: '消息已发送' })
      } else {
        reply.status(400).send({ success: false, error: result.error })
      }
    } catch (error) {
      console.error('发送私聊失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 发送队伍消息
  fastify.post('/chat/party', async (request, reply) => {
    try {
      const { senderId, partyId, content } = request.body as {
        senderId: string
        partyId: string
        content: string
      }

      const result = await ChatService.sendPartyMessage(senderId, partyId, content)
      
      if (result.success) {
        reply.send({ success: true, message: '消息已发送' })
      } else {
        reply.status(400).send({ success: false, error: result.error })
      }
    } catch (error) {
      console.error('发送队伍消息失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 发送区域消息
  fastify.post('/chat/zone', async (request, reply) => {
    try {
      const { senderId, zoneId, content } = request.body as {
        senderId: string
        zoneId: string
        content: string
      }

      const result = await ChatService.sendZoneMessage(senderId, zoneId, content)
      
      if (result.success) {
        reply.send({ success: true, message: '消息已发送' })
      } else {
        reply.status(400).send({ success: false, error: result.error })
      }
    } catch (error) {
      console.error('发送区域消息失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 发送全局消息
  fastify.post('/chat/global', async (request, reply) => {
    try {
      const { senderId, content } = request.body as {
        senderId: string
        content: string
      }

      const result = await ChatService.sendGlobalMessage(senderId, content)
      
      if (result.success) {
        reply.send({ success: true, message: '消息已发送' })
      } else {
        reply.status(400).send({ success: false, error: result.error })
      }
    } catch (error) {
      console.error('发送全局消息失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })

  // 获取聊天记录
  fastify.get('/chat/history', async (request, reply) => {
    try {
      const { type, targetId, limit = 50 } = request.query as {
        type: string
        targetId?: string
        limit?: number
      }

      let messages: any[] = []
      
      switch (type) {
        case 'whisper':
          if (targetId) {
            messages = await ChatService.getWhisperHistory(targetId.split(',')[0], targetId.split(',')[1], limit)
          }
          break
        case 'party':
          if (targetId) {
            messages = await ChatService.getPartyHistory(targetId, limit)
          }
          break
        case 'zone':
          if (targetId) {
            messages = await ChatService.getZoneHistory(targetId, limit)
          }
          break
        case 'global':
          messages = await ChatService.getGlobalHistory(limit)
          break
      }
      
      reply.send({
        success: true,
        data: {
          messages,
        },
      })
    } catch (error: any) {
      console.error('获取聊天记录失败:', error)
      reply.status(500).send({ success: false, error: '服务器错误' })
    }
  })
}
