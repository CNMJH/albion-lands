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
  
  // 动作
  initialize: () => void
  setPlayer: (player: Partial<Player>) => void
  updatePlayer: (updates: Partial<Player>) => void
  addItem: (item: Item, slot: number) => void
  removeItem: (slot: number) => void
  addSkill: (skillId: string) => void
  setParty: (party: any) => void
  addFriend: (friend: any) => void
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
  }))
)

// 选择器辅助函数
export const selectPlayer = (state: GameState) => state.player
export const selectInventory = (state: GameState) => state.inventory
export const selectSkills = (state: GameState) => state.skills
export const selectParty = (state: GameState) => state.party
