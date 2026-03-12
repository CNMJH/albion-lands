import { prisma } from '../prisma'

interface MonsterInstance {
  id: string
  templateId: string
  zoneId: string
  x: number
  y: number
  hp: number
  maxHp: number
  level: number
  defense: number
  expReward: number
  silverReward: number
  state: 'idle' | 'patrol' | 'chase' | 'attack'
  targetId: string | null
  lastAttackTime: number
}

// 活跃怪物列表（内存缓存）
const activeMonsters = new Map<string, MonsterInstance>()

/**
 * 战斗服务
 * 处理战斗相关逻辑
 */
export class CombatService {

  /**
   * 计算伤害
   */
  public static calculateDamage(attackerLevel: number, attack: number, defenderLevel: number, defense: number): number {
    const levelFactor = 1 + (attackerLevel - defenderLevel) * 0.01
    const baseDamage = attack * 2 - defense
    const variance = 0.8 + Math.random() * 0.4 // 0.8 ~ 1.2
    const damage = Math.max(1, Math.floor(baseDamage * levelFactor * variance))
    return damage
  }

  /**
   * 玩家攻击怪物
   */
  public static async playerAttackMonster(
    characterId: string,
    monsterId: string,
    _attackType: 'basic' | 'skill' = 'basic'
  ): Promise<{
    success: boolean
    damage: number
    monsterHP: number
    monsterDead: boolean
    expGained?: number
    silverGained?: number
  }> {
    // 获取角色信息
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        inventory: {
          include: {
            item: true,
          },
        },
      },
    })

    if (!character) {
      return { success: false, damage: 0, monsterHP: 0, monsterDead: false }
    }

    // 获取怪物信息（从内存或数据库）
    const monster = await this.getMonster(monsterId)
    if (!monster) {
      return { success: false, damage: 0, monsterHP: 0, monsterDead: false }
    }

    // 计算攻击力（基于装备）
    let attack = 10 + character.level * 2
    const weapon = character.inventory.find(item => item.isEquipped && item.item.slot === 'MainHand')
    if (weapon) {
      const stats = JSON.parse(weapon.item.stats || '{}')
      attack += stats.attack || 0
    }

    // 计算伤害
    const damage = this.calculateDamage(character.level, attack, monster.level, monster.defense)
    const newHP = monster.hp - damage

    // 更新怪物 HP
    await this.updateMonsterHP(monsterId, newHP)

    // 检查是否死亡
    if (newHP <= 0) {
      // 怪物死亡，给予奖励
      const expGained = monster.expReward
      const silverGained = monster.silverReward

      await prisma.character.update({
        where: { id: characterId },
        data: {
          exp: character.exp + expGained,
          silver: character.silver + silverGained,
        },
      })

      // 移除怪物
      await this.removeMonster(monsterId)

      return {
        success: true,
        damage,
        monsterHP: 0,
        monsterDead: true,
        expGained,
        silverGained,
      }
    }

    return {
      success: true,
      damage,
      monsterHP: newHP,
      monsterDead: false,
    }
  }

  /**
   * 怪物攻击玩家
   */
  public static async monsterAttackPlayer(
    characterId: string,
    monsterId: string
  ): Promise<{
    success: boolean
    damage: number
    playerHP: number
    playerDead: boolean
  }> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        inventory: {
          include: {
            item: true,
          },
        },
      },
    })

    if (!character) {
      return { success: false, damage: 0, playerHP: 0, playerDead: false }
    }

    const monster = await this.getMonster(monsterId)
    if (!monster) {
      return { success: false, damage: 0, playerHP: 0, playerDead: false }
    }

    // 计算防御力（基于装备）
    let defense = character.level
    const armor = character.inventory.find(item => item.isEquipped && item.item.slot === 'Armor')
    if (armor) {
      const stats = JSON.parse(armor.item.stats || '{}')
      defense += stats.defense || 0
    }

    // 计算伤害（简化：使用固定攻击力）
    const damage = this.calculateDamage(monster.level, 15, character.level, defense)

    // 简化处理：不追踪玩家 HP（Schema 中没有 HP 字段）
    // 实际项目中应添加 HP 字段到 Character 模型

    return {
      success: true,
      damage,
      playerHP: 100 - damage,
      playerDead: false,
    }
  }

  /**
   * 获取怪物
   */
  private static async getMonster(monsterId: string): Promise<{
    id: string
    templateId: string
    hp: number
    level: number
    defense: number
    expReward: number
    silverReward: number
  } | null> {
    // 从活跃怪物列表中获取
    const monster = activeMonsters.get(monsterId)
    if (!monster) {
      return null
    }
    
    return {
      id: monster.id,
      templateId: monster.templateId,
      hp: monster.hp,
      level: monster.level || 1,
      defense: monster.defense || 0,
      expReward: monster.expReward || 10,
      silverReward: monster.silverReward || 5,
    }
  }

  /**
   * 更新怪物 HP
   */
  private static async updateMonsterHP(monsterId: string, hp: number): Promise<void> {
    const monster = activeMonsters.get(monsterId)
    if (monster) {
      monster.hp = hp
      activeMonsters.set(monsterId, monster)
    }
  }

  /**
   * 移除怪物
   */
  private static async removeMonster(monsterId: string): Promise<void> {
    activeMonsters.delete(monsterId)
  }

  /**
   * 生成怪物
   */
  public static async spawnMonster(
    zoneId: string,
    x: number,
    y: number,
    templateId: string
  ): Promise<string> {
    const monsterId = `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 创建怪物实例并保存到活跃列表
    const monster: MonsterInstance = {
      id: monsterId,
      templateId,
      zoneId,
      x,
      y,
      hp: 50,
      maxHp: 50,
      level: 1,
      defense: 0,
      expReward: 10,
      silverReward: 5,
      state: 'idle',
      targetId: null,
      lastAttackTime: 0,
    }
    
    activeMonsters.set(monsterId, monster)
    
    return monsterId
  }
}
