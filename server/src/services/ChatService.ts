import { prisma } from '../prisma'
import { FriendService } from './FriendService'

/**
 * 聊天消息类型
 */
export type ChatType = 'whisper' | 'party' | 'zone' | 'global'

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string
  type: ChatType
  senderId: string
  receiverId?: string
  partyId?: string
  zoneId?: string
  content: string
  createdAt: Date
  sender?: {
    name: string
    level: number
  }
}

/**
 * 聊天服务
 * 处理聊天相关逻辑
 */
export class ChatService {
  /**
   * 发送私聊消息
   */
  public static async sendWhisper(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    // 检查是否被拉黑
    const isBlocked = await FriendService.isBlocked(receiverId, senderId)
    if (isBlocked) {
      return { success: false, error: '对方已拉黑你' }
    }

    // 限制消息长度
    if (content.length > 500) {
      return { success: false, error: '消息过长' }
    }

    // 保存消息
    await prisma.chatMessage.create({
      data: {
        type: 'whisper',
        senderId,
        receiverId,
        content,
      },
    })

    return { success: true }
  }

  /**
   * 发送队伍消息
   */
  public static async sendPartyMessage(
    senderId: string,
    partyId: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    // 检查是否在队伍中
    const member = await prisma.partyMember.findFirst({
      where: {
        partyId,
        characterId: senderId,
      },
    })

    if (!member) {
      return { success: false, error: '不在队伍中' }
    }

    // 限制消息长度
    if (content.length > 500) {
      return { success: false, error: '消息过长' }
    }

    // 保存消息
    await prisma.chatMessage.create({
      data: {
        type: 'party',
        senderId,
        partyId,
        content,
      },
    })

    return { success: true }
  }

  /**
   * 发送区域消息
   */
  public static async sendZoneMessage(
    senderId: string,
    zoneId: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    // 限制消息长度
    if (content.length > 500) {
      return { success: false, error: '消息过长' }
    }

    // 保存消息
    await prisma.chatMessage.create({
      data: {
        type: 'zone',
        senderId,
        zoneId,
        content,
      },
    })

    return { success: true }
  }

  /**
   * 发送全局消息（需要大喇叭）
   */
  public static async sendGlobalMessage(
    senderId: string,
    content: string,
    checkHorn: boolean = true
  ): Promise<{ success: boolean; error?: string; remaining?: number }> {
    // 限制消息长度
    if (content.length > 100) {
      return { success: false, error: '世界消息长度不能超过 100 字符' }
    }

    // 检查大喇叭
    if (checkHorn) {
      const character = await prisma.character.findUnique({
        where: { id: senderId },
        include: {
          inventory: true,
        },
      })

      if (!character) {
        return { success: false, error: '角色不存在' }
      }

      // 查找大喇叭
      const horn = character.inventory.find(
        item => item.itemId === 'world_horn' && item.quantity > 0
      )

      if (!horn) {
        return { 
          success: false, 
          error: '需要消耗大喇叭',
          remaining: 0
        }
      }

      // 扣除大喇叭
      await prisma.inventoryItem.update({
        where: { id: horn.id },
        data: {
          quantity: horn.quantity - 1,
        },
      })

      // 如果数量为 0，删除物品
      if (horn.quantity - 1 === 0) {
        await prisma.inventoryItem.delete({
          where: { id: horn.id },
        })
      }
    }

    // 保存消息
    await prisma.chatMessage.create({
      data: {
        type: 'global',
        senderId,
        content,
      },
    })

    // 获取剩余大喇叭数量
    const remaining = await prisma.inventoryItem.aggregate({
      where: {
        characterId: senderId,
        itemId: 'world_horn',
      },
      _sum: {
        quantity: true,
      },
    })

    return { 
      success: true,
      remaining: remaining._sum.quantity || 0
    }
  }

  /**
   * 获取私聊记录
   */
  public static async getWhisperHistory(
    userId1: string,
    userId2: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: {
        type: 'whisper',
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        sender: true,
      },
    })

    return messages.map(m => ({
      id: m.id,
      type: m.type as ChatType,
      senderId: m.senderId,
      receiverId: m.receiverId || undefined,
      content: m.content,
      createdAt: m.createdAt,
      sender: m.sender ? {
        name: m.sender.name,
        level: m.sender.level,
      } : undefined,
    }))
  }

  /**
   * 获取队伍聊天记录
   */
  public static async getPartyHistory(
    partyId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: {
        type: 'party',
        partyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        sender: true,
      },
    })

    return messages.map(m => ({
      id: m.id,
      type: m.type as ChatType,
      senderId: m.senderId,
      partyId: m.partyId || undefined,
      content: m.content,
      createdAt: m.createdAt,
      sender: m.sender ? {
        name: m.sender.name,
        level: m.sender.level,
      } : undefined,
    }))
  }

  /**
   * 获取区域聊天记录
   */
  public static async getZoneHistory(
    zoneId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: {
        type: 'zone',
        zoneId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        sender: true,
      },
    })

    return messages.map(m => ({
      id: m.id,
      type: m.type as ChatType,
      senderId: m.senderId,
      zoneId: m.zoneId || undefined,
      content: m.content,
      createdAt: m.createdAt,
      sender: m.sender ? {
        name: m.sender.name,
        level: m.sender.level,
      } : undefined,
    }))
  }

  /**
   * 获取全局聊天记录
   */
  public static async getGlobalHistory(limit: number = 50): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: {
        type: 'global',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        sender: true,
      },
    })

    return messages.map(m => ({
      id: m.id,
      type: m.type as ChatType,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt,
      sender: m.sender ? {
        name: m.sender.name,
        level: m.sender.level,
      } : undefined,
    }))
  }

  /**
   * 删除消息
   */
  public static async deleteMessage(
    messageId: string,
    characterId: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return { success: false, error: '消息不存在' }
    }

    // 只能删除自己的消息
    if (message.senderId !== characterId) {
      return { success: false, error: '不能删除他人的消息' }
    }

    await prisma.chatMessage.delete({
      where: { id: messageId },
    })

    return { success: true }
  }

  /**
   * 清理旧消息（保留最近 1000 条）
   */
  public static async cleanupOldMessages(): Promise<void> {
    const types: ChatType[] = ['whisper', 'party', 'zone', 'global']

    for (const type of types) {
      const count = await prisma.chatMessage.count({
        where: { type },
      })

      if (count > 1000) {
        const oldest = await prisma.chatMessage.findMany({
          where: { type },
          orderBy: { createdAt: 'asc' },
          take: count - 1000,
          select: { id: true },
        })

        const ids = oldest.map(m => m.id)
        await prisma.chatMessage.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        })
      }
    }
  }
}
