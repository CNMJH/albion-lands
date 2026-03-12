import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
 * 角色属性类型
 */
export interface CharacterStats {
  attack: number
  defense: number
  hp: number
  attackSpeed: number
  moveSpeed: number
}

/**
 * 装备数据
 */
export interface EquipmentData {
  MainHand?: string
  OffHand?: string
  Armor?: string
  Legs?: string
  Boots?: string
  Accessory?: string
}

/**
 * 装备服务
 * 管理角色装备、属性计算
 */
export class EquipmentService {
  /**
   * 获取角色装备
   */
  async getEquipment(characterId: string): Promise<EquipmentData> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { equipment: true }
    })

    if (!character) {
      throw new Error('角色不存在')
    }

    if (!character.equipment) {
      return {}
    }

    try {
      return JSON.parse(character.equipment)
    } catch (error) {
      console.error('解析装备数据失败:', error)
      return {}
    }
  }

  /**
   * 装备物品
   */
  async equipItem(
    characterId: string,
    itemId: string,
    slot: EquipmentSlot
  ): Promise<{
    success: boolean
    error?: string
    previousItemId?: string
  }> {
    // 1. 检查物品是否存在且属于该角色
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        characterId
      },
      include: {
        item: true
      }
    })

    if (!inventoryItem) {
      return { success: false, error: '物品不存在或不属于该角色' }
    }

    // 2. 检查角色等级
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    })

    if (!character) {
      return { success: false, error: '角色不存在' }
    }

    if (character.level < inventoryItem.item.minLevel) {
      return { 
        success: false, 
        error: `等级不足（需要 ${inventoryItem.item.minLevel} 级）` 
      }
    }

    // 3. 检查物品类型是否匹配槽位
    if (inventoryItem.item.slot !== slot) {
      return { 
        success: false, 
        error: `物品类型不匹配槽位（${slot}）` 
      }
    }

    // 4. 获取当前装备
    const currentEquipment = await this.getEquipment(characterId)
    const previousItemId = currentEquipment[slot]

    // 5. 更新装备
    const newEquipment: EquipmentData = { ...currentEquipment, [slot]: itemId }

    await prisma.character.update({
      where: { id: characterId },
      data: {
        equipment: JSON.stringify(newEquipment)
      }
    })

    // 6. 更新物品装备状态
    if (previousItemId) {
      // 卸下旧装备
      await prisma.inventoryItem.update({
        where: { id: previousItemId },
        data: { isEquipped: false }
      })
    }

    // 装备新物品
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { isEquipped: true }
    })

    // 7. 重新计算属性
    await this.recalculateStats(characterId)

    return {
      success: true,
      previousItemId
    }
  }

  /**
   * 卸下装备
   */
  async unequipItem(
    characterId: string,
    slot: EquipmentSlot
  ): Promise<{
    success: boolean
    error?: string
    itemId?: string
  }> {
    // 1. 获取当前装备
    const currentEquipment = await this.getEquipment(characterId)
    const itemId = currentEquipment[slot]

    if (!itemId) {
      return { success: false, error: '该槽位没有装备' }
    }

    // 2. 更新装备
    const newEquipment = { ...currentEquipment }
    delete newEquipment[slot]

    await prisma.character.update({
      where: { id: characterId },
      data: {
        equipment: JSON.stringify(newEquipment)
      }
    })

    // 3. 更新物品装备状态
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { isEquipped: false }
    })

    // 4. 重新计算属性
    await this.recalculateStats(characterId)

    return {
      success: true,
      itemId
    }
  }

  /**
   * 重新计算角色属性
   */
  async recalculateStats(characterId: string): Promise<CharacterStats> {
    // 1. 获取基础属性（根据等级）
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    })

    if (!character) {
      throw new Error('角色不存在')
    }

    const baseStats = this.getBaseStats(character.level)

    // 2. 获取装备属性
    const equipmentStats = await this.getEquipmentStats(characterId)

    // 3. 计算总属性
    const totalStats: CharacterStats = {
      attack: baseStats.attack + equipmentStats.attack,
      defense: baseStats.defense + equipmentStats.defense,
      hp: baseStats.hp + equipmentStats.hp,
      attackSpeed: baseStats.attackSpeed + equipmentStats.attackSpeed,
      moveSpeed: baseStats.moveSpeed + equipmentStats.moveSpeed
    }

    // 4. 保存到数据库
    await prisma.character.update({
      where: { id: characterId },
      data: {
        stats: JSON.stringify(totalStats)
      }
    })

    return totalStats
  }

  /**
   * 获取基础属性（根据等级）
   */
  getBaseStats(level: number): CharacterStats {
    return {
      attack: 10 + level * 2,
      defense: 5 + level,
      hp: 100 + level * 20,
      attackSpeed: 1.0,
      moveSpeed: 200
    }
  }

  /**
   * 获取装备属性
   */
  async getEquipmentStats(characterId: string): Promise<CharacterStats> {
    const equipment = await this.getEquipment(characterId)

    const stats: CharacterStats = {
      attack: 0,
      defense: 0,
      hp: 0,
      attackSpeed: 0,
      moveSpeed: 0
    }

    // 遍历所有装备槽位
    for (const slot of Object.keys(equipment) as EquipmentSlot[]) {
      const itemId = equipment[slot]
      if (!itemId) continue

      // 获取物品
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: itemId },
        include: { item: true }
      })

      if (!inventoryItem) continue

      // 解析物品属性
      try {
        const itemStats = inventoryItem.item.stats 
          ? JSON.parse(inventoryItem.item.stats) 
          : {}

        // 累加属性
        if (itemStats.attack) stats.attack += itemStats.attack
        if (itemStats.defense) stats.defense += itemStats.defense
        if (itemStats.hp) stats.hp += itemStats.hp
        if (itemStats.attackSpeed) stats.attackSpeed += itemStats.attackSpeed
        if (itemStats.moveSpeed) stats.moveSpeed += itemStats.moveSpeed
      } catch (error) {
        console.error('解析物品属性失败:', error)
      }
    }

    return stats
  }

  /**
   * 获取角色属性
   */
  async getCharacterStats(characterId: string): Promise<CharacterStats> {
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    })

    if (!character || !character.stats) {
      // 重新计算
      return await this.recalculateStats(characterId)
    }

    try {
      return JSON.parse(character.stats)
    } catch (error) {
      // 解析失败，重新计算
      return await this.recalculateStats(characterId)
    }
  }

  /**
   * 对比两个物品
   */
  async compareItems(
    characterId: string,
    slot: EquipmentSlot,
    itemId: string
  ): Promise<{
    better: boolean
    upgrades: string[]
    downgrades: string[]
  }> {
    // 获取当前装备
    const currentEquipment = await this.getEquipment(characterId)
    const currentItemId = currentEquipment[slot]

    if (!currentItemId) {
      // 当前没有装备，新物品更好
      return { better: true, upgrades: ['新装备'], downgrades: [] }
    }

    // 获取两个物品
    const [currentInvItem, newInvItem] = await Promise.all([
      prisma.inventoryItem.findUnique({
        where: { id: currentItemId },
        include: { item: true }
      }),
      prisma.inventoryItem.findUnique({
        where: { id: itemId },
        include: { item: true }
      })
    ])

    if (!currentInvItem || !newInvItem) {
      return { better: false, upgrades: [], downgrades: [] }
    }

    // 解析属性
    const currentStats = currentInvItem.item.stats 
      ? JSON.parse(currentInvItem.item.stats) 
      : {}
    const newStats = newInvItem.item.stats 
      ? JSON.parse(newInvItem.item.stats) 
      : {}

    const upgrades: string[] = []
    const downgrades: string[] = []

    // 对比属性
    const statNames = ['attack', 'defense', 'hp', 'attackSpeed', 'moveSpeed']
    for (const stat of statNames) {
      const currentVal = currentStats[stat] || 0
      const newVal = newStats[stat] || 0

      if (newVal > currentVal) {
        upgrades.push(`${stat} +${newVal - currentVal}`)
      } else if (newVal < currentVal) {
        downgrades.push(`${stat} -${currentVal - newVal}`)
      }
    }

    const better = upgrades.length > downgrades.length

    return { better, upgrades, downgrades }
  }

  /**
   * 批量装备（预设配置）
   */
  async loadPreset(
    characterId: string,
    preset: EquipmentData
  ): Promise<{
    success: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    for (const [slot, itemId] of Object.entries(preset)) {
      if (!itemId) continue

      const result = await this.equipItem(
        characterId,
        itemId,
        slot as EquipmentSlot
      )

      if (!result.success && result.error) {
        errors.push(`${slot}: ${result.error}`)
      }
    }

    return {
      success: errors.length === 0,
      errors
    }
  }
}

export const equipmentService = new EquipmentService()
