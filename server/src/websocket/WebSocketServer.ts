import { FastifyInstance, FastifyRequest } from 'fastify'
import { WebSocket } from 'ws'
import { v4 as uuidv4 } from 'uuid'
import { CombatService } from '../services/CombatService'
import { GatheringService } from '../services/GatheringService'
import { CraftingService } from '../services/CraftingService'

interface Client {
  id: string
  ws: WebSocket
  characterId?: string
  userId?: string
  isAlive: boolean
  lastPing: number
  position?: { x: number; y: number; zoneId: string }
}

interface Monster {
  id: string
  templateId: string
  name: string
  level: number
  hp: number
  maxHp: number
  x: number
  y: number
  zoneId: string
  state: 'idle' | 'patrol' | 'chase' | 'attack'
}

/**
 * WebSocket 服务器
 * 处理实时游戏通信
 */
export class WebSocketServer {
  private clients: Map<string, Client> = new Map()
  private monsters: Map<string, Monster> = new Map()
  private fastify: FastifyInstance
  private heartbeatInterval: NodeJS.Timeout | null = null
  private monsterAIInterval: NodeJS.Timeout | null = null

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
  }

  /**
   * 启动 WebSocket 服务器
   */
  async start(): Promise<void> {
    // 注册 WebSocket 路由
    this.fastify.register(async (fastify) => {
      fastify.get('/ws', { websocket: true }, (connection, req: FastifyRequest) => {
        this.handleConnection(connection.socket as WebSocket, req)
      })
    })

    // 启动心跳检测
    this.startHeartbeat()

    // 启动怪物 AI
    this.startMonsterAI()

    // 生成初始怪物
    this.spawnInitialMonsters()

    this.fastify.log.info('WebSocket 服务器已启动')
  }

  /**
   * 处理新连接
   */
  private handleConnection(ws: WebSocket, req: FastifyRequest): void {
    const clientId = uuidv4()
    
    const client: Client = {
      id: clientId,
      ws,
      isAlive: true,
      lastPing: Date.now(),
    }

    this.clients.set(clientId, client)

    this.fastify.log.info(`客户端连接：${clientId}`)

    // 发送欢迎消息
    this.send(clientId, {
      type: 'welcome',
      data: {
        clientId,
        serverTime: Date.now(),
      },
    })

    // 处理消息
    ws.on('message', (data) => {
      this.handleMessage(clientId, data)
    })

    // 处理关闭
    ws.on('close', () => {
      this.handleDisconnect(clientId)
    })

    // 处理错误
    ws.on('error', (error) => {
      this.fastify.log.error(`客户端错误 ${clientId}:`, error)
    })

    // 心跳响应
    ws.on('pong', () => {
      client.isAlive = true
    })
  }

  /**
   * 处理消息
   */
  private handleMessage(clientId: string, data: any): void {
    try {
      const message = JSON.parse(data.toString())
      const client = this.clients.get(clientId)

      if (!client) {
        this.fastify.log.warn(`收到未知客户端消息：${clientId}`)
        return
      }

      client.lastPing = Date.now()

      this.fastify.log.debug(`收到消息 [${clientId}]:`, message.type)

      // 根据消息类型处理
      switch (message.type) {
        case 'auth':
          this.handleAuth(clientId, message.data)
          break

        case 'move':
          this.handleMove(clientId, message.data)
          break

        case 'attack':
          this.handleAttack(clientId, message.data)
          break

        case 'skill':
          this.handleSkill(clientId, message.data)
          break

        case 'chat':
          this.handleChat(clientId, message.data)
          break

        case 'action':
          this.handleAction(clientId, message.data)
          break

        case 'ping':
          this.send(clientId, { type: 'pong', timestamp: Date.now() })
          break

        // 采集相关
        case 'gatherStart':
          this.handleGatherStart(clientId, message.data)
          break

        case 'gatherComplete':
          this.handleGatherComplete(clientId, message.data)
          break

        case 'gatherStop':
          this.handleGatherStop(clientId, message.data)
          break

        // 制造相关
        case 'craft':
          this.handleCraft(clientId, message.data)
          break

        case 'craftMultiple':
          this.handleCraftMultiple(clientId, message.data)
          break

        case 'getRecipes':
          this.handleGetRecipes(clientId, message.data)
          break

        default:
          this.fastify.log.warn(`未知消息类型：${message.type}`)
      }
    } catch (error) {
      this.fastify.log.error(`消息解析错误：`, error)
    }
  }

  /**
   * 处理认证
   */
  private handleAuth(clientId: string, data: any): void {
    // TODO: 实现认证逻辑
    this.fastify.log.info(`客户端认证：${clientId}`)
    
    this.send(clientId, {
      type: 'auth_success',
      data: {
        authenticated: true,
      },
    })
  }

  /**
   * 处理移动
   */
  private handleMove(clientId: string, data: any): void {
    const client = this.clients.get(clientId)
    if (!client || !client.position) return

    // 更新位置
    client.position.x += data.dx || 0
    client.position.y += data.dy || 0

    // 发送确认
    this.send(clientId, {
      type: 'move',
      payload: {
        x: client.position.x,
        y: client.position.y,
      },
    })
  }

  /**
   * 处理攻击
   */
  private async handleAttack(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId || !client.position) return

    // 查找最近的怪物
    const targetMonster = this.findNearestMonster(client.position)
    if (!targetMonster) {
      this.send(clientId, { type: 'error', message: '附近没有可攻击的怪物' })
      return
    }

    // 检查距离
    const distance = Math.sqrt(
      Math.pow(targetMonster.x - client.position.x, 2) + 
      Math.pow(targetMonster.y - client.position.y, 2)
    )
    
    if (distance > 100) {
      this.send(clientId, { type: 'error', message: '目标太远' })
      return
    }

    // 执行攻击
    const result = await CombatService.playerAttackMonster(
      client.characterId,
      targetMonster.id,
      data.type || 'basic'
    )

    if (result.success) {
      // 发送攻击结果
      this.send(clientId, {
        type: 'attack',
        payload: {
          targetId: targetMonster.id,
          damage: result.damage,
          type: data.type || 'basic',
        },
      })

      // 发送怪物 HP
      this.send(clientId, {
        type: 'monsterHP',
        payload: {
          monsterId: targetMonster.id,
          hp: result.monsterHP,
        },
      })

      // 怪物死亡
      if (result.monsterDead) {
        this.send(clientId, {
          type: 'monsterDeath',
          payload: {
            monsterId: targetMonster.id,
            expGained: result.expGained,
            silverGained: result.silverGained,
          },
        })

        // 更新玩家状态
        this.send(clientId, {
          type: 'playerUpdate',
          payload: {
            exp: result.expGained,
            silver: result.silverGained,
          },
        })

        // 移除怪物
        this.monsters.delete(targetMonster.id)
      }
    }
  }

  /**
   * 处理技能
   */
  private handleSkill(clientId: string, data: any): void {
    const client = this.clients.get(clientId)
    if (!client) return

    this.fastify.log.info(`玩家 ${clientId} 使用技能 ${data.skillIndex}`)

    this.send(clientId, {
      type: 'skill',
      payload: {
        skillIndex: data.skillIndex,
        timestamp: data.timestamp,
      },
    })
  }

  /**
   * 处理聊天
   */
  private handleChat(clientId: string, data: any): void {
    // TODO: 实现聊天逻辑
    this.fastify.log.info(`聊天消息 [${clientId}]:`, data.message)
  }

  /**
   * 处理动作
   */
  private handleAction(clientId: string, data: any): void {
    // TODO: 实现动作逻辑
    this.fastify.log.info(`动作 [${clientId}]:`, data.action)
  }

  /**
   * 处理采集开始
   */
  private async handleGatherStart(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    const result = await GatheringService.startGathering(
      client.characterId,
      data.nodeId
    )

    if (result.success) {
      // 通知客户端可以开始采集
      this.send(clientId, {
        type: 'gatherStart',
        payload: {
          nodeId: data.nodeId,
        },
      })
    } else {
      this.send(clientId, {
        type: 'gatherFail',
        payload: {
          nodeId: data.nodeId,
          reason: result.reason,
        },
      })
    }
  }

  /**
   * 处理采集完成
   */
  private async handleGatherComplete(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    const result = await GatheringService.completeGathering(
      client.characterId,
      data.nodeId
    )

    if (result.success) {
      // 发送采集成功
      this.send(clientId, {
        type: 'gatherSuccess',
        payload: {
          nodeId: data.nodeId,
          itemId: result.itemId,
          quantity: result.quantity,
          exp: result.exp,
        },
      })
    } else {
      this.send(clientId, {
        type: 'gatherFail',
        payload: {
          nodeId: data.nodeId,
          reason: result.reason,
        },
      })
    }
  }

  /**
   * 处理停止采集
   */
  private handleGatherStop(clientId: string, data: any): void {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    GatheringService.stopGathering(client.characterId, data.nodeId)
  }

  /**
   * 处理制造
   */
  private async handleCraft(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    const result = await CraftingService.craftItem(
      client.characterId,
      data.recipeId
    )

    if (result.success) {
      this.send(clientId, {
        type: 'craftSuccess',
        payload: {
          recipeId: data.recipeId,
          itemId: result.itemId,
          quantity: result.quantity,
          exp: result.exp,
        },
      })
    } else {
      this.send(clientId, {
        type: 'craftFail',
        payload: {
          recipeId: data.recipeId,
          reason: result.reason,
        },
      })
    }
  }

  /**
   * 处理批量制造
   */
  private async handleCraftMultiple(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    const results = await CraftingService.craftMultiple(
      client.characterId,
      data.recipeId,
      data.quantity
    )

    this.send(clientId, {
      type: 'craftMultipleResult',
      payload: {
        recipeId: data.recipeId,
        results,
      },
    })
  }

  /**
   * 处理获取配方
   */
  private handleGetRecipes(clientId: string, data: any): void {
    const recipes = CraftingService.getAllRecipes()
    
    this.send(clientId, {
      type: 'recipes',
      payload: {
        recipes,
      },
    })
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId)
    if (client) {
      this.fastify.log.info(`客户端断开：${clientId}`)
      
      // 通知其他玩家
      if (client.characterId) {
        this.broadcast({
          type: 'player_logout',
          data: {
            characterId: client.characterId,
          },
        })
      }

      client.ws.terminate()
      this.clients.delete(clientId)
    }
  }

  /**
   * 发送消息到指定客户端
   */
  send(clientId: string, message: any): void {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  }

  /**
   * 广播消息到所有客户端
   */
  broadcast(message: any, excludeClientId?: string): void {
    const data = JSON.stringify(message)
    this.clients.forEach((client) => {
      if (client.id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data)
      }
    })
  }

  /**
   * 广播到指定区域
   */
  broadcastToZone(zoneId: string, message: any, excludeClientId?: string): void {
    // TODO: 实现区域广播
    this.broadcast(message, excludeClientId)
  }

  /**
   * 获取客户端数量
   */
  getClientCount(): number {
    return this.clients.size
  }

  /**
   * 获取指定客户端
   */
  getClient(clientId: string): Client | undefined {
    return this.clients.get(clientId)
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          this.fastify.log.warn(`心跳超时，断开客户端：${clientId}`)
          client.ws.terminate()
          this.clients.delete(clientId)
          return
        }

        client.isAlive = false
        client.ws.ping()
      })
    }, 30000) // 30 秒
  }

  /**
   * 启动怪物 AI
   */
  private startMonsterAI(): void {
    this.monsterAIInterval = setInterval(() => {
      this.updateMonsterAI()
    }, 1000) // 每秒更新一次
  }

  /**
   * 更新怪物 AI
   */
  private updateMonsterAI(): void {
    this.monsters.forEach((monster) => {
      // 简单的 AI 逻辑
      if (monster.state === 'idle' && Math.random() < 0.1) {
        monster.state = 'patrol'
      }
    })
  }

  /**
   * 生成初始怪物
   */
  private spawnInitialMonsters(): void {
    // 新手村庄生成一些史莱姆
    const templates = [
      { id: 'slime_t1', name: '绿色史莱姆', level: 2, hp: 50, maxHp: 50 },
      { id: 'slime_t2', name: '蓝色史莱姆', level: 5, hp: 80, maxHp: 80 },
    ]

    for (let i = 0; i < 10; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)]
      const monster: Monster = {
        id: `monster_${Date.now()}_${i}`,
        templateId: template.id,
        name: template.name,
        level: template.level,
        hp: template.hp,
        maxHp: template.maxHp,
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50,
        zoneId: 'zone_1',
        state: 'idle',
      }
      this.monsters.set(monster.id, monster)
    }

    this.fastify.log.info(`生成了 ${this.monsters.size} 个初始怪物`)
  }

  /**
   * 查找最近的怪物
   */
  private findNearestMonster(position: { x: number; y: number; zoneId: string }): Monster | null {
    let nearest: Monster | null = null
    let minDistance = Infinity

    this.monsters.forEach((monster) => {
      if (monster.zoneId !== position.zoneId) return

      const distance = Math.sqrt(
        Math.pow(monster.x - position.x, 2) + 
        Math.pow(monster.y - position.y, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        nearest = monster
      }
    })

    return nearest
  }

  /**
   * 获取区域怪物列表
   */
  public getMonstersInZone(zoneId: string): Monster[] {
    return Array.from(this.monsters.values()).filter(m => m.zoneId === zoneId)
  }

  /**
   * 停止服务器
   */
  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    this.clients.forEach((client) => {
      client.ws.close()
    })

    this.clients.clear()
    this.fastify.log.info('WebSocket 服务器已停止')
  }
}
