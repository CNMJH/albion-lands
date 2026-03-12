import { GameRenderer } from '../renderer/GameRenderer'
import { useGameStore } from '../stores/gameStore'
import { network } from '../network/NetworkManager'

/**
 * 输入系统
 * 处理键盘输入并控制玩家移动
 */
export class InputSystem {
  private gameRenderer: GameRenderer
  private keysPressed: Set<string> = new Set()
  private moveSpeed: number = 200 // 像素/秒
  private lastMoveTime: number = 0
  private moveInterval: number = 50 // 移动更新间隔 (ms)

  constructor(gameRenderer: GameRenderer) {
    this.gameRenderer = gameRenderer
    this.setupInputHandlers()
  }

  /**
   * 设置输入处理器
   */
  private setupInputHandlers(): void {
    // 监听键盘按下
    this.gameRenderer.on('keydown', (e: KeyboardEvent) => {
      this.keysPressed.add(e.code)
      
      // 阻止方向键和空格键的默认行为
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault()
      }
    })

    // 监听键盘释放
    this.gameRenderer.on('keyup', (e: KeyboardEvent) => {
      this.keysPressed.delete(e.code)
    })

    console.log('输入系统：键盘监听已设置')
  }

  /**
   * 更新输入状态（在游戏循环中调用）
   */
  public update(deltaTime: number): void {
    const state = useGameStore.getState()
    if (!state.player) return

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
      const moveDistance = this.moveSpeed * deltaTime
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
   * 检查特定按键是否被按下
   */
  public isKeyPressed(code: string): boolean {
    return this.keysPressed.has(code)
  }

  /**
   * 设置移动速度
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed
  }

  /**
   * 获取当前移动速度
   */
  public getMoveSpeed(): number {
    return this.moveSpeed
  }
}

// 导出单例实例
export const inputSystem = {
  instance: null as InputSystem | null,
  
  init(gameRenderer: GameRenderer): InputSystem {
    if (!this.instance) {
      this.instance = new InputSystem(gameRenderer)
    }
    return this.instance
  },
  
  getInstance(): InputSystem | null {
    return this.instance
  },
}
