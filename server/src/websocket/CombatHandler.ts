import { FastifyInstance } from 'fastify'
import { CombatService } from '../services/CombatService'

/**
 * 战斗消息处理器
 */
export class CombatHandler {
  private playerPositions: Map<string, { x: number; y: number; zoneId: string }> = new Map()
  private monsterPositions: Map<string, { x: number; y: number; zoneId: string; templateId: string }> = new Map()

  constructor(private fastify: FastifyInstance) {}

  /**
   * 注册战斗相关的 WebSocket 消息处理器
   */
  public registerHandlers(sendToPlayer: (userId: string, type: string, payload: any) => void): void {
    // 移动
    this.fastify.get('/ws-handler/move', async (request, reply) => {
      const { userId, payload } = request.query as any
      await this.handleMove(userId, payload, sendToPlayer)
      return reply.send({ success: true })
    })

    // 攻击
    this.fastify.get('/ws-handler/attack', async (request, reply) => {
      const { userId, payload } = request.query as any
      await this.handleAttack(userId, payload, sendToPlayer)
      return reply.send({ success: true })
    })

    // 技能
    this.fastify.get('/ws-handler/skill', async (request, reply) => {
      const { userId, payload } = request.query as any
      await this.handleSkill(userId, payload, sendToPlayer)
      return reply.send({ success: true })
    })
  }

  /**
   * 处理移动
   */
  private async handleMove(
    userId: string,
    payload: { dx: number; dy: number; timestamp: number },
    sendToPlayer: (userId: string, type: string, payload: any) => void
  ): Promise<void> {
    const pos = this.playerPositions.get(userId)
    if (!pos) {
      this.fastify.log.warn(`玩家 ${userId} 位置不存在`)
      return
    }

    // 更新位置
    pos.x += payload.dx
    pos.y += payload.dy

    // 广播位置更新
    sendToPlayer(userId, 'move', {
      id: userId,
      x: pos.x,
      y: pos.y,
    })
  }

  /**
   * 处理攻击
   */
  private async handleAttack(
    userId: string,
    payload: { type: 'basic' | 'skill'; targetId?: string; timestamp: number },
    sendToPlayer: (userId: string, type: string, payload: any) => void
  ): Promise<void> {
    try {
      // 获取角色 ID（从用户 ID 映射）
      const character = await this.getCharacterByUserId(userId)
      if (!character) {
        this.fastify.log.warn(`用户 ${userId} 没有角色`)
        return
      }

      // 使用默认位置查找怪物
      const defaultPos = { x: 0, y: 0 }
      const targetMonster = this.findNearestMonster(character.id, defaultPos)
      if (!targetMonster) {
        this.fastify.log.warn('附近没有可攻击的怪物')
        return
      }

      // 执行攻击
      const result = await CombatService.playerAttackMonster(
        character.id,
        targetMonster.id,
        payload.type
      )

      if (result.success) {
        // 发送攻击结果
        sendToPlayer(userId, 'attack', {
          attackerId: userId,
          targetId: targetMonster.id,
          damage: result.damage,
          type: payload.type,
        })

        // 发送怪物 HP 更新
        sendToPlayer(userId, 'monsterHP', {
          monsterId: targetMonster.id,
          hp: result.monsterHP,
          maxHp: targetMonster.maxHp || 50,
        })

        // 如果怪物死亡
        if (result.monsterDead) {
          sendToPlayer(userId, 'monsterDeath', {
            monsterId: targetMonster.id,
            expGained: result.expGained,
            silverGained: result.silverGained,
          })

          // 更新玩家状态
          sendToPlayer(userId, 'playerUpdate', {
            exp: result.expGained,
            silver: result.silverGained,
          })
        }
      }
    } catch (error) {
      this.fastify.log.error(`处理攻击失败: ${error}`)
    }
  }

  /**
   * 处理技能
   */
  private async handleSkill(
    userId: string,
    payload: { skillIndex: number; targetId?: string; timestamp: number },
    sendToPlayer: (userId: string, type: string, payload: any) => void
  ): Promise<void> {
    // 简化处理：暂时只记录日志
    // 实际项目中应实现技能逻辑
    this.fastify.log.info(`玩家 ${userId} 使用技能 ${payload.skillIndex}`)

    sendToPlayer(userId, 'skill', {
      skillIndex: payload.skillIndex,
      timestamp: payload.timestamp,
    })
  }

  /**
   * 获取角色
   */
  private async getCharacterByUserId(userId: string): Promise<{ id: string } | null> {
    // 简化处理：返回模拟数据
    // 实际项目中应从数据库获取
    return { id: `char_${userId}` }
  }

  /**
   * 查找最近的怪物
   */
  private findNearestMonster(
    _characterId: string,
    pos: { x: number; y: number }
  ): { id: string; x: number; y: number; maxHp?: number } | null {
    // 简化处理：返回模拟数据
    // 实际项目中应查找附近的怪物实例
    return {
      id: 'monster_1',
      x: pos.x + 50,
      y: pos.y + 50,
      maxHp: 50,
    }
  }

  /**
   * 设置玩家位置
   */
  public setPlayerPosition(userId: string, x: number, y: number, zoneId: string): void {
    this.playerPositions.set(userId, { x, y, zoneId })
  }

  /**
   * 获取玩家位置
   */
  public getPlayerPosition(userId: string): { x: number; y: number; zoneId: string } | undefined {
    return this.playerPositions.get(userId)
  }

  /**
   * 生成怪物
   */
  public spawnMonster(zoneId: string, x: number, y: number, templateId: string): string {
    const monsterId = `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.monsterPositions.set(monsterId, { x, y, zoneId, templateId })
    return monsterId
  }

  /**
   * 获取区域所有怪物
   */
  public getMonstersInZone(zoneId: string): Array<{ id: string; x: number; y: number; templateId: string }> {
    const result: Array<{ id: string; x: number; y: number; templateId: string }> = []
    this.monsterPositions.forEach((pos, id) => {
      if (pos.zoneId === zoneId) {
        result.push({ id, x: pos.x, y: pos.y, templateId: pos.templateId })
      }
    })
    return result
  }
}
