import { prisma } from '../prisma'

/**
 * 好友请求状态
 */
export type FriendStatus = 'pending' | 'accepted' | 'blocked'

/**
 * 好友信息
 */
export interface FriendInfo {
  id: string
  userId: string
  friendId: string
  status: FriendStatus
  friend: {
    id: string
    name: string
    level: number
    isOnline: boolean
    zoneId: string
  }
}

/**
 * 好友服务
 * 处理好友相关逻辑
 */
export class FriendService {
  /**
   * 发送好友请求
   */
  public static async sendRequest(
    characterId: string,
    friendCharacterId: string
  ): Promise<{ success: boolean; error?: string }> {
    // 不能添加自己为好友
    if (characterId === friendCharacterId) {
      return { success: false, error: '不能添加自己为好友' }
    }

    // 检查是否已经是好友
    const existing = await prisma.friend.findFirst({
      where: {
        characterId,
        friendId: friendCharacterId,
      },
    })

    if (existing) {
      if (existing.status === 'accepted') {
        return { success: false, error: '已经是好友了' }
      }
      if (existing.status === 'pending') {
        return { success: false, error: '好友请求已发送' }
      }
      if (existing.status === 'blocked') {
        return { success: false, error: '已被对方拉黑' }
      }
    }

    // 创建好友请求
    await prisma.friend.create({
      data: {
        characterId,
        friendId: friendCharacterId,
        status: 'pending',
      },
    })

    return { success: true }
  }

  /**
   * 接受好友请求
   */
  public static async acceptRequest(
    characterId: string,
    friendCharacterId: string
  ): Promise<{ success: boolean; error?: string }> {
    // 更新请求状态
    await prisma.friend.updateMany({
      where: {
        characterId: friendCharacterId,
        friendId: characterId,
        status: 'pending',
      },
      data: {
        status: 'accepted',
      },
    })

    // 创建反向好友关系
    await prisma.friend.create({
      data: {
        characterId,
        friendId: friendCharacterId,
        status: 'accepted',
      },
    })

    return { success: true }
  }

  /**
   * 拒绝好友请求
   */
  public static async rejectRequest(
    characterId: string,
    friendCharacterId: string
  ): Promise<{ success: boolean }> {
    await prisma.friend.deleteMany({
      where: {
        characterId: friendCharacterId,
        friendId: characterId,
        status: 'pending',
      },
    })

    return { success: true }
  }

  /**
   * 删除好友
   */
  public static async removeFriend(
    characterId: string,
    friendCharacterId: string
  ): Promise<{ success: boolean }> {
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { characterId, friendId: friendCharacterId },
          { characterId: friendCharacterId, friendId: characterId },
        ],
      },
    })

    return { success: true }
  }

  /**
   * 拉黑用户
   */
  public static async blockUser(
    characterId: string,
    targetCharacterId: string
  ): Promise<{ success: boolean }> {
    // 删除现有好友关系
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { characterId, friendId: targetCharacterId },
          { characterId: targetCharacterId, friendId: characterId },
        ],
      },
    })

    // 创建拉黑记录
    await prisma.friend.create({
      data: {
        characterId,
        friendId: targetCharacterId,
        status: 'blocked',
      },
    })

    return { success: true }
  }

  /**
   * 取消拉黑
   */
  public static async unblockUser(
    characterId: string,
    targetCharacterId: string
  ): Promise<{ success: boolean }> {
    await prisma.friend.deleteMany({
      where: {
        characterId,
        friendId: targetCharacterId,
        status: 'blocked',
      },
    })

    return { success: true }
  }

  /**
   * 获取好友列表
   */
  public static async getFriendList(characterId: string): Promise<FriendInfo[]> {
    const friends = await prisma.friend.findMany({
      where: {
        characterId,
        status: 'accepted',
      },
      include: {
        friend: true,
      },
    })

    return friends.map(f => ({
      id: f.id,
      userId: f.characterId,
      friendId: f.friendId,
      status: f.status as FriendStatus,
      friend: f.friend,
    }))
  }

  /**
   * 获取待处理的好友请求
   */
  public static async getPendingRequests(characterId: string): Promise<FriendInfo[]> {
    const requests = await prisma.friend.findMany({
      where: {
        friendId: characterId,
        status: 'pending',
      },
      include: {
        friend: true,
      },
    })

    return requests.map(f => ({
      id: f.id,
      userId: f.characterId,
      friendId: f.friendId,
      status: f.status as FriendStatus,
      friend: f.friend,
    }))
  }

  /**
   * 获取拉黑列表
   */
  public static async getBlockList(characterId: string): Promise<FriendInfo[]> {
    const blocks = await prisma.friend.findMany({
      where: {
        characterId,
        status: 'blocked',
      },
      include: {
        friend: true,
      },
    })

    return blocks.map(f => ({
      id: f.id,
      userId: f.characterId,
      friendId: f.friendId,
      status: f.status as FriendStatus,
      friend: f.friend,
    }))
  }

  /**
   * 检查是否是好友
   */
  public static async areFriends(
    characterId1: string,
    characterId2: string
  ): Promise<boolean> {
    const friend = await prisma.friend.findFirst({
      where: {
        characterId: characterId1,
        friendId: characterId2,
        status: 'accepted',
      },
    })

    return !!friend
  }

  /**
   * 检查是否被拉黑
   */
  public static async isBlocked(
    characterId: string,
    targetCharacterId: string
  ): Promise<boolean> {
    const block = await prisma.friend.findFirst({
      where: {
        characterId,
        friendId: targetCharacterId,
        status: 'blocked',
      },
    })

    return !!block
  }

  /**
   * 获取在线好友数量
   */
  public static async getOnlineFriendCount(characterId: string): Promise<number> {
    const friends = await this.getFriendList(characterId)
    return friends.filter(f => f.friend.isOnline).length
  }
}
