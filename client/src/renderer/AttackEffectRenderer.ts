import * as PIXI from 'pixi.js'
import { GameRenderer } from '../renderer/GameRenderer'

/**
 * 攻击效果渲染器
 * 负责播放攻击动画和特效
 */
export class AttackEffectRenderer {
  private gameRenderer: GameRenderer
  private activeEffects: Array<{
    sprite: PIXI.Sprite
    lifetime: number
    age: number
  }> = []

  constructor(gameRenderer: GameRenderer) {
    this.gameRenderer = gameRenderer
    this.setupEventListeners()
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听玩家攻击事件
    this.gameRenderer.on('playerAttack', (data: any) => {
      this.playAttackEffect(data.x, data.y, data.range, data.type)
    })

    // 监听技能释放事件
    this.gameRenderer.on('playerSkill', (data: any) => {
      this.playSkillEffect(data.x, data.y, data.skillId)
    })
  }

  /**
   * 播放攻击效果
   */
  public playAttackEffect(x: number, y: number, range: number, _type: string): void {
    const app = this.gameRenderer.getApp()
    if (!app) return

    const layer = this.gameRenderer.getLayer('effects')
    if (!layer) return

    // 创建攻击效果（圆形波纹）
    const graphics = new PIXI.Graphics()
    
    // 攻击范围指示（短暂显示）
    graphics.lineStyle(2, 0xFFFFFF, 0.5)
    graphics.drawCircle(0, 0, range)
    
    // 攻击方向指示（根据鼠标位置）
    graphics.beginFill(0xFFFF00, 0.6)
    graphics.drawCircle(0, 0, 10)
    graphics.endFill()

    const texture = app.renderer.generateTexture(graphics)
    const effect = new PIXI.Sprite(texture)
    effect.anchor.set(0.5)
    effect.x = x
    effect.y = y
    effect.alpha = 1

    layer.addChild(effect)

    // 添加到活动效果列表
    this.activeEffects.push({
      sprite: effect,
      lifetime: 0.3, // 300ms
      age: 0,
    })

    // 播放攻击动画（简单的缩放效果）
    this.animateAttack(effect)
  }

  /**
   * 播放技能效果
   */
  public playSkillEffect(x: number, y: number, skillId: string): void {
    const app = this.gameRenderer.getApp()
    if (!app) return

    const layer = this.gameRenderer.getLayer('effects')
    if (!layer) return

    // 根据技能类型创建不同效果
    const effect = this.createSkillEffect(skillId, x, y)
    if (effect) {
      layer.addChild(effect)
      
      this.activeEffects.push({
        sprite: effect,
        lifetime: 0.5, // 500ms
        age: 0,
      })
    }
  }

  /**
   * 创建技能效果
   */
  private createSkillEffect(skillId: string, x: number, y: number): PIXI.Sprite | null {
    const app = this.gameRenderer.getApp()
    if (!app) return null

    const graphics = new PIXI.Graphics()

    // 根据技能 ID 选择颜色
    let color = 0xFFFFFF
    let radius = 20

    if (skillId.includes('fire')) {
      color = 0xFF4500 // 火红色
      radius = 30
    } else if (skillId.includes('frost') || skillId.includes('ice')) {
      color = 0x00BFFF // 冰蓝色
      radius = 30
    } else if (skillId.includes('lightning')) {
      color = 0xFFD700 // 金色
      radius = 25
    } else if (skillId.includes('heal')) {
      color = 0x00FF00 // 绿色
      radius = 25
    } else if (skillId.includes('shield')) {
      color = 0x4169E1 // 蓝色
      radius = 35
    }

    // 绘制技能效果
    graphics.beginFill(color, 0.6)
    graphics.drawCircle(0, 0, radius)
    graphics.endFill()
    
    graphics.lineStyle(2, color, 0.8)
    graphics.drawCircle(0, 0, radius)

    const texture = app.renderer.generateTexture(graphics)
    const effect = new PIXI.Sprite(texture)
    effect.anchor.set(0.5)
    effect.x = x
    effect.y = y
    effect.alpha = 1

    return effect
  }

  /**
   * 攻击动画
   */
  private animateAttack(effect: PIXI.Sprite): void {
    const startTime = Date.now()
    const duration = 300 // 300ms

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      if (progress >= 1) {
        // 动画结束，移除效果
        if (effect.parent) {
          effect.parent.removeChild(effect)
          effect.destroy()
        }
        return
      }

      // 缩放和淡出效果
      const scale = 1 + progress * 0.5
      effect.scale.set(scale)
      effect.alpha = 1 - progress

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  /**
   * 更新所有效果
   */
  public update(deltaTime: number): void {
    // 更新活动效果
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i]
      effect.age += deltaTime

      if (effect.age >= effect.lifetime) {
        // 效果到期，移除
        if (effect.sprite.parent) {
          effect.sprite.parent.removeChild(effect.sprite)
          effect.sprite.destroy()
        }
        this.activeEffects.splice(i, 1)
      } else {
        // 更新效果
        const progress = effect.age / effect.lifetime
        effect.sprite.alpha = 1 - progress
      }
    }
  }

  /**
   * 清理所有效果
   */
  public clear(): void {
    this.activeEffects.forEach(effect => {
      if (effect.sprite.parent) {
        effect.sprite.parent.removeChild(effect.sprite)
        effect.sprite.destroy()
      }
    })
    this.activeEffects = []
  }
}
