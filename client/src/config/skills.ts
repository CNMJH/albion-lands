/**
 * 技能类型
 */
export type SkillType = 
  | 'Damage'      // 伤害技能
  | 'Heal'        // 治疗技能
  | 'Buff'        // 增益技能
  | 'Debuff'      // 减益技能
  | 'Dash'        // 位移技能
  | 'Shield'      // 护盾技能

/**
 * 技能目标类型
 */
export type SkillTargetType = 
  | 'Self'        // 自己
  | 'Single'      // 单体目标
  | 'AOE'         // 范围效果
  | 'Direction'   // 方向性

/**
 * 技能配置接口
 */
export interface SkillConfig {
  id: string
  name: string
  description: string
  type: SkillType
  targetType: SkillTargetType
  weaponType: string // 关联的武器类型
  damageMultiplier?: number // 伤害倍率
  healAmount?: number // 治疗量
  cooldown: number // 冷却时间（秒）
  energyCost: number // 能量消耗
  range: number // 施法距离
  duration?: number // 持续时间（秒，用于 Buff/Debuff）
  radius?: number // 作用半径（用于 AOE）
  icon: string // 技能图标
}

/**
 * 30 种技能配置（精简版）
 * 8 种武器 × 平均 4 种技能 = 32 种
 */
export const SKILL_CONFIGS: SkillConfig[] = [
  // ==================== 剑技能（4 种） ====================
  {
    id: 'sword_heavy_strike',
    name: '重击',
    description: '用力挥剑，造成 150% 伤害',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'sword',
    damageMultiplier: 1.5,
    cooldown: 3,
    energyCost: 10,
    range: 50,
    icon: '⚔️',
  },
  {
    id: 'sword_whirlwind',
    name: '旋风斩',
    description: '旋转挥剑，对周围敌人造成 120% 伤害',
    type: 'Damage',
    targetType: 'AOE',
    weaponType: 'sword',
    damageMultiplier: 1.2,
    cooldown: 8,
    energyCost: 25,
    range: 50,
    radius: 100,
    icon: '🌪️',
  },
  {
    id: 'sword_block',
    name: '格挡',
    description: '举起盾牌，减少 50% 伤害，持续 5 秒',
    type: 'Shield',
    targetType: 'Self',
    weaponType: 'sword',
    cooldown: 15,
    energyCost: 20,
    range: 0,
    duration: 5,
    icon: '🛡️',
  },
  {
    id: 'sword_charge',
    name: '冲锋',
    description: '向目标冲锋，造成 100% 伤害并眩晕 1 秒',
    type: 'Damage',
    targetType: 'Direction',
    weaponType: 'sword',
    damageMultiplier: 1.0,
    cooldown: 10,
    energyCost: 15,
    range: 150,
    icon: '💨',
  },

  // ==================== 斧技能（4 种） ====================
  {
    id: 'axe_chop',
    name: '劈砍',
    description: '猛烈劈砍，造成 180% 伤害',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'axe',
    damageMultiplier: 1.8,
    cooldown: 4,
    energyCost: 15,
    range: 50,
    icon: '🪓',
  },
  {
    id: 'axe_berserk',
    name: '狂暴',
    description: '进入狂暴状态，攻击力 +30%，持续 8 秒',
    type: 'Buff',
    targetType: 'Self',
    weaponType: 'axe',
    cooldown: 20,
    energyCost: 30,
    range: 0,
    duration: 8,
    icon: '😡',
  },
  {
    id: 'axe_blood_suck',
    name: '吸血打击',
    description: '造成伤害的 30% 转化为生命值',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'axe',
    damageMultiplier: 1.3,
    cooldown: 12,
    energyCost: 20,
    range: 50,
    icon: '🩸',
  },
  {
    id: 'axe_shockwave',
    name: '震荡波',
    description: '震击地面，对周围敌人造成 100% 伤害并减速',
    type: 'Debuff',
    targetType: 'AOE',
    weaponType: 'axe',
    damageMultiplier: 1.0,
    cooldown: 15,
    energyCost: 25,
    range: 50,
    radius: 120,
    duration: 3,
    icon: '💥',
  },

  // ==================== 锤技能（4 种） ====================
  {
    id: 'hammer_smash',
    name: '猛击',
    description: '重锤猛击，造成 160% 伤害',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'hammer',
    damageMultiplier: 1.6,
    cooldown: 4,
    energyCost: 15,
    range: 50,
    icon: '🔨',
  },
  {
    id: 'hammer_armor_break',
    name: '破甲攻击',
    description: '降低目标 30% 防御，持续 10 秒',
    type: 'Debuff',
    targetType: 'Single',
    weaponType: 'hammer',
    cooldown: 15,
    energyCost: 20,
    range: 50,
    duration: 10,
    icon: '💔',
  },
  {
    id: 'hammer_stun',
    name: '眩晕重击',
    description: '重击头部，造成 120% 伤害并眩晕 2 秒',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'hammer',
    damageMultiplier: 1.2,
    cooldown: 18,
    energyCost: 25,
    range: 50,
    icon: '⭐',
  },
  {
    id: 'hammer_counter',
    name: '反击',
    description: '格挡下次攻击并反击，造成 200% 伤害',
    type: 'Damage',
    targetType: 'Self',
    weaponType: 'hammer',
    damageMultiplier: 2.0,
    cooldown: 20,
    energyCost: 30,
    range: 0,
    duration: 5,
    icon: '🔄',
  },

  // ==================== 匕首技能（4 种） ====================
  {
    id: 'dagger_backstab',
    name: '背刺',
    description: '从背后攻击，造成 200% 伤害',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'dagger',
    damageMultiplier: 2.0,
    cooldown: 6,
    energyCost: 20,
    range: 40,
    icon: '🗡️',
  },
  {
    id: 'dagger_poison',
    name: '毒刃',
    description: '给武器涂毒，每次攻击附加 10 点伤害，持续 8 秒',
    type: 'Debuff',
    targetType: 'Single',
    weaponType: 'dagger',
    cooldown: 15,
    energyCost: 25,
    range: 40,
    duration: 8,
    icon: '☠️',
  },
  {
    id: 'dagger_stealth',
    name: '隐身',
    description: '进入隐身状态，持续 5 秒',
    type: 'Buff',
    targetType: 'Self',
    weaponType: 'dagger',
    cooldown: 30,
    energyCost: 40,
    range: 0,
    duration: 5,
    icon: '👻',
  },
  {
    id: 'dagger_evasion',
    name: '闪避',
    description: '闪避率 +50%，持续 6 秒',
    type: 'Buff',
    targetType: 'Self',
    weaponType: 'dagger',
    cooldown: 20,
    energyCost: 25,
    range: 0,
    duration: 6,
    icon: '💨',
  },

  // ==================== 弓技能（4 种） ====================
  {
    id: 'bow_shot',
    name: '射击',
    description: '精准射击，造成 130% 伤害',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'bow',
    damageMultiplier: 1.3,
    cooldown: 2,
    energyCost: 8,
    range: 300,
    icon: '🏹',
  },
  {
    id: 'bow_multishot',
    name: '多重箭',
    description: '同时射出 3 支箭，每支造成 80% 伤害',
    type: 'Damage',
    targetType: 'AOE',
    weaponType: 'bow',
    damageMultiplier: 0.8,
    cooldown: 10,
    energyCost: 30,
    range: 250,
    radius: 100,
    icon: '🎯',
  },
  {
    id: 'bow_eagle_eye',
    name: '鹰眼',
    description: '命中率 +50%，暴击率 +30%，持续 10 秒',
    type: 'Buff',
    targetType: 'Self',
    weaponType: 'bow',
    cooldown: 20,
    energyCost: 25,
    range: 0,
    duration: 10,
    icon: '🦅',
  },
  {
    id: 'bow_escape',
    name: '逃脱射击',
    description: '向后跳跃并射击，造成 100% 伤害',
    type: 'Damage',
    targetType: 'Direction',
    weaponType: 'bow',
    damageMultiplier: 1.0,
    cooldown: 12,
    energyCost: 15,
    range: 300,
    icon: '🏃',
  },

  // ==================== 弩技能（3 种） ====================
  {
    id: 'crossbow_snipe',
    name: '狙击',
    description: '瞄准要害，造成 250% 伤害',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'crossbow',
    damageMultiplier: 2.5,
    cooldown: 15,
    energyCost: 35,
    range: 400,
    icon: '🎯',
  },
  {
    id: 'crossbow_pierce',
    name: '穿透箭',
    description: '射出穿透箭，对一条直线上的敌人造成 150% 伤害',
    type: 'Damage',
    targetType: 'Direction',
    weaponType: 'crossbow',
    damageMultiplier: 1.5,
    cooldown: 12,
    energyCost: 25,
    range: 350,
    icon: '➹',
  },
  {
    id: 'crossbow_reload',
    name: '快速装填',
    description: '立即装填弩箭，攻击速度 +50%，持续 8 秒',
    type: 'Buff',
    targetType: 'Self',
    weaponType: 'crossbow',
    cooldown: 20,
    energyCost: 20,
    range: 0,
    duration: 8,
    icon: '⚡',
  },

  // ==================== 法杖技能（4 种） ====================
  {
    id: 'staff_fireball',
    name: '火球术',
    description: '发射火球，造成 180% 魔法伤害',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'staff',
    damageMultiplier: 1.8,
    cooldown: 3,
    energyCost: 20,
    range: 250,
    icon: '🔥',
  },
  {
    id: 'staff_frost',
    name: '冰霜新星',
    description: '释放冰霜，对周围敌人造成 120% 伤害并减速',
    type: 'Debuff',
    targetType: 'AOE',
    weaponType: 'staff',
    damageMultiplier: 1.2,
    cooldown: 10,
    energyCost: 30,
    range: 150,
    radius: 120,
    duration: 4,
    icon: '❄️',
  },
  {
    id: 'staff_lightning',
    name: '雷电术',
    description: '召唤雷电，对目标造成 200% 魔法伤害',
    type: 'Damage',
    targetType: 'Single',
    weaponType: 'staff',
    damageMultiplier: 2.0,
    cooldown: 8,
    energyCost: 35,
    range: 250,
    icon: '⚡',
  },
  {
    id: 'staff_teleport',
    name: '传送',
    description: '瞬间移动到目标位置',
    type: 'Dash',
    targetType: 'Direction',
    weaponType: 'staff',
    cooldown: 20,
    energyCost: 40,
    range: 200,
    icon: '✨',
  },

  // ==================== 魔典技能（3 种） ====================
  {
    id: 'tome_heal',
    name: '治疗术',
    description: '恢复目标 100 点生命值',
    type: 'Heal',
    targetType: 'Single',
    weaponType: 'tome',
    healAmount: 100,
    cooldown: 5,
    energyCost: 25,
    range: 200,
    icon: '💚',
  },
  {
    id: 'tome_shield',
    name: '神圣护盾',
    description: '为目标添加护盾，吸收 80 点伤害，持续 8 秒',
    type: 'Shield',
    targetType: 'Single',
    weaponType: 'tome',
    cooldown: 15,
    energyCost: 30,
    range: 200,
    duration: 8,
    icon: '🛡️',
  },
  {
    id: 'tome_cleanse',
    name: '净化',
    description: '移除目标所有负面状态',
    type: 'Buff',
    targetType: 'Single',
    weaponType: 'tome',
    cooldown: 20,
    energyCost: 35,
    range: 200,
    icon: '✨',
  },
]

/**
 * 根据武器类型获取技能列表
 */
export function getSkillsByWeapon(weaponType: string): SkillConfig[] {
  return SKILL_CONFIGS.filter(skill => skill.weaponType === weaponType)
}

/**
 * 根据技能 ID 获取技能配置
 */
export function getSkillById(skillId: string): SkillConfig | undefined {
  return SKILL_CONFIGS.find(skill => skill.id === skillId)
}

/**
 * 获取所有技能 ID 列表（用于快捷栏）
 */
export function getAllSkillIds(): string[] {
  return SKILL_CONFIGS.map(skill => skill.id)
}
