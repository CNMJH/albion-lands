import { network } from '../network/NetworkManager'
import { useGameStore } from '../stores/gameStore'

/**
 * 简单的事件发射器 (浏览器环境)
 */
class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map()

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
      return true
    }
    return false
  }
}

/**
 * 战斗系统
 * 负责处理移动、攻击、技能释放等战斗相关逻辑
 */
export class CombatSystem extends EventEmitter {
  private moveSpeed: number = 200 // 像素/秒
  private attackRange: number = 50
  private isAttacking: boolean = false
  private attackCooldown: number = 0
  private attackCooldownTime: number = 1000 // 毫秒

  /**
   * 检查是否正在攻击
   */
  public getIsAttacking(): boolean {
    return this.isAttacking
  }

  // 输入状态
  private keys: Set<string> = new Set()
  private targetPosition: { x: number; y: number } | null = null

  constructor() {
    super()
    this.bindInputEvents()
    this.setupNetworkHandlers()
  }

  /**
   * 绑定输入事件
   */
  private bindInputEvents(): void {
    // 键盘按下
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code)
      
      // 技能快捷键 1-8
      if (e.code >= 'Digit1' && e.code <= 'Digit8') {
        const skillIndex = parseInt(e.code.replace('Digit', '')) - 1
        this.useSkill(skillIndex)
      }
    })

    // 键盘释放
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)
    })

    // 鼠标点击移动
    window.addEventListener('mousedown', (e) => {
      if (e.button === 2) { // 右键移动
        e.preventDefault()
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        this.targetPosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
        this.emit('moveClick', this.targetPosition)
      } else if (e.button === 0) { // 左键攻击
        this.performAttack()
      }
    })

    // 阻止右键菜单
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }

  /**
   * 设置网络消息处理器
   */
  private setupNetworkHandlers(): void {
    // 监听移动确认 - 更新玩家位置
    network.onMessage('move', (payload) => {
      console.log('📍 收到移动确认:', payload)
      const store = useGameStore.getState()
      if (payload.x !== undefined && payload.y !== undefined) {
        store.updatePlayer({ x: payload.x, y: payload.y })
        console.log('✅ 玩家位置已更新:', { x: payload.x, y: payload.y })
      }
      this.emit('playerMoved', payload)
    })

    // 监听攻击
    network.onMessage('attack', (payload) => {
      this.emit('attackPerformed', payload)
    })

    // 监听技能
    network.onMessage('skill', (payload) => {
      this.emit('skillUsed', payload)
    })

    // 监听受伤
    network.onMessage('damage', (payload) => {
      this.emit('damageTaken', payload)
    })
  }

  /**
   * 更新移动
   */
  public update(deltaTime: number): void {
    // 键盘移动
    let dx = 0
    let dy = 0

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dy -= 1
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dy += 1
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dx -= 1
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dx += 1

    // 归一化对角线移动
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy)
      dx /= length
      dy /= length
    }

    // 发送移动指令
    if (dx !== 0 || dy !== 0) {
      this.sendMove(dx * this.moveSpeed * deltaTime, dy * this.moveSpeed * deltaTime)
    }

    // 鼠标移动
    if (this.targetPosition) {
      // 由服务端处理移动逻辑
    }

    // 攻击冷却
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime * 1000
    }
  }

  /**
   * 发送移动指令
   */
  private sendMove(dx: number, dy: number): void {
    network.send('move', {
      dx,
      dy,
      timestamp: Date.now(),
    })
  }

  /**
   * 执行攻击
   */
  public performAttack(): void {
    if (this.attackCooldown > 0) {
      console.log('攻击冷却中')
      return
    }

    // 发送攻击指令
    network.send('attack', {
      type: 'basic',
      timestamp: Date.now(),
    })

    this.attackCooldown = this.attackCooldownTime
    this.isAttacking = true
    this.emit('attack', { type: 'basic' })

    // 重置攻击状态
    setTimeout(() => {
      this.isAttacking = false
    }, 300)
  }

  /**
   * 使用技能
   */
  public useSkill(skillIndex: number): void {
    network.send('skill', {
      skillIndex,
      timestamp: Date.now(),
    })

    this.emit('skill', { skillIndex })
  }

  /**
   * 设置攻击范围
   */
  public setAttackRange(range: number): void {
    this.attackRange = range
  }

  /**
   * 设置移动速度
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed
  }

  /**
   * 获取攻击范围
   */
  public getAttackRange(): number {
    return this.attackRange
  }

  /**
   * 检查是否在攻击范围内
   */
  public isInAttackRange(targetX: number, targetY: number, playerX: number, playerY: number): boolean {
    const dx = targetX - playerX
    const dy = targetY - playerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= this.attackRange
  }
}

// 导出单例
export const combatSystem = new CombatSystem()
