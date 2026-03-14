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
import { DebugOverlay } from '../components/DebugOverlay'
import './GameCanvas.css'

/**
 * 游戏画布组件
 */
export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<GameRenderer | null>(null)
  const rendererInstance = useRef<GameRenderer | null>(null)
  const combatRendererRef = useRef<CombatRenderer | null>(null)
  const minimapRef = useRef<MinimapRenderer | null>(null)
  const deathSystemRef = useRef<DeathSystem | null>(null)
  const playerControlsRef = useRef<ReturnType<typeof playerControls.init> | null>(null)

  const { player, characterId } = useGameStore()

  useEffect(() => {
    console.log('===== GameCanvas useEffect 开始 =====')
    
    if (!containerRef.current) {
      console.error('❌ GameCanvas: containerRef.current 为空')
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
      backgroundColor: 0x2d5016,
    })

    rendererRef.current = renderer
    rendererInstance.current = renderer

    // 初始化 Pixi 应用
    renderer.init(containerRef.current)
    
    console.log('✅ GameCanvas: renderer.init() 已完成')
    console.log('✅ GameCanvas: renderer.app =', (renderer as any).app)

    // 初始化地图系统
    const mapSystem = new MapSystem(renderer)
    mapSystem.init().then(() => {
      console.log('GameCanvas: 地图系统初始化完成')
    })

    // 创建战斗渲染器
    const combatRenderer = new CombatRenderer(renderer)
    combatRendererRef.current = combatRenderer

    // 创建攻击效果渲染器
    new AttackEffectRenderer(renderer)
    console.log('⚔️ 攻击效果渲染器已创建')

    // 创建小地图渲染器
    const minimap = new MinimapRenderer()
    minimapRef.current = minimap
    console.log('🗺️ 小地图已创建')

    // 初始化死亡系统
    const deathSystem = new DeathSystem(renderer, characterId || 'unknown')
    deathSystemRef.current = deathSystem
    console.log('💀 死亡系统已创建')

    // 初始化市场系统
    const marketSystem = new MarketSystem(characterId || 'unknown')
    useGameStore.getState().marketSystem = marketSystem
    console.log('🏪 市场系统已创建')

    // 初始化交易系统
    const tradeSystem = new TradeSystem(characterId || 'unknown')
    useGameStore.getState().tradeSystem = tradeSystem
    console.log('🤝 交易系统已创建')

    // 初始化玩家操作系统
    const controls = playerControls.init(renderer)
    playerControlsRef.current = controls

    // 创建玩家精灵
    console.log('GameCanvas: 准备创建玩家精灵...')
    combatRenderer.createPlayerSprite()
    console.log('GameCanvas: 玩家精灵已创建')

    // 启动游戏循环
    renderer.start()

    // 监听渲染器更新事件
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

    // 监听交互事件
    renderer.on('playerInteract', (data: any) => {
      if (combatRendererRef.current) {
        combatRendererRef.current.showInteractRange(data.x, data.y, data.range)
      }
    })

    // 监听技能释放事件
    const savedControls = playerControlsRef.current
    if (savedControls && (savedControls as any).combatSystem) {
      const combatSys = (savedControls as any).combatSystem
      combatSys.on('playerSkill', (data: any) => {
        if (combatRendererRef.current) {
          combatRendererRef.current.showSkillEffect(data.skillId, data.x, data.y)
          console.log(`✨ 技能特效：${data.skillId} at (${data.x.toFixed(0)}, ${data.y.toFixed(0)})`)
        }
      })
    }

    console.log('✅ GameCanvas: 初始化完成')

    // 清理函数
    return () => {
      console.log('===== GameCanvas useEffect 清理 =====')
      if (rendererRef.current) {
        rendererRef.current = null
      }
      if (playerControlsRef.current) {
        playerControlsRef.current = null
      }
    }
  }, [])

  // 监听玩家位置变化
  useEffect(() => {
    if (!player) return
    
    console.log('📍 玩家位置更新:', { x: player.x, y: player.y })
    
    if (rendererInstance.current) {
      rendererInstance.current.setCameraTarget(player.x, player.y)
    }
    
    if (combatRendererRef.current) {
      combatRendererRef.current.updatePlayerPosition(player.x, player.y, player.rotation)
    }
  }, [player?.x, player?.y, player?.rotation])

  return (
    <>
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
      <DebugOverlay />
    </>
  )
}
