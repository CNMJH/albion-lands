import * as PIXI from 'pixi.js'
import { Monster } from '../systems/MonsterAI'

/**
 * 怪物纹理配置
 * 包含永久素材和临时替代映射
 */
export const MONSTER_TEXTURES: Record<string, string> = {
  // ✅ 核心怪物 (已有素材)
  'slime': 'assets/monsters/slime.png',           // 蓝色史莱姆
  'bat': 'assets/monsters/bat.png',               // 黑色蝙蝠
  'ghost': 'assets/monsters/ghost.png',           // 半透明幽灵
  'demon': 'assets/monsters/demon_idle.png',      // 红色恶魔
  'dragon': 'assets/monsters/dragon_idle.png',    // 红色巨龙
  
  // 🔄 临时替代方案
  'goblin': 'assets/monsters/lizard_idle.png',    // 绿色哥布林 → 蜥蜴
  'skeleton': 'assets/monsters/ghost.png',        // 白色骷髅兵 → 幽灵
  'spider': 'assets/monsters/bee.png',            // 棕色蜘蛛 → 蜜蜂
  'wolf': 'assets/monsters/snake.png',            // 灰色野狼 → 蛇
  'mummy': 'assets/monsters/ghost.png',           // 绷带木乃伊 → 幽灵 (变色)
  'orc': 'assets/monsters/demon_idle.png',        // 棕色兽人 → 恶魔
  'zombie': 'assets/monsters/slime.png',          // 绿色僵尸 → 史莱姆 (变色)
  
  // ✨ 额外怪物 (可用于扩展)
  'bee': 'assets/monsters/bee.png',
  'big_worm': 'assets/monsters/big_worm.png',
  'eyeball': 'assets/monsters/eyeball.png',
  'jinn': 'assets/monsters/jinn_animation_idle.png',
  'lizard': 'assets/monsters/lizard_idle.png',
  'man_eater_flower': 'assets/monsters/man_eater_flower.png',
  'medusa': 'assets/monsters/medusa_idle.png',
  'pumpking': 'assets/monsters/pumpking.png',
  'small_dragon': 'assets/monsters/small_dragon_idle.png',
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

  constructor(
    private app: PIXI.Application,
    private assetsPath: string = ''
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

    // 创建名字文本
    this.nameText = new PIXI.Text('', {
      fontSize: 12,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 3,
    })
    this.nameText.anchor.set(0.5)
    this.nameText.y = -45
    this.container.addChild(this.nameText)

    // 创建等级文本
    this.levelText = new PIXI.Text('', {
      fontSize: 10,
      fill: 0xFFFF00,
      stroke: 0x000000,
      strokeThickness: 2,
    })
    this.levelText.anchor.set(0.5)
    this.levelText.y = -58
    this.container.addChild(this.levelText)
  }

  /**
   * 加载怪物纹理
   */
  private async loadMonsterTexture(type: string): Promise<PIXI.Texture> {
    // 检查缓存
    if (this.textureCache.has(type)) {
      return this.textureCache.get(type)!
    }

    const assetPath = MONSTER_TEXTURES[type] || MONSTER_TEXTURES['slime']
    const fullPath = this.assetsPath + assetPath

    try {
      // 从资源加载
      const texture = await PIXI.Assets.load(fullPath)
      this.textureCache.set(type, texture)
      return texture
    } catch (error) {
      console.warn(`Failed to load monster texture: ${fullPath}`, error)
      // 返回临时色块纹理
      return this.createFallbackTexture(type)
    }
  }

  /**
   * 创建临时纹理 (回退方案)
   */
  private createFallbackTexture(type: string): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // 根据类型设置颜色
    const colors: Record<string, number> = {
      'slime': 0x00FF00,
      'bat': 0x000000,
      'ghost': 0xFFFFFF,
      'demon': 0xFF0000,
      'dragon': 0xFF0000,
      'goblin': 0x00FF00,
      'skeleton': 0xFFFFFF,
      'spider': 0x8B4513,
      'wolf': 0x808080,
      'mummy': 0xF5DEB3,
      'orc': 0x8B4513,
      'zombie': 0x32CD32,
    }

    const color = colors[type] || 0xFF00FF
    
    // 绘制圆形/方形怪物
    if (type === 'bat' || type === 'spider') {
      // 飞行/昆虫类：菱形
      graphics.beginFill(color)
      graphics.moveTo(0, -20)
      graphics.lineTo(15, 0)
      graphics.lineTo(0, 20)
      graphics.lineTo(-15, 0)
      graphics.closePath()
      graphics.endFill()
    } else if (type === 'ghost' || type === 'mummy') {
      // 幽灵类：椭圆形
      graphics.beginFill(color, 0.7)
      graphics.drawEllipse(0, 0, 20, 25)
      graphics.endFill()
    } else {
      // 普通类：圆形
      graphics.beginFill(color)
      graphics.drawCircle(0, 0, 25)
      graphics.endFill()
    }

    // 添加眼睛
    graphics.beginFill(0xFFFFFF)
    graphics.drawCircle(-8, -5, 5)
    graphics.drawCircle(8, -5, 5)
    graphics.endFill()

    graphics.beginFill(0x000000)
    graphics.drawCircle(-8, -5, 2)
    graphics.drawCircle(8, -5, 2)
    graphics.endFill()

    return this.app.renderer.generateTexture(graphics)
  }

  /**
   * 应用颜色调整
   */
  private applyColorAdjustment(sprite: PIXI.Sprite, type: string): void {
    const adjustment = MONSTER_COLOR_ADJUSTMENTS[type]
    if (!adjustment) return

    // 简单实现：使用 tint
    // 完整实现需要使用 PIXI.filters.ColorMatrixFilter
    if (type === 'mummy') {
      sprite.tint = 0xF5DEB3 // 小麦色 (绷带)
    } else if (type === 'zombie') {
      sprite.tint = 0x32CD32 // 绿黄色 (腐烂)
    } else if (type === 'goblin') {
      sprite.tint = 0x228B22 // 森林绿
    } else if (type === 'skeleton') {
      sprite.tint = 0xF0F0F0 // 灰白色
    }
  }

  /**
   * 设置怪物数据
   */
  public async setMonster(monster: Monster): Promise<void> {
    this.monster = monster
    
    // 移除旧精灵
    if (this.sprite) {
      this.container.removeChild(this.sprite)
      this.sprite.destroy()
    }

    // 加载新纹理
    const texture = await this.loadMonsterTexture(monster.type)
    this.sprite = new PIXI.Sprite(texture)
    this.sprite.anchor.set(0.5)
    
    // 应用颜色调整
    this.applyColorAdjustment(this.sprite, monster.type)
    
    // 根据怪物大小缩放
    const size = monster.size || 1
    this.sprite.scale.set(size)
    
    this.container.addChildAt(this.sprite, 0) // 添加到最底层
    this.updateDisplay()
  }

  /**
   * 更新显示
   */
  private updateDisplay(): void {
    if (!this.monster) return

    // 更新位置
    this.container.x = this.monster.x
    this.container.y = this.monster.y

    // 更新名字和等级
    this.nameText.text = this.monster.name
    this.levelText.text = `Lv.${this.monster.level}`

    // 更新血条
    this.updateHPBar()
  }

  /**
   * 更新血条
   */
  public updateHPBar(): void {
    if (!this.monster) return

    const hpPercent = this.monster.hp / this.monster.maxHp

    // 血条背景
    this.hpBarBg.clear()
    this.hpBarBg.beginFill(0x000000, 0.5)
    this.hpBarBg.drawRect(-25, 0, 50, 6)
    this.hpBarBg.endFill()

    // 血条
    this.hpBar.clear()
    const hpColor = hpPercent > 0.5 ? 0x00FF00 : hpPercent > 0.25 ? 0xFFFF00 : 0xFF0000
    this.hpBar.beginFill(hpColor)
    this.hpBar.drawRect(-25, 0, 50 * hpPercent, 6)
    this.hpBar.endFill()
  }

  /**
   * 更新位置
   */
  public updatePosition(x: number, y: number): void {
    this.container.x = x
    this.container.y = y
    if (this.monster) {
      this.monster.x = x
      this.monster.y = y
    }
  }

  /**
   * 获取容器
   */
  public getContainer(): PIXI.Container {
    return this.container
  }

  /**
   * 设置可见性
   */
  public setVisible(visible: boolean): void {
    this.container.visible = visible
  }

  /**
   * 销毁
   */
  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy()
    }
    this.container.destroy({ children: true })
  }
}

