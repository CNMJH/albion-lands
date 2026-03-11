import { EventEmitter } from 'events'
import { network } from '../network/NetworkManager'
import { useGameStore } from '../stores/gameStore'

/**
 * 资源类型
 */
export type ResourceType = 
  | 'Mining'      // 采矿
  | 'Woodcutting' // 伐木
  | 'Gathering'   // 采集
  | 'Fishing'     // 钓鱼
  | 'Hunting'     // 狩猎

/**
 * 资源节点
 */
export interface ResourceNode {
  id: string
  type: ResourceType
  name: string
  level: number
  x: number
  y: number
  zoneId: string
  hitsRemaining: number
  maxHits: number
  toolRequired?: string
  respawnTime: number
}

/**
 * 采集配置
 */
export interface GatheringConfig {
  gatherRange: number
  baseGatherTime: number
  autoGather: boolean
}

/**
 * 采集系统
 * 负责管理资源采集、工具使用等
 */
export class GatheringSystem extends EventEmitter {
  private config: GatheringConfig
  private resourceNodes: Map<string, ResourceNode> = new Map()
  private isGathering: boolean = false
  private currentTarget: ResourceNode | null = null
  private gatherTimer: NodeJS.Timeout | null = null

  constructor(config: GatheringConfig = { 
    gatherRange: 50, 
    baseGatherTime: 2000,
    autoGather: false 
  }) {
    super()
    this.config = config
    this.setupNetworkHandlers()
  }

  /**
   * 设置网络消息处理器
   */
  private setupNetworkHandlers(): void {
    // 监听资源节点列表
    network.onMessage('resourceNodes', (payload) => {
      this.loadResourceNodes(payload.nodes)
    })

    // 监听资源节点生成
    network.onMessage('resourceSpawn', (payload) => {
      this.spawnResourceNode(payload)
    })

    // 监听资源节点移除
    network.onMessage('resourceDespawn', (payload) => {
      this.removeResourceNode(payload.id)
    })

    // 监听采集开始
    network.onMessage('gatherStart', (payload) => {
      this.startGatheringAnimation(payload.nodeId)
    })

    // 监听采集成功
    network.onMessage('gatherSuccess', (payload) => {
      this.onGatherSuccess(payload)
    })

    // 监听采集失败
    network.onMessage('gatherFail', (payload) => {
      this.onGatherFail(payload)
    })
  }

  /**
   * 加载资源节点
   */
  public loadResourceNodes(nodes: ResourceNode[]): void {
    this.resourceNodes.clear()
    nodes.forEach(node => {
      this.resourceNodes.set(node.id, node)
    })
    this.emit('resourceNodesLoaded', nodes)
  }

  /**
   * 生成资源节点
   */
  public spawnResourceNode(node: ResourceNode): void {
    this.resourceNodes.set(node.id, node)
    this.emit('resourceSpawned', node)
  }

  /**
   * 移除资源节点
   */
  public removeResourceNode(id: string): void {
    this.resourceNodes.delete(id)
    this.emit('resourceDespawned', id)
  }

  /**
   * 开始采集
   */
  public startGathering(nodeId: string): boolean {
    const node = this.resourceNodes.get(nodeId)
    if (!node) {
      console.warn('资源节点不存在:', nodeId)
      return false
    }

    const state = useGameStore.getState()
    if (!state.player) return false

    // 检查距离
    const distance = Math.sqrt(
      Math.pow(node.x - state.player.x, 2) + 
      Math.pow(node.y - state.player.y, 2)
    )

    if (distance > this.config.gatherRange) {
      this.emit('gatherError', { message: '距离太远' })
      return false
    }

    // 检查工具
    if (node.toolRequired && !this.hasTool(node.toolRequired)) {
      this.emit('gatherError', { 
        message: `需要工具：${this.getToolName(node.toolRequired)}` 
      })
      return false
    }

    this.currentTarget = node
    this.isGathering = true

    // 发送开始采集消息
    network.send('gatherStart', {
      nodeId,
      timestamp: Date.now(),
    })

    // 开始采集计时
    this.startGatherTimer(node)

    return true
  }

  /**
   * 开始采集计时
   */
  private startGatherTimer(node: ResourceNode): void {
    if (this.gatherTimer) {
      clearTimeout(this.gatherTimer)
    }

    // 根据工具等级调整采集时间
    const gatherTime = this.config.baseGatherTime

    this.gatherTimer = setTimeout(() => {
      this.performGather(node)
    }, gatherTime)
  }

  /**
   * 执行采集
   */
  private performGather(node: ResourceNode): void {
    // 发送采集完成消息
    network.send('gatherComplete', {
      nodeId: node.id,
      timestamp: Date.now(),
    })

    this.isGathering = false
    this.currentTarget = null
  }

  /**
   * 采集成功处理
   */
  private onGatherSuccess(payload: {
    nodeId: string
    itemId: string
    quantity: number
    exp: number
  }): void {
    console.log(`采集成功：${payload.itemId} x${payload.quantity}`)
    
    this.emit('gatherSuccess', payload)
  }

  /**
   * 采集失败处理
   */
  private onGatherFail(payload: {
    nodeId: string
    reason: string
  }): void {
    console.log(`采集失败：${payload.reason}`)
    this.emit('gatherFail', payload)
    this.isGathering = false
    this.currentTarget = null
  }

  /**
   * 开始采集动画
   */
  private startGatheringAnimation(nodeId: string): void {
    this.emit('gatheringAnimation', { nodeId })
  }

  /**
   * 停止采集
   */
  public stopGathering(): void {
    if (this.gatherTimer) {
      clearTimeout(this.gatherTimer)
      this.gatherTimer = null
    }

    if (this.isGathering) {
      network.send('gatherStop', {
        nodeId: this.currentTarget?.id,
      })
    }

    this.isGathering = false
    this.currentTarget = null
  }

  /**
   * 检查是否有工具
   */
  private hasTool(toolType: string): boolean {
    // TODO: 检查背包中是否有工具
    return true
  }

  /**
   * 获取工具名称
   */
  private getToolName(toolType: string): string {
    const names: Record<string, string> = {
      'pickaxe': '镐',
      'axe': '斧',
      'sickle': '镰刀',
      'rod': '鱼竿',
    }
    return names[toolType] || toolType
  }

  /**
   * 获取附近的资源节点
   */
  public getNearbyNodes(
    x: number, 
    y: number, 
    zoneId: string,
    range: number = 100
  ): ResourceNode[] {
    const nearby: ResourceNode[] = []
    
    this.resourceNodes.forEach(node => {
      if (node.zoneId !== zoneId) return
      
      const distance = Math.sqrt(
        Math.pow(node.x - x, 2) + 
        Math.pow(node.y - y, 2)
      )

      if (distance <= range) {
        nearby.push(node)
      }
    })

    return nearby
  }

  /**
   * 获取资源节点
   */
  public getResourceNode(id: string): ResourceNode | undefined {
    return this.resourceNodes.get(id)
  }

  /**
   * 获取所有资源节点
   */
  public getAllResourceNodes(): ResourceNode[] {
    return Array.from(this.resourceNodes.values())
  }

  /**
   * 是否正在采集
   */
  public isGatheringNow(): boolean {
    return this.isGathering
  }

  /**
   * 获取当前目标
   */
  public getCurrentTarget(): ResourceNode | null {
    return this.currentTarget
  }

  /**
   * 清除所有资源节点
   */
  public clear(): void {
    this.stopGathering()
    this.resourceNodes.clear()
  }
}

// 导出单例
export const gatheringSystem = new GatheringSystem()
