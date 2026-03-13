import { FastifyInstance, FastifyRequest } from 'fastify'
import { WebSocket } from 'ws'
import { randomUUID } from 'crypto'
import { CombatService, setWebSocketBroadcast as setCombatBroadcast } from '../services/CombatService'
import { GatheringService, setWebSocketBroadcast as setGatheringBroadcast } from '../services/GatheringService'
import { CraftingService } from '../services/CraftingService'
import { ChatService } from '../services/ChatService'
import { PartyService } from '../services/PartyService'
import { FriendService } from '../services/FriendService'

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

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
  }

  /**
   * 根据角色 ID 发送消息
   */
  sendToCharacter(characterId: string, type: string, data: any): void {
    // 查找对应的客户端
    for (const [clientId, client] of this.clients.entries()) {
      if (client.characterId === characterId) {
        this.send(clientId, { type, data })
        break
      }
    }
  }

  /**
   * 启动 WebSocket 服务器
   */
  async start(): Promise<void> {
    // 设置 WebSocket 广播函数
    setCombatBroadcast((characterId, type, data) => {
      this.sendToCharacter(characterId, type, data)
    })
    setGatheringBroadcast((characterId, type, data) => {
      this.sendToCharacter(characterId, type, data)
    })

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

    // 初始化资源节点
    this.initializeResourceNodes()

    this.fastify.log.info('WebSocket 服务器已启动')
  }

  /**
   * 处理新连接
   */
  private handleConnection(ws: WebSocket, _req: FastifyRequest): void {
    const clientId = randomUUID()
    
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
      this.fastify.log.error(`客户端错误 ${clientId}: ${error.message}`)
    })

    // 心跳响应
    ws.on('pong', () => {
      client.isAlive = true
    })

    // 发送资源节点列表（临时）
    setTimeout(() => {
      const nodes = GatheringService.getZoneNodes('zone_1')
      this.send(clientId, {
        type: 'resourceNodes',
        payload: {
          nodes: nodes.map(n => ({
            id: n.id,
            type: n.type,
            name: n.name,
            level: n.level,
            x: n.x,
            y: n.y,
            zoneId: n.zoneId,
            hitsRemaining: n.hitsRemaining,
            maxHits: n.maxHits,
            toolRequired: n.toolRequired,
          })),
        },
      })
    }, 2000)
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

      // @ts-ignore - Fastify log type issue
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

        // 社交相关
        case 'friendRequest':
          this.handleFriendRequest(clientId, message.data)
          break

        case 'friendAccept':
          this.handleFriendAccept(clientId, message.data)
          break

        case 'friendReject':
          this.handleFriendReject(clientId, message.data)
          break

        case 'friendRemove':
          this.handleFriendRemove(clientId, message.data)
          break

        case 'partyCreate':
          this.handlePartyCreate(clientId, message.data)
          break

        case 'partyJoin':
          this.handlePartyJoin(clientId, message.data)
          break

        case 'partyLeave':
          this.handlePartyLeave(clientId, message.data)
          break

        case 'partyKick':
          this.handlePartyKick(clientId, message.data)
          break

        default:
          this.fastify.log.warn(`未知消息类型：${message.type}`)
      }
    } catch (error: any) {
      this.fastify.log.error(`消息解析错误：${error.message}`)
    }
  }

  /**
   * 处理认证
   */
  private handleAuth(clientId: string, data: any): void {
    const client = this.clients.get(clientId)
    if (!client) return
    
    // 简化处理：暂时只记录日志
    // 实际项目中应实现 token 验证逻辑
    this.fastify.log.info(`客户端认证：${clientId}`)
    
    // 发送附近怪物列表
    const monsterList = Array.from(this.monsters.values()).map(m => ({
      id: m.id,
      templateId: m.templateId,
      x: m.x,
      y: m.y,
      zoneId: m.zoneId,
    }))
    
    this.send(clientId, {
      type: 'monsterList',
      payload: {
        monsters: monsterList,
      },
    })
    
    this.fastify.log.info(`发送 ${monsterList.length} 个怪物到客户端 ${clientId}`)
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
  private async handleChat(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    const { type, content, receiverId, partyId, zoneId } = data

    let result
    switch (type) {
      case 'whisper':
        if (!receiverId) {
          this.send(clientId, {
            type: 'chatError',
            payload: { error: '私聊需要指定接收者' },
          })
          return
        }
        result = await ChatService.sendWhisper(client.characterId, receiverId, content)
        if (result.success) {
          // 发送给接收者（如果在线）
          const receiverClient = Array.from(this.clients.values()).find(
            c => c.characterId === receiverId
          )
          if (receiverClient) {
            this.send(receiverClient.id, {
              type: 'chatMessage',
              payload: {
                type: 'whisper',
                senderId: client.characterId,
                senderName: client.characterId,
                content,
                isReceived: true,
              },
            })
          }
          // 确认发送者
          this.send(clientId, {
            type: 'chatMessage',
            payload: {
              type: 'whisper',
              senderId: client.characterId,
              receiverId,
              content,
              isReceived: false,
            },
          })
        } else {
          this.send(clientId, {
            type: 'chatError',
            payload: { error: result.error },
          })
        }
        break

      case 'party':
        if (!partyId) {
          this.send(clientId, {
            type: 'chatError',
            payload: { error: '队伍聊天需要指定队伍 ID' },
          })
          return
        }
        result = await ChatService.sendPartyMessage(client.characterId, partyId, content)
        if (result.success) {
          // 广播给队伍成员
          const party = await PartyService.getPartyInfo(partyId)
          for (const member of party.members) {
            const memberClient = Array.from(this.clients.values()).find(
              c => c.characterId === member.characterId
            )
            if (memberClient) {
              this.send(memberClient.id, {
                type: 'chatMessage',
                payload: {
                  type: 'party',
                  senderId: client.characterId,
                  senderName: client.characterId,
                  content,
                  partyId,
                },
              })
            }
          }
        } else {
          this.send(clientId, {
            type: 'chatError',
            payload: { error: result.error },
          })
        }
        break

      case 'zone':
        if (!zoneId) {
          this.send(clientId, {
            type: 'chatError',
            payload: { error: '区域聊天需要指定区域 ID' },
          })
          return
        }
        result = await ChatService.sendZoneMessage(client.characterId, zoneId, content)
        if (result.success) {
          // 广播给区域内所有玩家
          this.clients.forEach((c) => {
            if (c.position?.zoneId === zoneId && c.characterId) {
              this.send(c.id, {
                type: 'chatMessage',
                payload: {
                  type: 'zone',
                  senderId: client.characterId,
                  senderName: client.characterId,
                  content,
                  zoneId,
                },
              })
            }
          })
        } else {
          this.send(clientId, {
            type: 'chatError',
            payload: { error: result.error },
          })
        }
        break

      case 'global':
        result = await ChatService.sendGlobalMessage(client.characterId, content)
        if (result.success) {
          // 广播给所有玩家
          this.clients.forEach((c) => {
            if (c.characterId) {
              this.send(c.id, {
                type: 'chatMessage',
                payload: {
                  type: 'global',
                  senderId: client.characterId,
                  senderName: client.characterId,
                  content,
                },
              })
            }
          })
        } else {
          this.send(clientId, {
            type: 'chatError',
            payload: { error: result.error },
          })
        }
        break

      default:
        this.send(clientId, {
          type: 'chatError',
          payload: { error: '未知的聊天类型' },
        })
    }
  }

  /**
   * 处理动作
   */
  private handleAction(clientId: string, data: any): void {
    // 简化处理：暂时只记录日志
    // 实际项目中应实现动作逻辑（移动、交互等）
    // @ts-ignore - Fastify log type issue
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
  private handleGetRecipes(clientId: string, _data: any): void {
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
  broadcastToZone(_zoneId: string, message: any, excludeClientId?: string): void {
    // 简化处理：广播给所有客户端
    // 实际项目中应只发送给指定区域的客户端
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
    setInterval(() => {
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
   * 初始化资源节点
   */
  private initializeResourceNodes(): void {
    // 初始化 zone_1 的资源节点
    GatheringService.initializeZoneNodes('zone_1')
    
    const nodes = GatheringService.getZoneNodes('zone_1')
    this.fastify.log.info(`初始化了 ${nodes.length} 个资源节点`)
  }

  /**
   * 处理好友请求
   */
  private async handleFriendRequest(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.userId) return

    const { friendUserId } = data
    const result = await FriendService.sendRequest(client.userId, friendUserId)

    if (result.success) {
      this.send(clientId, {
        type: 'friendRequestSent',
        payload: { friendUserId, message: '好友请求已发送' },
      })
    } else {
      this.send(clientId, {
        type: 'friendError',
        payload: { error: result.error },
      })
    }
  }

  /**
   * 处理接受好友
   */
  private async handleFriendAccept(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.userId) return

    const { friendUserId } = data
    const result = await FriendService.acceptRequest(client.userId, friendUserId)

    if (result.success) {
      this.send(clientId, {
        type: 'friendAccepted',
        payload: { friendUserId, message: '已添加为好友' },
      })
      // 通知对方
      const friendClient = Array.from(this.clients.values()).find(
        c => c.userId === friendUserId
      )
      if (friendClient) {
        this.send(friendClient.id, {
          type: 'friendAdded',
          payload: { friendUserId: client.userId },
        })
      }
    } else {
      this.send(clientId, {
        type: 'friendError',
        payload: { error: result.error },
      })
    }
  }

  /**
   * 处理拒绝好友
   */
  private async handleFriendReject(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.userId) return

    const { friendUserId } = data
    await FriendService.rejectRequest(client.userId, friendUserId)

    this.send(clientId, {
      type: 'friendRejected',
      payload: { friendUserId },
    })
  }

  /**
   * 处理删除好友
   */
  private async handleFriendRemove(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.userId) return

    const { friendUserId } = data
    await FriendService.removeFriend(client.userId, friendUserId)

    this.send(clientId, {
      type: 'friendRemoved',
      payload: { friendUserId },
    })
  }

  /**
   * 处理创建队伍
   */
  private async handlePartyCreate(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    try {
      const party = await PartyService.createParty(
        client.characterId,
        data.name,
        data.isPublic || false
      )

      this.send(clientId, {
        type: 'partyCreated',
        payload: { party },
      })
    } catch (error: any) {
      this.send(clientId, {
        type: 'partyError',
        payload: { error: error.message },
      })
    }
  }

  /**
   * 处理加入队伍
   */
  private async handlePartyJoin(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    const { partyId } = data
    const result = await PartyService.joinParty(partyId, client.characterId)

    if (result.success) {
      const party = await PartyService.getPartyInfo(partyId)
      this.send(clientId, {
        type: 'partyJoined',
        payload: { party },
      })
      // 通知队长
      const leaderClient = Array.from(this.clients.values()).find(
        c => c.characterId === party.leaderId
      )
      if (leaderClient) {
        this.send(leaderClient.id, {
          type: 'partyMemberJoined',
          payload: { partyId, memberId: client.characterId },
        })
      }
    } else {
      this.send(clientId, {
        type: 'partyError',
        payload: { error: result.error },
      })
    }
  }

  /**
   * 处理离开队伍
   */
  private async handlePartyLeave(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    const { partyId } = data
    const result = await PartyService.leaveParty(partyId, client.characterId)

    if (result.success) {
      this.send(clientId, {
        type: 'partyLeft',
        payload: { partyId },
      })
      // 通知其他队员
      const party = await PartyService.getPlayerParty(client.characterId)
      if (party) {
        party.members.forEach(member => {
          const memberClient = Array.from(this.clients.values()).find(
            c => c.characterId === member.characterId
          )
          if (memberClient) {
            this.send(memberClient.id, {
              type: 'partyMemberLeft',
              payload: { partyId, memberId: client.characterId, newLeaderId: result.newLeaderId },
            })
          }
        })
      }
    } else {
      this.send(clientId, {
        type: 'partyError',
        payload: { error: result.error },
      })
    }
  }

  /**
   * 处理踢出队伍
   */
  private async handlePartyKick(clientId: string, data: any): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client || !client.characterId) return

    const { partyId, targetId } = data
    const result = await PartyService.kickMember(partyId, client.characterId, targetId)

    if (result.success) {
      this.send(clientId, {
        type: 'partyMemberKicked',
        payload: { partyId, targetId },
      })
      // 通知被踢者
      const targetClient = Array.from(this.clients.values()).find(
        c => c.characterId === targetId
      )
      if (targetClient) {
        this.send(targetClient.id, {
          type: 'partyKicked',
          payload: { partyId },
        })
      }
    } else {
      this.send(clientId, {
        type: 'partyError',
        payload: { error: result.error },
      })
    }
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
