import { useGameStore } from '../stores/gameStore'
import { network } from '../network/NetworkManager'
import { SKILL_CONFIGS, SkillConfig } from '../config/skills'

/**
 * Buff/Debuff 接口
 */
export interface Buff {
  id: string
  type: string
  value: number
  duration: number
  remainingTime: number
  stacks?: number
}

/**
 * 技能冷却信息
 */
export interface SkillCooldown {
  skillId: string
  remainingTime: number
  cooldownTime: number
}

/**
 * 技能系统
 * 负责技能释放、冷却管理、Buff 管理
 */
export class SkillSystem {
  private buffs: Map<string, Buff[]> = new Map() // playerId -> buffs
  private cooldowns: Map<string, SkillCooldown> = new Map() // skillId -> cooldown
  private skillQueue: Array<{ skillId: string; targetId?: string; x?: number; y?: number }> = []

  constructor() {
    console.log('技能系统初始化完成')
  }

  /**
   * 释放技能
   */
  public useSkill(
    skillId: string,
    targetId?: string,
    x?: number,
    y?: number
  ): boolean {
    const state = useGameStore.getState()
    if (!state.player) {
      console.warn('玩家未登录，无法释放技能')
      return false
    }

    // 检查冷却
    if (this.isOnCooldown(skillId)) {
      console.warn(`技能 ${skillId} 正在冷却中`)
      return false
    }

    // 获取技能配置
    const skillConfig = this.getSkillConfig(skillId)
    if (!skillConfig) {
      console.warn(`技能 ${skillId} 不存在`)
      return false
    }

    // 检查能量
    if (state.player.mp < skillConfig.energyCost) {
      console.warn(`能量不足，需要 ${skillConfig.energyCost}，当前 ${state.player.mp}`)
      return false
    }

    // 检查距离（如果是目标型技能）
    if (targetId && skillConfig.targetType === 'Single') {
      // TODO: 检查与目标的距离
    }

    // 发送技能消息到服务器
    network.send('skill', {
      skillId,
      targetId,
      x,
      y,
      timestamp: Date.now(),
    })

    // 本地执行技能效果
    this.executeSkill(skillConfig, state.player.id, targetId, x, y)

    // 开始冷却
    this.startCooldown(skillId, skillConfig.cooldown)

    // 消耗能量
    const newMp = Math.max(0, state.player.mp - skillConfig.energyCost)
    state.updatePlayer({ mp: newMp })

    console.log(`释放技能：${skillConfig.name} (${skillId})`)
    return true
  }

  /**
   * 执行技能效果（本地）
   */
  private executeSkill(
    config: SkillConfig,
    _casterId: string,
    targetId?: string,
    x?: number,
    y?: number
  ): void {
    const state = useGameStore.getState()
    const player = state.player
    if (!player) return

    switch (config.type) {
      case 'Damage':
        this.executeDamageSkill(config, player, targetId, x, y)
        break

      case 'Heal':
        this.executeHealSkill(config, player, targetId)
        break

      case 'Buff':
        this.executeBuffSkill(config, player)
        break

      case 'Debuff':
        this.executeDebuffSkill(config, player, targetId)
        break

      case 'Dash':
        this.executeDashSkill(config, player, x, y)
        break

      case 'Shield':
        this.executeShieldSkill(config, player, targetId)
        break
    }
  }

  /**
   * 执行伤害技能
   */
  private executeDamageSkill(
    config: SkillConfig,
    _player: any,
    _targetId?: string,
    _x?: number,
    _y?: number
  ): void {
    console.log(`伤害技能：${config.name}, 倍率：${config.damageMultiplier}x`)
    // 实际伤害计算由服务端完成
  }

  /**
   * 执行治疗技能
   */
  private executeHealSkill(
    config: SkillConfig,
    player: any,
    _targetId?: string
  ): void {
    if (!config.healAmount) return

    const state = useGameStore.getState()
    const newHp = Math.min(player.maxHp, player.hp + config.healAmount)
    state.updatePlayer({ hp: newHp })

    console.log(`治疗技能：${config.name}, 治疗量：${config.healAmount}`)
  }

  /**
   * 执行 Buff 技能
   */
  private executeBuffSkill(config: SkillConfig, player: any): void {
    if (!config.duration) return

    this.addBuff(player.id, {
      id: config.id,
      type: 'buff',
      value: 1,
      duration: config.duration,
      remainingTime: config.duration,
    })

    console.log(`Buff 技能：${config.name}, 持续：${config.duration}秒`)
  }

  /**
   * 执行 Debuff 技能
   */
  private executeDebuffSkill(
    config: SkillConfig,
    _player: any,
    targetId?: string
  ): void {
    if (!config.duration || !targetId) return

    // 对目标添加 Debuff（服务端处理）
    console.log(`Debuff 技能：${config.name}, 目标：${targetId}, 持续：${config.duration}秒`)
  }

