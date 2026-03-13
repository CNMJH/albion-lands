/**
 * 灰尘特效渲染器
 * 角色移动时产生小灰尘粒子效果
 */

import * as PIXI from 'pixi.js'
import type { GameRenderer } from '../renderer/GameRenderer'

interface DustParticle {
  sprite: PIXI.Graphics
  life: number
  maxLife: number
  vx: number
  vy: number
}

export class DustEffectRenderer {
  private renderer: GameRenderer
  private dustContainer: PIXI.Container
  private particles: DustParticle[] = []
  private lastEmitTime: number = 0
  private emitInterval: number = 100 // 100ms 发射一次

  constructor(renderer: GameRenderer) {
    this.renderer = renderer
    this.dustContainer = new PIXI.Container()
    this.dustContainer.zIndex = 5
    renderer.getStage('effects')?.addChild(this.dustContainer)
  }

  /**
   * 在位置发射灰尘粒子
   */
  public emit(x: number, y: number): void {
    const now = Date.now()
    if (now - this.lastEmitTime < this.emitInterval) return

    this.lastEmitTime = now

    // 创建 2-4 个灰尘粒子
    const count = 2 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < count; i++) {
      const graphics = new PIXI.Graphics()
      
      // 随机大小 2-4px
      const size = 2 + Math.random() * 2
      
      // 浅棕色/灰色灰尘
      const color = 0xC4A574 + Math.floor(Math.random() * 0x202020)
      const alpha = 0.4 + Math.random() * 0.3
      
      graphics.beginFill(color, alpha)
      graphics.drawCircle(0, 0, size)
      graphics.endFill()
      
      graphics.x = x + (Math.random() - 0.5) * 20
      graphics.y = y + (Math.random() - 0.5) * 20
      
      // 随机速度（向上飘）
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5
      const speed = 10 + Math.random() * 20
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      
      this.dustContainer.addChild(graphics)
      
      this.particles.push({
        sprite: graphics,
        life: 0,
        maxLife: 300 + Math.random() * 200, // 300-500ms 寿命
        vx,
        vy,
      })
    }
  }

  /**
   * 更新所有粒子
   */
  public update(deltaTime: number): void {
    const dt = deltaTime * 1000 // 转换为毫秒
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      particle.life += dt
      
      // 更新位置
      particle.sprite.x += particle.vx * deltaTime
      particle.sprite.y += particle.vy * deltaTime
      
      // 淡出效果
      const lifeRatio = 1 - (particle.life / particle.maxLife)
      particle.sprite.alpha = lifeRatio * 0.7
      
      // 缩小效果
      const scale = lifeRatio
      particle.sprite.scale.set(scale)
      
      // 移除死亡粒子
      if (particle.life >= particle.maxLife) {
        this.dustContainer.removeChild(particle.sprite)
        particle.sprite.destroy()
        this.particles.splice(i, 1)
      }
    }
  }

  /**
   * 清理
   */
  public destroy(): void {
    this.particles.forEach(p => {
      this.dustContainer.removeChild(p.sprite)
      p.sprite.destroy()
    })
    this.particles = []
    this.dustContainer.destroy()
  }
}
