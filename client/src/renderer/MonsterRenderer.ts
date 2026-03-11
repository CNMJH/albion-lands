import * as PIXI from 'pixi.js'
import { Monster } from '../systems/MonsterAI'

/**
 * 怪物渲染器
 * 负责渲染怪物及其血条
 */
export class MonsterRenderer {
  private container: PIXI.Container
  private sprite: PIXI.Sprite
  private hpBarBg: PIXI.Graphics
  private hpBar: PIXI.Graphics
  private nameText: PIXI.Text
  private levelText: PIXI.Text
  private monster: Monster | null = null

  constructor(private app: PIXI.Application) {
    this.container = new PIXI.Container()
    
    // 创建怪物精灵（临时用色块代替）
    this.sprite = new PIXI.Sprite(this.createMonsterTexture())
    this.sprite.anchor.set(0.5)
    this.container.addChild(this.sprite)

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
   * 创建怪物纹理（临时）
   */
  private createMonsterTexture(): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // 根据等级设置颜色
    const colors = {
      'slime_t1': 0x00FF00, // 绿色史莱姆
      'slime_t2': 0x0000FF, // 蓝色史莱姆
      'rabbit': 0xFFA500,   // 野兔 - 橙色
      'wolf': 0x808080,     // 灰狼
      'boar': 0x8B4513,     // 野猪 - 棕色
      'deer': 0xDEB887,     // 鹿 - 米色
      'spider': 0x4B0082,   // 毒蜘蛛 - 靛蓝
      'bear': 0x000000,     // 黑熊
      'dragon_whelp': 0xFF0000, // 幼龙 - 红色
      'stone_golem': 0x696969,  // 石头傀儡 - 暗灰
      'skeleton_king': 0xFFFFFF, // 骷髅王 - 白色
      'demon': 0x8B0000,    // 恶魔 - 深红
    }

    const color = colors['slime_t1' as keyof typeof colors] || 0xFF00FF
    
    // 绘制圆形怪物
    graphics.beginFill(color)
    graphics.drawCircle(0, 0, 25)
    graphics.endFill()

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
   * 设置怪物数据
   */
  public setMonster(monster: Monster): void {
    this.monster = monster
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
