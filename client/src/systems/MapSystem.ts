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
    console.log('MapSystem: 开始初始化地图...')
    
    // 先创建默认绿色纹理（保证一定有背景）
    this.createDefaultTexture()
    
    try {
      // 然后尝试加载真实地砖
      await this.loadTileTexture()
      console.log('MapSystem: 地砖纹理加载成功，重新创建地面')
    } catch (error) {
      console.warn('MapSystem: 地砖纹理加载失败，使用默认绿色背景', error)
    }
    
    // 创建地面
    this.createGround()
    
    console.log('MapSystem: 地图初始化完成')
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
    console.log('MapSystem: 创建深色网格背景')
    const canvas = document.createElement('canvas')
    canvas.width = this.tileSize
    canvas.height = this.tileSize
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // 绘制深色背景
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, this.tileSize, this.tileSize)
      
      // 绘制网格线（更明显）
      ctx.strokeStyle = '#3a3a6e'
      ctx.lineWidth = 2
      
      // 边框
      ctx.strokeRect(0, 0, this.tileSize, this.tileSize)
      
      // 对角线（辅助看清移动方向）
      ctx.strokeStyle = '#2a2a4e'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(this.tileSize, this.tileSize)
      ctx.moveTo(this.tileSize, 0)
      ctx.lineTo(0, this.tileSize)
      ctx.stroke()
      
      // 中心点（红色，更明显）
      ctx.fillStyle = '#ff4444'
      ctx.beginPath()
      ctx.arc(this.tileSize / 2, this.tileSize / 2, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    
    this.tileTexture = PIXI.Texture.from(canvas)
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
    
    // 创建平铺纹理
    const tilingSprite = new PIXI.TilingSprite(
      this.tileTexture,
      this.mapWidth * this.tileSize,
      this.mapHeight * this.tileSize
    )
    
    tilingSprite.x = -(this.mapWidth * this.tileSize) / 2
    tilingSprite.y = -(this.mapHeight * this.tileSize) / 2
    
    groundLayer.addChild(tilingSprite)
    
    console.log(`MapSystem: 地面创建完成 (${this.mapWidth}x${this.mapHeight} 地砖)`)
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
