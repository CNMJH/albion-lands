import { useGameStore } from '../stores/gameStore'

/**
 * 小地图组件
 * 显示玩家位置、队友、怪物和重要标记
 */
export class MinimapRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private size: number = 200 // 小地图尺寸
  private scale: number = 0.05 // 缩放比例
  
  // 显示配置
  private showPlayers: boolean = true
  private showMonsters: boolean = true
  private showResources: boolean = false
  
  // 渲染计数（用于调试）
  private renderCount: number = 0

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.setupCanvas()
    this.setupEvents()
  }

  /**
   * 设置画布
   */
  private setupCanvas(): void {
    this.canvas.width = this.size
    this.canvas.height = this.size
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '10px'
    this.canvas.style.left = '10px' // ✅ 改到左上角
    this.canvas.style.border = '2px solid #333'
    this.canvas.style.borderRadius = '4px'
    this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    this.canvas.style.zIndex = '1000'
    this.canvas.style.pointerEvents = 'none' // ✅ 让点击穿透，不遮挡 UI 按钮
    this.canvas.style.touchAction = 'none' // ✅ 防止触摸默认行为
    
    document.getElementById('game-container')?.appendChild(this.canvas)
  }

  /**
   * 设置事件监听
   */
  private setupEvents(): void {
    // 点击小地图移动
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // 转换为世界坐标（假设地图 6400x6400）
      const worldX = (x / this.size) * 6400
      const worldY = (y / this.size) * 6400
      
      console.log('🗺️ 小地图点击移动:', { x: worldX, y: worldY })
      // TODO: 发送移动指令
    })
  }

  /**
   * 渲染小地图
   */
  public render(): void {
    const state = useGameStore.getState()
    const ctx = this.ctx

    // 清空画布
    ctx.clearRect(0, 0, this.size, this.size)

    // 1. 绘制地面背景（绿色代表可通行区域）
    ctx.fillStyle = '#2d5016' // 深绿色地面
    ctx.fillRect(0, 0, this.size, this.size)

    // 2. 绘制网格线
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 0.5
    const gridSize = 64 * this.scale
    for (let x = 0; x < this.size; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.size)
      ctx.stroke()
    }
    for (let y = 0; y < this.size; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.size, y)
      ctx.stroke()
    }

    // 如果没有玩家，不继续绘制
    if (!state.player) {
      // 首次渲染时打印一次警告
      if (!this.renderCount) {
        console.log('🗺️ 小地图：等待玩家数据...')
        this.renderCount = 1
      }
      return
    }
    
    this.renderCount++

    const player = state.player
    const playerX = player.x * this.scale
    const playerY = player.y * this.scale
    
    // 调试日志（每 60 帧打印一次）
    if (this.renderCount % 60 === 1) {
      console.log('🗺️ 小地图渲染:', {
        playerX: player.x,
        playerY: player.y,
        scaledX: playerX,
        scaledY: playerY,
        monsterCount: state.monsters?.length || 0,
      })
    }

    // 3. 绘制边界
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, this.size, this.size)

    // 4. 绘制玩家位置（蓝色箭头）
    ctx.save()
    ctx.translate(playerX, playerY)
    ctx.rotate(player.rotation || 0)
    
    // 玩家三角形
    ctx.fillStyle = '#00BFFF'
    ctx.shadowColor = '#00BFFF'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(6, 0)
    ctx.lineTo(-4, -4)
    ctx.lineTo(-4, 4)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()

    // 5. 绘制怪物位置（红色点）
    if (this.showMonsters && state.monsters && state.monsters.length > 0) {
      state.monsters.forEach((monster, index) => {
        const mx = monster.x * this.scale
        const my = monster.y * this.scale
        
        // 只绘制在小地图范围内的怪物
        if (mx >= 0 && mx <= this.size && my >= 0 && my <= this.size) {
          ctx.fillStyle = '#ff4444'
          ctx.shadowColor = '#ff4444'
          ctx.shadowBlur = 4
          ctx.beginPath()
          ctx.arc(mx, my, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
          
          // 调试：打印第一个怪物坐标
          if (index === 0 && this.renderCount % 60 === 1) {
            console.log('👹 怪物坐标:', { name: monster.name, x: monster.x, y: monster.y, scaledX: mx, scaledY: my })
          }
        }
      })
    }

    // 6. 绘制队友位置（绿色点）
    if (this.showPlayers && state.party && state.party.members) {
      state.party.members.forEach((member: any) => {
        if (member.id !== player.id) {
          const mx = member.x * this.scale
          const my = member.y * this.scale
          
          if (mx >= 0 && mx <= this.size && my >= 0 && my <= this.size) {
            ctx.fillStyle = '#00ff00'
            ctx.shadowColor = '#00ff00'
            ctx.shadowBlur = 4
            ctx.beginPath()
            ctx.arc(mx, my, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      })
    }

    // 7. 绘制玩家视野范围
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(playerX, playerY, 30, 0, Math.PI * 2)
    ctx.stroke()
  }

  /**
   * 更新小地图
   */
  public update(): void {
    this.render()
  }

  /**
   * 切换显示选项
   */
  public toggleShowPlayers(): void {
    this.showPlayers = !this.showPlayers
    console.log(`🗺️ 玩家显示：${this.showPlayers ? '开启' : '关闭'}`)
  }

  public toggleShowMonsters(): void {
    this.showMonsters = !this.showMonsters
    console.log(`🗺️ 怪物显示：${this.showMonsters ? '开启' : '关闭'}`)
  }

  public toggleShowResources(): void {
    this.showResources = !this.showResources
    console.log(`🗺️ 资源显示：${this.showResources ? '开启' : '关闭'}`)
  }

  /**
   * 清理
   */
  public destroy(): void {
    this.canvas.remove()
  }
}
