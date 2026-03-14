/**
 * 调试控制台
 * 按 F12 打开/关闭
 * 显示游戏状态、日志、命令输入
 */

export interface DebugCommand {
  name: string
  description: string
  handler: (args: string[]) => void
}

class DebugConsole {
  private visible: boolean = false
  private logs: Array<{ type: string; message: string; time: string }> = []
  private commands: Map<string, DebugCommand> = new Map()
  private maxLogs: number = 100
  private listeners: Set<(visible: boolean) => void> = new Set()

  constructor() {
    this.registerDefaultCommands()
  }

  /**
   * 切换显示
   */
  toggle() {
    this.visible = !this.visible
    this.listeners.forEach((listener) => listener(this.visible))
    return this.visible
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean) {
    this.visible = visible
    this.listeners.forEach((listener) => listener(visible))
  }

  /**
   * 获取可见性
   */
  isVisible(): boolean {
    return this.visible
  }

  /**
   * 添加日志
   */
  log(message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') {
    const time = new Date().toLocaleTimeString()
    this.logs.push({ type, message, time })

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  /**
   * 获取所有日志
   */
  getLogs(): Array<{ type: string; message: string; time: string }> {
    return this.logs
  }

  /**
   * 清空日志
   */
  clear() {
    this.logs = []
    this.log('日志已清空', 'info')
  }

  /**
   * 注册命令
   */
  registerCommand(command: DebugCommand) {
    this.commands.set(command.name, command)
    this.log(`命令已注册：${command.name}`, 'success')
  }

  /**
   * 执行命令
   */
  executeCommand(input: string): boolean {
    const parts = input.trim().split(/\s+/)
    const cmdName = parts[0].toLowerCase()
    const args = parts.slice(1)

    const command = this.commands.get(cmdName)
    if (!command) {
      this.log(`未知命令：${cmdName}`, 'error')
      return false
    }

    try {
      command.handler(args)
      this.log(`执行命令：${cmdName}`, 'success')
      return true
    } catch (error: any) {
      this.log(`命令执行失败：${error.message}`, 'error')
      return false
    }
  }

  /**
   * 注册默认命令
   */
  private registerDefaultCommands() {
    // 帮助命令
    this.registerCommand({
      name: 'help',
      description: '显示所有可用命令',
      handler: () => {
        this.log('=== 可用命令 ===', 'info')
        this.commands.forEach((cmd, name) => {
          this.log(`  ${name} - ${cmd.description}`, 'info')
        })
      }
    })

    // 清空命令
    this.registerCommand({
      name: 'clear',
      description: '清空日志',
      handler: () => {
        this.clear()
      }
    })

    // FPS 命令
    this.registerCommand({
      name: 'fps',
      description: '显示当前 FPS',
      handler: () => {
        this.log(`当前 FPS: ${performance.now()}`, 'info')
      }
    })

    // 位置命令
    this.registerCommand({
      name: 'pos',
      description: '显示玩家位置',
      handler: () => {
        this.log('玩家位置：需要集成游戏状态', 'info')
      }
    })

    // 传送命令
    this.registerCommand({
      name: 'tp',
      description: '传送到指定坐标 (tp x y)',
      handler: (args) => {
        if (args.length < 2) {
          this.log('用法：tp x y', 'error')
          return
        }
        const x = parseInt(args[0])
        const y = parseInt(args[1])
        this.log(`传送到：(${x}, ${y})`, 'success')
      }
    })

    // 生成怪物命令
    this.registerCommand({
      name: 'spawn',
      description: '生成怪物 (spawn type count)',
      handler: (args) => {
        if (args.length < 2) {
          this.log('用法：spawn type count', 'error')
          return
        }
        const type = args[0]
        const count = parseInt(args[1])
        this.log(`生成 ${count} 只 ${type}`, 'success')
      }
    })

    // 添加物品命令
    this.registerCommand({
      name: 'give',
      description: '添加物品 (give itemId count)',
      handler: (args) => {
        if (args.length < 2) {
          this.log('用法：give itemId count', 'error')
          return
        }
        const itemId = args[0]
        const count = parseInt(args[1])
        this.log(`添加 ${count} 个 ${itemId}`, 'success')
      }
    })

    // 设置等级命令
    this.registerCommand({
      name: 'level',
      description: '设置玩家等级 (level <number>)',
      handler: (args) => {
        if (args.length < 1) {
          this.log('用法：level <number>', 'error')
          return
        }
        const level = parseInt(args[0])
        this.log(`设置等级：${level}`, 'success')
      }
    })

    // 添加货币命令
    this.registerCommand({
      name: 'gold',
      description: '添加金币 (gold <amount>)',
      handler: (args) => {
        if (args.length < 1) {
          this.log('用法：gold <amount>', 'error')
          return
        }
        const amount = parseInt(args[0])
        this.log(`添加 ${amount} 金币`, 'success')
      }
    })

    // 速度命令
    this.registerCommand({
      name: 'speed',
      description: '设置移动速度 (speed <number>)',
      handler: (args) => {
        if (args.length < 1) {
          this.log('用法：speed <number>', 'error')
          return
        }
        const speed = parseInt(args[0])
        this.log(`设置速度：${speed}`, 'success')
      }
    })

    // 无敌命令
    this.registerCommand({
      name: 'god',
      description: '切换无敌模式',
      handler: () => {
        this.log('无敌模式切换', 'warn')
      }
    })

    // 隐藏命令
    this.registerCommand({
      name: 'hide',
      description: '隐藏调试控制台',
      handler: () => {
        this.setVisible(false)
        this.log('调试控制台已隐藏', 'info')
      }
    })
  }

  /**
   * 注册监听器
   */
  onToggle(callback: (visible: boolean) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }
}

// 单例
export const debugConsole = new DebugConsole()

/**
 * 获取调试控制台实例
 */
export function getDebugConsole(): DebugConsole {
  return debugConsole
}
