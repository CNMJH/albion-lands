// 简单的事件发射器 (浏览器环境)
class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map()

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
  }

  off(event: string, listener: (...args: any[]) => void): void {
    const listeners = this.events.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
      return true
    }
    return false
  }
}

// 消息包接口
export interface GamePacket {
  seq: number
  type: string
  payload: any
  timestamp: number
}

// 网络事件类型
export interface NetworkEvents {
  'connected': () => void
  'disconnected': (reason: string) => void
  'error': (error: Error) => void
  'message': (packet: GamePacket) => void
  'reconnecting': (attempt: number) => void
}

/**
 * 网络管理器 - 单例模式
 * 负责 WebSocket 连接管理、消息发送和接收
 */
export class NetworkManager extends EventEmitter {
  private static instance: NetworkManager | null = null
  private ws: WebSocket | null = null
  private seq: number = 0
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private heartbeatInterval: number = 30000
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null
  private messageHandlers: Map<string, Array<(payload: any) => void>> = new Map()
  private connectionPromise: Promise<void> | null = null

  private constructor() {
    super()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager()
    }
    return NetworkManager.instance
  }

  /**
   * 连接到服务器
   */
  public async connect(url: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('已连接，跳过')
      return Promise.resolve()
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('正在连接到:', url)
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('WebSocket 连接成功')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket 连接关闭:', event.code, event.reason)
          this.stopHeartbeat()
          this.emit('disconnected', event.reason || '连接关闭')
          this.handleReconnect(url)
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket 错误:', error)
          this.emit('error', new Error('WebSocket 连接错误'))
          reject(new Error('WebSocket 连接错误'))
        }
      } catch (error) {
        this.connectionPromise = null
        reject(error)
      }
    })

    return this.connectionPromise
  }

  /**
   * 发送消息
   */
  public send(type: string, payload: any = {}): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('❌ WebSocket 未连接，消息发送失败:', type)
      console.log('WebSocket 状态:', this.ws?.readyState)
      return
    }

    const packet: GamePacket = {
      seq: this.seq++,
      type,
      payload,
      timestamp: Date.now(),
    }

    this.ws.send(JSON.stringify(packet))
    console.log(`📡 发送消息 [${type}]:`, payload)
  }

  /**
   * 注册消息处理器
   */
  public onMessage(type: string, handler: (payload: any) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)
  }

  /**
   * 移除消息处理器
   */
  public offMessage(type: string, handler: (payload: any) => void): void {
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    this.maxReconnectAttempts = 0 // 禁止重连
    if (this.ws) {
      this.ws.close(1000, '用户主动断开')
      this.ws = null
    }
    this.stopHeartbeat()
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const packet: GamePacket = JSON.parse(data)
      console.log(`接收消息 [${packet.type}]:`, packet.payload)

      // 调用对应的处理器
      const handlers = this.messageHandlers.get(packet.type)
      if (handlers) {
        handlers.forEach(handler => handler(packet.payload))
      }

      // 触发通用消息事件
      this.emit('message', packet)
    } catch (error) {
      console.error('消息解析失败:', error, data)
    }
  }

  /**
   * 处理重连
   */
  private handleReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连')
      this.emit('disconnected', '达到最大重连次数')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * this.reconnectAttempts, 10000)
    
    console.log(`准备重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts}), 延迟 ${delay}ms`)
    this.emit('reconnecting', this.reconnectAttempts)

    setTimeout(() => {
      this.connectionPromise = null
      this.connect(url).catch(console.error)
    }, delay)
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 获取连接状态
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * 获取重连次数
   */
  public getReconnectAttempts(): number {
    return this.reconnectAttempts
  }
}

// 导出默认实例
export const network = NetworkManager.getInstance()
