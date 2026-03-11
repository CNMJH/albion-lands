import { prisma } from '../prisma'

/**
 * 物品服务
 * 处理物品相关逻辑
 */
export class ItemService {
  /**
   * 获取物品模板
   */
  public static async getItemTemplate(templateId: string): Promise<{
    id: string
    name: string
    type: string
    rarity: string
    stats: any
    slot?: string
    minLevel: number
    stackSize: number
    basePrice: number
  } | null> {
    const item = await prisma.item.findUnique({
      where: { id: templateId },
    })

    if (!item) return null

    return {
      id: item.id,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      stats: item.stats ? JSON.parse(item.stats) : {},
      slot: item.slot || undefined,
      minLevel: item.minLevel,
      stackSize: item.stackSize,
      basePrice: item.basePrice,
    }
  }

  /**
   * 创建物品实例
   */
  public static async createItemInstance(
    templateId: string,
    quantity: number = 1
  ): Promise<{
    id: string
    templateId: string
    quantity: number
  } | null> {
    const template = await this.getItemTemplate(templateId)
    if (!template) return null

    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      quantity: Math.min(quantity, template.stackSize),
    }
  }

  /**
   * 获取角色背包
   */
  public static async getCharacterInventory(characterId: string): Promise<Array<{
    slot: number
    itemId: string
    quantity: number
    isEquipped: boolean
    item: any
  }>> {
    const inventory = await prisma.inventoryItem.findMany({
      where: { characterId },
      include: {
        item: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return inventory.map(inv => ({
      slot: parseInt(inv.id.split('_').pop() || '0'),
      itemId: inv.itemId,
      quantity: inv.quantity,
      isEquipped: inv.isEquipped,
      item: {
        ...inv.item,
        stats: inv.item.stats ? JSON.parse(inv.item.stats) : {},
      },
    }))
  }

  /**
   * 添加物品到角色背包
   */
  public static async addItemToCharacter(
    characterId: string,
    itemId: string,
    quantity: number = 1,
    slot?: number
  ): Promise<boolean> {
    try {
      // 如果指定了槽位
      if (slot !== undefined) {
        await prisma.inventoryItem.create({
          data: {
            id: `inv_${characterId}_${slot}`,
            characterId,
            itemId,
            quantity,
            isEquipped: false,
          },
        })
        return true
      }

      // 找空槽位
      const existingItems = await this.getCharacterInventory(characterId)
      const usedSlots = new Set(existingItems.map(i => i.slot))
      
      let emptySlot = -1
      for (let i = 0; i < 50; i++) {
        if (!usedSlots.has(i)) {
          emptySlot = i
          break
        }
      }

      if (emptySlot === -1) {
        return false // 背包已满
      }

      await prisma.inventoryItem.create({
        data: {
          id: `inv_${characterId}_${emptySlot}`,
          characterId,
          itemId,
          quantity,
          isEquipped: false,
        },
      })

      return true
    } catch (error) {
      console.error('添加物品失败:', error)
      return false
    }
  }

  /**
   * 从角色背包移除物品
   */
  public static async removeItemFromCharacter(
    characterId: string,
    slot: number,
    quantity: number = 1
  ): Promise<boolean> {
    try {
      const invItem = await prisma.inventoryItem.findUnique({
        where: {
          id: `inv_${characterId}_${slot}`,
        },
      })

      if (!invItem) return false

      if (invItem.quantity <= quantity) {
        await prisma.inventoryItem.delete({
          where: {
            id: `inv_${characterId}_${slot}`,
          },
        })
      } else {
        await prisma.inventoryItem.update({
          where: {
            id: `inv_${characterId}_${slot}`,
          },
          data: {
            quantity: invItem.quantity - quantity,
          },
        })
      }

      return true
    } catch (error) {
      console.error('移除物品失败:', error)
      return false
    }
  }

  /**
   * 装备物品
   */
  public static async equipItem(
    characterId: string,
    slot: number
  ): Promise<boolean> {
    try {
      const invItem = await prisma.inventoryItem.findUnique({
        where: {
          id: `inv_${characterId}_${slot}`,
        },
        include: {
          item: true,
        },
      })

      if (!invItem || !invItem.item.slot) return false

      // 卸下当前装备
      await prisma.inventoryItem.updateMany({
        where: {
          characterId,
          isEquipped: true,
          item: {
            slot: invItem.item.slot,
          },
        },
        data: {
          isEquipped: false,
        },
      })

      // 装备新物品
      await prisma.inventoryItem.update({
        where: {
          id: `inv_${characterId}_${slot}`,
        },
        data: {
          isEquipped: true,
        },
      })

      return true
    } catch (error) {
      console.error('装备物品失败:', error)
      return false
    }
  }

  /**
   * 卸下装备
   */
  public static async unequipItem(
    characterId: string,
    slot: number
  ): Promise<boolean> {
    try {
      await prisma.inventoryItem.update({
        where: {
          id: `inv_${characterId}_${slot}`,
        },
        data: {
          isEquipped: false,
        },
      })

      return true
    } catch (error) {
      console.error('卸下装备失败:', error)
      return false
    }
  }

  /**
   * 获取角色装备
   */
  public static async getCharacterEquipment(characterId: string): Promise<Array<{
    slot: number
    itemId: string
    item: any
  }>> {
    const equipment = await prisma.inventoryItem.findMany({
      where: {
        characterId,
        isEquipped: true,
      },
      include: {
        item: true,
      },
    })

    return equipment.map(eq => ({
      slot: parseInt(eq.id.split('_').pop() || '0'),
      itemId: eq.itemId,
      item: {
        ...eq.item,
        stats: eq.item.stats ? JSON.parse(eq.item.stats) : {},
      },
    }))
  }

  /**
   * 移动物品
   */
  public static async moveItem(
    characterId: string,
    fromSlot: number,
    toSlot: number
  ): Promise<boolean> {
    try {
      const fromItem = await prisma.inventoryItem.findUnique({
        where: {
          id: `inv_${characterId}_${fromSlot}`,
        },
      })

      const toItem = await prisma.inventoryItem.findUnique({
        where: {
          id: `inv_${characterId}_${toSlot}`,
        },
      })

      if (!fromItem) return false

      // 如果目标槽为空，直接移动
      if (!toItem) {
        await prisma.inventoryItem.update({
          where: {
            id: `inv_${characterId}_${fromSlot}`,
          },
          data: {
            id: `inv_${characterId}_${toSlot}`,
          },
        })
        return true
      }

      // 如果可以堆叠
      if (fromItem.itemId === toItem.itemId) {
        const totalQuantity = fromItem.quantity + toItem.quantity
        const template = await this.getItemTemplate(fromItem.itemId)
        const maxStack = template?.stackSize || 99

        if (totalQuantity <= maxStack) {
          await prisma.inventoryItem.delete({
            where: {
              id: `inv_${characterId}_${fromSlot}`,
            },
          })
          await prisma.inventoryItem.update({
            where: {
              id: `inv_${characterId}_${toSlot}`,
            },
            data: {
              quantity: totalQuantity,
            },
          })
          return true
        }
      }

      // 交换
      await prisma.inventoryItem.update({
        where: {
          id: `inv_${characterId}_${fromSlot}`,
        },
        data: {
          id: `inv_${characterId}_${toSlot}_temp`,
        },
      })

      await prisma.inventoryItem.update({
        where: {
          id: `inv_${characterId}_${toSlot}`,
        },
        data: {
          id: `inv_${characterId}_${fromSlot}`,
        },
      })

      await prisma.inventoryItem.update({
        where: {
          id: `inv_${characterId}_${toSlot}_temp`,
        },
        data: {
          id: `inv_${characterId}_${toSlot}`,
        },
      })

      return true
    } catch (error) {
      console.error('移动物品失败:', error)
      return false
    }
  }

  /**
   * 给予物品
   */
  public static async giveItem(
    characterId: string,
    templateId: string,
    quantity: number = 1
  ): Promise<boolean> {
    const template = await this.getItemTemplate(templateId)
    if (!template) return false

    // 尝试堆叠
    const inventory = await this.getCharacterInventory(characterId)
    for (const item of inventory) {
      if (item.itemId === templateId && item.quantity < template.stackSize) {
        const addAmount = Math.min(
          quantity,
          template.stackSize - item.quantity
        )
        await this.addItemToCharacter(characterId, templateId, addAmount, item.slot)
        quantity -= addAmount
        
        if (quantity <= 0) {
          return true
        }
      }
    }

    // 找空位
    while (quantity > 0) {
      const addAmount = Math.min(quantity, template.stackSize)
      const success = await this.addItemToCharacter(characterId, templateId, addAmount)
      if (!success) return false
      quantity -= addAmount
    }

    return true
  }
}
