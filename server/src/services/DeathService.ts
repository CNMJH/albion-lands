import { PrismaClient } from '@prisma/client';
import { Character, EquipmentSlot } from '../types';

const prisma = new PrismaClient();

export interface DeathResult {
  droppedItems: Array<{
    itemId: string;
    itemName: string;
    slot?: string;
    quantity?: number;
  }>;
  durabilityLoss: number;
  respawnLocation: {
    mapId: string;
    x: number;
    y: number;
  };
}

export interface LootResult {
  success: boolean;
  item?: any;
  message?: string;
}

/**
 * 死亡掉落服务
 * 实现阿尔比恩核心机制：死亡掉落装备
 */
export class DeathService {
  /**
   * 处理玩家死亡
   */
  async handleDeath(
    characterId: string,
    mapId: string,
    safetyLevel: number,
    killerId?: string
  ): Promise<DeathResult> {
    // 1. 获取角色信息
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        inventory: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!character) {
      throw new Error('角色不存在');
    }

    // 2. 计算掉落物品
    const droppedItems = this.calculateDrops(
      character,
      safetyLevel,
      mapId
    );

    // 3. 创建掉落物实体
    for (const drop of droppedItems) {
      await prisma.droppedItem.create({
        data: {
          mapId,
          x: Math.floor(character.x),
          y: Math.floor(character.y),
          itemId: drop.itemId,
          ownerId: characterId, // 原主人，用于拾取保护
          quantity: drop.quantity || 1,
          expireAt: new Date(Date.now() + 30 * 60 * 1000), // 30 分钟后过期
        },
      });
    }

    // 4. 从角色背包/装备中移除掉落物品
    await this.removeDroppedItems(characterId, droppedItems);

    // 5. 记录死亡
    await prisma.deathRecord.create({
      data: {
        characterId,
        killerId,
        mapId,
        safetyLevel,
        droppedItems: JSON.stringify(droppedItems),
      },
    });

    // 6. 扣除装备耐久度
    await this.reduceEquipmentDurability(characterId, durabilityLoss);

    // 7. 计算复活位置
    const respawnLocation = this.getRespawnLocation(safetyLevel, mapId);

    // 8. 更新角色位置
    await prisma.character.update({
      where: { id: characterId },
      data: {
        x: respawnLocation.x,
        y: respawnLocation.y,
        zoneId: respawnLocation.mapId,
      },
    });

