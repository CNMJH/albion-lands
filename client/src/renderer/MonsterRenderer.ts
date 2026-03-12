import * as PIXI from 'pixi.js'
import { Monster } from '../systems/MonsterAI'
import { SpriteAnimator } from './SpriteAnimator'

/**
 * 战斗效果管理器
 * 显示伤害数字、特效等
 */
export class CombatEffectManager {
  private container: PIXI.Container
  private effects: Map<number, PIXI.Container> = new Map()

  constructor(private app: PIXI.Application) {
    this.container = new PIXI.Container()
    this.container.zIndex = 100
    app.stage.addChild(this.container)
  }

  /**
   * 显示伤害数字
   */
  public showDamage(x: number, y: number, damage: number, isPlayer: boolean): void {
    const text = new PIXI.Text(damage.toString(), {
      fontSize: 24,
      fill: isPlayer ? 0xFF0000 : 0xFFFFFF,
      stroke: isPlayer ? 0xFFFFFF : 0x000000,
      strokeThickness: 3,
      fontWeight: 'bold'
    })
    
    text.anchor.set(0.5)
    text.x = x
    text.y = y
    
    this.container.addChild(text)
    
    // 动画 ID
    const effectId = Date.now() + Math.random()
    this.effects.set(effectId, text)
    
    // 移除效果（1 秒后）
    setTimeout(() => {
      this.removeEffect(effectId)
    }, 1000)
  }

  /**
   * 移除效果
   */
  private removeEffect(effectId: number): void {
    const effect = this.effects.get(effectId)
    if (effect) {
      this.container.removeChild(effect)
      effect.destroy()
      this.effects.delete(effectId)
    }
  }

  /**
   * 更新效果
   */
  public update(_deltaTime: number): void {
    this.effects.forEach((effect, _id) => {
      effect.y -= 1 // 向上浮动
      effect.alpha -= 0.02 // 淡出
    })
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.effects.forEach((effect) => {
      this.container.removeChild(effect)
      effect.destroy()
    })
    this.effects.clear()
    this.app.stage.removeChild(this.container)
    this.container.destroy()
  }
}

/**
 * 怪物纹理配置
 * 包含永久素材和临时替代映射
 */
export const MONSTER_TEXTURES: Record<string, string> = {
  // ✅ 核心怪物 (已有素材)
  'slime': 'assets/monsters/slime.png',           // 蓝色史莱姆
  'bat': 'assets/monsters/bat.png',               // 黑色蝙蝠
  'ghost': 'assets/monsters/ghost.png',           // 半透明幽灵
  'demon': 'assets/monsters/demon/idle.png',      // 红色恶魔
  'dragon': 'assets/monsters/dragon/idle.png',    // 红色巨龙
  
  // 🔄 临时替代方案
  'goblin': 'assets/monsters/lizard/idle.png',    // 绿色哥布林 → 蜥蜴
  'skeleton': 'assets/monsters/ghost.png',        // 白色骷髅兵 → 幽灵
  'spider': 'assets/monsters/bee.png',            // 棕色蜘蛛 → 蜜蜂
  'wolf': 'assets/monsters/snake.png',            // 灰色野狼 → 蛇
  'mummy': 'assets/monsters/ghost.png',           // 绷带木乃伊 → 幽灵 (变色)
  'orc': 'assets/monsters/demon/idle.png',        // 棕色兽人 → 恶魔
  'zombie': 'assets/monsters/slime.png',          // 绿色僵尸 → 史莱姆 (变色)
  
  // ✨ 额外怪物 (可用于扩展)
  'bee': 'assets/monsters/bee.png',
  'big_worm': 'assets/monsters/big_worm.png',
  'eyeball': 'assets/monsters/eyeball.png',
  'jinn': 'assets/monsters/jinn_animation/idle.png',
  'lizard': 'assets/monsters/lizard/idle.png',
  'man_eater_flower': 'assets/monsters/man_eater_flower.png',
  'medusa': 'assets/monsters/medusa/idle.png',
  'pumpking': 'assets/monsters/pumpking.png',
  'small_dragon': 'assets/monsters/small_dragon/idle.png',
  'small_worm': 'assets/monsters/small_worm.png',
  'snake': 'assets/monsters/snake.png',
}

