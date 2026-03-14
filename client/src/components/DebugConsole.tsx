import { useEffect, useState } from 'react'
import { debugConsole, getDebugConsole } from '../utils/debugConsole'
import './DebugConsole.css'

/**
 * 调试控制台组件
 * F12 打开/关闭
 */
export function DebugConsoleComponent() {
  const [visible, setVisible] = useState(false)
  const [logs, setLogs] = useState<Array<{ type: string; message: string; time: string }>>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    // F12 切换
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault()
        const newVisible = debugConsole.toggle()
        setVisible(newVisible)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // 监听日志更新
    const interval = setInterval(() => {
      setLogs([...getDebugConsole().getLogs()])
    }, 500)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearInterval(interval)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      debugConsole.executeCommand(input)
      setInput('')
      // 立即刷新日志
      setLogs([...getDebugConsole().getLogs()])
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return '#e74c3c'
      case 'warn': return '#f39c12'
      case 'success': return '#27ae60'
      default: return '#3498db'
    }
  }

  if (!visible) return null

  return (
    <div className="debug-console">
      <div className="debug-header">
        <span>🔧 调试控制台</span>
        <button onClick={() => {
          debugConsole.setVisible(false)
          setVisible(false)
        }}>
          ✕
        </button>
      </div>

      <div className="debug-logs">
        {logs.length === 0 ? (
          <div className="debug-empty">暂无日志</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`debug-log debug-log-${log.type}`}>
              <span className="debug-time">{log.time}</span>
              <span className="debug-message" style={{ color: getLogColor(log.type) }}>
                [{log.type.toUpperCase()}] {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      <form className="debug-input-form" onSubmit={handleSubmit}>
        <span className="debug-prompt">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入命令 (输入 help 查看可用命令)"
          className="debug-input"
          autoFocus
        />
      </form>

      <div className="debug-footer">
        <small>按 F12 隐藏/显示 | 输入 help 查看命令</small>
      </div>
    </div>
  )
}
