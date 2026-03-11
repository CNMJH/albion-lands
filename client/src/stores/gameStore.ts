import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// 玩家接口
export interface Player {
  id: string
  name: string
  level: number
  exp: number
  maxExp: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  x: number
  y: number
  zoneId: string
  isBot: boolean
}

// 物品接口
export interface Item {
  id: string
  templateId: string
  name: string
  type: string
  rarity: string
  quantity: number
  slot?: number
}

// 怪物接口
export interface Monster {
  id: string
  templateId: string
  name: string
  level: number
  hp: number
  maxHp: number
  x: number
  y: number
  zoneId: string
}

// 游戏状态接口
interface GameState {
  // 玩家信息
  player: Player | null
  isLoggedIn: boolean
  
  // 背包
  inventory: {
    slots: (Item | null)[]
    capacity: number
  }
  
  // 技能
  skills: string[]
  
  // 任务
  quests: any[]
  
  // 社交
  party: any | null
  guild: any | null
  friends: any[]
  
  // 战斗
  monsters: Monster[]
  combatLog: string[]
  
  // 动作
  initialize: () => void
  setPlayer: (player: Partial<Player>) => void
  updatePlayer: (updates: Partial<Player>) => void
  addItem: (item: Item, slot: number) => void
  removeItem: (slot: number) => void
  addSkill: (skillId: string) => void
  setParty: (party: any) => void
  addFriend: (friend: any) => void
  
  // 战斗相关
  addMonster: (monster: Monster) => void
  updateMonster: (id: string, updates: Partial<Monster>) => void
  removeMonster: (id: string) => void
  addCombatLog: (message: string) => void
  updatePlayerHP: (hp: number) => void
  updateMonsterHP: (id: string, hp: number) => void
}

// 初始玩家数据
const initialPlayer: Player = {
  id: '',
  name: '',
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  x: 0,
  y: 0,
  zoneId: 'starter_village',
  isBot: false,
}

// 创建游戏状态 store
export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    player: null,
    isLoggedIn: false,
    inventory: {
      slots: Array(50).fill(null),
      capacity: 50,
    },
    skills: [],
    quests: [],
    party: null,
    guild: null,
    friends: [],
    monsters: [],
    combatLog: [],
    
    // 初始化
    initialize: () => {
      console.log('游戏状态初始化完成')
    },
    
    // 设置玩家信息
    setPlayer: (playerData) => {
      set((state) => ({
        player: state.player 
          ? { ...state.player, ...playerData }
          : { ...initialPlayer, ...playerData } as Player,
        isLoggedIn: true,
      }))
    },
    
    // 更新玩家信息
    updatePlayer: (updates) => {
      set((state) => ({
        player: state.player ? { ...state.player, ...updates } : null,
      }))
    },
    
    // 添加物品
    addItem: (item, slot) => {
      set((state) => {
        const newSlots = [...state.inventory.slots]
        newSlots[slot] = item
        return {
          inventory: {
            ...state.inventory,
            slots: newSlots,
          },
        }
      })
    },
    
    // 移除物品
    removeItem: (slot) => {
      set((state) => {
        const newSlots = [...state.inventory.slots]
        newSlots[slot] = null
        return {
          inventory: {
            ...state.inventory,
            slots: newSlots,
          },
        }
      })
    },
    
    // 添加技能
    addSkill: (skillId) => {
      set((state) => ({
        skills: [...state.skills, skillId],
      }))
    },
    
    // 设置队伍
    setParty: (party) => {
      set({ party })
    },
    
    // 添加好友
    addFriend: (friend) => {
      set((state) => ({
        friends: [...state.friends, friend],
      }))
    },
    
    // 添加怪物
    addMonster: (monster) => {
      set((state) => ({
        monsters: [...state.monsters, monster],
      }))
    },
    
    // 更新怪物
    updateMonster: (id, updates) => {
      set((state) => ({
        monsters: state.monsters.map(m => 
          m.id === id ? { ...m, ...updates } : m
        ),
      }))
    },
    
    // 移除怪物
    removeMonster: (id) => {
      set((state) => ({
        monsters: state.monsters.filter(m => m.id !== id),
      }))
    },
    
    // 添加战斗日志
    addCombatLog: (message) => {
      set((state) => ({
        combatLog: [...state.combatLog, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-50),
      }))
    },
    
    // 更新玩家 HP
    updatePlayerHP: (hp) => {
      set((state) => {
        if (!state.player) return state
        return {
          player: {
            ...state.player,
            hp: Math.max(0, Math.min(hp, state.player.maxHp)),
          },
        }
      })
    },
    
    // 更新怪物 HP
    updateMonsterHP: (id, hp) => {
      set((state) => ({
        monsters: state.monsters.map(m =>
          m.id === id ? { ...m, hp: Math.max(0, hp), maxHp: m.maxHp } : m
        ),
      }))
    },
  }))
)

// 选择器辅助函数
export const selectPlayer = (state: GameState) => state.player
export const selectInventory = (state: GameState) => state.inventory
export const selectSkills = (state: GameState) => state.skills
export const selectParty = (state: GameState) => state.party
export const selectMonsters = (state: GameState) => state.monsters
export const selectCombatLog = (state: GameState) => state.combatLog
