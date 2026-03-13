import * as PIXI from 'pixi.js'
import { GameRenderer } from './GameRenderer'
import { combatSystem } from '../systems/CombatSystem'
import { monsterAI, Monster } from '../systems/MonsterAI'
import { MonsterRenderer, CombatEffectManager } from './MonsterRenderer'
import { useGameStore } from '../stores/gameStore'
import { network } from '../network/NetworkManager'
import { AttackEffectRenderer } from './AttackEffectRenderer'
import { DustEffectRenderer } from './DustEffectRenderer'

/**
 * 战斗渲染集成
 * 负责将战斗系统集成到渲染器
 */
export class CombatRenderer {
  private gameRenderer: GameRenderer
  private monsterRenderers: Map<string, MonsterRenderer> = new Map()
  private effectManager: CombatEffectManager | null = null
  private attackEffectRenderer: AttackEffectRenderer | null = null
  private playerSprite: PIXI.Sprite | null = null
  private playerShadow: PIXI.Graphics | null = null
  private dustRenderer: DustEffectRenderer | null = null
  private lastPlayerX: number = 0
  private lastPlayerY: number = 0

  constructor(gameRenderer: GameRenderer) {
    this.gameRenderer = gameRenderer
    this.attackEffectRenderer = new AttackEffectRenderer(gameRenderer)
    this.dustRenderer = new DustEffectRenderer(gameRenderer)
    this.setupEventListeners()
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    const app = this.gameRenderer.getApp()
    if (!app) return

    this.effectManager = new CombatEffectManager(app)

    // 监听怪物生成
    monsterAI.on('monsterSpawned', (monster) => {
      this.spawnMonster(monster)
    })

    // 监听怪物移除
    monsterAI.on('monsterRemoved', (monsterId) => {
      this.removeMonster(monsterId)
    })

    // 监听怪物移动
    monsterAI.on('monsterMoved', (monster) => {
      this.updateMonsterPosition(monster)
    })

    // 监听怪物状态变化
    monsterAI.on('monsterStateChanged', (data) => {
      console.log(`怪物 ${data.monsterId} 状态变为 ${data.state}`)
    })

    // 监听玩家攻击（CombatSystem）
    combatSystem.on('attack', (data) => {
      console.log('玩家攻击（CombatSystem）', data)
    })

    // 监听玩家攻击（PlayerControlsSystem）
    this.gameRenderer.on('playerAttack', (data: any) => {
      console.log('玩家攻击（PlayerControlsSystem）', data)
      // 可以在这里添加攻击动画效果
    })

    // 监听网络消息 - 攻击
    network.onMessage('attack', (payload) => {
      if (payload.targetId) {
        const monster = monsterAI.getMonster(payload.targetId)
        if (monster) {
          this.effectManager?.showDamage(monster.x, monster.y, payload.damage, false)
        }
      }
    })

    // 监听网络消息 - 怪物 HP
    network.onMessage('monsterHP', (payload) => {
      monsterAI.updateMonster(payload.monsterId, { hp: payload.hp })
      const renderer = this.monsterRenderers.get(payload.monsterId)
      if (renderer) {
        renderer.updateHP()
      }
    })

    // 监听网络消息 - 怪物死亡
    network.onMessage('monsterDeath', (payload) => {
      console.log(`怪物 ${payload.monsterId} 死亡`, payload)
      useGameStore.getState().addCombatLog(`击败了 ${payload.monsterId}, 获得 ${payload.expGained} 经验`)
    })

    // 监听网络消息 - 怪物攻击
    network.onMessage('monsterAttack', (payload) => {
      console.log('怪物攻击', payload)
      const state = useGameStore.getState()
      if (state.player) {
        const newHP = state.player.hp - payload.damage
        useGameStore.getState().updatePlayerHP(newHP)
        this.effectManager?.showDamage(state.player.x, state.player.y, payload.damage, true)
      }
    })

    // 监听网络消息 - PVP 攻击
    network.onMessage('pvpAttack', (payload) => {
      console.log('🗡️ PVP 攻击', payload)
      const state = useGameStore.getState()
      
      // 显示伤害数字
      if (payload.targetId === state.player?.id) {
        // 玩家受到 PVP 伤害
        if (state.player) {
          const newHP = state.player.hp - payload.damage
          useGameStore.getState().updatePlayerHP(newHP)
          this.effectManager?.showDamage(state.player.x, state.player.y, payload.damage, true)
        }
      } else {
        // 其他玩家受到伤害（显示但不更新 HP）
        this.effectManager?.showDamage(payload.targetX, payload.targetY, payload.damage, false)
      }
      
      // 显示 PVP 提示
      if (payload.killed) {
        this.showPVPKillAnnouncement(payload.attackerName, payload.targetName)
      }
    })
  }

