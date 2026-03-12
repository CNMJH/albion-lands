import { network } from '../network/NetworkManager'
import { useGameStore } from '../stores/gameStore'

/**
 * 简单的事件发射器 (浏览器环境)
 */
class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map()

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
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

/**
 * 物品类型
 */
export type ItemType = 
  | 'Weapon'      // 武器
  | 'Armor'       // 防具
  | 'Material'    // 材料
  | 'Consumable'  // 消耗品
  | 'Tool'        // 工具
  | 'Quest'       // 任务物品

/**
 * 物品稀有度
 */
export type ItemRarity = 
  | 'Common'      // 普通（白色）
  | 'Uncommon'    // 优秀（绿色）
  | 'Rare'        // 稀有（蓝色）
  | 'Epic'        // 史诗（紫色）
  | 'Legendary'   // 传说（橙色）

/**
 * 装备部位
 */
export type EquipmentSlot =
  | 'MainHand'    // 主手
  | 'OffHand'     // 副手
  | 'Head'        // 头部
  | 'Armor'       // 衣服
  | 'Legs'        // 腿部
  | 'Boots'       // 鞋子
  | 'Gloves'       // 手套
  | 'Ring'        // 戒指
  | 'Necklace'    // 项链

/**
 * 物品接口
 */
export interface Item {
  id: string
  templateId: string
  name: string
  type: ItemType
  rarity: ItemRarity
  level: number
  icon?: string
  description?: string
  stackSize: number
  maxStackSize: number
  slot?: EquipmentSlot
  stats?: Record<string, number>
  effects?: string[]
  price: number
}

/**
 * 背包物品接口
 */
export interface InventoryItem {
  slot: number
  item: Item
  quantity: number
  isEquipped: boolean
}

/**
 * 背包配置
 */
export interface InventoryConfig {
  capacity: number
  defaultMaxStack: number
}

/**
 * 背包系统
 * 负责管理玩家物品、装备、交易等
 */
export class InventorySystem extends EventEmitter {
  private config: InventoryConfig
  private items: Map<number, InventoryItem> = new Map()
  private equipment: Map<EquipmentSlot, InventoryItem> = new Map()
  private currency: {
    silver: number
    gold: number
  } = { silver: 0, gold: 0 }

  constructor(config: InventoryConfig = { capacity: 50, defaultMaxStack: 99 }) {
    super()
    this.config = config
    this.setupNetworkHandlers()
  }

  /**
   * 设置网络消息处理器
   */
  private setupNetworkHandlers(): void {
    // 监听背包更新
    network.onMessage('inventory', (payload) => {
      this.loadInventory(payload.items)
    })

    // 监听物品添加
    network.onMessage('itemAdd', (payload) => {
      this.addItemToSlot(payload.slot, payload.item, payload.quantity)
    })

    // 监听物品移除
    network.onMessage('itemRemove', (payload) => {
      this.removeItemFromSlot(payload.slot, payload.quantity)
    })

    // 监听装备变更
    network.onMessage('equipment', (payload) => {
      this.updateEquipment(payload.slot, payload.item)
    })

    // 监听货币更新
    network.onMessage('currency', (payload) => {
      this.updateCurrency(payload.silver, payload.gold)
    })
  }

  /**
   * 加载背包
   */
  public loadInventory(items: InventoryItem[]): void {
    this.items.clear()
    items.forEach(item => {
      this.items.set(item.slot, item)
    })
    this.emit('inventoryLoaded', items)
  }

