import * as PIXI from 'pixi.js'
import { GameRenderer } from './GameRenderer'
import { combatSystem } from '../systems/CombatSystem'
import { monsterAI, Monster } from '../systems/MonsterAI'
import { MonsterRenderer, CombatEffectManager } from './MonsterRenderer'
import { useGameStore } from '../stores/gameStore'
import { network } from '../network/NetworkManager'

/**
 * 战斗渲染集成
 * 负责将战斗系统集成到渲染器
 */
export class CombatRenderer {
  private gameRenderer: GameRenderer
  private monsterRenderers: Map<string, MonsterRenderer> = new Map()
  private effectManager: CombatEffectManager | null = null
  private playerSprite: PIXI.Sprite | null = null

  constructor(gameRenderer: GameRenderer) {
    this.gameRenderer = gameRenderer
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

    const graphics = new PIXI.Graphics()
    
    // 绘制玩家（蓝色圆形）
    graphics.beginFill(0x0000FF)
    graphics.drawCircle(0, 0, 20)
    graphics.endFill()

    // 添加轮廓
    graphics.lineStyle(2, 0xFFFFFF)
    graphics.drawCircle(0, 0, 20)

    const texture = app.renderer.generateTexture(graphics)
    this.playerSprite = new PIXI.Sprite(texture)
    this.playerSprite.anchor.set(0.5)

    const layer = this.gameRenderer.getLayer('characters')
    if (layer) {
      layer.addChild(this.playerSprite)
    }
  }

  /**
   * 更新玩家位置
   */
  public updatePlayerPosition(x: number, y: number): void {
    if (this.playerSprite) {
      this.playerSprite.x = x
      this.playerSprite.y = y
      
      // 更新摄像机目标
      this.gameRenderer.setCameraTarget(x, y)
    }
  }

  /**
   * 更新
   */
  public update(deltaTime: number): void {
    // 更新伤害数字
    if (this.effectManager) {
      this.effectManager.update(deltaTime)
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

    if (this.playerSprite) {
      this.playerSprite.destroy()
      this.playerSprite = null
    }
  }
}
