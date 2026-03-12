import { prisma } from '../prisma'
import { ItemService } from './ItemService'

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
 * 资源节点数据
 */
export interface ResourceNodeData {
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
  possibleDrops: ResourceDrop[]
}

/**
 * 资源掉落
 */
export interface ResourceDrop {
  itemId: string
  minQuantity: number
  maxQuantity: number
  chance: number // 0-1
}

/**
 * 采集结果
 */
export interface GatherResult {
  success: boolean
  itemId?: string
  quantity?: number
  exp?: number
  reason?: string
}

/**
 * 资源节点模板
 */
const RESOURCE_TEMPLATES: Record<string, ResourceNodeData> = {
  // 采矿
  'copper_ore': {
    id: 'copper_ore',
    type: 'Mining',
    name: '铜矿',
    level: 1,
    x: 0,
    y: 0,
    zoneId: 'zone_1',
    hitsRemaining: 5,
    maxHits: 5,
    toolRequired: 'pickaxe',
    respawnTime: 300000, // 5 分钟
    possibleDrops: [
      { itemId: 'copper_ore', minQuantity: 1, maxQuantity: 3, chance: 1.0 },
      { itemId: 'stone', minQuantity: 1, maxQuantity: 2, chance: 0.5 },
    ],
  },
  'iron_ore': {
    id: 'iron_ore',
    type: 'Mining',
    name: '铁矿',
    level: 10,
    x: 0,
    y: 0,
    zoneId: 'zone_2',
    hitsRemaining: 8,
    maxHits: 8,
    toolRequired: 'pickaxe',
    respawnTime: 300000,
    possibleDrops: [
      { itemId: 'iron_ore', minQuantity: 1, maxQuantity: 3, chance: 1.0 },
      { itemId: 'stone', minQuantity: 1, maxQuantity: 2, chance: 0.5 },
    ],
  },
  
  // 伐木
  'oak_tree': {
    id: 'oak_tree',
    type: 'Woodcutting',
    name: '橡树',
    level: 1,
    x: 0,
    y: 0,
    zoneId: 'zone_1',
    hitsRemaining: 5,
    maxHits: 5,
    toolRequired: 'axe',
    respawnTime: 300000,
    possibleDrops: [
      { itemId: 'oak_log', minQuantity: 1, maxQuantity: 3, chance: 1.0 },
      { itemId: 'twig', minQuantity: 1, maxQuantity: 2, chance: 0.5 },
    ],
  },
  'pine_tree': {
    id: 'pine_tree',
    type: 'Woodcutting',
    name: '松树',
    level: 10,
    x: 0,
    y: 0,
    zoneId: 'zone_2',
    hitsRemaining: 8,
    maxHits: 8,
    toolRequired: 'axe',
    respawnTime: 300000,
    possibleDrops: [
      { itemId: 'pine_log', minQuantity: 1, maxQuantity: 3, chance: 1.0 },
      { itemId: 'twig', minQuantity: 1, maxQuantity: 2, chance: 0.5 },
    ],
  },
  
  // 采集
  'herb': {
    id: 'herb',
    type: 'Gathering',
    name: '草药',
    level: 1,
    x: 0,
    y: 0,
    zoneId: 'zone_1',
    hitsRemaining: 3,
    maxHits: 3,
    toolRequired: 'sickle',
    respawnTime: 180000, // 3 分钟
    possibleDrops: [
      { itemId: 'herb', minQuantity: 1, maxQuantity: 2, chance: 1.0 },
    ],
  },
}

/**
 * 采集服务
 * 处理资源采集逻辑
 */
export class GatheringService {
  private static activeNodes: Map<string, ResourceNodeData> = new Map()

  /**
   * 初始化资源节点
   */
  public static async initializeZoneNodes(zoneId: string): Promise<void> {
    // 从数据库加载或生成资源节点
    const nodes = await this.generateZoneNodes(zoneId)
    nodes.forEach(node => {
      this.activeNodes.set(node.id, node)
    })
  }

  /**
   * 生成区域资源节点
   */
  private static async generateZoneNodes(zoneId: string): Promise<ResourceNodeData[]> {
    const nodes: ResourceNodeData[] = []
    
    // 根据区域等级生成不同类型的资源
    const nodeConfigs = Object.values(RESOURCE_TEMPLATES)
      .filter(t => t.zoneId === zoneId)

    // 每种类型生成多个节点
    for (const config of nodeConfigs) {
      const count = Math.floor(Math.random() * 5) + 5 // 5-10 个
      for (let i = 0; i < count; i++) {
        const node = { ...config }
        node.id = `${config.id}_${zoneId}_${i}_${Date.now()}`
        node.x = Math.random() * 800 + 100
        node.y = Math.random() * 800 + 100
        node.hitsRemaining = node.maxHits
        nodes.push(node)
      }
    }

    return nodes
  }

