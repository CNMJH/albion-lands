import * as PIXI from 'pixi.js'

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

  off(event: string, listener: (...args: any[]) => void): void {
    const listeners = this.events.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
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
 * 游戏渲染器配置
 */
export interface RendererConfig {
  width: number
  height: number
  resolution: number
  backgroundColor: number
}

/**
 * 游戏渲染器
 * 负责管理所有游戏对象的渲染
 */
export class GameRenderer extends EventEmitter {
  private app: PIXI.Application | null = null
  private stages: Map<string, PIXI.Container> = new Map()
  private camera: Camera = new Camera()
  private gameObjects: Map<string, GameObject> = new Map()
  private isRunning: boolean = false
  private lastFrameTime: number = 0

  constructor(private config: RendererConfig) {
    super()
  }

  /**
   * 初始化渲染器
   */
  public init(container: HTMLElement): void {
    // 创建 Pixi 应用
    this.app = new PIXI.Application({
      width: this.config.width,
      height: this.config.height,
      resolution: this.config.resolution,
      backgroundAlpha: 1,
      backgroundColor: this.config.backgroundColor,
      antialias: true,
      autoDensity: true,
    })

    // 添加到 DOM
    container.appendChild(this.app.view as HTMLCanvasElement)

    // 初始化图层
    this.initLayers()

    // 绑定输入事件
    this.bindInputEvents()

    console.log('游戏渲染器初始化完成')
  }

  /**
   * 初始化图层
   */
  private initLayers(): void {
    if (!this.app) return

    // 创建各个图层
    const layerNames = [
      'ground',      // 地面层
      'objects',     // 物体层
      'characters',  // 角色层
      'effects',     // 特效层
      'ui',          // UI 层
    ]

    layerNames.forEach((name) => {
      const layer = new PIXI.Container()
      layer.name = name
      this.stages.set(name, layer)
      this.app?.stage.addChild(layer)
    })
  }

  /**
   * 绑定输入事件
   */
  private bindInputEvents(): void {
    if (!this.app) return

    const canvas = this.app.view as HTMLCanvasElement

    // 键盘事件
    canvas.addEventListener('keydown', (e) => {
      this.emit('keydown', e)
    })

    canvas.addEventListener('keyup', (e) => {
      this.emit('keyup', e)
    })

    // 鼠标事件
    canvas.addEventListener('mousedown', (e) => {
      this.emit('mousedown', e)
    })

    canvas.addEventListener('mouseup', (e) => {
      this.emit('mouseup', e)
    })

    canvas.addEventListener('mousemove', (e) => {
      this.emit('mousemove', e)
    })

    // 阻止右键菜单
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.emit('contextmenu', e)
    })
  }

  /**
   * 启动游戏循环
   */
  public start(): void {
    if (!this.app || !this.app.ticker || this.isRunning) {
      console.log('渲染器未就绪或已运行，跳过启动')
      return
    }

    this.isRunning = true
    this.lastFrameTime = performance.now()

    // 启动渲染循环
    this.app.ticker.add((_delta) => {
      const now = performance.now()
      const deltaTime = (now - this.lastFrameTime) / 1000
      this.lastFrameTime = now

      this.update(deltaTime)
      this.render()
    })

    console.log('游戏循环启动')
  }

  /**
   * 更新游戏逻辑
   */
  private update(deltaTime: number): void {
    // 更新摄像机
    this.camera.update(deltaTime)

    // 更新所有游戏对象
    this.gameObjects.forEach((obj) => {
      if (obj.active) {
        obj.update(deltaTime)
      }
    })

    // 触发更新事件
    this.emit('update', deltaTime)
  }

  /**
   * 渲染
   */
  private render(): void {
    if (!this.app) return

    // 应用摄像机变换
    this.applyCameraTransform()
  }

  /**
   * 应用摄像机变换
   */
  private applyCameraTransform(): void {
    if (!this.app) return

    const ground = this.stages.get('ground')
    const objects = this.stages.get('objects')
    const characters = this.stages.get('characters')
    const effects = this.stages.get('effects')

    // UI 层不跟随摄像机
    const worldLayers = [ground, objects, characters, effects]

    worldLayers.forEach((layer) => {
      if (layer) {
        layer.position.x = -this.camera.x + this.config.width / 2
        layer.position.y = -this.camera.y + this.config.height / 2
      }
    })
  }

  /**
   * 设置摄像机目标
   */
  public setCameraTarget(x: number, y: number): void {
    this.camera.setTarget(x, y)
  }

  /**
   * 添加游戏对象
   */
  public addGameObject(obj: GameObject): void {
    this.gameObjects.set(obj.id, obj)
    
    const layer = this.stages.get(obj.layer)
    if (layer) {
      layer.addChild(obj.sprite)
    }
  }

  /**
   * 移除游戏对象
   */
  public removeGameObject(id: string): void {
    const obj = this.gameObjects.get(id)
    if (obj) {
      const layer = this.stages.get(obj.layer)
      if (layer) {
        layer.removeChild(obj.sprite)
      }
      this.gameObjects.delete(id)
    }
  }

  /**
   * 获取游戏对象
   */
  public getGameObject(id: string): GameObject | undefined {
    return this.gameObjects.get(id)
  }

  /**
   * 获取图层
   */
  public getLayer(name: string): PIXI.Container | undefined {
    return this.stages.get(name)
  }

  /**
   * 调整大小
   */
  public resize(width: number, height: number): void {
    if (!this.app) return

    this.app.renderer.resize(width, height)
    this.config.width = width
    this.config.height = height

    console.log(`渲染器大小调整为：${width}x${height}`)
  }

  /**
   * 销毁渲染器
   */
  public destroy(): void {
    console.log('GameRenderer: 开始销毁...')
    
    this.isRunning = false

    try {
      if (this.app) {
        // 先停止 ticker，避免访问 next 指针
        if (this.app.ticker) {
          this.app.ticker.stop()
          // 不要调用 ticker.destroy()，直接设为 null
          this.app.ticker = null as any
        }
        
        // 销毁 app，不销毁 renderer（因为可能被复用）
        this.app.destroy(false, { children: true, texture: false, baseTexture: false })
        this.app = null
      }

      this.gameObjects.clear()
      this.stages.clear()
      
      console.log('GameRenderer: 销毁完成')
    } catch (error) {
      console.error('GameRenderer: 销毁时出错', error)
      // 即使出错也要清理
      this.app = null
    }
  }

  /**
   * 获取应用实例
   */
  public getApp(): PIXI.Application | null {
    return this.app
  }

  /**
   * 获取摄像机
   */
  public getCamera(): Camera {
    return this.camera
  }
}

