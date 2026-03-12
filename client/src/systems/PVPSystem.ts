/**
 * 简单的事件发射器 (浏览器环境)
 */
class SimpleEventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }
}

/**
 * PVP 系统
 * 处理玩家间对战逻辑
 */
export class PVPSystem extends SimpleEventEmitter {
  private characterId: string;
  private damageNumbers: DamageNumber[] = [];
  private pvpMarkers: Map<string, PVPMarker> = new Map();

  constructor(characterId: string) {
    super();
    this.characterId = characterId;
  }

  /**
   * 攻击玩家
   */
  async attackPlayer(targetId: string, damage: number, skillId?: string): Promise<any> {
    try {
      const response = await fetch(`http://localhost:3002/api/v1/pvp/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attackerId: this.characterId,
          targetId,
          damage,
          skillId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 显示伤害数字
        this.showDamageNumber(targetId, result.damage, result.isCrit);

        // 触发事件
        this.emit('attack', {
          attackerId: this.characterId,
          targetId,
          damage: result.damage,
          isCrit: result.isCrit,
          isKilled: result.isKilled,
        });

        // 如果击杀，显示击杀公告
        if (result.isKilled) {
          this.showKillAnnouncement(this.characterId, targetId);
        }
      }

      return result;
    } catch (error) {
      console.error('🗡️ PVP 攻击失败:', error);
      return { success: false, message: '攻击失败' };
    }
  }

  /**
   * 显示伤害数字
   */
  showDamageNumber(targetId: string, damage: number, isCrit: boolean): void {
    const damageNumber: DamageNumber = {
      id: Math.random().toString(36).substr(2, 9),
      targetId,
      damage,
      isCrit,
      createdAt: Date.now(),
      opacity: 1,
      yOffset: 0,
    };

    this.damageNumbers.push(damageNumber);

    // 2 秒后移除
    setTimeout(() => {
      this.damageNumbers = this.damageNumbers.filter(dn => dn.id !== damageNumber.id);
    }, 2000);
  }

  /**
   * 显示击杀公告
   */
  showKillAnnouncement(killerId: string, victimId: string): void {
    // 这里可以触发 UI 显示击杀公告
    this.emit('killAnnouncement', {
      killerId,
      victimId,
      timestamp: Date.now(),
    });
  }

  /**
   * 获取 PVP 统计
   */
  async getPVPStats(): Promise<any> {
    try {
      const response = await fetch(`http://localhost:3002/api/v1/pvp/stats/${this.characterId}`);
      const result = await response.json();

      if (result.success) {
        return result.stats;
      }

      return null;
    } catch (error) {
      console.error('获取 PVP 统计失败:', error);
      return null;
    }
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(type: 'kills' | 'honor' = 'kills', limit: number = 100): Promise<any[]> {
    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/pvp/leaderboard?type=${type}&limit=${limit}`
      );
      const result = await response.json();

      if (result.success) {
        return result.leaderboard;
      }

      return [];
    } catch (error) {
      console.error('获取排行榜失败:', error);
      return [];
    }
  }

  /**
   * 获取击杀记录
   */
  async getKillHistory(limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/pvp/history/${this.characterId}?limit=${limit}`
      );
      const result = await response.json();

      if (result.success) {
        return result.history;
      }

      return [];
    } catch (error) {
      console.error('获取击杀记录失败:', error);
      return [];
    }
  }

  /**
   * 更新 PVP 标记 (敌对/友好/中立)
   */
  updatePVPMarker(characterId: string, type: 'enemy' | 'ally' | 'neutral', x: number, y: number): void {
    const marker = this.pvpMarkers.get(characterId);
    if (marker) {
      marker.type = type;
      marker.x = x;
      marker.y = y;
    } else {
      this.pvpMarkers.set(characterId, {
        id: characterId,
        type,
        x,
        y,
        createdAt: Date.now(),
      });
    }
  }

  /**
   * 移除 PVP 标记
   */
  removePVPMarker(characterId: string): void {
    this.pvpMarkers.delete(characterId);
  }

  /**
   * 获取所有 PVP 标记
   */
  getPVPMarkers(): Map<string, PVPMarker> {
    return new Map(this.pvpMarkers);
  }

  /**
   * 获取所有伤害数字
   */
  getDamageNumbers(): DamageNumber[] {
    return this.damageNumbers;
  }

  /**
   * 清理过期的伤害数字
   */
  cleanupDamageNumbers(): void {
    const now = Date.now();
    this.damageNumbers = this.damageNumbers.filter(dn => now - dn.createdAt < 2000);
  }
}

export interface DamageNumber {
  id: string;
  targetId: string;
  damage: number;
  isCrit: boolean;
  createdAt: number;
  opacity: number;
  yOffset: number;
}

export interface PVPMarker {
  id: string;
  type: 'enemy' | 'ally' | 'neutral';
  x: number;
  y: number;
  createdAt: number;
}
