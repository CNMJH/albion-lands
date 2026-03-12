import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface PVPAttackResult {
  success: boolean;
  damage: number;
  isCrit: boolean;
  victimHP: number;
  victimMaxHP: number;
  isKilled: boolean;
  message?: string;
}

export interface PVPStats {
  kills: number;
  deaths: number;
  assists: number;
  honorPoints: number;
  kdRatio: number;
}

/**
 * PVP 服务
 * 实现玩家间对战系统
 */
export class PVPService {
  /**
   * 攻击玩家
   */
  async attackPlayer(
    attackerId: string,
    targetId: string,
    damage: number,
    skillId?: string
  ): Promise<PVPAttackResult> {
    // 1. 验证攻击者和目标
    const [attacker, target] = await Promise.all([
      prisma.character.findUnique({
        where: { id: attackerId },
        include: { pvpStats: true },
      }),
      prisma.character.findUnique({
        where: { id: targetId },
        include: { pvpStats: true },
      }),
    ]);

    if (!attacker || !target) {
      return {
        success: false,
        damage: 0,
        isCrit: false,
        victimHP: 0,
        victimMaxHP: 0,
        isKilled: false,
        message: '角色不存在',
      };
    }

    // 解析 stats
    const attackerStats = attacker.stats ? JSON.parse(attacker.stats) : {};
    const targetStats = target.stats ? JSON.parse(target.stats) : {};
    const targetHP = targetStats.hp || 100;
    const targetMaxHP = targetStats.maxHp || 100;

    // 2. 检查是否在同一地图
    if (attacker.zoneId !== target.zoneId) {
      return {
        success: false,
        damage: 0,
        isCrit: false,
        victimHP: 0,
        victimMaxHP: 0,
        isKilled: false,
        message: '目标不在同一区域',
      };
    }

    // 3. 检查安全区
    const safetyLevel = await this.getMapSafetyLevel(attacker.zoneId);
    if (safetyLevel >= 6) {
      return {
        success: false,
        damage: 0,
        isCrit: false,
        victimHP: 0,
        victimMaxHP: 0,
        isKilled: false,
        message: '安全区禁止 PVP',
      };
    }

    // 4. 计算实际伤害 (考虑防御)
    const actualDamage = this.calculateDamage(attacker, target, damage);
    const isCrit = this.checkCrit(attacker);
    const finalDamage = isCrit ? Math.floor(actualDamage * 1.5) : actualDamage;

    // 5. 更新目标血量
    const newHP = Math.max(0, targetHP - finalDamage);
    targetStats.hp = newHP;
    await prisma.character.update({
      where: { id: targetId },
      data: { stats: JSON.stringify(targetStats) },
    });

    // 6. 检查是否击杀
    const isKilled = newHP === 0;
    if (isKilled) {
      await this.handleKill(attackerId, targetId, attacker.zoneId);
    }

    // 7. 更新 PVP 统计
    await this.updatePVPStats(attackerId, targetId, isKilled);

    return {
      success: true,
      damage: finalDamage,
      isCrit,
      victimHP: newHP,
      victimMaxHP: targetMaxHP,
      isKilled,
    };
  }

  /**
   * 计算伤害
   */
  private calculateDamage(attacker: any, target: any, baseDamage: number): number {
    // 获取攻击者的攻击力
    const attackStats = attacker.stats ? JSON.parse(attacker.stats) : {};
    const attack = attackStats.attack || 0;

    // 获取目标的防御力
    const targetStats = target.stats ? JSON.parse(target.stats) : {};
    const defense = targetStats.defense || 0;

    // 伤害公式：(攻击力 + 技能伤害) - (防御力 * 0.5)
    const rawDamage = (attack + baseDamage) - (defense * 0.5);

    // 最小伤害为 1
    const damage = Math.max(1, Math.floor(rawDamage));

    // 伤害浮动 ±10%
    const fluctuation = 0.9 + Math.random() * 0.2;
    return Math.floor(damage * fluctuation);
  }

