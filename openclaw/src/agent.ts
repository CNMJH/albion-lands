import { OpenClawClient } from './OpenClawClient'
import { GameState, PlayerState, MonsterState, ItemState } from './types'

/**
 * AI 代理配置
 */
export interface AIAgentConfig {
  agentId: string
  agentToken: string
  serverUrl: string
  behavior: AIBehavior
  combatEnabled?: boolean
  gatheringEnabled?: boolean
  socialEnabled?: boolean
}

export enum AIBehavior {
  Passive = 'passive', // 被动，只防御
  Active = 'active', // 主动攻击怪物
  Gatherer = 'gatherer', // 采集资源
  Trader = 'trader', // 交易
  Explorer = 'explorer', // 探索
}

/**
 * AI 代理接口
 */
export interface AIAgent {
  start(): Promise<void>
  stop(): void
  getStatus(): AgentStatus
}

export interface AgentStatus {
  isRunning: boolean
  behavior: AIBehavior
  currentState: string
  healthPercent: number
  manaPercent: number
}

/**
 * AI 代理实现
 */
class AIAgentImpl implements AIAgent {
  private client: OpenClawClient
  private config: AIAgentConfig
  private isRunning: boolean = false
  private currentState: string = 'idle'
  private decisionInterval: NodeJS.Timeout | null = null
  private lastDecisionTime: number = 0
  private decisionCooldown: number = 1000 // 1 秒决策一次

  constructor(config: AIAgentConfig) {
    this.config = config
    this.client = new OpenClawClient({
      serverUrl: config.serverUrl,
      agentId: config.agentId,
      agentToken: config.agentToken,
    })

    // 绑定事件
    this.client.on('gameStateUpdate', this.onGameStateUpdate.bind(this))
    this.client.on('disconnected', this.onDisconnected.bind(this))
    this.client.on('error', this.onError.bind(this))
  }

  /**
   * 启动 AI 代理
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('AI 代理已在运行')
    }

    console.log(`[AI:${this.config.agentId}] 启动中...`)
    
    await this.client.connect()
    
    this.isRunning = true
    this.currentState = 'connected'
    
    // 启动决策循环
    this.startDecisionLoop()
    
    console.log(`[AI:${this.config.agentId}] 已启动，行为模式：${this.config.behavior}`)
  }

  /**
   * 停止 AI 代理
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    
    if (this.decisionInterval) {
      clearInterval(this.decisionInterval)
      this.decisionInterval = null
    }

    this.client.disconnect()
    this.currentState = 'stopped'
    
    console.log(`[AI:${this.config.agentId}] 已停止`)
  }

  /**
   * 获取状态
   */
  getStatus(): AgentStatus {
    const player = this.client.getPlayerState()
    
    return {
      isRunning: this.isRunning,
      behavior: this.config.behavior,
      currentState: this.currentState,
      healthPercent: player ? (player.hp / player.maxHp) * 100 : 0,
      manaPercent: player ? (player.mp / player.maxMp) * 100 : 0,
    }
  }

  /**
   * 游戏状态更新
   */
  private onGameStateUpdate(state: GameState): void {
    // 状态更新由决策循环处理
  }

  /**
   * 断开连接
   */
  private onDisconnected(): void {
    console.log(`[AI:${this.config.agentId}] 断开连接`)
    this.currentState = 'disconnected'
  }

  /**
   * 错误处理
   */
  private onError(error: any): void {
    console.error(`[AI:${this.config.agentId}] 错误:`, error)
  }

  /**
   * 启动决策循环
   */
  private startDecisionLoop(): void {
    this.decisionInterval = setInterval(() => {
      if (!this.isRunning) return
      
      const now = Date.now()
      if (now - this.lastDecisionTime < this.decisionCooldown) return
      
      this.lastDecisionTime = now
      this.makeDecision()
    }, 100) // 100ms 检查一次
  }