  /**
   * 生成怪物
   */
  private async spawnMonster(monster: Monster): Promise<void> {
    const app = this.gameRenderer.getApp()
    if (!app) return

    const monsterRenderer = new MonsterRenderer(app)
    
    // 加载动画配置（如果尚未加载）
    await monsterRenderer.loadAnimationConfigs()
    monsterRenderer.setMonster(monster)
    
    const layer = this.gameRenderer.getLayer('characters')
    if (layer) {
      layer.addChild(monsterRenderer.getContainer())
    }

    this.monsterRenderers.set(monster.id, monsterRenderer)
    console.log(`生成怪物：${monster.name} (${monster.id})`)
  }

  /**
   * 移除怪物
   */
  private removeMonster(monsterId: string): void {
    const renderer = this.monsterRenderers.get(monsterId)
    if (renderer) {
      const layer = this.gameRenderer.getLayer('characters')
      if (layer) {
        layer.removeChild(renderer.getContainer())
      }
      renderer.destroy()
      this.monsterRenderers.delete(monsterId)
      console.log(`移除怪物：${monsterId}`)
    }
  }

  /**
   * 更新怪物位置
   */
  private updateMonsterPosition(monster: Monster): void {
    const renderer = this.monsterRenderers.get(monster.id)
    if (renderer) {
      renderer.updatePosition(16) // deltaTime 用于动画更新
      renderer.updateHP()
    }
  }

  /**
   * 创建玩家精灵
   */
  public createPlayerSprite(): void {
    const app = this.gameRenderer.getApp()
    if (!app) return

    // 创建阴影（深色椭圆，在玩家脚下）
    const shadow = new PIXI.Graphics()
    shadow.beginFill(0x000000, 0.3) // 黑色，30% 透明度
    shadow.drawEllipse(0, 0, 25, 12) // 椭圆形
    shadow.endFill()
    shadow.zIndex = 0 // 最底层
    this.playerShadow = shadow
    
    const layer = this.gameRenderer.getLayer('characters')
    if (layer) {
      layer.addChild(this.playerShadow)
      console.log('✅ 玩家阴影已添加')
    }

    const graphics = new PIXI.Graphics()
    
    // 绘制玩家（亮蓝色圆形，更明显）
    graphics.beginFill(0x00BFFF) // 亮蓝色
    graphics.drawCircle(0, 0, 20)
    graphics.endFill()

    // 添加白色轮廓（更粗）
    graphics.lineStyle(3, 0xFFFFFF)
    graphics.drawCircle(0, 0, 20)
    
    // 添加方向指示（小三角形，显示面向）
    graphics.beginFill(0xFFFFFF)
    graphics.moveTo(0, -15)
    graphics.lineTo(-8, -5)
    graphics.lineTo(8, -5)
    graphics.closePath()
    graphics.endFill()

    const texture = app.renderer.generateTexture(graphics)
    this.playerSprite = new PIXI.Sprite(texture)
    this.playerSprite.anchor.set(0.5)
    this.playerSprite.zIndex = 1 // 在阴影上面
    
    // 设置初始位置到屏幕中央
    this.playerSprite.x = 0
    this.playerSprite.y = 0
    this.lastPlayerX = 0
    this.lastPlayerY = 0

    if (layer) {
      layer.addChild(this.playerSprite)
      console.log('✅ 玩家精灵已添加到 characters 图层')
    } else {
      console.error('❌ characters 图层不存在！')
    }
    
    console.log('⚔️ 玩家精灵已创建（亮蓝色圆形 + 白色轮廓 + 方向指示 + 阴影）')
    console.log('📍 玩家初始位置:', { x: this.playerSprite.x, y: this.playerSprite.y })
  }

  /**
   * 更新玩家位置
   */
  public updatePlayerPosition(x: number, y: number, rotation?: number): void {
    if (this.playerSprite) {
      const oldX = this.playerSprite.x
      const oldY = this.playerSprite.y
      
      this.playerSprite.x = x
      this.playerSprite.y = y
      
      // 更新阴影位置（跟随玩家）
      if (this.playerShadow) {
        this.playerShadow.x = x
        this.playerShadow.y = y + 5 // 阴影稍微偏下一点
      }
      
      // 应用旋转角度（如果有）
      if (rotation !== undefined) {
        this.playerSprite.rotation = rotation
        // console.log('🔄 玩家旋转:', (rotation * 180 / Math.PI).toFixed(0) + '°')
      }
      
      // 移动时产生灰尘效果
      const distance = Math.sqrt((x - oldX) ** 2 + (y - oldY) ** 2)
      if (distance > 5 && this.dustRenderer) {
        this.dustRenderer.emit(x, y)
      }
      
      // 更新摄像机目标
      this.gameRenderer.setCameraTarget(x, y)
    } else {
      console.log('⚠️ 玩家精灵未创建，跳过位置更新')
    }
  }

