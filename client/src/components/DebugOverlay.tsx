import { useEffect, useRef, useState } from 'react'
import './DebugOverlay.css'

/**
 * 调试覆盖层 - 显示实时调试信息
 */
export function DebugOverlay() {
  const [logs, setLogs] = useState<string[]>([])
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 })
  const [canvasFocused, setCanvasFocused] = useState(false)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const addLogRef = useRef<(message: string) => void>(() => {})

  useEffect(() => {
    // 定义 addLog 函数
    const addLog = (message: string) => {
      setLogs(prev => {
        const newLogs = [...prev, message].slice(-50)
        return newLogs
      })
    }
    
    // 存储到 ref 供按钮使用
    addLogRef.current = addLog

    // 监听玩家位置更新
    const checkPlayer = setInterval(() => {
      const store = (window as any).__GAME_STORE__
      if (store?.player) {
        setPlayerPos({ x: store.player.x, y: store.player.y })
      }
    }, 100)

    // 监听 Canvas focus 状态
    const checkCanvas = setInterval(() => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        setCanvasFocused(document.activeElement === canvas)
      }
    }, 500)

    // 拦截 console.log
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    console.log = (...args) => {
      const message = args.join(' ')
      if (message.includes('🖱️') || message.includes('🎯') || 
          message.includes('⚔️') || message.includes('🚶') ||
          message.includes('❌') || message.includes('✅')) {
        addLog(message)
      }
      originalLog.apply(console, args)
    }

    console.warn = (...args) => {
      const message = '⚠️ ' + args.join(' ')
      addLog(message)
      originalWarn.apply(console, args)
    }

    console.error = (...args) => {
      const message = '❌ ' + args.join(' ')
      addLog(message)
      originalError.apply(console, args)
    }

    return () => {
      clearInterval(checkPlayer)
      clearInterval(checkCanvas)
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  // 自动滚动到最新日志
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="debug-overlay">
      <div className="debug-panel">
        <h3>🔧 调试信息</h3>
        
        <div className="debug-status">
          <div className="status-item">
            <span className="label">玩家位置:</span>
            <span className="value">({playerPos.x.toFixed(0)}, {playerPos.y.toFixed(0)})</span>
          </div>
          <div className="status-item">
            <span className="label">Canvas 焦点:</span>
            <span className={`value ${canvasFocused ? 'ok' : 'error'}`}>
              {canvasFocused ? '✅ 已聚焦' : '❌ 未聚焦'}
            </span>
          </div>
        </div>

        <div className="debug-actions">
          <button onClick={() => {
            const canvas = document.querySelector('canvas') as HTMLCanvasElement
            if (canvas) {
              canvas.tabIndex = 1
              canvas.focus()
              canvas.style.border = '3px solid #00ff88'
              addLogRef.current('✅ 手动聚焦 Canvas')
            }
          }}>
            聚焦 Canvas
          </button>
          <button onClick={() => {
            const store = (window as any).__GAME_STORE__
            if (store?.player) {
              addLogRef.current(`📍 玩家数据：${JSON.stringify(store.player)}`)
            } else {
              addLogRef.current('❌ 玩家数据不存在')
            }
          }}>
            检查玩家
          </button>
          <button onClick={() => setLogs([])}>
            清空日志
          </button>
        </div>

        <div className="debug-logs" ref={logContainerRef}>
          {logs.map((log, i) => (
            <div key={i} className={`log-entry ${
              log.includes('❌') ? 'error' : 
              log.includes('✅') ? 'success' : 
              log.includes('⚠️') ? 'warn' : ''
            }`}>
              <span className="log-time">{new Date().toLocaleTimeString()}</span>
              <span className="log-message">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
