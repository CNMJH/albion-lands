/**
 * 游戏状态
 */
export interface GameState {
  timestamp: number
  player: PlayerState | null
  players: PlayerState[]
  npcs: NPCState[]
  monsters: MonsterState[]
  items: ItemState[]
  projectiles: ProjectileState[]
  zone: ZoneState
}

/**
 * 玩家状态
 */
export interface PlayerState {
  id: string
  name: string
  level: number
  x: number
  y: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  exp: number
  maxExp: number
  status: PlayerStatus
  equipment: Equipment
  isBot: boolean
  guild?: string
  party?: string
}

export interface PlayerStatus {
  isMoving: boolean
  isAttacking: boolean
  isCasting: boolean
  isDead: boolean
  buffs: Buff[]
  debuffs: Debuff[]
}

export interface Buff {
  id: string
  name: string
  duration: number
  stacks: number
}

export interface Debuff {
  id: string
  name: string
  duration: number
  stacks: number
}

export interface Equipment {
  mainHand?: ItemInstance
  offHand?: ItemInstance
  head?: ItemInstance
  chest?: ItemInstance
  legs?: ItemInstance
  feet?: ItemInstance
  gloves?: ItemInstance
  necklace?: ItemInstance
  ring?: ItemInstance
}

/**
 * NPC 状态
 */
export interface NPCState {
  id: string
  name: string
  type: NPCType
  x: number
  y: number
  level: number
  dialogue?: string
  services: NPCService[]
}

export enum NPCType {
  QuestGiver = 'quest_giver',
  Merchant = 'merchant',
  Blacksmith = 'blacksmith',
  Banker = 'banker',
  GuildMaster = 'guild_master',
  Trainer = 'trainer',
  Vendor = 'vendor',
}

export enum NPCService {
  Trade = 'trade',
  Quest = 'quest',
  Repair = 'repair',
  Bank = 'bank',
  Train = 'train',
}

/**
 * 怪物状态
 */
export interface MonsterState {
  id: string
  name: string
  type: string
  level: number
  x: number
  y: number
  hp: number
  maxHp: number
  isAggressive: boolean
  isElite: boolean
  targetId?: string
  spawnTime: number
}

/**
 * 物品状态
 */
export interface ItemState {
  id: string
  itemId: string
  name: string
  type: ItemType
  rarity: ItemRarity
  x: number
  y: number
  quantity: number
  ownerId?: string
  expireTime?: number
}

export enum ItemType {
  Weapon = 'weapon',
  Armor = 'armor',
  Accessory = 'accessory',
  Consumable = 'consumable',
  Material = 'material',
  Tool = 'tool',
  Misc = 'misc',
}

export enum ItemRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
  Artifact = 'artifact',
}

export interface ItemInstance {
  id: string
  itemId: string
  name: string
  level: number
  durability?: number
  maxDurability?: number
  enchantLevel: number
  stats?: Record<string, number>
}

/**
 * 投射物状态
 */
export interface ProjectileState {
  id: string
  ownerId: string
  type: string
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  damage: number
}

/**
 * 区域状态
 */
export interface ZoneState {
  id: string
  name: string
  type: ZoneType
  safetyLevel: number // 0-10
  width: number
  height: number
  weather?: WeatherType
  timeOfDay: number // 0-24
}

export enum ZoneType {
  City = 'city',
  Village = 'village',
  Field = 'field',
  Dungeon = 'dungeon',
  Arena = 'arena',
  Special = 'special',
}

export enum WeatherType {
  Clear = 'clear',
  Rain = 'rain',
  Snow = 'snow',
  Fog = 'fog',
  Storm = 'storm',
}

/**
 * 世界状态（用于广播）
 */
export interface WorldState {
  timestamp: number
  zoneId: string
  players: PlayerState[]
  monsters: MonsterState[]
  items: ItemState[]
}

/**
 * 技能定义
 */
export interface Skill {
  id: string
  name: string
  description: string
  type: SkillType
  damage?: number
  healing?: number
  duration?: number
  cooldown: number
  manaCost: number
  range: number
  area?: number
  icon: string
}

export enum SkillType {
  Active = 'active',
  Passive = 'passive',
}

/**
 * 任务定义
 */
export interface Quest {
  id: string
  name: string
  description: string
  type: QuestType
  status: QuestStatus
  objectives: QuestObjective[]
  rewards: QuestReward[]
  level: number
}

export enum QuestType {
  Main = 'main',
  Side = 'side',
  Daily = 'daily',
  Weekly = 'weekly',
  Event = 'event',
}

export enum QuestStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
}

export interface QuestObjective {
  id: string
  description: string
  type: QuestObjectiveType
  target: number
  current: number
  completed: boolean
}

export enum QuestObjectiveType {
  Kill = 'kill',
  Collect = 'collect',
  Deliver = 'deliver',
  Talk = 'talk',
  Explore = 'explore',
  Craft = 'craft',
}

export interface QuestReward {
  type: RewardType
  itemId?: string
  amount?: number
  exp?: number
  gold?: number
}

export enum RewardType {
  Item = 'item',
  Exp = 'exp',
  Gold = 'gold',
  Reputation = 'reputation',
}

/**
 * 战斗日志
 */
export interface CombatLog {
  timestamp: number
  type: CombatLogType
  sourceId: string
  targetId: string
  damage?: number
  healing?: number
  skillId?: string
  critical?: boolean
}

export enum CombatLogType {
  Damage = 'damage',
  Healing = 'healing',
  Buff = 'buff',
  Debuff = 'debuff',
  Death = 'death',
  Resurrect = 'resurrect',
}