    return {
      droppedItems,
      durabilityLoss,
      respawnLocation,
    };
  }

  /**
   * 计算掉落物品
   */
  private calculateDrops(
    character: any,
    safetyLevel: number,
    mapId: string
  ): Array<{ itemId: string; itemName: string; slot?: string; quantity?: number }> {
    const droppedItems: Array<{
      itemId: string;
      itemName: string;
      slot?: string;
      quantity?: number;
    }> = [];

    // 新手保护：Lv.10 以下不掉落装备
    if (character.level < 10) {
      return droppedItems;
    }

    // 安全区：不掉落
    if (safetyLevel >= 6) {
      return droppedItems;
    }

    // 低危区：掉落非装备物品
    if (safetyLevel >= 3) {
      const dropCount = Math.floor(Math.random() * 2); // 0-1 件
      if (dropCount > 0) {
        // 从背包随机选择非装备物品
        const nonEquipmentItems = character.inventory.filter(
          (inv: any) => !inv.isEquipped && inv.item.equipmentType !== 'Tool'
        );

        if (nonEquipmentItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * nonEquipmentItems.length);
          const selectedItem = nonEquipmentItems[randomIndex];

          droppedItems.push({
            itemId: selectedItem.itemId,
            itemName: selectedItem.item.name,
            quantity: selectedItem.quantity,
          });
        }
      }

      return droppedItems;
    }

    // 高危区/死亡区：掉落装备
    const equipment = character.equipment
      ? JSON.parse(character.equipment)
      : {};
    const equipmentSlots = Object.keys(equipment).filter(
      (slot) => equipment[slot] !== null
    );

    if (equipmentSlots.length === 0) {
      return droppedItems;
    }

    // 计算掉落数量
    let dropCount: number;
    if (safetyLevel >= 1) {
      // 高危区：掉落 1-2 件
      dropCount = Math.floor(Math.random() * 2) + 1;
    } else {
      // 死亡区：掉落 3-5 件
      dropCount = Math.floor(Math.random() * 3) + 3;
    }

    // 限制最大掉落数量为装备数量
    dropCount = Math.min(dropCount, equipmentSlots.length);

    // 随机选择装备掉落
    const shuffledSlots = equipmentSlots.sort(() => Math.random() - 0.5);
    const selectedSlots = shuffledSlots.slice(0, dropCount);

    for (const slot of selectedSlots) {
      const itemId = equipment[slot];
      if (itemId) {
        droppedItems.push({
          itemId,
          slot,
          itemName: '装备', // 具体名称在客户端查询
        });
      }
    }

    return droppedItems;
  }

  /**
   * 从角色背包/装备中移除掉落物品
   */
  private async removeDroppedItems(
    characterId: string,
    droppedItems: Array<{ itemId: string; slot?: string }>
  ) {
    for (const drop of droppedItems) {
      if (drop.slot) {
        // 从装备中移除
        const character = await prisma.character.findUnique({
          where: { id: characterId },
        });

        if (character && character.equipment) {
          const equipment = JSON.parse(character.equipment);
          delete equipment[drop.slot];

          await prisma.character.update({
            where: { id: characterId },
            data: { equipment: JSON.stringify(equipment) },
          });
        }
      } else {
        // 从背包中移除
        await prisma.inventoryItem.deleteMany({
          where: {
            characterId,
            itemId: drop.itemId,
            isEquipped: false,
          },
          take: 1,
        });
      }
    }
  }

  /**
   * 获取复活位置
   */
  private getRespawnLocation(
    safetyLevel: number,
    currentMapId: string
  ): { mapId: string; x: number; y: number } {
    // 简单实现：复活到当前地图的安全点
    // 后期可以实现：绑定复活点、最近城市等

    const safePoints: Record<string, { x: number; y: number }> = {
      zone_1: { x: 100, y: 100 },
      zone_2: { x: 200, y: 200 },
      zone_3: { x: 300, y: 300 },
      zone_4: { x: 400, y: 400 },
      zone_5: { x: 500, y: 500 },
    };

    const safePoint = safePoints[currentMapId] || { x: 0, y: 0 };

    return {
      mapId: currentMapId,
      x: safePoint.x,
      y: safePoint.y,
    };
  }

  /**
   * 拾取掉落物
   */
  async lootDroppedItem(
    characterId: string,
    droppedItemId: string
  ): Promise<LootResult> {
    const droppedItem = await prisma.droppedItem.findUnique({
      where: { id: droppedItemId },
      include: {
        item: true,
      },
    });

    if (!droppedItem) {
      return {
        success: false,
        message: '掉落物不存在',
      };
    }

    // 检查是否过期
    if (new Date() > droppedItem.expireAt) {
      await prisma.droppedItem.delete({
        where: { id: droppedItemId },
      });

      return {
        success: false,
        message: '掉落物已过期',
      };
    }

    // 检查距离 (简化：不检查距离)
    // 后期实现：计算玩家与掉落物的距离

    // 添加到拾取者背包
    await prisma.inventoryItem.create({
      data: {
        characterId,
        itemId: droppedItem.itemId,
        quantity: droppedItem.quantity,
        isEquipped: false,
      },
    });

    // 删除掉落物
    await prisma.droppedItem.delete({
      where: { id: droppedItemId },
    });

    return {
      success: true,
      item: droppedItem.item,
    };
  }

  /**
   * 查询地图上的掉落物
   */
  async getDropsInMap(mapId: string) {
    return prisma.droppedItem.findMany({
      where: {
        mapId,
        expireAt: {
          gt: new Date(),
        },
      },
      include: {
        item: true,
      },
    });
  }

  /**
   * 清理过期掉落物
   */
  async cleanupExpiredDrops() {
    const result = await prisma.droppedItem.deleteMany({
      where: {
        expireAt: {
          lte: new Date(),
        },
      },
    });

    console.log(`清理了 ${result.count} 个过期掉落物`);
    return result.count;
  }

  /**
   * 扣除装备耐久度
   */
  async reduceEquipmentDurability(characterId: string, amount: number): Promise<void> {
    // 获取所有装备的 InventoryItem
    const equippedItems = await prisma.inventoryItem.findMany({
      where: {
        characterId,
        isEquipped: true,
      },
    });

    // 更新耐久度
    for (const invItem of equippedItems) {
      const newDurability = Math.max(0, invItem.durability - amount);
      
      await prisma.inventoryItem.update({
        where: { id: invItem.id },
        data: {
          durability: newDurability,
        },
      });

      console.log(`装备 ${invItem.itemId} 耐久度：${invItem.durability} -> ${newDurability}`);
    }

    console.log(`✅ 已扣除 ${equippedItems.length} 件装备的耐久度 (-${amount})`);
  }
}

export const deathService = new DeathService();
