import { create } from 'zustand';

// 任务目标类型
export interface QuestObjective {
  type: 'kill' | 'collect' | 'deliver' | 'explore' | 'talk' | 'craft';
  targetId: string;
  count: number;
  completed?: boolean;
  current?: number;
}

// 任务进度
export interface QuestProgressData {
  objectiveIndex: number;
  current: number;
  required: number;
  completed: boolean;
}

// 任务
export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'weekly';
  level: number;
  difficulty: 'easy' | 'normal' | 'hard';
  category?: string;
  objectives: QuestObjective[];
  prerequisites?: string[];
  expReward: number;
  silverReward: number;
  goldReward: number;
  itemRewards: Array<{ itemId: string; quantity: number }>;
  isRepeatable: boolean;
  repeatCooldown?: number;
  giverId?: string;
  receiverId?: string;
  giver?: any;
  receiver?: any;
  createdAt: string;
  updatedAt: string;
}

// 任务进度
export interface QuestProgress {
  id: string;
  characterId: string;
  questId: string;
  status: 'in_progress' | 'completed' | 'failed' | 'abandoned';
  progress: QuestProgressData[];
  startedAt: string;
  completedAt?: string;
  failedAt?: string;
  abandonedAt?: string;
  completedCount: number;
  lastCompletedAt?: string;
  quest: Quest;
}

// NPC
export interface NPC {
  id: string;
  name: string;
  type: 'quest' | 'merchant' | 'service';
  zoneId: string;
  x: number;
  y: number;
  dialogue?: any;
  quests?: Array<{
    quest: Quest;
    type: 'give' | 'receive' | 'both';
  }>;
  createdAt: string;
  updatedAt: string;
}

// 成就
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'gathering' | 'crafting' | 'social' | 'exploration';
  type: string;
  targetType?: string;
  targetId?: string;
  targetCount: number;
  expReward: number;
  silverReward: number;
  goldReward: number;
  title?: string;
  badge?: string;
  prerequisites?: string[];
  isHidden: boolean;
  isRepeatable: boolean;
  createdAt: string;
  updatedAt: string;
}

// 成就进度
export interface AchievementProgress {
  id: string;
  characterId: string;
  achievementId: string;
  current: number;
  completed: boolean;
  completedAt?: string;
  completedCount: number;
  achievement: Achievement;
}

// 状态接口
interface QuestState {
  // 任务列表
  availableQuests: Quest[];
  characterQuests: QuestProgress[];
  dailyQuests: any[];
  
  // NPC 列表
  npcs: NPC[];
  
  // 成就
  achievements: Achievement[];
  achievementProgress: AchievementProgress[];
  
  // UI 状态
  selectedQuestId: string | null;
  isQuestPanelOpen: boolean;
  isAchievementPanelOpen: boolean;
  
