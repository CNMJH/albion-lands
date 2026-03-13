import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { GameRenderer } from '../renderer/GameRenderer'
import { CombatRenderer } from './CombatRenderer'
import { AttackEffectRenderer } from './AttackEffectRenderer'
import { MinimapRenderer } from './MinimapRenderer'
import { MapSystem } from '../systems/MapSystem'
import { playerControls } from '../systems/PlayerControlsSystem'
import { DeathSystem } from '../systems/DeathSystem'
import { MarketSystem } from '../systems/MarketSystem'
import { TradeSystem } from '../systems/TradeSystem'
import './GameCanvas.css'

/**
 * 游戏画布组件
 * 负责初始化和运行 Pixi.js 渲染器
 */
export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<GameRenderer | null>(null)
  const combatRendererRef = useRef<CombatRenderer | null>(null)
  const playerControlsRef = useRef<ReturnType<typeof playerControls.init> | null>(null)
  const minimapRef = useRef<MinimapRenderer | null>(null)
  const deathSystemRef = useRef<DeathSystem | null>(null)
  const { player, characterId, setDeathSystem } = useGameStore()
  
  // 使用 useRef 存储渲染器，避免闭包问题
  const rendererInstance = useRef<GameRenderer | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      console.log('GameCanvas: 容器未就绪，跳过初始化')
      return
    }

    // 清理容器中旧的内容（React 严格模式会导致重复调用）
    containerRef.current.innerHTML = ''
    console.log('GameCanvas: 已清理容器内容')

    console.log('GameCanvas: 开始初始化渲染器...')

    // 创建游戏渲染器
    const renderer = new GameRenderer({
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio,
      backgroundColor: 0x2d5016, // 深绿色背景（确保能看到）
    })

    rendererRef.current = renderer
    rendererInstance.current = renderer

    // 初始化 Pixi 应用
    renderer.init(containerRef.current)

    // 自动 focus canvas 以接收键盘事件
    setTimeout(() => {
      const canvas = renderer.getApp()?.view as HTMLCanvasElement
      if (canvas) {
        canvas.focus()
        canvas.tabIndex = 0
        console.log('🎮 GameCanvas: Canvas 已 focus，可以接收键盘事件')
        
        // 添加点击事件，确保点击 Canvas 时获得焦点
        canvas.addEventListener('click', () => {
          canvas.focus()
          console.log('🖱️ Canvas 被点击，重新获得焦点')
        })
        
        // 测试键盘事件
        canvas.addEventListener('keydown', (e) => {
          console.log('⌨️ [Canvas 原生] 键盘按下:', e.code)
        })
      } else {
        console.error('❌ GameCanvas: 无法获取 Canvas 元素')
      }
    }, 100)

    // 初始化地图系统
    const mapSystem = new MapSystem(renderer)
    mapSystem.init().then(() => {
      console.log('GameCanvas: 地图系统初始化完成')
    })

    // 创建战斗渲染器
    const combatRenderer = new CombatRenderer(renderer)
    combatRendererRef.current = combatRenderer

    // 创建攻击效果渲染器（攻击反馈）
    new AttackEffectRenderer(renderer)
    console.log('⚔️ 攻击效果渲染器已创建')

    // 创建小地图渲染器
    const minimap = new MinimapRenderer()
    minimapRef.current = minimap
    console.log('🗺️ 小地图已创建')

    // 初始化死亡系统
    const deathSystem = new DeathSystem(renderer, characterId || 'unknown')
    deathSystemRef.current = deathSystem
    setDeathSystem(deathSystem)
    console.log('💀 死亡系统已创建 (characterId:', characterId + ')')

    // 初始化市场系统
    const marketSystem = new MarketSystem(characterId || 'unknown')
    useGameStore.getState().marketSystem = marketSystem
    console.log('🏪 市场系统已创建 (characterId:', characterId + ')')

    // 初始化交易系统
    const tradeSystem = new TradeSystem(characterId || 'unknown')
    useGameStore.getState().tradeSystem = tradeSystem
    console.log('🤝 交易系统已创建 (characterId:', characterId + ')')

    // 初始化玩家操作系统
    const controls = playerControls.init(renderer)
    playerControlsRef.current = controls

    // 创建玩家精灵（立即创建，不要延迟）
    console.log('GameCanvas: 准备创建玩家精灵...')
    const layer = renderer.getLayer('characters')
    console.log('GameCanvas: characters 图层存在吗？', !!layer)
    combatRenderer.createPlayerSprite()
    console.log('GameCanvas: 玩家精灵已创建')

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

    // 监听渲染器更新事件，处理玩家输入
    const handleUpdate = (deltaTime: number) => {
      if (playerControlsRef.current) {
        playerControlsRef.current.update(deltaTime)
      }
      if (combatRendererRef.current) {
        combatRendererRef.current.update(deltaTime)
      }
      if (minimapRef.current) {
        minimapRef.current.update()
      }
    }
    renderer.on('update', handleUpdate)

    // 监听交互事件，显示交互范围
    renderer.on('playerInteract', (data: any) => {
      if (combatRendererRef.current) {
        combatRendererRef.current.showInteractRange(data.x, data.y, data.range)
      }
    })

    // 监听技能释放事件，显示技能特效
    renderer.on('playerSkill', (data: any) => {
      if (combatRendererRef.current) {
        combatRendererRef.current.showSkillEffect(data.skillId, data.x, data.y)
        console.log(`✨ 技能特效：${data.skillId} at (${data.x.toFixed(0)}, ${data.y.toFixed(0)})`)
      }
    })

    console.log('GameCanvas: 初始化完成')

    // 清理函数
    return () => {
      console.log('GameCanvas: 清理函数被调用')
      
      // 先移除事件监听
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      
      // 移除渲染器更新监听
      if (rendererRef.current) {
        rendererRef.current.off('update', handleUpdate)
      }
      
      // 清理渲染器
      try {
        if (playerControlsRef.current) {
          console.log('GameCanvas: 清理玩家操作系统...')
          playerControlsRef.current = null
        }
        
        if (combatRendererRef.current) {
          console.log('GameCanvas: 清理战斗渲染器...')
          combatRendererRef.current.clear()
          combatRendererRef.current = null
        }
        
        if (minimapRef.current) {
          console.log('GameCanvas: 清理小地图...')
          minimapRef.current.destroy()
          minimapRef.current = null
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

  // 当玩家位置更新时，更新摄像机和旋转
  useEffect(() => {
    if (rendererInstance.current && player) {
      console.log('📍 玩家位置更新:', { x: player.x, y: player.y })
      
      rendererInstance.current.setCameraTarget(player.x, player.y)
      
      // 更新玩家精灵位置和旋转
      if (combatRendererRef.current) {
        combatRendererRef.current.updatePlayerPosition(player.x, player.y, player.rotation)
      }
    }
  }, [player?.x, player?.y, player?.rotation])

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
