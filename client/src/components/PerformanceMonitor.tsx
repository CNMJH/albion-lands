import { useEffect, useState } from 'react'
import { performanceMonitor, type PerformanceMetrics } from '../utils/performanceMonitor'
import './PerformanceMonitor.css'

/**
 * 性能监控面板
 * 显示 FPS、内存、网络延迟等信息
 */
export function PerformanceMonitorPanel() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memory: { used: 0, total: 0, percent: 0 },
    network: { latency: 0, packetLoss: 0 },
    entities: { players: 0, monsters: 0, items: 0, total: 0 }
  })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // F11 切换显示
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault()
        setVisible((v) => !v)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    const unsubscribe = performanceMonitor.onMetricsUpdate((m: PerformanceMetrics) => {
      setMetrics(m)
    })

    performanceMonitor.start()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      unsubscribe()
    }
  }, [])

  if (!visible) return null

  const getFpsColor = (fps: number) => {
    if (fps >= 60) return '#27ae60'
    if (fps >= 30) return '#f39c12'
    return '#e74c3c'
  }

  const getLatencyColor = (latency: number) => {
    if (latency <= 50) return '#27ae60'
    if (latency <= 150) return '#f39c12'
    return '#e74c3c'
  }

  const getMemoryColor = (percent: number) => {
    if (percent <= 70) return '#27ae60'
    if (percent <= 90) return '#f39c12'
    return '#e74c3c'
  }

  return (
    <div className="performance-monitor">
      <div className="performance-header">
        <span>📊 性能监控</span>
        <button onClick={() => setVisible(false)} className="close-btn">
          ✕
        </button>
      </div>

      <div className="performance-content">
        {/* FPS */}
        <div className="perf-stat">
          <div className="perf-label">FPS</div>
          <div className="perf-value" style={{ color: getFpsColor(metrics.fps) }}>
            {metrics.fps}
          </div>
          <div className="perf-bar">
            <div
              className="perf-bar-fill"
              style={{
                width: `${Math.min(100, (metrics.fps / 60) * 100)}%`,
                backgroundColor: getFpsColor(metrics.fps)
              }}
            />
          </div>
        </div>

        {/* 帧时间 */}
        <div className="perf-stat">
          <div className="perf-label">帧时间</div>
          <div className="perf-value">{metrics.frameTime.toFixed(1)}ms</div>
          <div className="perf-bar">
            <div
              className="perf-bar-fill"
              style={{
                width: `${Math.min(100, (metrics.frameTime / 33.3) * 100)}%`,
                backgroundColor: metrics.frameTime <= 16.6 ? '#27ae60' : '#f39c12'
              }}
            />
          </div>
        </div>

        {/* 网络延迟 */}
        <div className="perf-stat">
          <div className="perf-label">延迟</div>
          <div className="perf-value" style={{ color: getLatencyColor(metrics.network.latency) }}>
            {metrics.network.latency}ms
          </div>
          <div className="perf-bar">
            <div
              className="perf-bar-fill"
              style={{
                width: `${Math.min(100, (metrics.network.latency / 200) * 100)}%`,
                backgroundColor: getLatencyColor(metrics.network.latency)
              }}
            />
          </div>
        </div>

        {/* 内存 */}
        <div className="perf-stat">
          <div className="perf-label">内存</div>
          <div className="perf-value" style={{ color: getMemoryColor(metrics.memory.percent) }}>
            {metrics.memory.used}MB
          </div>
          <div className="perf-sub">
            {metrics.memory.percent}%
          </div>
          <div className="perf-bar">
            <div
              className="perf-bar-fill"
              style={{
                width: `${metrics.memory.percent}%`,
                backgroundColor: getMemoryColor(metrics.memory.percent)
              }}
            />
          </div>
        </div>

        {/* 实体数量 */}
        <div className="perf-stat">
          <div className="perf-label">实体</div>
          <div className="perf-value">{metrics.entities.total}</div>
          <div className="perf-sub">
            玩家：{metrics.entities.players} | 怪物：{metrics.entities.monsters} | 物品：{metrics.entities.items}
          </div>
        </div>

        {/* 性能警告 */}
        {performanceMonitor.getPerformanceWarning() && (
          <div className="perf-warning">
            ⚠️ {performanceMonitor.getPerformanceWarning()}
          </div>
        )}
      </div>

      <div className="performance-footer">
        <small>按 F11 隐藏/显示</small>
      </div>
    </div>
  )
}