/**
 * 怪物颜色调整 (用于临时替代)
 */
export const MONSTER_COLOR_ADJUSTMENTS: Record<string, number[]> = {
  // [色调偏移，饱和度，亮度]
  'mummy': [0, -50, 20],      // 木乃伊：降低饱和度，提高亮度 (绷带色)
  'zombie': [60, 30, -10],    // 僵尸：绿色调 (腐烂感)
  'goblin': [40, 20, 0],      // 哥布林：绿色调
  'skeleton': [0, -100, 50],  // 骷髅：去色，提高亮度
}

/**
 * 怪物动画配置 (从 JSON 加载)
 */
export interface MonsterAnimationConfig {
  texture: string
  frames: number
  frameWidth: number
  frameHeight: number
}

/**
 * 怪物动画数据
 */
export interface MonsterAnimations {
  monsters: Record<string, Record<string, MonsterAnimationConfig>>
}

/**
 * 怪物渲染器
 * 负责渲染怪物及其血条
 */
export class MonsterRenderer {
  private container: PIXI.Container
  private sprite: PIXI.Sprite | null = null
  private hpBarBg: PIXI.Graphics
  private hpBar: PIXI.Graphics
  private nameText: PIXI.Text
  private levelText: PIXI.Text
  private monster: Monster | null = null
  private textureCache: Map<string, PIXI.Texture>
  private animator: SpriteAnimator | null = null
  private animationConfigs: MonsterAnimations | null = null
  private colorAdjustment: number[] | null = null

  constructor(
    private app: PIXI.Application
  ) {
    this.container = new PIXI.Container()
    this.textureCache = new Map()
    
    // 创建血条背景
    this.hpBarBg = new PIXI.Graphics()
    this.hpBarBg.y = -30
    this.container.addChild(this.hpBarBg)

    // 创建血条
    this.hpBar = new PIXI.Graphics()
    this.hpBar.y = -30
    this.container.addChild(this.hpBar)

    // 创建名称文本
    this.nameText = new PIXI.Text('', {
      fontSize: 12,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 3,
      align: 'center'
    })
    this.nameText.anchor.set(0.5, 1)
    this.nameText.y = -35
    this.container.addChild(this.nameText)

    // 创建等级文本
    this.levelText = new PIXI.Text('', {
      fontSize: 10,
      fill: 0xFFFF00,
      stroke: 0x000000,
      strokeThickness: 2,
      align: 'center'
    })
    this.levelText.anchor.set(0.5, 0)
    this.levelText.y = -20
    this.container.addChild(this.levelText)

    this.app.stage.addChild(this.container)
  }

  /**
   * 加载怪物动画配置
   */
  public async loadAnimationConfigs(): Promise<void> {
    try {
      const response = await fetch('assets/monsters/monster_animations.json')
      if (!response.ok) {
        console.warn('无法加载怪物动画配置')
        return
      }
      this.animationConfigs = await response.json()
      console.log('✓ 怪物动画配置已加载')
    } catch (error) {
      console.warn('加载怪物动画配置失败:', error)
    }
  }

  /**
   * 设置怪物
   */
  public setMonster(monster: Monster): void {
    this.monster = monster
    this.updateName()
    this.updateLevel()
    
    // 应用颜色调整
    if (monster.type) {
      const adjustment = MONSTER_COLOR_ADJUSTMENTS[monster.type]
      this.colorAdjustment = adjustment || null
      
      // 加载动画
      this.loadMonsterAnimation(monster.type)
    }
  }