  /**
   * 获取区域所有资源节点
   */
  public static getZoneNodes(zoneId: string): ResourceNodeData[] {
    return Array.from(this.activeNodes.values())
      .filter(node => node.zoneId === zoneId)
  }

  /**
   * 获取资源节点
   */
  public static getResourceNode(nodeId: string): ResourceNodeData | undefined {
    return this.activeNodes.get(nodeId)
  }

  /**
   * 开始采集
   */
  public static async startGathering(
    characterId: string,
    nodeId: string
  ): Promise<{ success: boolean; reason?: string }> {
    const node = this.getResourceNode(nodeId)
    if (!node) {
      return { success: false, reason: '资源节点不存在' }
    }

    // 检查角色等级
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    })

    if (!character) {
      return { success: false, reason: '角色不存在' }
    }

    if (character.level < node.level) {
      return { 
        success: false, 
        reason: `需要等级 ${node.level}` 
      }
    }

    // 检查工具
    if (node.toolRequired) {
      // 简化处理：暂时跳过工具检查
      // 实际项目中应检查背包中是否有对应工具
    }

    return { success: true }
  }

  /**
   * 完成采集
   */
  public static async completeGathering(
    characterId: string,
    nodeId: string
  ): Promise<GatherResult> {
    const node = this.getResourceNode(nodeId)
    if (!node) {
      return { success: false, reason: '资源节点不存在' }
    }

    // 减少采集次数
    node.hitsRemaining--

    // 检查是否采集完毕
    if (node.hitsRemaining <= 0) {
      // 计算掉落
      const drop = this.calculateDrop(node)
      
      // 给予物品
      if (drop) {
        const success = await ItemService.giveItem(
          characterId,
          drop.itemId,
          drop.quantity
        )

        if (!success) {
          return { 
            success: false, 
            reason: '背包已满' 
          }
        }
      }

      // 计算经验
      const exp = this.calculateExp(node)

      // 增加采集经验
      await this.addGatheringExp(characterId, exp, node.type)

      // 移除节点（准备重生）
      this.activeNodes.delete(nodeId)

      // 设置重生定时器
      setTimeout(() => {
        this.respawnNode(nodeId, node)
      }, node.respawnTime)

      return {
        success: true,
        itemId: drop?.itemId,
        quantity: drop?.quantity,
        exp,
      }
    }

    // 未采集完毕，给予少量物品
    const drop = this.calculateDrop(node, true)
    if (drop) {
      await ItemService.giveItem(characterId, drop.itemId, drop.quantity)
    }

    return {
      success: true,
      itemId: drop?.itemId,
      quantity: drop?.quantity,
      exp: 0,
    }
  }

  /**
   * 计算掉落
   */
  private static calculateDrop(
    node: ResourceNodeData,
    partial: boolean = false
  ): { itemId: string; quantity: number } | null {
    const drops = node.possibleDrops
    
    for (const drop of drops) {
      if (Math.random() <= drop.chance) {
        const quantity = partial
          ? drop.minQuantity
          : Math.floor(
              Math.random() * (drop.maxQuantity - drop.minQuantity + 1)
            ) + drop.minQuantity
        
        return {
          itemId: drop.itemId,
          quantity,
        }
      }
    }

    return null
  }

  /**
   * 计算经验
   */
  private static calculateExp(node: ResourceNodeData): number {
    const baseExp = 10
    return Math.floor(baseExp * node.level * (1 + Math.random() * 0.2))
  }

  /**
   * 增加采集经验
   */
  private static async addGatheringExp(
    _characterId: string,
    exp: number,
    type: ResourceType
  ): Promise<void> {
    // 简化处理：记录日志
    // 实际项目中应更新角色采集技能经验
    console.log(`增加 ${type} 经验：${exp}`)
  }

  /**
   * 重生资源节点
   */
  private static respawnNode(nodeId: string, template: ResourceNodeData): void {
    const newNode: ResourceNodeData = {
      ...template,
      id: nodeId,
      hitsRemaining: template.maxHits,
      x: Math.random() * 800 + 100,
      y: Math.random() * 800 + 100,
    }

    this.activeNodes.set(nodeId, newNode)
    
    // 资源节点重生完成
    console.log(`资源节点重生：${nodeId}`)
  }

  /**
   * 停止采集
   */
  public static stopGathering(characterId: string, nodeId: string): void {
    // 取消采集，无惩罚
    console.log(`停止采集：${characterId} -> ${nodeId}`)
  }

  /**
   * 获取所有活动节点
   */
  public static getAllActiveNodes(): ResourceNodeData[] {
    return Array.from(this.activeNodes.values())
  }

  /**
   * 清除区域节点
   */
  public static clearZoneNodes(zoneId: string): void {
    Array.from(this.activeNodes.keys())
      .filter(id => id.includes(zoneId))
      .forEach(id => this.activeNodes.delete(id))
  }
}
