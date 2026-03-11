import { prisma } from '../prisma'

/**
 * 队伍成员角色
 */
export type PartyRole = 'Leader' | 'Member'

/**
 * 队伍成员信息
 */
export interface PartyMemberInfo {
  id: string
  partyId: string
  characterId: string
  role: PartyRole
  character: {
    id: string
    name: string
    level: number
    isOnline: boolean
    zoneId: string
    x: number
    y: number
  }
}

/**
 * 队伍信息
 */
export interface PartyInfo {
  id: string
  leaderId: string
  name?: string
  maxMembers: number
  isPublic: boolean
  members: PartyMemberInfo[]
  createdAt: Date
  updatedAt: Date
}

/**
 * 组队服务
 * 处理队伍相关逻辑
 */
export class PartyService {
  /**
   * 创建队伍
   */
  public static async createParty(
    leaderId: string,
    name?: string,
    isPublic: boolean = false
  ): Promise<PartyInfo> {
    // 检查是否已经在队伍中
    const existing = await prisma.partyMember.findFirst({
      where: {
        characterId: leaderId,
      },
    })

    if (existing) {
      throw new Error('已经在队伍中')
    }

    // 创建队伍
    const party = await prisma.party.create({
      data: {
        leaderId,
        name,
        maxMembers: 3,
        isPublic,
      },
    })

    // 添加队长
    await prisma.partyMember.create({
      data: {
        partyId: party.id,
        characterId: leaderId,
        role: 'Leader',
      },
    })

    return this.getPartyInfo(party.id)
  }

  /**
   * 获取队伍信息
   */
  public static async getPartyInfo(partyId: string): Promise<PartyInfo> {
    const party = await prisma.party.findUnique({
      where: { id: partyId },
      include: {
        members: {
          include: {
            character: true,
          },
        },
      },
    })

    if (!party) {
      throw new Error('队伍不存在')
    }

    return {
      id: party.id,
      leaderId: party.leaderId,
      name: party.name || undefined,
      maxMembers: party.maxMembers,
      isPublic: party.isPublic,
      members: party.members.map(m => ({
        id: m.id,
        partyId: m.partyId,
        characterId: m.characterId,
        role: m.role as PartyRole,
        character: m.character,
      })),
      createdAt: party.createdAt,
      updatedAt: party.updatedAt,
    }
  }

  /**
   * 邀请玩家加入队伍
   */
  public static async invitePlayer(
    partyId: string,
    leaderId: string,
    targetId: string
  ): Promise<{ success: boolean; error?: string }> {
    const party = await this.getPartyInfo(partyId)

    // 检查是否是队长
    if (party.leaderId !== leaderId) {
      return { success: false, error: '只有队长可以邀请' }
    }

    // 检查队伍是否已满
    if (party.members.length >= party.maxMembers) {
      return { success: false, error: '队伍已满' }
    }

    // 检查目标是否已经在队伍中
    const inParty = party.members.some(m => m.characterId === targetId)
    if (inParty) {
      return { success: false, error: '目标已在队伍中' }
    }

    // TODO: 发送邀请通知
    return { success: true }
  }

  /**
   * 接受邀请加入队伍
   */
  public static async joinParty(
    partyId: string,
    characterId: string
  ): Promise<{ success: boolean; error?: string }> {
    const party = await this.getPartyInfo(partyId)

    // 检查队伍是否已满
    if (party.members.length >= party.maxMembers) {
      return { success: false, error: '队伍已满' }
    }

    // 检查是否已经在队伍中
    const inParty = party.members.some(m => m.characterId === characterId)
    if (inParty) {
      return { success: false, error: '已在队伍中' }
    }

    // 添加成员
    await prisma.partyMember.create({
      data: {
        partyId,
        characterId,
        role: 'Member',
      },
    })

    return { success: true }
  }