  /**
   * 加载怪物动画
   */
  private async loadMonsterAnimation(monsterType: string): Promise<void> {
    // 清理旧的动画器
    if (this.animator) {
      this.animator.destroy()
      this.animator = null
    }

    // 检查是否有动画配置
    const monsterAnim = this.animationConfigs?.monsters[monsterType]
    if (!monsterAnim) {
      // 使用静态纹理
      this.loadStaticTexture(monsterType)
      return
    }

    // 创建精灵
    if (!this.sprite) {
      this.sprite = new PIXI.Sprite()
      this.sprite.anchor.set(0.5, 0.5)
      this.container.addChildAt(this.sprite, 0)
    }

    // 创建动画器
    this.animator = new SpriteAnimator(this.sprite)

    // 加载 idle 动画
    const idleConfig = monsterAnim.idle
    if (idleConfig) {
      await this.animator.loadAnimation(
        idleConfig.texture,
        idleConfig.frames,
        idleConfig.frameWidth,
        idleConfig.frameHeight
      )
      
      // 应用颜色调整
      if (this.colorAdjustment) {
        this.applyColorAdjustment()
      }
      
      // 播放 idle 动画
      this.animator.play(true)
    } else {
      // 没有 idle 动画，使用静态纹理
      this.loadStaticTexture(monsterType)
    }
  }

  /**
   * 加载静态纹理（回退方案）
   */
  private loadStaticTexture(monsterType: string): void {
    const texturePath = MONSTER_TEXTURES[monsterType]
    if (!texturePath) {
      console.warn(`未知怪物类型：${monsterType}`)
      return
    }

    if (!this.sprite) {
      this.sprite = new PIXI.Sprite()
      this.sprite.anchor.set(0.5, 0.5)
      this.container.addChildAt(this.sprite, 0)
    }

    // 加载纹理
    if (this.textureCache.has(texturePath)) {
      this.sprite.texture = this.textureCache.get(texturePath)!
    } else {
      PIXI.Assets.load(texturePath).then(texture => {
        this.textureCache.set(texturePath, texture)
        this.sprite!.texture = texture
        
        // 应用颜色调整
        if (this.colorAdjustment) {
          this.applyColorAdjustment()
        }
      }).catch(error => {
        console.warn(`加载纹理失败：${texturePath}`, error)
        // 使用占位符
        this.sprite!.texture = this.createPlaceholderTexture()
      })
    }
  }

  /**
   * 应用颜色调整
   */
  private applyColorAdjustment(): void {
    if (!this.sprite || !this.colorAdjustment) return

    const [hue, saturation, brightness] = this.colorAdjustment
    
    // 使用 PIXI 的 colorMatrix
    const matrix = new PIXI.ColorMatrixFilter()
    
    // 调整色相
    if (hue !== 0) {
      matrix.hue(hue / 360, false)
    }
    
    // 调整饱和度
    if (saturation !== 0) {
      matrix.saturate(saturation / 100, false)
    }
    
    // 调整亮度
    if (brightness !== 0) {
      matrix.brightness(brightness / 100, false)
    }
    
    this.sprite.filters = [matrix]
  }

  /**
   * 播放攻击动画
   */
  public playAttack(): void {
    if (!this.animator || !this.animationConfigs) return

    const monsterType = this.monster?.type
    if (!monsterType) return

    const attackConfig = this.animationConfigs.monsters[monsterType].attack
    if (!attackConfig) return

    // 加载攻击动画
    this.animator.loadAnimation(
      attackConfig.texture,
      attackConfig.frames,
      attackConfig.frameWidth,
      attackConfig.frameHeight
    ).then(() => {
      // 播放一次，不循环
      this.animator!.play(false, () => {
        // 动画完成后回到 idle
        this.playIdle()
      })
    })
  }

  /**
   * 播放受伤动画
   */
  public playHurt(): void {
    if (!this.animator || !this.animationConfigs) return

    const monsterType = this.monster?.type
    if (!monsterType) return

    const hurtConfig = this.animationConfigs.monsters[monsterType].hurt
    if (!hurtConfig) return

    // 加载受伤动画
    this.animator.loadAnimation(
      hurtConfig.texture,
      hurtConfig.frames,
      hurtConfig.frameWidth,
      hurtConfig.frameHeight
    ).then(() => {
      // 播放一次，不循环
      this.animator!.play(false, () => {
        // 动画完成后回到 idle
        this.playIdle()
      })
    })
  }