/**
 * 伤害数字效果
 */
export class DamageNumber {
  private text: PIXI.Text
  private lifetime: number = 1000 // 毫秒
  private createdAt: number
  private velocity: { x: number; y: number }

  constructor(
    private app: PIXI.Application,
    x: number,
    y: number,
    private damage: number,
    isCritical: boolean = false
  ) {
    this.createdAt = Date.now()
    this.velocity = {
      x: (Math.random() - 0.5) * 50,
      y: -100 - Math.random() * 50,
    }

    this.text = new PIXI.Text(damage.toString(), {
      fontSize: isCritical ? 24 : 18,
      fill: isCritical ? 0xFFFF00 : 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4,
      fontWeight: 'bold',
    })
    this.text.anchor.set(0.5)
    this.text.x = x
    this.text.y = y
    this.text.scale.set(isCritical ? 1.5 : 1)
  }

  /**
   * 更新
   */
  public update(deltaTime: number): boolean {
    const age = Date.now() - this.createdAt
    
    // 更新位置
    this.text.x += this.velocity.x * deltaTime
    this.text.y += this.velocity.y * deltaTime
    
    // 重力
    this.velocity.y += 200 * deltaTime

    // 淡出
    const alpha = 1 - (age / this.lifetime)
    this.text.alpha = alpha

    return age < this.lifetime
  }

  /**
   * 获取文本对象
   */
  public getText(): PIXI.Text {
    return this.text
  }

  /**
   * 是否存活
   */
  public isAlive(): boolean {
    return Date.now() - this.createdAt < this.lifetime
  }
}

/**
 * 战斗特效管理器
 */
export class CombatEffectManager {
  private damageNumbers: DamageNumber[] = []
  private effectsContainer: PIXI.Container

  constructor(private app: PIXI.Application) {
    this.effectsContainer = new PIXI.Container()
    app.stage.addChild(this.effectsContainer)
  }

  /**
   * 显示伤害数字
   */
  public showDamage(x: number, y: number, damage: number, isCritical: boolean = false): void {
    const damageNumber = new DamageNumber(this.app, x, y, damage, isCritical)
    this.damageNumbers.push(damageNumber)
    this.effectsContainer.addChild(damageNumber.getText())
  }

  /**
   * 更新
   */
  public update(deltaTime: number): void {
    // 更新伤害数字
    this.damageNumbers = this.damageNumbers.filter(dn => {
      const alive = dn.update(deltaTime)
      if (!alive) {
        this.effectsContainer.removeChild(dn.getText())
        dn.getText().destroy()
      }
      return alive
    })
  }

  /**
   * 清除所有
   */
  public clear(): void {
    this.damageNumbers.forEach(dn => {
      this.effectsContainer.removeChild(dn.getText())
      dn.getText().destroy()
    })
    this.damageNumbers = []
  }
}
