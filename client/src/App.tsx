import { useEffect, useState } from 'react'
import { GameCanvas } from './renderer/GameCanvas'
import { UIOverlay } from './components/UIOverlay'
import { useGameStore } from './stores/gameStore'
import { NetworkManager } from './network/NetworkManager'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const { initialize } = useGameStore()

  useEffect(() => {
    // 初始化游戏
    const initGame = async () => {
      try {
        // 1. 初始化状态管理
        initialize()
        setLoadingProgress(20)

        // 2. 初始化网络
        const network = NetworkManager.getInstance()
        await network.connect('ws://localhost:4000/ws')
        setLoadingProgress(40)

        // 3. 加载资源配置
        await loadResources()
        setLoadingProgress(80)

        // 4. 启动游戏循环
        setLoadingProgress(100)
        
        // 延迟移除加载界面
        setTimeout(() => {
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('游戏初始化失败:', error)
        alert('游戏加载失败，请刷新页面重试')
      }
    }

    initGame()
  }, [])

  if (loading) {
    return (
      <div id="loading">
        <div className="loading-content">
          <h1>阿尔比恩大陆</h1>
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
    </div>
  )
}

// 模拟资源加载
async function loadResources() {
  // TODO: 实现真实的资源加载
  return new Promise(resolve => setTimeout(resolve, 1000))
}

export default App