  /**
   * 添加物品
   */
  public addItem(item: Item, quantity: number = 1): boolean {
    // 尝试堆叠
    if (this.canStack(item)) {
      for (const [slot, invItem] of this.items.entries()) {
        if (invItem.item.templateId === item.templateId && 
            invItem.quantity < invItem.item.maxStackSize) {
          const addAmount = Math.min(
            quantity,
            invItem.item.maxStackSize - invItem.quantity
          )
          invItem.quantity += addAmount
          quantity -= addAmount
          
          this.updateSlot(slot, invItem)
          
          if (quantity <= 0) {
            return true
          }
        }
      }
    }

    // 找空位
    while (quantity > 0) {
      const emptySlot = this.findEmptySlot()
      if (emptySlot === -1) {
        this.emit('inventoryFull')
        return false
      }

      const addAmount = Math.min(quantity, item.maxStackSize)
      const newItem: InventoryItem = {
        slot: emptySlot,
        item: { ...item },
        quantity: addAmount,
        isEquipped: false,
      }

      this.items.set(emptySlot, newItem)
      quantity -= addAmount

      // 发送网络消息
      network.send('itemAdd', {
        slot: emptySlot,
        item,
        quantity: addAmount,
      })
    }

    return true
  }

  /**
   * 移除物品
   */
  public removeItem(slot: number, quantity: number = 1): boolean {
    const invItem = this.items.get(slot)
    if (!invItem) return false

    if (invItem.quantity <= quantity) {
      this.items.delete(slot)
    } else {
      invItem.quantity -= quantity
      this.items.set(slot, invItem)
    }

    // 发送网络消息
    network.send('itemRemove', {
      slot,
      quantity,
    })

    return true
  }

  /**
   * 移动物品
   */
  public moveItem(fromSlot: number, toSlot: number): boolean {
    const fromItem = this.items.get(fromSlot)
    const toItem = this.items.get(toSlot)

    if (!fromItem) return false

    // 如果目标槽为空，直接移动
    if (!toItem) {
      this.items.delete(fromSlot)
      fromItem.slot = toSlot
      this.items.set(toSlot, fromItem)
      return true
    }

    // 如果可以堆叠
    if (this.canStackItems(fromItem.item, toItem.item)) {
      const totalQuantity = fromItem.quantity + toItem.quantity
      const maxStack = toItem.item.maxStackSize

      if (totalQuantity <= maxStack) {
        toItem.quantity = totalQuantity
        this.items.delete(fromSlot)
        this.items.set(toSlot, toItem)
        return true
      } else {
        // 部分堆叠
        fromItem.quantity = totalQuantity - maxStack
        toItem.quantity = maxStack
        this.items.set(fromSlot, fromItem)
        this.items.set(toSlot, toItem)
        return true
      }
    }

    // 交换
    fromItem.slot = toSlot
    toItem.slot = fromSlot
    this.items.set(fromSlot, toItem)
    this.items.set(toSlot, fromItem)
    return true
  }

  /**
   * 装备物品
   */
  public equipItem(slot: number): boolean {
    const invItem = this.items.get(slot)
    if (!invItem || !invItem.item.slot) return false

    const equipmentSlot = invItem.item.slot as EquipmentSlot
    const currentEquip = this.equipment.get(equipmentSlot)

    // 卸下当前装备
    if (currentEquip) {
      this.unequipItem(equipmentSlot)
    }

    // 装备新物品
    invItem.isEquipped = true
    this.items.set(slot, invItem)
    this.equipment.set(equipmentSlot, invItem)

    // 发送网络消息
    network.send('equip', {
      slot,
      equipmentSlot,
    })

    this.emit('equipmentChanged', {
      slot: equipmentSlot,
      item: invItem,
    })

    return true
  }

  /**
   * 卸下装备
   */
  public unequipItem(equipmentSlot: EquipmentSlot): boolean {
    const equipItem = this.equipment.get(equipmentSlot)
    if (!equipItem) return false

    // 找背包空位
    const emptySlot = this.findEmptySlot()
    if (emptySlot === -1) {
      this.emit('inventoryFull')
      return false
    }

    equipItem.isEquipped = false
    equipItem.slot = emptySlot
    this.items.set(emptySlot, equipItem)
    this.equipment.delete(equipmentSlot)

    // 发送网络消息
    network.send('unequip', {
      equipmentSlot,
      newSlot: emptySlot,
    })

    this.emit('equipmentChanged', {
      slot: equipmentSlot,
      item: null,
    })

    return true
  }