  // 动作
  setAvailableQuests: (quests: Quest[]) => void;
  setCharacterQuests: (quests: QuestProgress[]) => void;
  setDailyQuests: (quests: any[]) => void;
  setNPCs: (npcs: NPC[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setAchievementProgress: (progress: AchievementProgress[]) => void;
  setSelectedQuest: (questId: string | null) => void;
  toggleQuestPanel: (open?: boolean) => void;
  toggleAchievementPanel: (open?: boolean) => void;
  
  // API 动作
  fetchAvailableQuests: () => Promise<void>;
  fetchCharacterQuests: (characterId: string) => Promise<void>;
  fetchDailyQuests: () => Promise<void>;
  fetchNPCs: () => Promise<void>;
  acceptQuest: (characterId: string, questId: string) => Promise<{ success: boolean; message?: string }>;
  completeQuest: (characterId: string, questId: string) => Promise<{ success: boolean; message?: string }>;
  abandonQuest: (characterId: string, questId: string) => Promise<{ success: boolean; message?: string }>;
  fetchAchievements: () => Promise<void>;
  fetchAchievementProgress: (characterId: string) => Promise<void>;
}

const API_BASE = '/api/v1/quests';

/**
 * 任务系统 Zustand Store
 */
export const useQuestStore = create<QuestState>((set, get) => ({
  // 初始状态
  availableQuests: [],
  characterQuests: [],
  dailyQuests: [],
  npcs: [],
  achievements: [],
  achievementProgress: [],
  selectedQuestId: null,
  isQuestPanelOpen: false,
  isAchievementPanelOpen: false,

  // 设置器
  setAvailableQuests: (quests) => set({ availableQuests: quests }),
  setCharacterQuests: (quests) => set({ characterQuests: quests }),
  setDailyQuests: (quests) => set({ dailyQuests: quests }),
  setNPCs: (npcs) => set({ npcs: npcs }),
  setAchievements: (achievements) => set({ achievements }),
  setAchievementProgress: (progress) => set({ achievementProgress: progress }),
  setSelectedQuest: (questId) => set({ selectedQuestId: questId }),
  toggleQuestPanel: (open) => set({ isQuestPanelOpen: open !== undefined ? open : !get().isQuestPanelOpen }),
  toggleAchievementPanel: (open) => set({ isAchievementPanelOpen: open !== undefined ? open : !get().isAchievementPanelOpen }),

  // API 动作
  fetchAvailableQuests: async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (data.success) {
        set({ availableQuests: data.data.quests });
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
    }
  },

  fetchCharacterQuests: async (characterId) => {
    try {
      const res = await fetch(`${API_BASE}/character/${characterId}`);
      const data = await res.json();
      if (data.success) {
        set({ characterQuests: data.data.quests });
      }
    } catch (error) {
      console.error('获取角色任务失败:', error);
    }
  },

  fetchDailyQuests: async () => {
    try {
      const res = await fetch(`${API_BASE}/daily/list`);
      const data = await res.json();
      if (data.success) {
        set({ dailyQuests: data.data.dailyQuests });
      }
    } catch (error) {
      console.error('获取每日任务失败:', error);
    }
  },

  fetchNPCs: async () => {
    try {
      const res = await fetch(`${API_BASE}/npcs`);
      const data = await res.json();
      if (data.success) {
        set({ npcs: data.data.npcs });
      }
    } catch (error) {
      console.error('获取 NPC 列表失败:', error);
    }
  },

  acceptQuest: async (characterId, questId) => {
    try {
      const res = await fetch(`${API_BASE}/${questId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      const data = await res.json();
      
      if (data.success) {
        // 刷新任务列表
        await get().fetchCharacterQuests(characterId);
      }
      
      return data;
    } catch (error) {
      console.error('接取任务失败:', error);
      return { success: false, message: '网络错误' };
    }
  },

  completeQuest: async (characterId, questId) => {
    try {
      const res = await fetch(`${API_BASE}/${questId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      const data = await res.json();
      
      if (data.success) {
        // 刷新任务列表
        await get().fetchCharacterQuests(characterId);
      }
      
      return data;
    } catch (error) {
      console.error('提交任务失败:', error);
      return { success: false, message: '网络错误' };
    }
  },

  abandonQuest: async (characterId, questId) => {
    try {
      const res = await fetch(`${API_BASE}/${questId}/abandon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      const data = await res.json();
      
      if (data.success) {
        // 刷新任务列表
        await get().fetchCharacterQuests(characterId);
      }
      
      return data;
    } catch (error) {
      console.error('放弃任务失败:', error);
      return { success: false, message: '网络错误' };
    }
  },

  fetchAchievements: async () => {
    try {
      const res = await fetch(`${API_BASE}/achievements`);
      const data = await res.json();
      if (data.success) {
        set({ achievements: data.data.achievements });
      }
    } catch (error) {
      console.error('获取成就列表失败:', error);
    }
  },

  fetchAchievementProgress: async (characterId) => {
    try {
      const res = await fetch(`${API_BASE}/achievements/character/${characterId}`);
      const data = await res.json();
      if (data.success) {
        set({ achievementProgress: data.data.achievements });
      }
    } catch (error) {
      console.error('获取成就进度失败:', error);
    }
  },
}));