/**
 * 摄像机类
 */
class Camera {
  public x: number = 0
  public y: number = 0
  public zoom: number = 1
  public rotation: number = 0

  private targetX: number = 0
  private targetY: number = 0
  private speed: number = 5

  /**
   * 设置目标位置
   */
  public setTarget(x: number, y: number): void {
    this.targetX = x
    this.targetY = y
  }

  /**
   * 更新摄像机
   */
  public update(deltaTime: number): void {
    // 平滑跟随目标
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      this.x += dx * this.speed * deltaTime
      this.y += dy * this.speed * deltaTime
    }
  }

  /**
   * 设置缩放
   */
  public setZoom(zoom: number): void {
    this.zoom = Math.max(0.5, Math.min(2, zoom))
  }

  /**
   * 设置旋转
   */
  public setRotation(rotation: number): void {
    this.rotation = rotation
  }
}

/**
 * 游戏对象基类
 */
export class GameObject {
  public id: string
  public sprite: PIXI.Sprite
  public layer: string
  public active: boolean = true
  public x: number = 0
  public y: number = 0

  constructor(
    id: string,
    texture: PIXI.Texture,
    layer: string = 'objects'
  ) {
    this.id = id
    this.sprite = new PIXI.Sprite(texture)
    this.layer = layer
    this.sprite.anchor.set(0.5)
  }

  /**
   * 更新对象
   */
  public update(_deltaTime: number): void {
    // 子类实现
  }

  /**
   * 设置位置
   */
  public setPosition(x: number, y: number): void {
    this.x = x
    this.y = y
    this.sprite.position.set(x, y)
  }

  /**
   * 设置可见性
   */
  public setVisible(visible: boolean): void {
    this.sprite.visible = visible
    this.active = visible
  }

  /**
   * 销毁对象
   */
  public destroy(): void {
    this.sprite.destroy()
    this.active = false
  }
}