  /**
   * 使用物品
   */
  public useItem(slot: number): boolean {
    const invItem = this.items.get(slot)
    if (!invItem) return false

    if (invItem.item.type === 'Consumable') {
      // 消耗品
      network.send('useItem', {
        slot,
        type: 'consumable',
      })

      this.emit('itemUsed', {
        slot,
        item: invItem.item,
      })

      // 减少数量
      this.removeItem(slot, 1)
      return true
    }

    return false
  }

  /**
   * 获取物品
   */
  public getItem(slot: number): InventoryItem | undefined {
    return this.items.get(slot)
  }

  /**
   * 获取所有物品
   */
  public getAllItems(): InventoryItem[] {
    return Array.from(this.items.values())
  }

  /**
   * 获取装备
   */
  public getEquipment(slot: EquipmentSlot): InventoryItem | undefined {
    return this.equipment.get(slot)
  }

  /**
   * 获取所有装备
   */
  public getAllEquipment(): Map<EquipmentSlot, InventoryItem> {
    return new Map(this.equipment)
  }

  /**
   * 获取货币
   */
  public getCurrency(): { silver: number; gold: number } {
    return this.currency
  }

  /**
   * 更新货币
   */
  public updateCurrency(silver: number, gold: number): void {
    this.currency = { silver, gold }
    this.emit('currencyUpdated', { silver, gold })
  }

  /**
   * 添加货币
   */
  public addCurrency(silver: number = 0, gold: number = 0): void {
    this.currency.silver += silver
    this.currency.gold += gold
    this.emit('currencyUpdated', { ...this.currency })
  }

  /**
   * 查找空槽位
   */
  private findEmptySlot(): number {
    for (let i = 0; i < this.config.capacity; i++) {
      if (!this.items.has(i)) {
        return i
      }
    }
    return -1
  }

  /**
   * 更新槽位
   */
  private updateSlot(slot: number, item: InventoryItem): void {
    this.items.set(slot, item)
    this.emit('slotUpdated', { slot, item })
  }

  /**
   * 添加物品到槽位
   */
  private addItemToSlot(slot: number, item: Item, quantity: number): void {
    const existing = this.items.get(slot)
    if (existing) {
      existing.quantity += quantity
      this.items.set(slot, existing)
    } else {
      this.items.set(slot, {
        slot,
        item,
        quantity,
        isEquipped: false,
      })
    }
    this.emit('slotUpdated', { slot, item: this.items.get(slot) })
  }

  /**
   * 从槽位移除物品
   */
  private removeItemFromSlot(slot: number, quantity: number): void {
    const invItem = this.items.get(slot)
    if (!invItem) return

    if (invItem.quantity <= quantity) {
      this.items.delete(slot)
    } else {
      invItem.quantity -= quantity
      this.items.set(slot, invItem)
    }
    this.emit('slotUpdated', { slot, item: this.items.get(slot) })
  }

  /**
   * 更新装备
   */
  private updateEquipment(slot: EquipmentSlot, item: InventoryItem | null): void {
    if (item) {
      this.equipment.set(slot, item)
    } else {
      this.equipment.delete(slot)
    }
    this.emit('equipmentChanged', { slot, item })
  }

  /**
   * 检查是否可以堆叠
   */
  private canStack(item: Item): boolean {
    return item.type !== 'Equipment' && item.type !== 'Quest'
  }

  /**
   * 检查两个物品是否可以堆叠
   */
  private canStackItems(item1: Item, item2: Item): boolean {
    return item1.templateId === item2.templateId &&
           item1.type !== 'Equipment' &&
           item1.type !== 'Quest'
  }

  /**
   * 获取背包容量
   */
  public getCapacity(): number {
    return this.config.capacity
  }

  /**
   * 获取已用槽位
   */
  public getUsedSlots(): number {
    return this.items.size
  }

  /**
   * 清空背包
   */
  public clear(): void {
    this.items.clear()
    this.equipment.clear()
    this.currency = { silver: 0, gold: 0 }
    this.emit('inventoryCleared')
  }
}

// 导出单例
export const inventorySystem = new InventorySystem()
