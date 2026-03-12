import { useEffect, useState } from 'react'
import { GameCanvas } from './renderer/GameCanvas'
import { UIOverlay } from './components/UIOverlay'
import { GatheringUI } from './components/GatheringUI'
import { CraftingUI } from './components/CraftingUI'
import { QuestTracker } from './components/ui/QuestTracker'
import { QuestPanel } from './components/ui/QuestPanel'
import { AchievementPanel } from './components/ui/AchievementPanel'
import { useGameStore } from './stores/gameStore'
import { NetworkManager } from './network/NetworkManager'
import { combatSystem } from './systems/CombatSystem'
import { monsterAI } from './systems/MonsterAI'
import './App.css'
import './styles/quest-system.css'

// 游戏循环引用 (模块级别)
let gameLoopRef: number | undefined

function App() {
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const { initialize } = useGameStore()

  useEffect(() => {
    console.log('===== App useEffect 开始执行 =====')
    
    // 初始化游戏
    const initGame = async () => {
      console.log('App: 开始初始化游戏...')
      try {
        // 1. 初始化状态管理
        initialize()
        console.log('App: 状态管理初始化完成')
        setLoadingProgress(20)

        // 2. 初始化网络
        const network = NetworkManager.getInstance()
        console.log('App: 准备连接 WebSocket...')
        await network.connect('ws://localhost:3002/ws')
        console.log('App: 网络连接完成')
        setLoadingProgress(40)

        // 3. 加载资源配置
        console.log('App: 准备加载资源...')
        await loadResources()
        console.log('App: 资源加载完成')
        setLoadingProgress(80)

        // 4. 设置网络消息处理器
        console.log('App: 准备设置网络处理器...')
        setupNetworkHandlers()
        console.log('App: 网络处理器设置完成')
        
        // 5. 启动游戏循环
        console.log('App: 准备启动游戏循环...')
        startGameLoop()
        console.log('App: 游戏循环启动')
        setLoadingProgress(100)
        
        // 移除加载界面
        console.log('App: 准备移除加载界面，当前 loading=', true)
        console.log('App: 将在 100ms 后设置 loading=false')
        
        // 直接设置，不用 setTimeout
        setLoading(false)
        console.log('App: 已设置 loading=false')
      } catch (error) {
        console.error('游戏初始化失败:', error)
        alert('游戏加载失败，请刷新页面重试')
      }
    }

    initGame()

    // 清理
    return () => {
      console.log('===== App useEffect 清理函数被调用 =====')
      if (gameLoopRef) {
        cancelAnimationFrame(gameLoopRef)
      }
    }
  }, [])

  if (loading) {
    return (
      <div id="loading">
        <div className="loading-content">
          <h1>呼噜大陆</h1>
          <p className="loading-subtitle">Hulu Lands</p>
          <p>正在加载游戏资源...</p>
          <div className="loading-bar">
            <div 
              className="loading-progress" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="game-container">
      {/* 游戏渲染画布 */}
      <GameCanvas />
      
      {/* UI 覆盖层 */}
      <UIOverlay />
      
      {/* 采集 UI */}
      <GatheringUI />
      
      {/* 制造 UI */}
      <CraftingUI />
      
      {/* 任务系统 UI */}
      <QuestTracker />
      <QuestPanel />
      <AchievementPanel />
    </div>
  )
}

// 设置网络消息处理器
function setupNetworkHandlers() {
  const network = NetworkManager.getInstance()
  const { setPlayer, addMonster, removeMonster, addCombatLog, updatePlayerHP } = useGameStore.getState()
  
  console.log('setupNetworkHandlers: 开始设置网络处理器...')

  // 监听欢迎消息
  network.onMessage('welcome', (data) => {
    console.log('连接到服务器:', data)
  })

  // 监听玩家更新
  network.onMessage('playerUpdate', (data) => {
    console.log('玩家更新:', data)
    if (data.exp || data.silver) {
      addCombatLog(`获得 ${data.exp || 0} 经验，${data.silver || 0} 银币`)
    }
  })

  // 监听怪物列表
  network.onMessage('monsterList', (data) => {
    console.log('收到怪物列表:', data)
    if (data.monsters) {
      data.monsters.forEach((m: any) => {
        addMonster({
          id: m.id,
          templateId: m.templateId,
          name: m.name || '怪物',
          level: m.level || 1,
          hp: m.hp || 50,
          maxHp: m.maxHp || 50,
          x: m.x || 0,
          y: m.y || 0,
          zoneId: m.zoneId || 'zone_1',
        })
      })
    }
  })

  // 监听怪物死亡
  network.onMessage('monsterDeath', (data) => {
    console.log('怪物死亡:', data)
    removeMonster(data.monsterId)
    addCombatLog(`击败了 ${data.monsterId}, 获得 ${data.expGained} 经验`)
  })

  // 监听玩家 HP 更新
  network.onMessage('playerHP', (data) => {
    updatePlayerHP(data.hp)
  })

  console.log('setupNetworkHandlers: 网络处理器设置完成')

  // 模拟玩家数据（临时）- 延迟执行让渲染器先准备好
  setTimeout(() => {
    try {
      const playerData = {
        id: 'test-character-id',
        name: '测试角色',
        level: 10,
        exp: 1000,
        maxExp: 1500,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        x: 400,
        y: 300,
        zoneId: 'zone_1',
        isBot: false,
      }
      console.log('setupNetworkHandlers: 设置玩家数据', playerData)
      setPlayer(playerData)
      console.log('setupNetworkHandlers: 玩家数据设置完成')
    } catch (error) {
      console.error('setupNetworkHandlers: 设置玩家数据失败', error)
    }
  }, 2000)
}

// 启动游戏循环
function startGameLoop() {
  let lastTime = performance.now()

  const gameLoop = (currentTime: number) => {
    const deltaTime = (currentTime - lastTime) / 1000
    lastTime = currentTime

    // 更新战斗系统
    combatSystem.update(deltaTime)

    // 更新怪物 AI
    const state = useGameStore.getState()
    if (state.player) {
      monsterAI.update(deltaTime, { x: state.player.x, y: state.player.y })
    }

    gameLoopRef = requestAnimationFrame(gameLoop)
  }

  gameLoopRef = requestAnimationFrame(gameLoop)
}

// 模拟资源加载
async function loadResources() {
  console.log('loadResources: 开始加载资源...')
  // 简化处理：模拟加载延迟
  // 实际项目中应加载真实的游戏资源（图片、音频等）
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('loadResources: 资源加载完成')
}

export default App
