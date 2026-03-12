import { GameRenderer } from '../renderer/GameRenderer'
import { useGameStore } from '../stores/gameStore'
import { network } from '../network/NetworkManager'
import { skillSystem } from './SkillSystem'

/**
 * 玩家操作类型
 */
export type PlayerAction = 
  | 'move'          // 移动
  | 'attack'        // 攻击
  | 'interact'      // 交互/采集
  | 'useSkill'      // 使用技能
  | 'openUI'        // 打开 UI
  | 'chat'          // 聊天

/**
 * 玩家操作配置
 */
export interface PlayerControlsConfig {
  moveSpeed: number
  attackRange: number
  interactRange: number
}

/**
 * 玩家操作系统
 * 统一管理所有玩家输入和操作
 * 
 * 控制方案：
 * - 移动：WASD 或 方向键
 * - 攻击：鼠标左键 或 空格键
 * - 交互：E 键（采集、NPC 对话等）
 * - 技能：数字键 1-8
 * - UI 快捷键：
 *   - B: 背包
 *   - C: 制作
 *   - Q: 任务
 *   - F: 好友
 *   - M: 地图（待实现）
 *   - L: 排行榜（待实现）
 * - 聊天：Enter 键
 */
export class PlayerControlsSystem {
  private gameRenderer: GameRenderer
  private config: PlayerControlsConfig
  private keysPressed: Set<string> = new Set()
  private attackCooldown: number = 0
  private attackCooldownTime: number = 1000 // 毫秒
  private lastMoveTime: number = 0
  private moveInterval: number = 50 // 移动更新间隔 (ms)
  
  // UI 状态跟踪
  private uiState: {
    inventory: boolean
    crafting: boolean
    quest: boolean
    friends: boolean
    chat: boolean
  } = {
    inventory: false,
    crafting: false,
    quest: false,
    friends: false,
    chat: false,
  }

  constructor(gameRenderer: GameRenderer, config?: Partial<PlayerControlsConfig>) {
    this.gameRenderer = gameRenderer
    this.config = {
      moveSpeed: 200,
      attackRange: 50,
      interactRange: 60,
      ...config,
    }
    this.setupInputHandlers()
    console.log('玩家操作系统初始化完成')
  }

  /**
   * 设置输入处理器
   */
  private setupInputHandlers(): void {
    // 监听键盘按下
    this.gameRenderer.on('keydown', (e: KeyboardEvent) => {
      // 如果聊天框激活，不处理游戏快捷键
      if (this.uiState.chat) {
        return
      }

      this.keysPressed.add(e.code)
      
      // 阻止游戏快捷键的默认行为
      const gameKeys = [
        'KeyW', 'KeyA', 'KeyS', 'KeyD',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'KeyE', 'KeyB', 'KeyC', 'KeyQ', 'KeyF', 'KeyM', 'KeyL',
        'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8',
        'Enter'
      ]
      
      if (gameKeys.includes(e.code)) {
        e.preventDefault()
      }

      // 处理单次触发的快捷键
      this.handleKeyPress(e.code)
    })

    // 监听键盘释放
    this.gameRenderer.on('keyup', (e: KeyboardEvent) => {
      this.keysPressed.delete(e.code)
    })

    // 监听鼠标点击
    this.gameRenderer.on('mousedown', (e: MouseEvent) => {
      const canvas = this.gameRenderer.getApp()?.view as HTMLCanvasElement
      if (!canvas) return

      if (e.button === 0) { // 左键 - 攻击
        this.performAttack()
      } else if (e.button === 2) { // 右键 - 移动
        e.preventDefault()
        const rect = canvas.getBoundingClientRect()
        const worldX = e.clientX - rect.left
        const worldY = e.clientY - rect.top
        this.sendMoveTo(worldX, worldY)
      }
    })

    // 阻止右键菜单
    this.gameRenderer.on('contextmenu', (e: MouseEvent) => {
      e.preventDefault()
    })

    console.log('玩家操作系统：输入监听已设置')
  }

  /**
   * 处理按键按下（单次触发）
   */
  private handleKeyPress(code: string): void {
    // 攻击 - 空格键
    if (code === 'Space') {
      this.performAttack()
      return
    }

    // 交互 - E 键
    if (code === 'KeyE') {
      this.performInteract()
      return
    }

    // 技能 - 数字键 1-8
    if (code >= 'Digit1' && code <= 'Digit8') {
      const skillIndex = parseInt(code.replace('Digit', '')) - 1
      this.useSkill(skillIndex)
      return
    }

    // UI 快捷键
    if (code === 'KeyB') {
      this.toggleUI('inventory')
      return
    }

    if (code === 'KeyC') {
      this.toggleUI('crafting')
      return
    }

    if (code === 'KeyQ') {
      this.toggleUI('quest')
      return
    }

    if (code === 'KeyF') {
      this.toggleUI('friends')
      return
    }

    if (code === 'Enter') {
      this.toggleUI('chat')
      return
    }
  }

  /**
   * 切换 UI 面板
   */
  private toggleUI(uiType: keyof typeof this.uiState): void {
    // 如果当前 UI 是激活的，关闭它
    if (this.uiState[uiType]) {
      this.uiState[uiType] = false
      console.log(`关闭 ${uiType} UI`)
    } else {
      // 关闭其他 UI，打开当前 UI
      Object.keys(this.uiState).forEach(key => {
        this.uiState[key as keyof typeof this.uiState] = false
      })
      this.uiState[uiType] = true
      console.log(`打开 ${uiType} UI`)
    }

    // 触发 UI 切换事件（UI 组件可以监听）
    this.gameRenderer.emit('uiToggle', { type: uiType, visible: this.uiState[uiType] })
  }

