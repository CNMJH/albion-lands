import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 成就服务
 * 处理成就追踪和完成逻辑
 */
export class AchievementService {
  /**
   * 获取所有成就
   */
  public static async getAllAchievements(): Promise<any[]> {
    const achievements = await prisma.achievement.findMany({
      orderBy: [
        { category: 'asc' },
        { targetCount: 'asc' },
      ],
    });

    return achievements.map(ach => ({
      ...ach,
      prerequisites: ach.prerequisites ? JSON.parse(ach.prerequisites) : [],
    }));
  }

  /**
   * 获取成就详情
   */
  public static async getAchievementById(achievementId: string): Promise<any | null> {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) return null;

    return {
      ...achievement,
      prerequisites: achievement.prerequisites ? JSON.parse(achievement.prerequisites) : [],
    };
  }

  /**
   * 获取角色成就进度
   */
  public static async getCharacterAchievements(
    characterId: string,
    includeHidden: boolean = false
  ): Promise<any[]> {
    const progresses = await prisma.achievementProgress.findMany({
      where: { characterId },
      include: {
        achievement: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return progresses
      .filter(p => includeHidden || !p.achievement.isHidden)
      .map(p => ({
        ...p,
        achievement: {
          ...p.achievement,
          prerequisites: p.achievement.prerequisites
            ? JSON.parse(p.achievement.prerequisites)
            : [],
        },
      }));
  }

  /**
   * 更新成就进度
   */
  public static async updateProgress(
    characterId: string,
    achievementType: string,
    targetId?: string,
    amount: number = 1
  ): Promise<{ updated: boolean; completed?: any[] }> {
    // 查找匹配的成就
    const achievements = await prisma.achievement.findMany({
      where: {
        type: achievementType,
        targetId: targetId || undefined,
      },
    });

    const completedAchievements: any[] = [];

    for (const achievement of achievements) {
      // 获取或创建进度
      let progress = await prisma.achievementProgress.findUnique({
        where: {
          characterId_achievementId: {
            characterId,
            achievementId: achievement.id,
          },
        },
      });

      if (!progress) {
        progress = await prisma.achievementProgress.create({
          data: {
            characterId,
            achievementId: achievement.id,
            current: 0,
            completed: false,
          },
        });
      }

      // 如果已完成且不可重复，跳过
      if (progress.completed && !achievement.isRepeatable) {
        continue;
      }

      // 更新进度
      const newCurrent = progress.current + amount;
      const isCompleted = newCurrent >= achievement.targetCount;

      await prisma.achievementProgress.update({
        where: {
          characterId_achievementId: {
            characterId,
            achievementId: achievement.id,
          },
        },
        data: {
          current: newCurrent,
          completed: isCompleted,
          completedAt: isCompleted && !progress.completed ? new Date() : progress.completedAt,
          completedCount: isCompleted && !progress.completed
            ? { increment: 1 }
            : progress.completedCount,
        },
      });

      // 如果新完成，发放奖励
      if (isCompleted && !progress.completed) {
        await this.grantReward(characterId, achievement);
        completedAchievements.push({
          ...achievement,
          progress: newCurrent,
        });
      }
    }

    return {
      updated: achievements.length > 0,
      completed: completedAchievements.length > 0 ? completedAchievements : undefined,
    };
  }

  /**
   * 发放成就奖励
   */
  private static async grantReward(
    characterId: string,
    achievement: any
  ): Promise<void> {
    // 更新角色属性
    const updates: any = {};
    if (achievement.expReward > 0) {
      updates.exp = { increment: achievement.expReward };
    }
    if (achievement.silverReward > 0) {
      updates.silver = { increment: achievement.silverReward };
    }
    if (achievement.goldReward > 0) {
      updates.gold = { increment: achievement.goldReward };
    }

    if (Object.keys(updates).length > 0) {
      await prisma.character.update({
        where: { id: characterId },
        data: updates,
      });
    }

    // 记录游戏日志
    await prisma.gameLog.create({
      data: {
        type: 'ACHIEVEMENT_COMPLETED',
        message: `完成成就：${achievement.name}`,
        characterId,
        data: JSON.stringify({
          achievementId: achievement.id,
          rewards: {
            exp: achievement.expReward,
            silver: achievement.silverReward,
            gold: achievement.goldReward,
            title: achievement.title,
          },
        }),
      },
    });
  }

  /**
   * 检查成就前置条件
   */
  public static async checkPrerequisites(
    characterId: string,
    achievementId: string
  ): Promise<boolean> {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement || !achievement.prerequisites) {
      return true;
    }

    const prerequisites: string[] = JSON.parse(achievement.prerequisites);

    for (const prereqId of prerequisites) {
      const progress = await prisma.achievementProgress.findUnique({
        where: {
          characterId_achievementId: {
            characterId,
            achievementId: prereqId,
          },
        },
      });

      if (!progress || !progress.completed) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取按分类的成就统计
   */
  public static async getAchievementStats(characterId: string): Promise<any> {
    const progresses = await prisma.achievementProgress.findMany({
      where: { characterId },
      include: {
        achievement: true,
      },
    });

    const stats: any = {
      total: progresses.length,
      completed: progresses.filter(p => p.completed).length,
      byCategory: {},
    };

    // 按分类统计
    const categories = ['combat', 'gathering', 'crafting', 'social', 'exploration'];
    for (const category of categories) {
      const categoryProgresses = progresses.filter(
        p => p.achievement.category === category
      );
      stats.byCategory[category] = {
        total: categoryProgresses.length,
        completed: categoryProgresses.filter(p => p.completed).length,
      };
    }

    return stats;
  }

  /**
   * 重置成就（用于测试）
   */
  public static async resetAchievements(characterId: string): Promise<void> {
    await prisma.achievementProgress.deleteMany({
      where: { characterId },
    });
  }
}