  /**
   * 检查暴击
   */
  private checkCrit(attacker: any): boolean {
    const stats = attacker.stats ? JSON.parse(attacker.stats) : {};
    const critRate = stats.critRate || 0; // 暴击率 (百分比)
    
    return Math.random() * 100 < critRate;
  }

  /**
   * 获取地图安全等级
   */
  private async getMapSafetyLevel(zoneId: string): Promise<number> {
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
    });
    return zone?.safetyLevel || 10;
  }

  /**
   * 处理击杀
   */
  private async handleKill(killerId: string, victimId: string, mapId: string): Promise<void> {
    // 1. 记录击杀
    await prisma.playerKill.create({
      data: {
        killerId,
        victimId,
        mapId,
      },
    });

    // 2. 触发死亡掉落 (调用 DeathService)
    const safetyLevel = await this.getMapSafetyLevel(mapId);
    
    // 这里可以调用 DeathService.handleDeath()
    // 为了简化，暂时不处理掉落
  }

  /**
   * 更新 PVP 统计
   */
  private async updatePVPStats(
    killerId: string,
    victimId: string,
    isKill: boolean
  ): Promise<void> {
    // 更新击杀者统计
    if (isKill) {
      await prisma.pVPStats.upsert({
        where: { characterId: killerId },
        update: {
          kills: { increment: 1 },
          honorPoints: { increment: 10 }, // 击杀获得 10 荣誉点
        },
        create: {
          characterId: killerId,
          kills: 1,
          deaths: 0,
          assists: 0,
          honorPoints: 10,
        },
      });
    }

    // 更新受害者统计
    await prisma.pVPStats.upsert({
      where: { characterId: victimId },
      update: {
        deaths: { increment: 1 },
      },
      create: {
        characterId: victimId,
        kills: 0,
        deaths: 1,
        assists: 0,
        honorPoints: 0,
      },
    });
  }

  /**
   * 获取 PVP 统计
   */
  async getPVPStats(characterId: string): Promise<PVPStats | null> {
    const stats = await prisma.pVPStats.findUnique({
      where: { characterId },
    });

    if (!stats) {
      return null;
    }

    const kdRatio = stats.deaths > 0 
      ? parseFloat((stats.kills / stats.deaths).toFixed(2))
      : stats.kills;

    return {
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      honorPoints: stats.honorPoints,
      kdRatio,
    };
  }

  /**
   * 获取 PVP 排行榜
   */
  async getLeaderboard(type: 'kills' | 'honor' = 'kills', limit: number = 100) {
    const orderBy: any = type === 'kills' ? { kills: 'desc' } : { honorPoints: 'desc' };

    const stats = await prisma.pVPStats.findMany({
      orderBy,
      take: limit,
      include: {
        character: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return stats.map((stat, index) => ({
      rank: index + 1,
      characterId: stat.characterId,
      name: stat.character.name,
      level: stat.character.level,
      kills: stat.kills,
      deaths: stat.deaths,
      assists: stat.assists,
      honorPoints: stat.honorPoints,
      kdRatio: stat.deaths > 0 ? parseFloat((stat.kills / stat.deaths).toFixed(2)) : stat.kills,
    }));
  }

  /**
   * 获取击杀记录
   */
  async getKillHistory(characterId: string, limit: number = 20) {
    const kills = await prisma.playerKill.findMany({
      where: {
        OR: [
          { killerId: characterId },
          { victimId: characterId },
        ],
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        killer: {
          select: { id: true, name: true },
        },
        victim: {
          select: { id: true, name: true },
        },
      },
    });

    return kills.map(kill => ({
      timestamp: kill.timestamp,
      mapId: kill.mapId,
      killerId: kill.killerId,
      killerName: kill.killer.name,
      victimId: kill.victimId,
      victimName: kill.victim.name,
      isKiller: kill.killerId === characterId,
    }));
  }
}

export const pvpService = new PVPService();
