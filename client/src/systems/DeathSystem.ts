import * as PIXI from 'pixi.js';
import { GameRenderer } from '../renderer/GameRenderer';

/**
 * 死亡掉落系统（完整版）
 * 处理玩家死亡、掉落物显示和拾取
 */
export class DeathSystem {
  private renderer: GameRenderer;
  private deathContainer: PIXI.Container;
  private dropMarkers: Map<string, PIXI.Container>;
  private isDead: boolean = false;
  private app: PIXI.Application;
  private characterId: string;

  constructor(renderer: GameRenderer, characterId: string) {
    this.renderer = renderer;
    this.characterId = characterId;
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

    console.log('💀 DeathSystem 已初始化');
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
      x: number;
      y: number;
      droppedItemId: string;
    }>;
    durabilityLoss: number;
    respawnLocation: {
      mapId: string;
      x: number;
      y: number;
    };
  }, killerName?: string) {
    this.isDead = true;

    console.log('💀 玩家死亡，掉落物品:', deathData.droppedItems.length);

    // 1. 播放死亡动画
    this.playDeathAnimation();

    // 2. 显示死亡报告
    this.showDeathReport(deathData, killerName);

    // 3. 渲染掉落物
    this.renderDrops(deathData.droppedItems);

    // 4. 3 秒后复活
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
   * 渲染掉落物
   */
  renderDrops(drops: Array<{
    droppedItemId: string;
    x: number;
    y: number;
    itemName: string;
    quantity?: number;
  }>) {
    console.log('🎁 渲染掉落物:', drops.length, '个');

    // 清除旧的标记
    this.clearDrops();

    // 创建新的标记
    for (const drop of drops) {
      const marker = this.createDropMarker(drop);
      this.dropMarkers.set(drop.droppedItemId, marker);
      this.deathContainer.addChild(marker);
    }
  }

  /**
   * 创建掉落物标记
   */
  private createDropMarker(drop: any): PIXI.Container {
    const container = new PIXI.Container();
    container.x = drop.x;
    container.y = drop.y;

    // 创建发光效果（黄色光圈）
    const glow = new PIXI.Graphics();
    glow.beginFill(0xffff00, 0.3);
    glow.drawCircle(0, 0, 25);
    glow.endFill();
    container.addChild(glow);

    // 创建物品图标（黄色圆圈）
    const icon = new PIXI.Graphics();
    icon.beginFill(0xffff00);
    icon.drawCircle(0, 0, 12);
    icon.endFill();
    container.addChild(icon);

    // 添加外圈光晕
    const halo = new PIXI.Graphics();
    halo.lineStyle(2, 0xffff00, 0.8);
    halo.drawCircle(0, 0, 15);
    halo.endFill();
    container.addChild(halo);

    // 添加文字标签（物品名称）
    const text = new PIXI.Text(drop.itemName, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 3,
    });
    text.anchor.set(0.5, 0);
    text.y = 20;
    container.addChild(text);

    // 添加拾取提示
    const pickupText = new PIXI.Text('[E 拾取]', {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0x00ff00,
      stroke: 0x000000,
      strokeThickness: 2,
    });
    pickupText.anchor.set(0.5, 0);
    pickupText.y = 35;
    pickupText.alpha = 0.8;
    container.addChild(pickupText);

    // 动画效果（上下浮动）
    let time = 0;
    this.app.ticker.add(() => {
      time += 0.05;
      container.y = drop.y + Math.sin(time) * 3;
      glow.alpha = 0.3 + Math.sin(time * 2) * 0.1;
    });

    return container;
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

  /**
   * 拾取掉落物
   */
  async pickupDrop(droppedItemId: string) {
    try {
      console.log('🤲 尝试拾取掉落物:', droppedItemId);

      const response = await fetch('http://localhost:3002/api/v1/combat/loot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: this.characterId,
          droppedItemId,
        }),
      });

      const result = await response.json();
      console.log('📦 拾取响应:', result);

      if (result.success) {
        console.log('✅ 拾取成功:', result.item?.name || result.item?.itemName);
        
        // 移除标记
        const marker = this.dropMarkers.get(droppedItemId);
        if (marker) {
          // 播放拾取动画
          this.playPickupAnimation(marker);
          
          // 显示拾取通知
          this.showPickupNotification(result.item);
        }
        
        return true;
      } else {
        console.error('❌ 拾取失败:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ 拾取掉落物失败:', error);
      return false;
    }
  }

  /**
   * 播放拾取动画
   */
  private playPickupAnimation(marker: PIXI.Container) {
    // 缩小并淡出
    const scale = marker.scale.x;
    const alpha = marker.alpha;
    
    const animate = () => {
      marker.scale.set(scale * 0.9);
      marker.alpha = alpha * 0.9;
      
      if (marker.scale.x < 0.1) {
        this.deathContainer.removeChild(marker);
        marker.destroy();
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  /**
   * 显示拾取通知
   */
  private showPickupNotification(item: any) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: rgba(0, 255, 0, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;
    notification.textContent = `📦 拾取：${item.name || item.itemName}`;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
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
   * 获取最近的掉落物
   */
  getNearestDrop(playerX: number, playerY: number, range: number = 50): string | null {
    let nearestId: string | null = null;
    let nearestDistance = range;

    for (const [id, marker] of this.dropMarkers.entries()) {
      const dx = marker.x - playerX;
      const dy = marker.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = id;
      }
    }

    if (nearestId) {
      console.log('🎯 最近掉落物:', nearestId, '距离:', nearestDistance.toFixed(1));
    }

    return nearestId;
  }

  /**
   * 销毁系统
   */
  destroy() {
    this.clearDrops();
    this.deathContainer.destroy();
  }
}
