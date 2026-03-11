import { prisma } from '../prisma'
import { ItemService } from './ItemService'

/**
 * 制造类型
 */
export type CraftingType = 
  | 'Blacksmithing' // 锻造
  | 'Woodworking'   // 木工
  | 'Tailoring'     // 裁缝
  | 'Alchemy'       // 炼金
  | 'Cooking'       // 烹饪

/**
 * 制造配方
 */
export interface CraftingRecipe {
  id: string
  name: string
  type: CraftingType
  outputItemId: string
  outputQuantity: number
  requiredLevel: number
  craftTime: number
  requiredItems: CraftingMaterial[]
  expReward: number
}

/**
 * 制造材料
 */
export interface CraftingMaterial {
  itemId: string
  quantity: number
}

/**
 * 制造结果
 */
export interface CraftingResult {
  success: boolean
  itemId?: string
  quantity?: number
  exp?: number
  reason?: string
}

/**
 * 配方数据库
 */
const RECIPES: Record<string, CraftingRecipe> = {
  // 锻造
  'iron_sword': {
    id: 'iron_sword',
    name: '铁剑',
    type: 'Blacksmithing',
    outputItemId: 'iron_sword',
    outputQuantity: 1,
    requiredLevel: 5,
    craftTime: 5000,
    requiredItems: [
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'coal', quantity: 2 },
    ],
    expReward: 50,
  },
  'steel_sword': {
    id: 'steel_sword',
    name: '钢剑',
    type: 'Blacksmithing',
    outputItemId: 'steel_sword',
    outputQuantity: 1,
    requiredLevel: 15,
    craftTime: 10000,
    requiredItems: [
      { itemId: 'steel_ingot', quantity: 5 },
      { itemId: 'leather', quantity: 2 },
    ],
    expReward: 100,
  },
  
  // 木工
  'oak_bow': {
    id: 'oak_bow',
    name: '橡木弓',
    type: 'Woodworking',
    outputItemId: 'oak_bow',
    outputQuantity: 1,
    requiredLevel: 5,
    craftTime: 5000,
    requiredItems: [
      { itemId: 'oak_log', quantity: 8 },
      { itemId: 'string', quantity: 2 },
    ],
    expReward: 50,
  },
  
  // 裁缝
  'cloth_armor': {
    id: 'cloth_armor',
    name: '布甲',
    type: 'Tailoring',
    outputItemId: 'cloth_armor',
    outputQuantity: 1,
    requiredLevel: 1,
    craftTime: 3000,
    requiredItems: [
      { itemId: 'cloth', quantity: 10 },
      { itemId: 'thread', quantity: 5 },
    ],
    expReward: 30,
  },
  'leather_armor': {
    id: 'leather_armor',
    name: '皮甲',
    type: 'Tailoring',
    outputItemId: 'leather_armor',
    outputQuantity: 1,
    requiredLevel: 10,
    craftTime: 7000,
    requiredItems: [
      { itemId: 'leather', quantity: 10 },
      { itemId: 'thread', quantity: 5 },
    ],
    expReward: 70,
  },
  
  // 炼金
  'health_potion': {
    id: 'health_potion',
    name: '生命药水',
    type: 'Alchemy',
    outputItemId: 'health_potion',
    outputQuantity: 1,
    requiredLevel: 1,
    craftTime: 2000,
    requiredItems: [
      { itemId: 'herb', quantity: 3 },
      { itemId: 'water', quantity: 1 },
    ],
    expReward: 20,
  },
  'mana_potion': {
    id: 'mana_potion',
    name: '法力药水',
    type: 'Alchemy',
    outputItemId: 'mana_potion',
    outputQuantity: 1,
    requiredLevel: 5,
    craftTime: 2000,
    requiredItems: [
      { itemId: 'magic_herb', quantity: 3 },
      { itemId: 'water', quantity: 1 },
    ],
    expReward: 30,
  },
  
  // 烹饪
  'bread': {
    id: 'bread',
    name: '面包',
    type: 'Cooking',
    outputItemId: 'bread',
    outputQuantity: 1,
    requiredLevel: 1,
    craftTime: 1000,
    requiredItems: [
      { itemId: 'wheat', quantity: 2 },
    ],
    expReward: 10,
  },
  'cooked_meat': {
    id: 'cooked_meat',
    name: '烤肉',
    type: 'Cooking',
    outputItemId: 'cooked_meat',
    outputQuantity: 1,
    requiredLevel: 5,
    craftTime: 3000,
    requiredItems: [
      { itemId: 'raw_meat', quantity: 2 },
      { itemId: 'salt', quantity: 1 },
    ],
    expReward: 25,
  },
}

