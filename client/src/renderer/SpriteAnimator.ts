import * as PIXI from 'pixi.js'

/**
 * 动画帧数据
 */
export interface AnimationFrame {
  texture: PIXI.Texture
  duration?: number // 毫秒，默认 100ms
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  name: string
  frames: AnimationFrame[]
  loop?: boolean
  frameDuration?: number // 每帧持续时间 (毫秒)
}

/**
 * 怪物动画配置
 */
export interface MonsterAnimationData {
  texture: string
  frames: number
  frameWidth: number
  frameHeight: number
}

/**
 * 怪物动画映射
 */
export const MONSTER_ANIMATIONS: Record<string, Record<string, MonsterAnimationData>> = {
  // 这些将在运行时从 JSON 加载
}

/**
 * 动画状态
 */
export type AnimationState = 'idle' | 'walk' | 'attack' | 'hurt' | 'death'

/**
 * 精灵动画播放器
 */
export class SpriteAnimator {
  private sprite: PIXI.Sprite
  private textures: PIXI.Texture[] = []
  private currentFrame: number = 0
  private frameDuration: number = 100 // 毫秒
  private lastFrameTime: number = 0
  private isPlaying: boolean = false
  private loop: boolean = true
  private onComplete?: () => void

  constructor(sprite: PIXI.Sprite) {
    this.sprite = sprite
  }

  /**
   * 从精灵图表加载动画
   */
  public async loadAnimation(
    texturePath: string,
    frameCount: number,
    frameWidth: number,
    frameHeight: number
  ): Promise<void> {
    try {
      const texture = await PIXI.Assets.load(texturePath)
      this.textures = []

      // 从精灵图表中提取每帧
      for (let i = 0; i < frameCount; i++) {
        const frameTexture = new PIXI.Texture(
          texture.baseTexture,
          new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight)
        )
        this.textures.push(frameTexture)
      }

      // 设置第一帧
      if (this.textures.length > 0) {
        this.sprite.texture = this.textures[0]
      }
    } catch (error) {
      console.warn(`加载动画失败：${texturePath}`, error)
    }
  }

  /**
   * 播放动画
   */
  public play(loop: boolean = true, onComplete?: () => void): void {
    if (this.textures.length === 0) return

    this.loop = loop
    this.isPlaying = true
    this.currentFrame = 0
    this.lastFrameTime = performance.now()
    this.onComplete = onComplete

    if (this.textures.length > 0) {
      this.sprite.texture = this.textures[0]
    }
  }

  /**
   * 停止动画
   */
  public stop(): void {
    this.isPlaying = false
  }

  /**
   * 更新动画帧
   */
  public update(_deltaTime: number): void {
    if (!this.isPlaying || this.textures.length === 0) return

    const now = performance.now()
    const elapsed = now - this.lastFrameTime

    if (elapsed >= this.frameDuration) {
      this.currentFrame++
      this.lastFrameTime = now

      if (this.currentFrame >= this.textures.length) {
        if (this.loop) {
          this.currentFrame = 0
        } else {
          this.currentFrame = this.textures.length - 1
          this.isPlaying = false
          if (this.onComplete) {
            this.onComplete()
          }
          return
        }
      }

      this.sprite.texture = this.textures[this.currentFrame]
    }
  }

  /**
   * 设置帧持续时间
   */
  public setFrameDuration(duration: number): void {
    this.frameDuration = duration
  }

  /**
   * 是否正在播放
   */
  public getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * 获取当前帧
   */
  public getCurrentFrame(): number {
    return this.currentFrame
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.textures = []
    this.stop()
  }
}
