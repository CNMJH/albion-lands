import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { GameRenderer } from '../renderer/GameRenderer'
import { CombatRenderer } from './CombatRenderer'
import { MapSystem } from '../systems/MapSystem'

/**
 * 游戏画布组件
 * 负责初始化和运行 Pixi.js 渲染器
 */
export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<GameRenderer | null>(null)
  const combatRendererRef = useRef<CombatRenderer | null>(null)
  const { player } = useGameStore()
  
  // 使用 useRef 存储渲染器，避免闭包问题
  const rendererInstance = useRef<GameRenderer | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      console.log('GameCanvas: 容器未就绪，跳过初始化')
      return
    }

    // 清理容器中旧的 canvas（React 严格模式会导致重复调用）
    const oldCanvas = containerRef.current.querySelector('canvas')
    if (oldCanvas) {
      console.log('GameCanvas: 清理旧的 canvas（React 严格模式）')
      oldCanvas.remove()
    }

    console.log('GameCanvas: 开始初始化渲染器...')

    // 创建游戏渲染器
    const renderer = new GameRenderer({
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio,
      backgroundColor: 0x1a1a2e,
    })

    rendererRef.current = renderer
    rendererInstance.current = renderer

    // 初始化 Pixi 应用
    renderer.init(containerRef.current)

    // 初始化地图系统
    const mapSystem = new MapSystem(renderer)
    mapSystem.init().then(() => {
      console.log('GameCanvas: 地图系统初始化完成')
    })

    // 创建战斗渲染器
    const combatRenderer = new CombatRenderer(renderer)
    combatRendererRef.current = combatRenderer

    // 创建玩家精灵
    setTimeout(() => {
      if (combatRendererRef.current) {
        combatRendererRef.current.createPlayerSprite()
      }
    }, 1000)

    // 处理窗口大小变化（使用防抖）
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        if (rendererInstance.current) {
          rendererInstance.current.resize(window.innerWidth, window.innerHeight)
        }
      }, 100) // 100ms 防抖
    }

    window.addEventListener('resize', handleResize)

    // 启动游戏循环
    renderer.start()

    console.log('GameCanvas: 初始化完成')

    // 清理函数
    return () => {
      console.log('GameCanvas: 清理函数被调用')
      
      // 先移除事件监听
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      
      // 从容器中移除 canvas（防止 React 严格模式导致重复）
      if (containerRef.current) {
        const canvases = containerRef.current.querySelectorAll('canvas')
        canvases.forEach(canvas => canvas.remove())
        console.log('GameCanvas: 移除了', canvases.length, '个 canvas')
      }
      
      // 清理渲染器
      try {
        if (combatRendererRef.current) {
          console.log('GameCanvas: 清理战斗渲染器...')
          combatRendererRef.current.clear()
          combatRendererRef.current = null
        }
        
        if (rendererRef.current) {
          console.log('GameCanvas: 清理游戏渲染器...')
          rendererRef.current.destroy()
          rendererRef.current = null
          rendererInstance.current = null
        }
      } catch (error) {
        console.error('GameCanvas: 清理时出错', error)
      }
      
      console.log('GameCanvas: 清理完成')
    }
  }, []) // 空依赖数组，只运行一次

  // 当玩家位置更新时，更新摄像机
  useEffect(() => {
    if (rendererInstance.current && player) {
      rendererInstance.current.setCameraTarget(player.x, player.y)
      
      // 更新玩家精灵位置
      if (combatRendererRef.current) {
        combatRendererRef.current.updatePlayerPosition(player.x, player.y)
      }
    }
  }, [player?.x, player?.y])

  return (
    <div 
      ref={containerRef} 
      id="game-canvas"
      style={{ 
        width: '100%', 
        height: '100%',
        outline: 'none',
      }}
      tabIndex={0}
    />
  )
}
