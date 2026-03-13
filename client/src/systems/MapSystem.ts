import * as PIXI from 'pixi.js'
import { GameRenderer } from '../renderer/GameRenderer'

/**
 * 地图系统
 * 负责渲染游戏世界的地砖和背景
 */
export class MapSystem {
  private renderer: GameRenderer
  private tileTexture: PIXI.Texture | null = null
  
  // 地图配置
  private tileSize: number = 64
  private mapWidth: number = 100  // 地砖数量
  private mapHeight: number = 100
  
  constructor(renderer: GameRenderer) {
    this.renderer = renderer
  }
  
  /**
   * 初始化地图
   */
  public async init(): Promise<void> {
    console.log('🗺️ MapSystem: 开始初始化地图...')
    console.log('🗺️ MapSystem: 地图尺寸', this.mapWidth, 'x', this.mapHeight, '地砖')
    console.log('🗺️ MapSystem: 地砖尺寸', this.tileSize, 'px')
    
    // 先创建默认绿色纹理（保证一定有背景）
    this.createDefaultTexture()
    console.log('✅ MapSystem: 默认纹理已创建')
    
    try {
      // 然后尝试加载真实地砖
      await this.loadTileTexture()
      console.log('✅ MapSystem: 地砖纹理加载成功，重新创建地面')
    } catch (error) {
      console.warn('⚠️ MapSystem: 地砖纹理加载失败，使用默认绿色背景', error)
    }
    
    // 创建地面
    this.createGround()
    
    // 验证地面是否创建成功
    const groundLayer = this.renderer.getStage('ground')
    if (groundLayer) {
      console.log('✅ MapSystem: ground 图层存在，子元素数量:', groundLayer.children.length)
      if (groundLayer.children.length > 0) {
        const sprite = groundLayer.children[0] as any
        console.log('✅ MapSystem: 地面精灵已添加', {
          type: sprite.constructor.name,
          width: sprite.width,
          height: sprite.height,
          x: sprite.x,
          y: sprite.y,
          anchor: sprite.anchor,
          visible: sprite.visible,
          alpha: sprite.alpha,
        })
      }
    } else {
      console.error('❌ MapSystem: ground 图层不存在!')
    }
    
    console.log('✅ MapSystem: 地图初始化完成')
  }
  
  /**
   * 加载地砖纹理
   */
  private async loadTileTexture(): Promise<void> {
    const texturePath = '/assets/tiles/grass_tile.png'
    console.log('MapSystem: 尝试加载地砖纹理:', texturePath)
    
    // 检查纹理是否存在
    const response = await fetch(texturePath)
    if (!response.ok) {
      throw new Error(`地砖纹理不存在：${texturePath}`)
    }
    
    this.tileTexture = await PIXI.Texture.from(texturePath)
    console.log('MapSystem: 地砖纹理加载成功')
  }
  