/**
 * 制造服务
 * 处理物品制造逻辑
 */
export class CraftingService {
  /**
   * 获取所有配方
   */
  public static getAllRecipes(): CraftingRecipe[] {
    return Object.values(RECIPES)
  }

  /**
   * 获取配方
   */
  public static getRecipe(recipeId: string): CraftingRecipe | undefined {
    return RECIPES[recipeId]
  }

  /**
   * 获取某类型的配方
   */
  public static getRecipesByType(type: CraftingType): CraftingRecipe[] {
    return Object.values(RECIPES).filter(r => r.type === type)
  }

  /**
   * 检查材料是否足够
   */
  public static async checkMaterials(
    characterId: string,
    recipe: CraftingRecipe
  ): Promise<{ success: boolean; missing?: CraftingMaterial[] }> {
    const inventory = await ItemService.getCharacterInventory(characterId)
    
    const missing: CraftingMaterial[] = []
    
    for (const required of recipe.requiredItems) {
      const have = inventory.find(i => i.itemId === required.itemId)
      const haveQuantity = have?.quantity || 0
      
      if (haveQuantity < required.quantity) {
        missing.push({
          itemId: required.itemId,
          quantity: required.quantity - haveQuantity,
        })
      }
    }
    
    return {
      success: missing.length === 0,
      missing: missing.length > 0 ? missing : undefined,
    }
  }

  /**
   * 消耗材料
   */
  public static async consumeMaterials(
    characterId: string,
    recipe: CraftingRecipe
  ): Promise<boolean> {
    for (const required of recipe.requiredItems) {
      const success = await ItemService.removeItemFromCharacter(
        characterId,
        // 需要找到对应物品的槽位
        0, // TODO: 找到正确的槽位
        required.quantity
      )
      
      if (!success) {
        return false
      }
    }
    
    return true
  }

  /**
   * 制造物品
   */
  public static async craftItem(
    characterId: string,
    recipeId: string
  ): Promise<CraftingResult> {
    const recipe = this.getRecipe(recipeId)
    if (!recipe) {
      return { success: false, reason: '配方不存在' }
    }

    // 检查角色等级
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    })

    if (!character) {
      return { success: false, reason: '角色不存在' }
    }

    if (character.level < recipe.requiredLevel) {
      return { 
        success: false, 
        reason: `需要等级 ${recipe.requiredLevel}` 
      }
    }

    // 检查材料
    const materialCheck = await this.checkMaterials(characterId, recipe)
    if (!materialCheck.success) {
      return {
        success: false,
        reason: '材料不足',
      }
    }

    // 消耗材料
    const consumed = await this.consumeMaterials(characterId, recipe)
    if (!consumed) {
      return {
        success: false,
        reason: '消耗材料失败',
      }
    }

    // 给予产物
    const success = await ItemService.giveItem(
      characterId,
      recipe.outputItemId,
      recipe.outputQuantity
    )

    if (!success) {
      return {
        success: false,
        reason: '背包已满',
      }
    }

    // 增加制造经验
    await this.addCraftingExp(characterId, recipe.expReward, recipe.type)

    return {
      success: true,
      itemId: recipe.outputItemId,
      quantity: recipe.outputQuantity,
      exp: recipe.expReward,
    }
  }

  /**
   * 增加制造经验
   */
  private static async addCraftingExp(
    characterId: string,
    exp: number,
    type: CraftingType
  ): Promise<void> {
    // TODO: 更新角色制造技能经验
    console.log(`增加 ${type} 经验：${exp}`)
  }

  /**
   * 批量制造
   */
  public static async craftMultiple(
    characterId: string,
    recipeId: string,
    quantity: number
  ): Promise<CraftingResult[]> {
    const results: CraftingResult[] = []
    
    for (let i = 0; i < quantity; i++) {
      const result = await this.craftItem(characterId, recipeId)
      results.push(result)
      
      if (!result.success) {
        break
      }
    }
    
    return results
  }
}