  /**
   * 播放死亡动画
   */
  public playDeath(): void {
    if (!this.animator || !this.animationConfigs) return

    const monsterType = this.monster?.type
    if (!monsterType) return

    const deathConfig = this.animationConfigs.monsters[monsterType].death
    if (!deathConfig) return

    // 加载死亡动画
    this.animator.loadAnimation(
      deathConfig.texture,
      deathConfig.frames,
      deathConfig.frameWidth,
      deathConfig.frameHeight
    ).then(() => {
      // 播放一次，不循环
      this.animator!.play(false)
    })
  }

  /**
   * 播放 idle 动画
   */
  private playIdle(): void {
    if (!this.animator || !this.animationConfigs) return

    const monsterType = this.monster?.type
    if (!monsterType) return

    const idleConfig = this.animationConfigs.monsters[monsterType].idle
    if (!idleConfig) return

    // 加载 idle 动画
    this.animator.loadAnimation(
      idleConfig.texture,
      idleConfig.frames,
      idleConfig.frameWidth,
      idleConfig.frameHeight
    ).then(() => {
      // 循环播放
      this.animator!.play(true)
    })
  }

  /**
   * 创建占位符纹理
   */
  private createPlaceholderTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    
    // 绘制粉色方块
    ctx.fillStyle = '#FF69B4'
    ctx.fillRect(0, 0, 64, 64)
    
    return PIXI.Texture.from(canvas)
  }

  /**
   * 更新名称
   */
  private updateName(): void {
    if (!this.monster) return
    this.nameText.text = this.monster.name
  }

  /**
   * 更新等级
   */
  private updateLevel(): void {
    if (!this.monster) return
    this.levelText.text = `Lv.${this.monster.level}`
  }

  /**
   * 更新血条
   */
  public updateHP(): void {
    if (!this.monster) return

    const maxHP = this.monster.maxHp
    const currentHP = this.monster.hp
    const hpPercent = Math.max(0, Math.min(1, currentHP / maxHP))

    // 绘制血条背景
    this.hpBarBg.clear()
    this.hpBarBg.beginFill(0x000000, 0.5)
    this.hpBarBg.drawRoundedRect(-25, 0, 50, 6, 3)
    this.hpBarBg.endFill()

    // 绘制血条
    this.hpBar.clear()
    this.hpBar.beginFill(this.getHPColor(hpPercent))
    this.hpBar.drawRoundedRect(-24, 1, 48 * hpPercent, 4, 2)
    this.hpBar.endFill()
  }

  /**
   * 获取血条颜色
   */
  private getHPColor(percent: number): number {
    if (percent > 0.6) return 0x00FF00 // 绿色
    if (percent > 0.3) return 0xFFFF00 // 黄色
    return 0xFF0000 // 红色
  }

  /**
   * 更新位置
   */
  public updatePosition(deltaTime: number): void {
    if (!this.monster) return

    // 更新动画
    if (this.animator) {
      this.animator.update(deltaTime)
    }

    // 平滑移动
    const targetX = this.monster.x
    const targetY = this.monster.y
    this.container.x += (targetX - this.container.x) * 0.1
    this.container.y += (targetY - this.container.y) * 0.1
  }

  /**
   * 设置位置
   */
  public setPosition(x: number, y: number): void {
    this.container.x = x
    this.container.y = y
  }

  /**
   * 获取容器
   */
  public getContainer(): PIXI.Container {
    return this.container
  }

  /**
   * 销毁
   */
  public destroy(): void {
    if (this.animator) {
      this.animator.destroy()
      this.animator = null
    }
    
    if (this.sprite) {
      this.container.removeChild(this.sprite)
      this.sprite = null
    }
    
    this.container.removeChild(this.hpBarBg)
    this.container.removeChild(this.hpBar)
    this.container.removeChild(this.nameText)
    this.container.removeChild(this.levelText)
    
    this.app.stage.removeChild(this.container)
    
    this.hpBarBg.destroy()
    this.hpBar.destroy()
    this.nameText.destroy()
    this.levelText.destroy()
    this.container.destroy()
  }
}