  /**
   * 获取 UI 状态
   */
  public getUIState(): typeof this.uiState {
    return { ...this.uiState }
  }

  /**
   * 设置 UI 状态（供 UI 组件调用）
   */
  public setUIState(uiType: keyof typeof this.uiState, visible: boolean): void {
    this.uiState[uiType] = visible
  }

  /**
   * 更新输入状态（在游戏循环中调用）
   */
  public update(deltaTime: number): void {
    const state = useGameStore.getState()
    if (!state.player) return

    // 更新攻击冷却
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime * 1000
    }

    // 更新技能冷却
    skillSystem.update(deltaTime)

    // 处理移动输入
    this.handleMovement(deltaTime, state)
  }

  /**
   * 处理移动
   */
  private handleMovement(deltaTime: number, state: any): void {
    const now = Date.now()
    if (now - this.lastMoveTime < this.moveInterval) return
    this.lastMoveTime = now

    let dx = 0
    let dy = 0

    // WASD 或方向键控制
    if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) {
      dy -= 1
    }
    if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) {
      dy += 1
    }
    if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) {
      dx -= 1
    }
    if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) {
      dx += 1
    }

    // 如果有移动输入
    if (dx !== 0 || dy !== 0) {
      // 归一化对角线移动
      const length = Math.sqrt(dx * dx + dy * dy)
      dx /= length
      dy /= length

      // 计算移动增量
      const moveDistance = this.config.moveSpeed * deltaTime
      const moveDx = dx * moveDistance
      const moveDy = dy * moveDistance

      // 计算新位置
      const newX = state.player.x + moveDx
      const newY = state.player.y + moveDy

      // 更新玩家位置（本地）
      state.updatePlayer({ x: newX, y: newY })

      // 发送移动消息到服务器（发送增量）
      network.send('move', {
        dx: moveDx,
        dy: moveDy,
      })
    }
  }

  /**
   * 执行攻击
   */
  public performAttack(): void {
    if (this.attackCooldown > 0) {
      console.log('攻击冷却中')
      return
    }

    const state = useGameStore.getState()
    if (!state.player) return

    // 发送攻击指令
    network.send('attack', {
      type: 'basic',
      x: state.player.x,
      y: state.player.y,
      timestamp: Date.now(),
    })

    this.attackCooldown = this.attackCooldownTime
    
    // 触发攻击事件（CombatRenderer 可以监听）
    this.gameRenderer.emit('playerAttack', {
      x: state.player.x,
      y: state.player.y,
      type: 'basic',
    })

    console.log('玩家执行攻击')
  }

  /**
   * 执行交互（采集、NPC 对话等）
   */
  public performInteract(): void {
    const state = useGameStore.getState()
    if (!state.player) return

    console.log('玩家尝试交互')

    // 发送交互指令
    network.send('interact', {
      x: state.player.x,
      y: state.player.y,
      range: this.config.interactRange,
      timestamp: Date.now(),
    })

    // 触发交互事件
    this.gameRenderer.emit('playerInteract', {
      x: state.player.x,
      y: state.player.y,
      range: this.config.interactRange,
    })
  }

  /**
   * 使用技能
   */
  public useSkill(skillIndex: number): void {
    const state = useGameStore.getState()
    if (!state.player) return

    // 获取玩家的技能栏配置（从玩家数据中）
    const skillIds = state.player.skills || []
    if (skillIndex >= skillIds.length) {
      console.warn(`技能索引 ${skillIndex} 超出范围`)
      return
    }

    const skillId = skillIds[skillIndex]
    if (!skillId) {
      console.warn(`技能栏 ${skillIndex + 1} 未配置技能`)
      return
    }

    // 使用 SkillSystem 释放技能
    const success = skillSystem.useSkill(skillId)
    
    if (success) {
      // 触发技能事件（用于 UI 和动画）
      this.gameRenderer.emit('playerSkill', {
        skillId,
        skillIndex,
        x: state.player.x,
        y: state.player.y,
      })
      console.log(`技能释放成功：${skillId}`)
    }
  }

  /**
   * 发送移动目标点（鼠标右键）
   */
  private sendMoveTo(x: number, y: number): void {
    const state = useGameStore.getState()
    if (!state.player) return

    console.log(`玩家移动到 (${x.toFixed(0)}, ${y.toFixed(0)})`)

    // 计算方向
    const dx = x - state.player.x
    const dy = y - state.player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 5) { // 最小移动距离
      network.send('move', {
        dx,
        dy,
        targetX: x,
        targetY: y,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 检查是否在攻击范围内
   */
  public isInAttackRange(targetX: number, targetY: number, playerX: number, playerY: number): boolean {
    const dx = targetX - playerX
    const dy = targetY - playerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= this.config.attackRange
  }

  /**
   * 设置移动速度
   */
  public setMoveSpeed(speed: number): void {
    this.config.moveSpeed = speed
  }

  /**
   * 获取移动速度
   */
  public getMoveSpeed(): number {
    return this.config.moveSpeed
  }

  /**
   * 检查特定按键是否被按下
   */
  public isKeyPressed(code: string): boolean {
    return this.keysPressed.has(code)
  }
}

// 导出单例工厂
export const playerControls = {
  instance: null as PlayerControlsSystem | null,
  
  init(gameRenderer: GameRenderer, config?: Partial<PlayerControlsConfig>): PlayerControlsSystem {
    if (!this.instance) {
      this.instance = new PlayerControlsSystem(gameRenderer, config)
    }
    return this.instance
  },
  
  getInstance(): PlayerControlsSystem | null {
    return this.instance
  },
}
