import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// 任务目标类型
export interface QuestObjective {
  type: 'kill' | 'collect' | 'deliver' | 'explore' | 'talk' | 'craft';
  targetId: string;
  count: number;
  completed?: boolean;
  current?: number;
}

// 任务进度接口
export interface QuestProgressData {
  objectiveIndex: number;
  current: number;
  required: number;
  completed: boolean;
}

/**
 * 任务服务
 * 处理任务接取、进度追踪、提交等逻辑
 */
export class QuestService {
  // 缓存任务数据
  private static questCache: Map<string, any> = new Map();
  private static npcCache: Map<string, any> = new Map();

  /**
   * 获取所有任务
   */
  public static async getAllQuests(): Promise<any[]> {
    const quests = await prisma.quest.findMany({
      include: {
        giver: true,
        receiver: true,
      },
      orderBy: {
        level: 'asc',
      },
    });

    return quests.map(quest => ({
      ...quest,
      objectives: quest.objectives ? JSON.parse(quest.objectives) : [],
      prerequisites: quest.prerequisites ? JSON.parse(quest.prerequisites) : [],
      itemRewards: quest.itemRewards ? JSON.parse(quest.itemRewards) : [],
    }));
  }

  /**
   * 获取任务详情
   */
  public static async getQuestById(questId: string): Promise<any | null> {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: {
        giver: true,
        receiver: true,
      },
    });

    if (!quest) return null;

    return {
      ...quest,
      objectives: quest.objectives ? JSON.parse(quest.objectives) : [],
      prerequisites: quest.prerequisites ? JSON.parse(quest.prerequisites) : [],
      itemRewards: quest.itemRewards ? JSON.parse(quest.itemRewards) : [],
    };
  }

  /**
   * 获取 NPC 可发布的任务
   */
  public static async getNPCQuests(npcId: string): Promise<any[]> {
    const npcQuests = await prisma.nPCQuest.findMany({
      where: { npcId },
      include: {
        quest: true,
        npc: true,
      },
    });

    return npcQuests.map(nq => ({
      ...nq.quest,
      relationType: nq.type,
      objectives: nq.quest.objectives ? JSON.parse(nq.quest.objectives) : [],
      itemRewards: nq.quest.itemRewards ? JSON.parse(nq.quest.itemRewards) : [],
    }));
  }

  /**
   * 获取所有 NPC
   */
  public static async getAllNPCs(): Promise<any[]> {
    const npcs = await prisma.nPC.findMany({
      include: {
        npcQuests: {
          include: {
            quest: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return npcs;
  }

  /**
   * 获取 NPC 详情
   */
  public static async getNPCById(npcId: string): Promise<any | null> {
    const npc = await prisma.nPC.findUnique({
      where: { id: npcId },
      include: {
        npcQuests: {
          include: {
            quest: true,
          },
        },
      },
    });

    if (!npc) return null;

    return {
      ...npc,
      dialogue: npc.dialogue ? JSON.parse(npc.dialogue) : {},
    };
  }

  /**
   * 检查任务前置条件
   */
  public static async checkPrerequisites(
    characterId: string,
    questId: string
  ): Promise<{ canAccept: boolean; reason?: string }> {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      return { canAccept: false, reason: '任务不存在' };
    }

    // 检查等级
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return { canAccept: false, reason: '角色不存在' };
    }

    if (character.level < quest.level) {
      return { canAccept: false, reason: `等级不足，需要 ${quest.level} 级` };
    }

    // 检查前置任务
    if (quest.prerequisites) {
      const prerequisites: string[] = JSON.parse(quest.prerequisites);
      
      for (const prereqId of prerequisites) {
        const progress = await prisma.questProgress.findUnique({
          where: {
            characterId_questId: {
              characterId,
              questId: prereqId,
            },
          },
        });

        if (!progress || progress.status !== 'completed') {
          const prereqQuest = await prisma.quest.findUnique({
            where: { id: prereqId },
          });
          return {
            canAccept: false,
            reason: `需要先完成前置任务：${prereqQuest?.name || prereqId}`,
          };
        }
      }
    }

    // 检查是否已在进行中
    const existingProgress = await prisma.questProgress.findUnique({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
    });

    if (existingProgress && existingProgress.status === 'in_progress') {
      return { canAccept: false, reason: '任务已在进行中' };
    }

    // 检查可重复任务的冷却时间
    if (quest.isRepeatable && quest.repeatCooldown > 0 && existingProgress) {
      if (existingProgress.lastCompletedAt) {
        const cooldownEnd = new Date(existingProgress.lastCompletedAt.getTime() + quest.repeatCooldown * 1000);
        if (new Date() < cooldownEnd) {
          const remaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
          return { canAccept: false, reason: `冷却时间剩余 ${remaining} 秒` };
        }
      }
    }

    return { canAccept: true };
  }

  /**
   * 接取任务
   */
  public static async acceptQuest(
    characterId: string,
    questId: string
  ): Promise<{ success: boolean; message?: string; progress?: any }> {
    // 检查前置条件
    const check = await this.checkPrerequisites(characterId, questId);
    if (!check.canAccept) {
      return { success: false, message: check.reason };
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      return { success: false, message: '任务不存在' };
    }

    // 创建任务进度
    const objectives = quest.objectives ? JSON.parse(quest.objectives) : [];
    const progress: QuestProgressData[] = objectives.map((obj: QuestObjective, index: number) => ({
      objectiveIndex: index,
      current: 0,
      required: obj.count,
      completed: false,
    }));

    const questProgress = await prisma.questProgress.create({
      data: {
        characterId,
        questId,
        status: 'in_progress',
        progress: JSON.stringify(progress),
        startedAt: new Date(),
      },
      include: {
        quest: true,
      },
    });

    return {
      success: true,
      message: `接取任务：${quest.name}`,
      progress: {
        ...questProgress,
        progress: JSON.parse(questProgress.progress || '[]'),
      },
    };
  }

  /**
   * 更新任务进度（按类型和目标自动查找匹配的任务）
   */
  public static async updateProgressByType(
    characterId: string,
    objectiveType: string,
    targetId: string,
    amount: number = 1
  ): Promise<void> {
    // 获取角色所有进行中的任务
    const progresses = await prisma.questProgress.findMany({
      where: {
        characterId,
        status: 'in_progress',
      },
      include: {
        quest: true,
      },
    });

    // 遍历所有任务，更新匹配的目标
    for (const progress of progresses) {
      if (!progress.quest.objectives) continue;

      const objectives: QuestObjective[] = JSON.parse(progress.quest.objectives);
      
      // 检查是否有匹配的目标
      const hasMatchingObjective = objectives.some(
        obj => obj.type === objectiveType && obj.targetId === targetId
      );

      if (hasMatchingObjective) {
        // 调用原有的 updateProgress 方法
        await this.updateProgress(
          characterId,
          progress.questId,
          objectiveType,
          targetId,
          amount
        );
      }
    }
  }

  /**
   * 更新任务进度
   */
  public static async updateProgress(
    characterId: string,
    questId: string,
    objectiveType: string,
    targetId: string,
    amount: number = 1
  ): Promise<{ updated: boolean; progress?: any }> {
    const progress = await prisma.questProgress.findUnique({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
    });

    if (!progress || progress.status !== 'in_progress') {
      return { updated: false };
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest || !quest.objectives) {
      return { updated: false };
    }

    const objectives: QuestObjective[] = JSON.parse(quest.objectives);
    const progressData: QuestProgressData[] = progress.progress
      ? JSON.parse(progress.progress)
      : [];

    let updated = false;

    // 查找匹配的目标
    for (let i = 0; i < objectives.length; i++) {
      const obj = objectives[i];
      if (obj.type === objectiveType && obj.targetId === targetId) {
        if (!progressData[i]) {
          progressData[i] = {
            objectiveIndex: i,
            current: 0,
            required: obj.count,
            completed: false,
          };
        }

        if (!progressData[i].completed && progressData[i].current < progressData[i].required) {
          progressData[i].current = Math.min(
            progressData[i].current + amount,
            progressData[i].required
          );

          if (progressData[i].current >= progressData[i].required) {
            progressData[i].completed = true;
          }

          updated = true;
        }
      }
    }

    if (updated) {
      // 检查是否所有目标都已完成
      const allCompleted = progressData.every(p => p.completed);

      await prisma.questProgress.update({
        where: {
          characterId_questId: {
            characterId,
            questId,
          },
        },
        data: {
          progress: JSON.stringify(progressData),
          status: allCompleted ? 'completed' : 'in_progress',
          completedAt: allCompleted ? new Date() : undefined,
        },
      });

      // 获取更新后的进度
      const updatedProgress = await prisma.questProgress.findUnique({
        where: {
          characterId_questId: {
            characterId,
            questId,
          },
        },
      });

      return {
        updated: true,
        progress: {
          ...updatedProgress,
          progress: updatedProgress?.progress ? JSON.parse(updatedProgress.progress) : [],
        },
      };
    }

    return { updated: false };
  }

  /**
   * 提交任务
   */
  public static async completeQuest(
    characterId: string,
    questId: string
  ): Promise<{ success: boolean; message?: string; rewards?: any }> {
    const progress = await prisma.questProgress.findUnique({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
      include: {
        quest: true,
      },
    });

    if (!progress) {
      return { success: false, message: '任务不存在或未接取' };
    }

    if (progress.status !== 'completed') {
      return { success: false, message: '任务未完成' };
    }

    const quest = progress.quest;

    // 发放奖励
    const rewards: any = {
      exp: quest.expReward,
      silver: quest.silverReward,
      gold: quest.goldReward,
      items: [],
    };

    // 更新角色经验和货币
    const character = await prisma.character.update({
      where: { id: characterId },
      data: {
        exp: { increment: quest.expReward },
        silver: { increment: quest.silverReward },
        gold: { increment: quest.goldReward },
      },
    });

    // 发放物品奖励
    if (quest.itemRewards) {
      const itemRewards: Array<{ itemId: string; quantity: number }> = JSON.parse(quest.itemRewards);
      
      for (const reward of itemRewards) {
        await prisma.inventoryItem.create({
          data: {
            characterId,
            itemId: reward.itemId,
            quantity: reward.quantity,
          },
        });
        rewards.items.push(reward);
      }
    }

    // 检查升级
    const levelUp = await this.checkLevelUp(characterId);

    // 更新任务进度
    await prisma.questProgress.update({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
        completedCount: { increment: 1 },
        lastCompletedAt: new Date(),
      },
    });

    // 记录游戏日志
    await prisma.gameLog.create({
      data: {
        type: 'QUEST_COMPLETED',
        message: `完成任务：${quest.name}`,
        characterId,
        data: JSON.stringify({ questId, rewards }),
      },
    });

    return {
      success: true,
      message: `完成任务：${quest.name}`,
      rewards: {
        ...rewards,
        levelUp,
        newLevel: character.level,
        newExp: character.exp,
      },
    };
  }

  /**
   * 检查升级
   */
  private static async checkLevelUp(characterId: string): Promise<{ leveledUp: boolean; newLevel?: number }> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) return { leveledUp: false };

    // 简单升级公式：升级所需经验 = 当前等级 * 100
    const expNeeded = character.level * 100;

    if (character.exp >= expNeeded) {
      const newLevel = character.level + 1;
      await prisma.character.update({
        where: { id: characterId },
        data: {
          level: newLevel,
          exp: character.exp - expNeeded, // 剩余经验
        },
      });

      // 记录升级日志
      await prisma.gameLog.create({
        data: {
          type: 'LEVEL_UP',
          message: `角色升级到 ${newLevel} 级`,
          characterId,
        },
      });

      return { leveledUp: true, newLevel };
    }

    return { leveledUp: false };
  }

  /**
   * 放弃任务
   */
  public static async abandonQuest(
    characterId: string,
    questId: string
  ): Promise<{ success: boolean; message?: string }> {
    const progress = await prisma.questProgress.findUnique({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
    });

    if (!progress) {
      return { success: false, message: '任务不存在或未接取' };
    }

    if (progress.status === 'completed') {
      return { success: false, message: '已完成的任务不能放弃' };
    }

    await prisma.questProgress.update({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
      data: {
        status: 'abandoned',
        abandonedAt: new Date(),
      },
    });

    return { success: true, message: '已放弃任务' };
  }

  /**
   * 获取角色任务列表
   */
  public static async getCharacterQuests(
    characterId: string,
    status?: string
  ): Promise<any[]> {
    const where: any = { characterId };
    if (status) {
      where.status = status;
    }

    const progresses = await prisma.questProgress.findMany({
      where,
      include: {
        quest: {
          include: {
            giver: true,
            receiver: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return progresses.map(p => ({
      ...p,
      progress: p.progress ? JSON.parse(p.progress) : [],
      objectives: p.quest.objectives ? JSON.parse(p.quest.objectives) : [],
      itemRewards: p.quest.itemRewards ? JSON.parse(p.quest.itemRewards) : [],
    }));
  }

  /**
   * 获取每日任务
   */
  public static async getDailyQuests(): Promise<any[]> {
    const dailyQuests = await prisma.dailyQuest.findMany({
      where: {
        type: 'daily',
      },
      include: {
        quest: true,
      },
    });

    return dailyQuests.map(dq => ({
      ...dq,
      itemRewards: dq.itemRewards ? JSON.parse(dq.itemRewards) : [],
    }));
  }

  /**
   * 获取区域 NPC（按坐标）
   */
  public static async getNPCsInZone(zoneId: string): Promise<any[]> {
    const npcs = await prisma.nPC.findMany({
      where: { zoneId },
      include: {
        npcQuests: {
          include: {
            quest: true,
          },
        },
      },
    });

    return npcs;
  }
}