  /**
   * 离开队伍
   */
  public static async leaveParty(
    partyId: string,
    characterId: string
  ): Promise<{ success: boolean; error?: string; newLeaderId?: string }> {
    const party = await this.getPartyInfo(partyId)

    // 查找成员
    const member = party.members.find(m => m.characterId === characterId)
    if (!member) {
      return { success: false, error: '不在队伍中' }
    }

    // 如果是队长
    if (member.role === 'Leader') {
      // 转移队长或解散队伍
      if (party.members.length > 1) {
        // 转移给第一个成员
        const newLeader = party.members.find(m => m.characterId !== characterId)
        if (newLeader) {
          await prisma.partyMember.update({
            where: { id: newLeader.id },
            data: { role: 'Leader' },
          })

          await prisma.party.update({
            where: { id: partyId },
            data: { leaderId: newLeader.characterId },
          })

          // 删除原队长
          await prisma.partyMember.delete({
            where: { id: member.id },
          })

          return { success: true, newLeaderId: newLeader.characterId }
        }
      } else {
        // 解散队伍
        await this.disbandParty(partyId)
        return { success: true }
      }
    } else {
      // 普通成员直接离开
      await prisma.partyMember.delete({
        where: { id: member.id },
      })
    }

    return { success: true }
  }

  /**
   * 踢出队伍
   */
  public static async kickMember(
    partyId: string,
    leaderId: string,
    targetId: string
  ): Promise<{ success: boolean; error?: string }> {
    const party = await this.getPartyInfo(partyId)

    // 检查是否是队长
    if (party.leaderId !== leaderId) {
      return { success: false, error: '只有队长可以踢人' }
    }

    // 查找目标成员
    const member = party.members.find(m => m.characterId === targetId)
    if (!member) {
      return { success: false, error: '目标不在队伍中' }
    }

    // 不能踢自己
    if (member.characterId === leaderId) {
      return { success: false, error: '不能踢自己' }
    }

    // 删除成员
    await prisma.partyMember.delete({
      where: { id: member.id },
    })

    return { success: true }
  }

  /**
   * 解散队伍
   */
  public static async disbandParty(partyId: string): Promise<{ success: boolean }> {
    await prisma.party.delete({
      where: { id: partyId },
    })

    return { success: true }
  }

  /**
   * 获取玩家的队伍
   */
  public static async getPlayerParty(characterId: string): Promise<PartyInfo | null> {
    const member = await prisma.partyMember.findFirst({
      where: {
        characterId,
      },
      include: {
        party: {
          include: {
            members: {
              include: {
                character: true,
              },
            },
          },
        },
      },
    })

    if (!member) {
      return null
    }

    const party = member.party
    return {
      id: party.id,
      leaderId: party.leaderId,
      name: party.name || undefined,
      maxMembers: party.maxMembers,
      isPublic: party.isPublic,
      members: party.members.map(m => ({
        id: m.id,
        partyId: m.partyId,
        characterId: m.characterId,
        role: m.role as PartyRole,
        character: m.character,
      })),
      createdAt: party.createdAt,
      updatedAt: party.updatedAt,
    }
  }

  /**
   * 更新队伍成员状态
   */
  public static async updateMemberStatus(
    partyId: string,
    characterId: string,
    isOnline: boolean
  ): Promise<void> {
    await prisma.character.update({
      where: { id: characterId },
      data: { isOnline },
    })
  }

  /**
   * 获取公开队伍列表
   */
  public static async getPublicParties(): Promise<PartyInfo[]> {
    const parties = await prisma.party.findMany({
      where: {
        isPublic: true,
      },
      include: {
        members: {
          include: {
            character: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return parties.map(party => ({
      id: party.id,
      leaderId: party.leaderId,
      name: party.name || undefined,
      maxMembers: party.maxMembers,
      isPublic: party.isPublic,
      members: party.members.map(m => ({
        id: m.id,
        partyId: m.partyId,
        characterId: m.characterId,
        role: m.role as PartyRole,
        character: m.character,
      })),
      createdAt: party.createdAt,
      updatedAt: party.updatedAt,
    }))
  }
}