  /**
   * 创建默认纹理（深色网格背景）
   */
  private createDefaultTexture(): void {
    console.log('MapSystem: 创建深色网格背景（高对比度）')
    const canvas = document.createElement('canvas')
    canvas.width = this.tileSize
    canvas.height = this.tileSize
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // 绘制深色背景（非常深）
      ctx.fillStyle = '#0f0f1a'
      ctx.fillRect(0, 0, this.tileSize, this.tileSize)
      
      // 绘制网格线（高对比度 - 亮白色边框）
      ctx.strokeStyle = '#8a8abe'
      ctx.lineWidth = 3
      
      // 边框（亮白色，非常明显）
      ctx.strokeRect(1, 1, this.tileSize - 2, this.tileSize - 2)
      
      // 十字线（亮色，辅助看清移动）
      ctx.strokeStyle = '#5a5a8e'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(this.tileSize / 2, 0)
      ctx.lineTo(this.tileSize / 2, this.tileSize)
      ctx.moveTo(0, this.tileSize / 2)
      ctx.lineTo(this.tileSize, this.tileSize / 2)
      ctx.stroke()
      
      // 对角线（辅助看清移动方向）
      ctx.strokeStyle = '#3a3a6e'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(this.tileSize, this.tileSize)
      ctx.moveTo(this.tileSize, 0)
      ctx.lineTo(0, this.tileSize)
      ctx.stroke()
      
      // 中心点（亮红色，非常明显）
      ctx.fillStyle = '#ff4444'
      ctx.beginPath()
      ctx.arc(this.tileSize / 2, this.tileSize / 2, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.stroke()
      
      // 四个角点（亮白色，辅助定位）
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(2, 2, 5, 5)
      ctx.fillRect(this.tileSize - 7, 2, 5, 5)
      ctx.fillRect(2, this.tileSize - 7, 5, 5)
      ctx.fillRect(this.tileSize - 7, this.tileSize - 7, 5, 5)
      
      // 添加坐标文字（辅助定位）
      ctx.fillStyle = '#6a6a9e'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('64px', this.tileSize / 2, this.tileSize / 2 + 20)
    }
    
    this.tileTexture = PIXI.Texture.from(canvas)
    console.log('✅ 默认网格纹理已创建（64x64px，高对比度，亮白色边框）')
  }
  
  /**
   * 创建地面
   */
  private createGround(): void {
    console.log('MapSystem: 开始创建地面...')
    
    if (!this.tileTexture) {
      console.error('MapSystem: 地砖纹理不存在，无法创建地面')
      return
    }
    
    const groundLayer = this.renderer.getStage('ground')
    if (!groundLayer) {
      console.error('MapSystem: ground 图层不存在')
      return
    }
    
    // 清除图层中已有的内容
    groundLayer.removeChildren()
    
    // 创建平铺纹理 - 尺寸要足够大，覆盖整个地图
    const mapPixelWidth = this.mapWidth * this.tileSize
    const mapPixelHeight = this.mapHeight * this.tileSize
    
    console.log('MapSystem: 创建 TilingSprite', {
      textureSize: this.tileSize + 'x' + this.tileSize,
      mapSize: mapPixelWidth + 'x' + mapPixelHeight,
    })
    
    const tilingSprite = new PIXI.TilingSprite(
      this.tileTexture,
      mapPixelWidth,
      mapPixelHeight
    )
    
    // 设置锚点为 0.5（中心），这样位置就是中心点
    tilingSprite.anchor.set(0.5)
    
    // 放在世界原点 (0, 0)，这样相机在 (0,0) 时就能看到
    tilingSprite.x = 0
    tilingSprite.y = 0
    
    // 确保可见
    tilingSprite.visible = true
    tilingSprite.alpha = 1
    tilingSprite.zIndex = 0
    
    groundLayer.addChild(tilingSprite)
    
    console.log(`MapSystem: 地面创建完成 (${this.mapWidth}x${this.mapHeight} 地砖)`)
    console.log('🗺️ 地面尺寸:', { width: mapPixelWidth, height: mapPixelHeight })
    console.log('🗺️ 地面位置:', { x: tilingSprite.x, y: tilingSprite.y })
    console.log('🗺️ 地面锚点:', tilingSprite.anchor)
    console.log('🗺️ 地面可见性:', { visible: tilingSprite.visible, alpha: tilingSprite.alpha })
    console.log('🗺️ 地面子元素数量:', groundLayer.children.length)
    console.log('🗺️ 地面图层:', groundLayer)
    console.log(' 地面纹理:', this.tileTexture)
  }
  
  /**
   * 获取地图宽度
   */
  public getMapWidth(): number {
    return this.mapWidth * this.tileSize
  }
  
  /**
   * 获取地图高度
   */
  public getMapHeight(): number {
    return this.mapHeight * this.tileSize
  }
}

// 导出单例
export const mapSystem = new MapSystem(
  // 延迟初始化，在 App.tsx 中设置
  null as any
)