  /**
   * 做出决策
   */
  private makeDecision(): void {
    const state = this.client.getGameState()
    if (!state || !state.player) return

    const player = state.player
    this.currentState = 'deciding'

    // 根据行为模式决策
    switch (this.config.behavior) {
      case AIBehavior.Passive:
        this.handlePassiveBehavior(player, state)
        break

      case AIBehavior.Active:
        this.handleActiveBehavior(player, state)
        break

      case AIBehavior.Gatherer:
        this.handleGathererBehavior(player, state)
        break

      case AIBehavior.Explorer:
        this.handleExplorerBehavior(player, state)
        break
    }
  }

  /**
   * 被动行为
   */
  private handlePassiveBehavior(player: PlayerState, state: GameState): void {
    // 生命值低时使用药水
    if (player.hp / player.maxHp < 0.3) {
      const healthPotion = this.client.getNearbyItems(5).find(i => i.name.includes('Health'))
      if (healthPotion) {
        this.client.pickUpItem(healthPotion.id)
        this.client.useItem(healthPotion.itemId)
        this.currentState = 'using_potion'
        return
      }
    }

    // 被攻击时逃跑
    const aggressiveMonsters = state.monsters.filter(m => m.isAggressive && m.targetId === player.id)
    if (aggressiveMonsters.length > 0) {
      const monster = aggressiveMonsters[0]
      const angle = Math.atan2(player.y - monster.y, player.x - monster.x)
      const runX = player.x + Math.cos(angle) * 20
      const runY = player.y + Math.sin(angle) * 20
      this.client.move(runX, runY)
      this.currentState = 'fleeing'
    } else {
      this.currentState = 'idle'
    }
  }

  /**
   * 主动行为（战斗）
   */
  private handleActiveBehavior(player: PlayerState, state: GameState): void {
    // 生命值低时逃跑
    if (player.hp / player.maxHp < 0.3) {
      this.handlePassiveBehavior(player, state)
      return
    }

    // 寻找最近的怪物
    const monsters = this.client.getNearbyMonsters(30)
    if (monsters.length > 0) {
      // 按距离排序
      monsters.sort((a, b) => {
        const distA = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2)
        const distB = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2)
        return distA - distB
      })

      const target = monsters[0]
      const distance = Math.sqrt((target.x - player.x) ** 2 + (target.y - player.y) ** 2)

      if (distance > 5) {
        // 靠近怪物
        this.client.move(target.x, target.y)
        this.currentState = 'chasing'
      } else {
        // 攻击
        this.client.attack(target.id)
        this.currentState = 'combat'
      }
    } else {
      // 随机移动探索
      this.randomMove()
      this.currentState = 'exploring'
    }
  }

  /**
   * 采集行为
   */
  private handleGathererBehavior(player: PlayerState, state: GameState): void {
    // 寻找最近的资源
    const items = this.client.getNearbyItems(50)
    if (items.length > 0) {
      // 按距离排序
      items.sort((a, b) => {
        const distA = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2)
        const distB = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2)
        return distA - distB
      })

      const target = items[0]
      const distance = Math.sqrt((target.x - player.x) ** 2 + (target.y - player.y) ** 2)

      if (distance > 2) {
        this.client.move(target.x, target.y)
        this.currentState = 'moving_to_resource'
      } else {
        this.client.pickUpItem(target.id)
        this.currentState = 'gathering'
      }
    } else {
      // 随机移动寻找资源
      this.randomMove()
      this.currentState = 'searching'
    }
  }

  /**
   * 探索行为
   */
  private handleExplorerBehavior(player: PlayerState, state: GameState): void {
    // 随机移动
    this.randomMove()
    this.currentState = 'exploring'
  }

  /**
   * 随机移动
   */
  private randomMove(): void {
    const state = this.client.getGameState()
    if (!state || !state.player) return

    const player = state.player
    const angle = Math.random() * Math.PI * 2
    const distance = 10 + Math.random() * 20
    
    const newX = player.x + Math.cos(angle) * distance
    const newY = player.y + Math.sin(angle) * distance
    
    this.client.move(newX, newY)
  }
}

/**
 * 创建 AI 代理
 */
export function createAIAgent(config: AIAgentConfig): AIAgent {
  return new AIAgentImpl(config)
}

export default AIAgentImpl
