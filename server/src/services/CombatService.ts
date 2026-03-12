import { prisma } from '../prisma'

/**
 * 战斗服务
 * 处理战斗相关逻辑
 */
export class CombatService {
  // 怪物模板
  private static readonly MONSTER_TEMPLATES = {
    // 新手村庄 (Lv1-10)
    'slime_t1': { id: 'slime_t1', name: '绿色史莱姆', level: 2, hp: 50, attack: 8, defense: 2, expReward: 20, silverReward: 5 },
    'slime_t2': { id: 'slime_t2', name: '蓝色史莱姆', level: 5, hp: 80, attack: 12, defense: 4, expReward: 35, silverReward: 8 },
    'rabbit': { id: 'rabbit', name: '野兔', level: 3, hp: 40, attack: 6, defense: 1, expReward: 15, silverReward: 3 },
    
    // 平原旷野 (Lv10-25)
    'wolf': { id: 'wolf', name: '灰狼', level: 12, hp: 150, attack: 25, defense: 8, expReward: 60, silverReward: 15 },
    'boar': { id: 'boar', name: '野猪', level: 15, hp: 200, attack: 30, defense: 12, expReward: 80, silverReward: 20 },
    'deer': { id: 'deer', name: '鹿', level: 10, hp: 100, attack: 15, defense: 5, expReward: 40, silverReward: 10 },
  }

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
    attackType: 'basic' | 'skill' = 'basic'
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
        inventoryItems: {
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
    const weapon = character.inventoryItems.find(item => item.isEquipped && item.item.slot === 'MainHand')
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
        inventoryItems: {
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
    const armor = character.inventoryItems.find(item => item.isEquipped && item.item.slot === 'Armor')
    if (armor) {
      const stats = JSON.parse(armor.item.stats || '{}')
      defense += stats.defense || 0
    }

    // 计算伤害
    const damage = this.calculateDamage(monster.level, monster.attack, character.level, defense)
    const newHP = (character as any).hp - damage || 100 - damage

    // 更新角色 HP
    await prisma.character.update({
      where: { id: characterId },
      data: {
        hp: Math.max(0, newHP),
      },
    })

    return {
      success: true,
      damage,
      playerHP: Math.max(0, newHP),
      playerDead: newHP <= 0,
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
