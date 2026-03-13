import { GameRenderer } from '../renderer/GameRenderer'
import { useGameStore } from '../stores/gameStore'
import { network } from '../network/NetworkManager'
import { skillSystem } from './SkillSystem'

/**
 * 玩家操作配置
 */
export interface PlayerControlsConfig {
  moveSpeed: number        // 移动速度（像素/秒）
  attackRange: number      // 攻击范围（像素）
  interactRange: number    // 交互范围（像素）
  attackCooldown: number   // 攻击冷却时间（毫秒）
  moveSendInterval: number // 移动发送间隔（毫秒）
  stopDistance: number     // 停止距离（像素）
}

/**
 * 玩家操作系统 - 英雄联盟风格
 * 
 * 控制方案：
 * - 移动：鼠标右键点击地面
 * - 普通攻击：鼠标左键点击敌人（自动移动到攻击范围）
 * - Q/W/E：小技能
 * - R：大招
 * - D/F：召唤师技能
 * - 1-6：物品主动技能
 * - A：攻击型移动（移动 + 攻击）
 * - S：停止
 * - H：回城
 */
export class PlayerControlsSystem {
  private gameRenderer: GameRenderer
  private config: PlayerControlsConfig
  private keysPressed: Set<string> = new Set()
  
  // 攻击状态
  private attackCooldown: number = 0
  private attackAnimationTime: number = 0
  private autoAttackTarget: { id: string; x: number; y: number } | null = null
  
  // 移动状态
  private lastMoveSendTime: number = 0
  private moveBuffer: { dx: number; dy: number } | null = null
  private isMoving: boolean = false
  private moveTarget: { x: number; y: number } | null = null

  constructor(gameRenderer: GameRenderer, config?: Partial<PlayerControlsConfig>) {
    this.gameRenderer = gameRenderer
    this.config = {
      moveSpeed: 200,          // 200 像素/秒
      attackRange: 150,        // 150 像素攻击范围（LOL 风格更远）
      interactRange: 80,       // 80 像素交互范围
      attackCooldown: 1000,    // 1000ms 攻击冷却（LOL 风格攻速由装备决定）
      moveSendInterval: 100,   // 100ms 发送一次移动
      stopDistance: 5,         // 5 像素内停止
      ...config,
    }
    this.setupInputHandlers()
    console.log('✅ 玩家操作系统初始化完成（LOL 风格）')
  }

  /**
   * 设置输入处理器
   */
  private setupInputHandlers(): void {
    console.log('🎮 玩家操作系统：开始设置输入监听...')
    
    // 方案 1：通过 GameRenderer 监听（canvas focus 时）
    this.setupGameRendererInput()
    
    // 方案 2：全局监听（备用方案）
    this.setupGlobalInput()
    
    console.log('🎮 玩家操作系统：输入监听设置完成（双模式）')
  }

  /**
   * 通过 GameRenderer 监听输入
   */
  private setupGameRendererInput(): void {
    // 监听键盘按下
    this.gameRenderer.on('keydown', (e: KeyboardEvent) => {
      console.log('⌨️ [Canvas] 键盘按下:', e.code)
      this.handleKeyDown(e)
    })

    // 监听键盘释放
    this.gameRenderer.on('keyup', (e: KeyboardEvent) => {
      console.log('⬆️ [Canvas] 键盘释放:', e.code)
      this.keysPressed.delete(e.code)
    })

    // 监听鼠标点击
    this.gameRenderer.on('mousedown', (e: MouseEvent) => {
      const canvas = this.gameRenderer.getApp()?.view as HTMLCanvasElement
      if (!canvas) return

      if (e.button === 0) { // 左键 - 普通攻击
        this.performBasicAttack()
      } else if (e.button === 2) { // 右键 - 移动或攻击
        e.preventDefault()
        const rect = canvas.getBoundingClientRect()
        const worldX = e.clientX - rect.left
        const worldY = e.clientY - rect.top
        this.handleRightClick(worldX, worldY)
      }
    })

    // 阻止右键菜单
    this.gameRenderer.on('contextmenu', (e: MouseEvent) => {
      e.preventDefault()
    })
  }

