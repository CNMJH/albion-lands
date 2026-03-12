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
    
    try {
      // 加载地砖纹理
      await this.loadTileTexture()
      
      // 创建地面
      this.createGround()
      
      console.log('MapSystem: 地图初始化完成')
    } catch (error) {
      console.error('MapSystem: 地图初始化失败', error)
    }
  }
  
  /**
   * 加载地砖纹理
   */
  private async loadTileTexture(): Promise<void> {
    try {
      // 使用草地地砖作为默认地面
      const texturePath = 'assets/tiles/grass_tile.png'
      console.log('MapSystem: 加载地砖纹理:', texturePath)
      
      this.tileTexture = await PIXI.Texture.from(texturePath)
      console.log('MapSystem: 地砖纹理加载成功')
    } catch (error) {
      console.error('MapSystem: 地砖纹理加载失败，使用默认纹理', error)
      // 创建默认纹理
      this.createDefaultTexture()
    }
  }
  
  /**
   * 创建默认纹理（绿色背景）
   */
  private createDefaultTexture(): void {
    console.log('MapSystem: 创建默认纹理')
    const canvas = document.createElement('canvas')
    canvas.width = this.tileSize
    canvas.height = this.tileSize
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // 绘制绿色背景
      ctx.fillStyle = '#2d5a27'
      ctx.fillRect(0, 0, this.tileSize, this.tileSize)
      
      // 绘制一些细节
      ctx.fillStyle = '#3d6a37'
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * this.tileSize
        const y = Math.random() * this.tileSize
        const size = Math.random() * 3 + 1
        ctx.fillRect(x, y, size, size)
      }
    }
    
    this.tileTexture = PIXI.Texture.from(canvas)
  }
  
  /**
   * 创建地面
   */
  private createGround(): void {
    if (!this.tileTexture) {
      console.error('MapSystem: 地砖纹理不存在')
      return
    }
    
    const groundLayer = this.renderer.getStage('ground')
    if (!groundLayer) {
      console.error('MapSystem: ground 图层不存在')
      return
    }
    
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
