import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { GameRenderer } from '../renderer/GameRenderer'
import { CombatRenderer } from './CombatRenderer'

/**
 * 游戏画布组件
 * 负责初始化和运行 Pixi.js 渲染器
 */
export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<GameRenderer | null>(null)
  const combatRendererRef = useRef<CombatRenderer | null>(null)
  const { player } = useGameStore()

  useEffect(() => {
    if (!containerRef.current) return

    // 创建游戏渲染器
    const renderer = new GameRenderer({
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio,
      backgroundColor: 0x1a1a2e,
    })

    rendererRef.current = renderer

    // 初始化 Pixi 应用
    renderer.init(containerRef.current)

    // 创建战斗渲染器
    const combatRenderer = new CombatRenderer(renderer)
    combatRendererRef.current = combatRenderer

    // 创建玩家精灵
    setTimeout(() => {
      combatRenderer.createPlayerSprite()
    }, 1000)

    // 处理窗口大小变化
    const handleResize = () => {
      renderer.resize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // 启动游戏循环
    renderer.start()

    // 清理
    return () => {
      console.log('GameCanvas: 清理组件...')
      
      window.removeEventListener('resize', handleResize)
      
      try {
        if (combatRendererRef.current) {
          combatRendererRef.current.clear()
          combatRendererRef.current = null
        }
        
        if (rendererRef.current) {
          rendererRef.current.destroy()
          rendererRef.current = null
        }
      } catch (error) {
        console.error('GameCanvas: 清理时出错', error)
      }
      
      console.log('GameCanvas: 清理完成')
    }
  }, [])

  // 当玩家位置更新时，更新摄像机
  useEffect(() => {
    if (rendererRef.current && player) {
      rendererRef.current.setCameraTarget(player.x, player.y)
      
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