  /**
   * 全局输入监听（备用方案）
   */
  private setupGlobalInput(): void {
    // 全局键盘按下
    window.addEventListener('keydown', (e) => {
      // 如果事件目标是输入框，忽略
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      console.log('⌨️ [Global] 键盘按下:', e.code)
      this.handleKeyDown(e)
    })

    // 全局键盘释放
    window.addEventListener('keyup', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      console.log('⬆️ [Global] 键盘释放:', e.code)
      this.keysPressed.delete(e.code)
    })

    // 全局鼠标点击
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // 左键 - 普通攻击
        this.performBasicAttack()
      } else if (e.button === 2) { // 右键 - 移动或攻击
        const canvas = this.gameRenderer.getApp()?.view as HTMLCanvasElement
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          const worldX = e.clientX - rect.left
          const worldY = e.clientY - rect.top
          this.handleRightClick(worldX, worldY)
        }
      }
    })
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // 如果聊天框激活，不处理游戏快捷键
    if (this.uiState.chat) {
      console.log('💬 聊天框激活，忽略游戏快捷键')
      return
    }

    this.keysPressed.add(e.code)
    
    // 阻止游戏快捷键的默认行为
    const gameKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Space', 'KeyE', 'KeyB', 'KeyC', 'KeyQ', 'KeyF', 'KeyR',
      'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6',
      'Enter', 'KeyH', 'KeyZ', 'KeyY', 'KeyG', 'KeyL',
      'KeyP', 'KeyK', 'KeyJ', 'KeyI', 'KeyU', 'KeyO'
    ]
    
    if (gameKeys.includes(e.code)) {
      e.preventDefault()
    }

    // 处理单次触发的快捷键
    this.handleKeyPress(e.code)
  }

  /**
   * 处理按键按下（单次触发）- LOL 风格
   */
  private handleKeyPress(code: string): void {
    // Q 技能 - 小技能 1
    if (code === 'KeyQ') {
      this.useSkill(0)
      return
    }

    // W 技能 - 小技能 2
    if (code === 'KeyW') {
      this.useSkill(1)
      return
    }

    // E 技能 - 小技能 3
    if (code === 'KeyE') {
      this.useSkill(2)
      return
    }

    // R 技能 - 大招
    if (code === 'KeyR') {
      this.useSkill(3)
      return
    }

    // D 技能 - 召唤师技能 1
    if (code === 'KeyD') {
      this.useSummonerSpell(0)
      return
    }

    // F 技能 - 召唤师技能 2
    if (code === 'KeyF') {
      this.useSummonerSpell(1)
      return
    }

    // 物品主动技能 1-6
    if (code >= 'Digit1' && code <= 'Digit6') {
      const itemIndex = parseInt(code.replace('Digit', '')) - 1
      this.useItemActive(itemIndex)
      return
    }

    // A - 攻击型移动
    if (code === 'KeyA') {
      this.toggleAttackMove()
      return
    }

    // S - 停止
    if (code === 'KeyS') {
      this.stop()
      return
    }

    // H - 回城
    if (code === 'KeyH') {
      this.recall()
      return
    }

    // 空格 - 锁定视角（暂时用空格重新聚焦玩家）
    if (code === 'Space') {
      this.centerCameraOnPlayer()
      return
    }

    // UI 快捷键
    if (code === 'KeyB') {
      this.toggleUI('inventory')
      return
    }

    if (code === 'KeyC') {
      this.toggleUI('character')
      return
    }

    if (code === 'KeyI') {
      this.toggleUI('inventory')
      return
    }

    if (code === 'KeyP') {
      this.toggleUI('shop')
      return
    }

    if (code === 'KeyK') {
      this.toggleUI('scoreboard')
      return
    }

    if (code === 'KeyM') {
      this.toggleUI('market')
      return
    }

    if (code === 'KeyL') {
      this.toggleMinionHealthBars()
      return
    }

    if (code === 'KeyZ') {
      this.toggleChat()
      return
    }

    if (code === 'Enter') {
      this.toggleUI('chat')
      return
    }

    if (code === 'F1') {
      this.toggleUI('deathStats')
      return
    }

    // E - 拾取掉落物（死亡掉落系统）
    if (code === 'KeyE') {
      this.pickupDrop()
      return
    }
  }

  /**
   * 处理右键点击 - LOL 风格核心
   */
  private handleRightClick(worldX: number, worldY: number): void {
    const state = useGameStore.getState()
    if (!state.player) return

    console.log('🖱️ 右键点击:', { x: worldX, y: worldY })

    // 检测是否点击到敌人
    const clickedEnemy = this.detectClickedEnemy(worldX, worldY)
    
    if (clickedEnemy) {
      // 点击到敌人 - 自动攻击
      console.log('⚔️ 点击到敌人，开始攻击:', clickedEnemy)
      this.autoAttackTarget = clickedEnemy
      this.moveAndAttack(clickedEnemy.x, clickedEnemy.y)
    } else {
      // 点击地面 - 移动
      console.log('🚶 点击地面，移动到:', { x: worldX, y: worldY })
      this.autoAttackTarget = null
      this.sendMoveTo(worldX, worldY)
    }
  }

  /**
   * 检测点击位置是否有敌人
   */
  private detectClickedEnemy(x: number, y: number): { id: string; x: number; y: number } | null {
    const state = useGameStore.getState()
    const monsters = state.monsters
    
    // 检测点击范围（50 像素）
    const clickRadius = 50
    
    for (const monster of monsters) {
      const dx = x - monster.x
      const dy = y - monster.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance <= clickRadius) {
        return {
          id: monster.id,
          x: monster.x,
          y: monster.y,
        }
      }
    }
    
    return null
  }

  /**
   * 移动并攻击（自动走到攻击范围）
   */
  private moveAndAttack(targetX: number, targetY: number): void {
    const state = useGameStore.getState()
    if (!state.player) return

    // 计算到目标的距离
    const dx = targetX - state.player.x
    const dy = targetY - state.player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // 如果已经在攻击范围内，直接攻击
    if (distance <= this.config.attackRange) {
      console.log('✅ 已在攻击范围内，执行攻击')
      this.performBasicAttack(targetX, targetY)
    } else {
      // 否则移动到攻击范围边缘
      const moveDistance = distance - this.config.attackRange
      const moveX = state.player.x + (dx / distance) * moveDistance
      const moveY = state.player.y + (dy / distance) * moveDistance
      
      console.log('🏃 移动到攻击范围:', { x: moveX, y: moveY, distance })
      this.sendMoveTo(moveX, moveY)
      
      // 到达后自动攻击（在 update 中检测）
    }
  }

  /**
   * 执行普通攻击
   */
  public performBasicAttack(targetX?: number, targetY?: number): void {
    if (this.attackCooldown > 0) {
      console.log('⏳ 攻击冷却中')
      return
    }

    const state = useGameStore.getState()
    if (!state.player) return

    // 设置攻击冷却
    this.attackCooldown = this.config.attackCooldown
    this.attackAnimationTime = 300 // 300ms 攻击动画

    // 如果有目标点，计算面向角度
    if (targetX !== undefined && targetY !== undefined) {
      const dx = targetX - state.player.x
      const dy = targetY - state.player.y
      const angle = Math.atan2(dy, dx)
      
      // 更新玩家面向
      state.updatePlayer({ rotation: angle })
      
      console.log('⚔️ 攻击目标:', { x: targetX, y: targetY, angle: (angle * 180 / Math.PI).toFixed(0) + '°' })
    }

    // 发送攻击指令到服务器
    network.send('attack', {
      type: 'basic',
      x: state.player.x,
      y: state.player.y,
      range: this.config.attackRange,
      timestamp: Date.now(),
    })
    
    // 触发攻击事件（CombatRenderer 监听并播放动画）
    this.gameRenderer.emit('playerAttack', {
      x: state.player.x,
      y: state.player.y,
      range: this.config.attackRange,
      type: 'basic',
    })

    console.log('⚔️ 玩家执行普通攻击')
  }

  /**
   * 使用技能（QWER）
   */
  public useSkill(skillIndex: number): void {
    const state = useGameStore.getState()
    if (!state.player) return

    // 获取玩家的技能栏配置
    const skillIds = state.player.skills || []
    if (skillIndex >= skillIds.length) {
      console.warn(`⚠️ 技能索引 ${skillIndex} 超出范围`)
      return
    }

    const skillId = skillIds[skillIndex]
    if (!skillId) {
      console.warn(`⚠️ 技能栏 ${skillIndex + 1} 未配置技能`)
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
      console.log(`✨ 技能释放成功：${skillId}`)
    }
  }

  /**
   * 使用召唤师技能（D/F）
   */
  public useSummonerSpell(spellIndex: number): void {
    console.log(`🔮 使用召唤师技能 ${spellIndex === 0 ? 'D' : 'F'}`)
    // TODO: 实现召唤师技能系统
  }

  /**
   * 使用物品主动技能
   */
  public useItemActive(itemIndex: number): void {
    console.log(`🎒 使用物品主动技能 ${itemIndex + 1}`)
    // TODO: 实现物品主动技能系统
  }

  /**
   * 切换攻击型移动
   */
  private toggleAttackMove(): void {
    console.log('🎯 切换攻击型移动')
    // TODO: 实现攻击型移动
  }

  /**
   * 停止
   */
  private stop(): void {
    console.log('🛑 停止')
    this.isMoving = false
    this.moveTarget = null
    this.moveBuffer = null
  }

  /**
   * 回城
   */
  private recall(): void {
    console.log('🏰 回城')
    // TODO: 实现回城功能
  }

  /**
   * 视角锁定玩家
   */
  private centerCameraOnPlayer(): void {
    const state = useGameStore.getState()
    if (!state.player) return
    
    console.log('📷 视角锁定玩家')
    this.gameRenderer.setCameraTarget(state.player.x, state.player.y)
  }

  /**
   * 切换聊天
   */
  private toggleChat(): void {
    console.log('💬 切换聊天')
    this.toggleUI('chat')
  }

  /**
   * 切换小兵血条
   */
  private toggleMinionHealthBars(): void {
    console.log('❤️ 切换小兵血条')
    // TODO: 实现血条显示切换
  }

  // UI 状态跟踪
  private uiState: {
    inventory: boolean
    crafting: boolean
    quest: boolean
    friends: boolean
    chat: boolean
    character: boolean
    shop: boolean
    scoreboard: boolean
    market: boolean
    trade: boolean
    deathStats: boolean
  } = {
    inventory: false,
    crafting: false,
    quest: false,
    friends: false,
    chat: false,
    character: false,
    shop: false,
    scoreboard: false,
    market: false,
    trade: false,
    deathStats: false,
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
   * 切换 UI 面板
   */
  private toggleUI(uiType: keyof typeof this.uiState): void {
    // 如果当前 UI 是激活的，关闭它
    if (this.uiState[uiType]) {
      this.uiState[uiType] = false
      console.log(`❌ 关闭 ${uiType} UI`)
    } else {
      // 关闭其他 UI，打开当前 UI
      Object.keys(this.uiState).forEach(key => {
        this.uiState[key as keyof typeof this.uiState] = false
      })
      this.uiState[uiType] = true
      console.log(`✅ 打开 ${uiType} UI`)
    }

    // 触发 UI 切换事件（UI 组件可以监听）
    this.gameRenderer.emit('uiToggle', { type: uiType, visible: this.uiState[uiType] })
  }

  /**
   * 更新输入状态（在游戏循环中调用）
   */
  public update(deltaTime: number): void {
    const state = useGameStore.getState()
    if (!state.player) return

    // 更新攻击冷却和动画
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime * 1000
    }
    if (this.attackAnimationTime > 0) {
      this.attackAnimationTime -= deltaTime * 1000
    }

    // 更新技能冷却
    skillSystem.update(deltaTime)

    // 处理移动
    this.handleMovement(deltaTime, state)
    
    // 处理自动攻击
    this.handleAutoAttack(state)
  }

  /**
   * 处理移动
   */
  private handleMovement(deltaTime: number, state: any): void {
    // LOL 风格：右键点击移动，不是 WASD 持续移动
    if (!this.isMoving || !this.moveTarget) return

    // 计算到目标的距离
    const dx = this.moveTarget.x - state.player.x
    const dy = this.moveTarget.y - state.player.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 如果到达目标
    if (distance <= this.config.stopDistance) {
      console.log('✅ 到达移动目标')
      this.isMoving = false
      this.moveBuffer = null
      return
    }

    // 计算移动方向
    const moveDx = (dx / distance)
    const moveDy = (dy / distance)

    // 计算移动增量
    const moveDistance = this.config.moveSpeed * deltaTime
    const actualDx = moveDx * moveDistance
    const actualDy = moveDy * moveDistance

    // 更新本地位置（立即反馈）
    const newX = state.player.x + actualDx
    const newY = state.player.y + actualDy
    state.updatePlayer({ x: newX, y: newY })
    
    // 更新玩家面向角度（弧度）
    const angle = Math.atan2(moveDy, moveDx) // 返回 -PI 到 PI
    state.updatePlayer({ rotation: angle })
    
    console.log('🚶 移动中:', { 
      x: newX.toFixed(0), 
      y: newY.toFixed(0), 
      angle: (angle * 180 / Math.PI).toFixed(0) + '°',
      distance: distance.toFixed(0)
    })

    // 缓冲移动增量
    if (this.moveBuffer) {
      this.moveBuffer.dx += actualDx
      this.moveBuffer.dy += actualDy
    } else {
      this.moveBuffer = { dx: actualDx, dy: actualDy }
    }

    // 定期发送到服务器
    const now = Date.now()
    if (now - this.lastMoveSendTime >= this.config.moveSendInterval) {
      this.sendMoveBuffer()
    }
  }

  /**
   * 处理自动攻击
   */
  private handleAutoAttack(state: any): void {
    if (!this.autoAttackTarget) return

    // 计算到目标的距离
    const dx = this.autoAttackTarget.x - state.player.x
    const dy = this.autoAttackTarget.y - state.player.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 如果在攻击范围内且冷却完成，自动攻击
    if (distance <= this.config.attackRange && this.attackCooldown <= 0) {
      console.log('🎯 自动攻击目标')
      this.performBasicAttack(this.autoAttackTarget.x, this.autoAttackTarget.y)
    }
  }

  /**
   * 发送缓冲的移动数据
   */
  private sendMoveBuffer(): void {
    if (!this.moveBuffer) {
      console.log('⚠️ 没有缓冲的移动数据')
      return
    }

    const state = useGameStore.getState()
    if (!state.player) {
      console.warn('⚠️ 玩家不存在，无法发送移动')
      return
    }

    // 发送累积的移动增量
    network.send('move', {
      dx: this.moveBuffer.dx,
      dy: this.moveBuffer.dy,
      timestamp: Date.now(),
    })

    console.log(`📍 移动已发送: dx=${this.moveBuffer.dx.toFixed(1)}, dy=${this.moveBuffer.dy.toFixed(1)}`)
    this.moveBuffer = null
    this.lastMoveSendTime = Date.now()
  }

  /**
   * 发送移动目标点
   */
  private sendMoveTo(x: number, y: number): void {
    const state = useGameStore.getState()
    if (!state.player) {
      console.warn('⚠️ 玩家不存在，无法发送移动')
      return
    }

    console.log(`🎯 玩家移动到 (${x.toFixed(0)}, ${y.toFixed(0)})`)

    // 计算方向
    const dx = x - state.player.x
    const dy = y - state.player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > this.config.stopDistance) {
      // 设置移动状态
      this.isMoving = true
      this.moveTarget = { x, y }
      
      network.send('move', {
        dx,
        dy,
        targetX: x,
        targetY: y,
        timestamp: Date.now(),
      })
      
      console.log(`📍 移动目标已发送: target=(${x.toFixed(0)}, ${y.toFixed(0)}), distance=${distance.toFixed(0)}`)
    } else {
      console.log(`⚠️ 距离过近 (${distance.toFixed(0)}px)，跳过移动`)
    }
  }

  /**
   * 拾取掉落物（E 键）
   */
  private async pickupDrop(): Promise<void> {
    console.log('🤲 尝试拾取掉落物...')
    
    // 获取 deathSystem 实例
    const state = useGameStore.getState()
    const deathSystem = (state as any).deathSystem;
    
    if (!deathSystem) {
      console.warn('⚠️ DeathSystem 未初始化')
      return
    }

    // 获取玩家位置
    const player = state.player;
    if (!player) {
      console.warn('⚠️ 玩家不存在')
      return
    }

    // 查找最近的掉落物
    const nearestDropId = deathSystem.getNearestDrop(player.x, player.y, this.config.interactRange);
    
    if (!nearestDropId) {
      console.log('⚠️ 范围内没有掉落物')
      return
    }

    // 拾取掉落物
    const success = await deathSystem.pickupDrop(nearestDropId);
    
    if (success) {
      console.log('✅ 拾取成功')
    } else {
      console.error('❌ 拾取失败')
    }
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
