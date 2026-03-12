import * as PIXI from 'pixi.js';
import { GameRenderer } from '../renderer/GameRenderer';

/**
 * 死亡掉落系统（简化版）
 * 处理玩家死亡、掉落物显示和拾取
 */
export class DeathSystem {
  private renderer: GameRenderer;
  private deathContainer: PIXI.Container;
  private dropMarkers: Map<string, PIXI.Container>;
  private isDead: boolean = false;
  private app: PIXI.Application;

  constructor(renderer: GameRenderer) {
    this.renderer = renderer;
    this.deathContainer = new PIXI.Container();
    this.dropMarkers = new Map();
    
    // 获取 app 引用
    const app = (renderer as any).app as PIXI.Application;
    this.app = app;
    
    // 添加到 effectsLayer
    const effectsLayer = (renderer as any).effectsLayer as PIXI.Container;
    if (effectsLayer) {
      effectsLayer.addChild(this.deathContainer);
    }
  }

  /**
   * 处理玩家死亡
   */
  async handleDeath(deathData: {
    droppedItems: Array<{
      itemId: string;
      itemName: string;
      slot?: string;
      quantity?: number;
    }>;
    durabilityLoss: number;
    respawnLocation: {
      mapId: string;
      x: number;
      y: number;
    };
  }, killerName?: string) {
    this.isDead = true;

    // 1. 播放死亡动画
    this.playDeathAnimation();

    // 2. 显示死亡报告
    this.showDeathReport(deathData, killerName);

    // 3. 3 秒后复活
    setTimeout(() => {
      this.respawn(deathData.respawnLocation);
    }, 3000);
  }

  /**
   * 播放死亡动画
   */
  private playDeathAnimation() {
    const player = (this.renderer as any).player as PIXI.Sprite;
    if (!player) return;

    // 播放死亡特效
    const deathEffect = new PIXI.Graphics();
    deathEffect.beginFill(0xff0000, 0.5);
    deathEffect.drawCircle(0, 0, 50);
    deathEffect.endFill();
    player.addChild(deathEffect);

    // 淡出动画
    let alpha = 1;
    
    const animate = () => {
      alpha -= 0.02;
      deathEffect.alpha = alpha;
      
      if (alpha <= 0) {
        player.removeChild(deathEffect);
      }
    };

    this.app.ticker.add(animate);

    // 隐藏玩家
    player.visible = false;
  }

  /**
   * 显示死亡报告
   */
  private showDeathReport(
    deathData: any,
    killerName?: string
  ) {
    // 创建死亡报告 UI
    const reportDiv = document.createElement('div');
    reportDiv.id = 'death-report';
    reportDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #ff0000;
      border-radius: 10px;
      padding: 30px;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
      z-index: 10000;
      min-width: 400px;
    `;

    const droppedItemsHtml = deathData.droppedItems
      .map((item: any) => `
        <div style="color: #ff6666; margin: 5px 0;">
          ${item.slot ? `[${item.slot}] ` : ''}${item.itemName}
        </div>
      `)
      .join('');

    reportDiv.innerHTML = `
      <h2 style="color: #ff0000; margin-bottom: 20px;">💀 你被击败了!</h2>
      ${killerName ? `<p style="margin: 10px 0;">击杀者：<span style="color: #ff6666;">${killerName}</span></p>` : ''}
      <p style="margin: 10px 0;">地点：${deathData.respawnLocation.mapId}</p>
      
      <div style="margin: 20px 0; padding: 15px; background: rgba(255, 0, 0, 0.1); border-radius: 5px;">
        <h3 style="margin-bottom: 10px;">掉落物品:</h3>
        ${droppedItemsHtml || '<p style="color: #999;">无</p>'}
      </div>
      
      <p style="margin: 10px 0;">耐久损失：<span style="color: #ff6666;">-${deathData.durabilityLoss}</span></p>
      
      <p style="margin-top: 20px; color: #999;">
        ${3} 秒后复活...
      </p>
    `;

    document.body.appendChild(reportDiv);

    // 倒计时
    let seconds = 3;
    const countdownInterval = setInterval(() => {
      seconds--;
      const countdownEl = reportDiv.querySelector('p:last-child');
      if (countdownEl && seconds > 0) {
        countdownEl.textContent = `${seconds} 秒后复活...`;
      }
      if (seconds <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // 3 秒后移除
    setTimeout(() => {
      if (reportDiv.parentNode) {
        reportDiv.parentNode.removeChild(reportDiv);
      }
    }, 3000);
  }

  /**
   * 复活
   */
  respawn(location: { mapId: string; x: number; y: number }) {
    const player = (this.renderer as any).player as PIXI.Sprite;
    if (!player) return;

    // 更新玩家位置
    player.x = location.x;
    player.y = location.y;
    player.visible = true;

    // 重置死亡状态
    this.isDead = false;

    console.log('🔄 玩家复活:', location);
  }

  /**
   * 检查是否死亡
   */
  checkIsDead(): boolean {
    return this.isDead;
  }

  /**
   * 销毁系统
   */
  destroy() {
    this.clearDrops();
    this.deathContainer.destroy();
  }

  /**
   * 清除所有掉落物标记
   */
  clearDrops() {
    for (const marker of this.dropMarkers.values()) {
      this.deathContainer.removeChild(marker);
      marker.destroy();
    }
    this.dropMarkers.clear();
  }
}