  /**
   * 更新
   */
  public update(deltaTime: number): void {
    // 更新攻击效果
    if (this.attackEffectRenderer) {
      this.attackEffectRenderer.update(deltaTime)
    }

    // 更新伤害数字
    if (this.effectManager) {
      this.effectManager.update(deltaTime)
    }

    // 更新灰尘特效
    if (this.dustRenderer) {
      this.dustRenderer.update(deltaTime)
    }

    // 更新所有怪物血条和动画（如果有变化）
    this.monsterRenderers.forEach((renderer, id) => {
      const monster = monsterAI.getMonster(id)
      if (monster) {
        renderer.updatePosition(16) // 更新动画和位置
        renderer.updateHP()
      }
    })
  }

  /**
   * 显示交互范围（按 E 键时）
   */
  public showInteractRange(x: number, y: number, range: number): void {
    const app = this.gameRenderer.getApp()
    if (!app) return

    const layer = this.gameRenderer.getLayer('effects')
    if (!layer) return

    // 创建交互范围圈
    const graphics = new PIXI.Graphics()
    graphics.lineStyle(2, 0x00FF00, 0.6)
    graphics.drawCircle(0, 0, range)
    
    const texture = app.renderer.generateTexture(graphics)
    const effect = new PIXI.Sprite(texture)
    effect.anchor.set(0.5)
    effect.x = x
    effect.y = y
    effect.alpha = 1

    layer.addChild(effect)

    // 0.5 秒后淡出
    setTimeout(() => {
      if (effect.parent) {
        effect.parent.removeChild(effect)
        effect.destroy()
      }
    }, 500)
    
    console.log('🟢 显示交互范围圈')
  }

  /**
   * 显示技能特效
   */
  public showSkillEffect(skillId: string, x: number, y: number): void {
    const app = this.gameRenderer.getApp()
    if (!app) return

    const layer = this.gameRenderer.getLayer('effects')
    if (!layer) return

    console.log(`✨ 显示技能特效：${skillId} at (${x.toFixed(0)}, ${y.toFixed(0)})`)

    // 根据技能类型创建不同的特效
    // TODO: 根据技能配置创建不同特效
    // 现在使用通用特效：彩色光环

    const graphics = new PIXI.Graphics()
    graphics.lineStyle(3, 0xFFFF00, 0.8)
    graphics.drawCircle(0, 0, 30)
    graphics.beginFill(0xFFFF00, 0.3)
    graphics.drawCircle(0, 0, 30)
    graphics.endFill()
    
    const texture = app.renderer.generateTexture(graphics)
    const effect = new PIXI.Sprite(texture)
    effect.anchor.set(0.5)
    effect.x = x
    effect.y = y
    effect.alpha = 1

    layer.addChild(effect)

    // 动画：缩放 + 淡出
    const startTime = Date.now()
    const duration = 500 // 500ms

    const animate = () => {
      const elapsed = Date.now() - startTime

      if (elapsed >= duration) {
        if (effect.parent) {
          effect.parent.removeChild(effect)
          effect.destroy()
        }
        return
      }

      const progress = elapsed / duration

      // 缩放效果
      const scale = 1 + progress * 1.5
      effect.scale.set(scale)
      
      // 淡出效果
      effect.alpha = 1 - progress

      requestAnimationFrame(animate)
    }

    animate()
  }

  /**
   * 清理
   */
  public clear(): void {
    this.monsterRenderers.forEach((renderer) => {
      renderer.destroy()
    })
    this.monsterRenderers.clear()
    
    if (this.effectManager) {
      this.effectManager.destroy()
    }

    if (this.attackEffectRenderer) {
      this.attackEffectRenderer.clear()
    }

    if (this.playerSprite) {
      this.playerSprite.destroy()
      this.playerSprite = null
    }
  }

  /**
   * 显示 PVP 击杀公告
   */
  private showPVPKillAnnouncement(attackerName: string, targetName: string): void {
    const app = this.gameRenderer.getApp()
    if (!app) return

    const layer = this.gameRenderer.getLayer('ui-effects') || this.gameRenderer.getLayer('effects')
    if (!layer) return

    // 创建公告文本
    const message = `⚔️ ${attackerName} 击杀了 ${targetName}!`
    const text = new PIXI.Text(message, {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xFF4444,
      stroke: 0x000000,
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
    })

    text.anchor.set(0.5)
    text.x = app.screen.width / 2
    text.y = 100
    text.alpha = 0

    layer.addChild(text)

    // 动画：淡入 + 显示 + 淡出
    const startTime = Date.now()
    const fadeInDuration = 500
    const showDuration = 2000
    const fadeOutDuration = 500
    const totalDuration = fadeInDuration + showDuration + fadeOutDuration

    const animate = () => {
      const elapsed = Date.now() - startTime

      if (elapsed < fadeInDuration) {
        // 淡入
        text.alpha = elapsed / fadeInDuration
      } else if (elapsed < fadeInDuration + showDuration) {
        // 显示
        text.alpha = 1
      } else if (elapsed < totalDuration) {
        // 淡出
        text.alpha = 1 - (elapsed - fadeInDuration - showDuration) / fadeOutDuration
      } else {
        // 移除
        layer.removeChild(text)
        text.destroy()
        return
      }

      requestAnimationFrame(animate)
    }

    animate()
  }
}
