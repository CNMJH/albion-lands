import { FastifyInstance, FastifyRequest } from 'fastify'
import { WebSocket } from 'ws'
import { v4 as uuidv4 } from 'uuid'

interface Client {
  id: string
  ws: WebSocket
  characterId?: string
  isAlive: boolean
  lastPing: number
}

/**
 * WebSocket 服务器
 * 处理实时游戏通信
 */
export class WebSocketServer {
  private clients: Map<string, Client> = new Map()
  private fastify: FastifyInstance
  private heartbeatInterval: NodeJS.Timeout | null = null

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

        case 'chat':
          this.handleChat(clientId, message.data)
          break

        case 'action':
          this.handleAction(clientId, message.data)
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
    // TODO: 实现移动逻辑
    const client = this.clients.get(clientId)
    if (client && client.characterId) {
      // 广播移动到其他玩家
      this.broadcast({
        type: 'player_move',
        data: {
          characterId: client.characterId,
          x: data.x,
          y: data.y,
        },
      }, clientId)
    }
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
