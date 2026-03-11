import WebSocket from 'ws'
import { EventEmitter } from 'events'
import { GameState, PlayerState, WorldState } from './types'

/**
 * OpenClaw API 配置
 */
export interface OpenClawConfig {
  serverUrl: string
  agentId: string
  agentToken: string
  tickRate?: number // 默认 30Hz
}

/**
 * OpenClaw API 客户端
 * 用于 AI 代理与游戏服务器通信
 */
export class OpenClawClient extends EventEmitter {
  private ws: WebSocket | null = null
  private config: OpenClawConfig
  private connected: boolean = false
  private gameState: GameState | null = null
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(config: OpenClawConfig) {
    super()
    this.config = {
      tickRate: 30,
      ...config,
    }
  }

  /**
   * 连接到游戏服务器
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.serverUrl, {
          headers: {
            'X-Agent-ID': this.config.agentId,
            'X-Agent-Token': this.config.agentToken,
          },
        })

        this.ws.on('open', () => {
          this.connected = true
          this.reconnectAttempts = 0
          this.emit('connected')
          this.startHeartbeat()
          resolve()
        })

        this.ws.on('message', (data: any) => {
          this.handleMessage(JSON.parse(data.toString()))
        })

        this.ws.on('close', () => {
          this.connected = false
          this.emit('disconnected')
          this.stopHeartbeat()
          this.attemptReconnect()
        })

        this.ws.on('error', (error) => {
          this.emit('error', error)
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.connected = false
  }

  /**
   * 处理服务器消息
   */
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'game_state':
        this.gameState = message.data as GameState
        this.emit('gameStateUpdate', this.gameState)
        break

      case 'world_update':
        this.emit('worldUpdate', message.data as WorldState)
        break

      case 'player_update':
        this.emit('playerUpdate', message.data as PlayerState)
        break

      case 'chat':
        this.emit('chat', message.data)
        break

      case 'error':
        this.emit('error', message.data)
        break
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      
      setTimeout(() => {
        this.connect().catch((err) => {
          this.emit('reconnectFailed', err)
        })
      }, delay)
    } else {
      this.emit('maxReconnectAttemptsReached')
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connected && this.ws) {
        this.send({ type: 'ping', timestamp: Date.now() })
      }
    }, 10000) // 10 秒心跳
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 发送消息
   */
  private send(message: any): void {
    if (this.connected && this.ws) {
      this.ws.send(JSON.stringify(message))
    } else {
      throw new Error('未连接到服务器')
    }
  }

  // ==================== AI 代理 API ====================

  /**
   * 移动角色
   * @param x 目标 X 坐标
   * @param y 目标 Y 坐标
   */
  move(x: number, y: number): void {
    this.send({
      type: 'move',
      data: { x, y },
    })
  }

  /**
   * 使用技能
   * @param skillId 技能 ID
   * @param targetX 目标 X 坐标（可选）
   * @param targetY 目标 Y 坐标（可选）
   */
  useSkill(skillId: string, targetX?: number, targetY?: number): void {
    this.send({
      type: 'action',
      data: {
        action: 'use_skill',
        skillId,
        targetX,
        targetY,
      },
    })
  }

  /**
   * 使用物品
   * @param itemId 物品 ID
   */
  useItem(itemId: string): void {
    this.send({
      type: 'action',
      data: {
        action: 'use_item',
        itemId,
      },
    })
  }

  /**
   * 与 NPC 交互
   * @param npcId NPC ID
   */
  interactWithNPC(npcId: string): void {
    this.send({
      type: 'action',
      data: {
        action: 'interact_npc',
        npcId,
      },
    })
  }

  /**
   * 拾取物品
   * @param itemId 物品 ID
   */
  pickUpItem(itemId: string): void {
    this.send({
      type: 'action',
      data: {
        action: 'pickup',
        itemId,
      },
    })
  }

  /**
   * 攻击目标
   * @param targetId 目标 ID
   */
  attack(targetId: string): void {
    this.send({
      type: 'action',
      data: {
        action: 'attack',
        targetId,
      },
    })
  }

  /**
   * 停止攻击
   */
  stopAttack(): void {
    this.send({
      type: 'action',
      data: {
        action: 'stop_attack',
      },
    })
  }

  /**
   * 发送聊天消息
   * @param channel 频道 (local, party, guild, trade)
   * @param message 消息内容
   */
  sendChat(channel: string, message: string): void {
    this.send({
      type: 'chat',
      data: { channel, message },
    })
  }

  /**
   * 请求交易
   * @param targetId 目标玩家 ID
   */
  requestTrade(targetId: string): void {
    this.send({
      type: 'action',
      data: {
        action: 'request_trade',
        targetId,
      },
    })
  }

  /**
   * 请求组队
   * @param targetId 目标玩家 ID
   */
  requestParty(targetId: string): void {
    this.send({
      type: 'action',
      data: {
        action: 'request_party',
        targetId,
      },
    })
  }

  // ==================== 状态查询 API ====================

  /**
   * 获取当前游戏状态
   */
  getGameState(): GameState | null {
    return this.gameState
  }

  /**
   * 获取玩家状态
   */
  getPlayerState(): PlayerState | null {
    return this.gameState?.player || null
  }

  /**
   * 获取附近玩家
   */
  getNearbyPlayers(radius: number = 50): PlayerState[] {
    if (!this.gameState) return []
    
    const player = this.gameState.player
    if (!player) return []

    return this.gameState.players.filter(p => {
      const dx = p.x - player.x
      const dy = p.y - player.y
      return Math.sqrt(dx * dx + dy * dy) <= radius
    })
  }

  /**
   * 获取附近 NPC
   */
  getNearbyNPCs(radius: number = 10): any[] {
    if (!this.gameState) return []
    
    const player = this.gameState.player
    if (!player) return []

    return this.gameState.npcs.filter(npc => {
      const dx = npc.x - player.x
      const dy = npc.y - player.y
      return Math.sqrt(dx * dx + dy * dy) <= radius
    })
  }

  /**
   * 获取附近物品
   */
  getNearbyItems(radius: number = 5): any[] {
    if (!this.gameState) return []
    
    const player = this.gameState.player
    if (!player) return []

    return this.gameState.items.filter(item => {
      const dx = item.x - player.x
      const dy = item.y - player.y
      return Math.sqrt(dx * dx + dy * dy) <= radius
    })
  }

  /**
   * 获取附近怪物
   */
  getNearbyMonsters(radius: number = 30): any[] {
    if (!this.gameState) return []
    
    const player = this.gameState.player
    if (!player) return []

    return this.gameState.monsters.filter(monster => {
      const dx = monster.x - player.x
      const dy = monster.y - player.y
      return Math.sqrt(dx * dx + dy * dy) <= radius
    })
  }

  /**
   * 计算到目标的距离
   */
  distanceTo(targetX: number, targetY: number): number {
    const player = this.gameState?.player
    if (!player) return Infinity

    const dx = targetX - player.x
    const dy = targetY - player.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 检查是否在安全区
   */
  isInSafeZone(): boolean {
    const player = this.gameState?.player
    if (!player) return false
    return player.zoneSafetyLevel > 5
  }

  /**
   * 检查生命值是否低于阈值
   */
  isHPBelow(threshold: number): boolean {
    const player = this.gameState?.player
    if (!player) return false
    return (player.hp / player.maxHp) < threshold
  }

  /**
   * 检查魔法值是否低于阈值
   */
  isMPBelow(threshold: number): boolean {
    const player = this.gameState?.player
    if (!player) return false
    return (player.mp / player.maxMp) < threshold
  }
}

export default OpenClawClient