  /**
   * 执行位移技能
   */
  private executeDashSkill(
    config: SkillConfig,
    _player: any,
    x?: number,
    y?: number
  ): void {
    if (x === undefined || y === undefined) return

    const state = useGameStore.getState()
    state.updatePlayer({ x, y })

    console.log(`位移技能：${config.name}, 目标位置：(${x}, ${y})`)
  }

  /**
   * 执行护盾技能
   */
  private executeShieldSkill(
    config: SkillConfig,
    player: any,
    _targetId?: string
  ): void {
    if (!config.duration) return

    this.addBuff(player.id, {
      id: config.id,
      type: 'shield',
      value: 80, // 护盾值
      duration: config.duration,
      remainingTime: config.duration,
    })

    console.log(`护盾技能：${config.name}, 护盾值：80, 持续：${config.duration}秒`)
  }

  /**
   * 添加 Buff
   */
  public addBuff(playerId: string, buff: Buff): void {
    if (!this.buffs.has(playerId)) {
      this.buffs.set(playerId, [])
    }

    const playerBuffs = this.buffs.get(playerId)!
    
    // 检查是否已有相同 Buff
    const existingBuff = playerBuffs.find(b => b.id === buff.id)
    if (existingBuff) {
      // 刷新持续时间
      existingBuff.remainingTime = buff.duration
    } else {
      playerBuffs.push(buff)
    }

    console.log(`添加 Buff: ${buff.id} 到玩家 ${playerId}`)
  }

  /**
   * 移除 Buff
   */
  public removeBuff(playerId: string, buffId: string): void {
    const playerBuffs = this.buffs.get(playerId)
    if (!playerBuffs) return

    const index = playerBuffs.findIndex(b => b.id === buffId)
    if (index > -1) {
      playerBuffs.splice(index, 1)
      console.log(`移除 Buff: ${buffId} 从玩家 ${playerId}`)
    }
  }

  /**
   * 获取玩家所有 Buff
   */
  public getBuffs(playerId: string): Buff[] {
    return this.buffs.get(playerId) || []
  }

  /**
   * 开始冷却
   */
  public startCooldown(skillId: string, cooldownTime: number): void {
    this.cooldowns.set(skillId, {
      skillId,
      remainingTime: cooldownTime,
      cooldownTime,
    })

    console.log(`技能冷却开始：${skillId}, ${cooldownTime}秒`)
  }

  /**
   * 检查是否在冷却中
   */
  public isOnCooldown(skillId: string): boolean {
    const cooldown = this.cooldowns.get(skillId)
    if (!cooldown) return false
    return cooldown.remainingTime > 0
  }

  /**
   * 获取冷却剩余时间
   */
  public getCooldownRemaining(skillId: string): number {
    const cooldown = this.cooldowns.get(skillId)
    if (!cooldown) return 0
    return cooldown.remainingTime
  }

  /**
   * 获取技能配置
   */
  public getSkillConfig(skillId: string): SkillConfig | undefined {
    return SKILL_CONFIGS.find(skill => skill.id === skillId)
  }

  /**
   * 获取所有技能配置
   */
  public getAllSkillConfigs(): SkillConfig[] {
    return SKILL_CONFIGS
  }

  /**
   * 根据武器类型获取技能
   */
  public getSkillsByWeapon(weaponType: string): SkillConfig[] {
    return SKILL_CONFIGS.filter(skill => skill.weaponType === weaponType)
  }

  /**
   * 更新冷却（每帧调用）
   */
  public update(deltaTime: number): void {
    // 更新所有冷却
    this.cooldowns.forEach((cooldown, skillId) => {
      if (cooldown.remainingTime > 0) {
        cooldown.remainingTime -= deltaTime
        if (cooldown.remainingTime <= 0) {
          console.log(`技能冷却完成：${skillId}`)
        }
      }
    })

    // 更新所有 Buff
    this.buffs.forEach((playerBuffs, playerId) => {
      for (let i = playerBuffs.length - 1; i >= 0; i--) {
        const buff = playerBuffs[i]
        buff.remainingTime -= deltaTime
        if (buff.remainingTime <= 0) {
          console.log(`Buff 到期：${buff.id} 从玩家 ${playerId}`)
          playerBuffs.splice(i, 1)
        }
      }
    })

    // 处理技能队列
    if (this.skillQueue.length > 0) {
      const skill = this.skillQueue.shift()!
      if (skill && !this.isOnCooldown(skill.skillId)) {
        this.useSkill(skill.skillId, skill.targetId, skill.x, skill.y)
      }
    }
  }

  /**
   * 加入技能队列
   */
  public queueSkill(skillId: string, targetId?: string, x?: number, y?: number): void {
    this.skillQueue.push({ skillId, targetId, x, y })
    console.log(`技能加入队列：${skillId}`)
  }

  /**
   * 清空技能队列
   */
  public clearQueue(): void {
    this.skillQueue = []
  }

  /**
   * 清除所有 Buff
   */
  public clearBuffs(playerId: string): void {
    this.buffs.delete(playerId)
  }

  /**
   * 清除所有冷却
   */
  public clearCooldowns(): void {
    this.cooldowns.clear()
  }
}

// 导出单例
export const skillSystem = new SkillSystem()
