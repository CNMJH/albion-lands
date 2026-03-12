/**
 * 装备槽位类型
 */
export type EquipmentSlot =
  | 'MainHand'
  | 'OffHand'
  | 'Armor'
  | 'Legs'
  | 'Boots'
  | 'Accessory'

/**
 * 服务端地址（绕过 Vite 代理问题）
 */
const SERVER_URL = 'http://localhost:3002'

/**
 * 装备数据
 */
export interface Equipment {
  MainHand?: string
  OffHand?: string
  Armor?: string
  Legs?: string
  Boots?: string
  Accessory?: string
}

/**
 * 角色属性
 */
export interface CharacterStats {
  attack: number
  defense: number
  hp: number
  attackSpeed: number
  moveSpeed: number
}

/**
 * 装备系统
 * 管理角色装备、属性显示
 */
export class EquipmentSystem {
  private characterId: string
  private equipment: Equipment = {}
  private stats: CharacterStats = {
    attack: 0,
    defense: 0,
    hp: 0,
    attackSpeed: 0,
    moveSpeed: 0
  }

  constructor(characterId: string) {
    this.characterId = characterId
    this.init()
  }

  /**
   * 初始化
   */
  private async init(): Promise<void> {
    await this.loadEquipment()
    await this.loadStats()
  }

  /**
   * 加载装备
   */
  async loadEquipment(): Promise<void> {
    try {
      const url = `http://localhost:3002/api/v1/equipment/${this.characterId}`
      console.log('📡 请求装备:', url)
      const response = await fetch(url)
      console.log('📬 装备响应状态:', response.status)
      const data = await response.json()
      console.log('📦 装备响应数据:', data)

      if (data.success) {
        this.equipment = data.data
        console.log('🎒 装备加载完成:', this.equipment)
      } else {
        console.error('❌ 装备加载失败:', data.error)
      }
    } catch (error) {
      console.error('❌ 加载装备异常:', error)
    }
  }

  /**
   * 加载属性
   */
  async loadStats(): Promise<void> {
    try {
      const url = `http://localhost:3002/api/v1/equipment/${this.characterId}/stats`
      console.log('📡 请求属性:', url)
      const response = await fetch(url)
      console.log('📬 属性响应状态:', response.status)
      const data = await response.json()
      console.log('📦 属性响应数据:', data)

      if (data.success) {
        this.stats = data.data
        console.log('📊 属性加载完成:', this.stats)
      } else {
        console.error('❌ 属性加载失败:', data.error)
      }
    } catch (error) {
      console.error('❌ 加载属性异常:', error)
    }
  }

  /**
   * 装备物品
   */
  async equipItem(itemId: string, slot: EquipmentSlot): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/equipment/${this.characterId}/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, slot })
      })

      const data = await response.json()

      if (data.success) {
        this.equipment = data.data.equipment
        this.stats = data.data.stats
        console.log(`✅ 装备已穿戴：${slot}`)
        
        // 触发事件
        this.emit('equipmentChanged', {
          slot,
          itemId,
          previousItemId: data.data.previousItemId
        })
        
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error: any) {
      console.error('装备物品失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 卸下装备
   */
  async unequipItem(slot: EquipmentSlot): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/equipment/${this.characterId}/unequip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot })
      })

      const data = await response.json()

      if (data.success) {
        this.equipment = data.data.equipment
        this.stats = data.data.stats
        console.log(`✅ 装备已卸下：${slot}`)
        
        // 触发事件
        this.emit('equipmentChanged', {
          slot,
          itemId: null
        })
        
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error: any) {
      console.error('卸下装备失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 获取装备
   */
  getEquipment(): Equipment {
    return { ...this.equipment }
  }

  /**
   * 获取属性
   */
  getStats(): CharacterStats {
    return { ...this.stats }
  }

  /**
   * 获取指定槽位的装备
   */
  getSlot(slot: EquipmentSlot): string | undefined {
    return this.equipment[slot]
  }

  /**
   * 对比物品
   */
  async compareItem(itemId: string, slot: EquipmentSlot): Promise<{
    better: boolean
    upgrades: string[]
    downgrades: string[]
  }> {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/equipment/${this.characterId}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, slot })
      })

      const data = await response.json()

      if (data.success) {
        return data.data
      }
      
      return { better: false, upgrades: [], downgrades: [] }
    } catch (error) {
      console.error('对比物品失败:', error)
      return { better: false, upgrades: [], downgrades: [] }
    }
  }

  /**
   * 事件监听
   */
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map()

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: string, listener: (...args: any[]) => void): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
    }
  }
}
