import { useEffect } from 'react'

/**
 * 性能监控工具
 * 监控 FPS、内存、网络延迟等性能指标
 */

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memory: {
    used: number
    total: number
    percent: number
  }
  network: {
    latency: number
    packetLoss: number
  }
  entities: {
    players: number
    monsters: number
    items: number
    total: number
  }
}

class PerformanceMonitor {
  private fps: number = 0
  private frameCount: number = 0
  private lastTime: number = performance.now()
  private frameTimes: number[] = []
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memory: { used: 0, total: 0, percent: 0 },
    network: { latency: 0, packetLoss: 0 },
    entities: { players: 0, monsters: 0, items: 0, total: 0 }
  }
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set()
  private animationFrameId: number | null = null
  private networkLatencies: number[] = []

  /**
   * 开始监控
   */
  start() {
    if (this.animationFrameId) return

    const measure = () => {
      const now = performance.now()
      const deltaTime = now - this.lastTime
      this.lastTime = now

      this.frameCount++
      this.frameTimes.push(deltaTime)

      // 保持最近 60 帧
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift()
      }

      // 每秒更新 FPS
      if (now - this.lastTime >= 1000) {
        this.fps = this.frameCount
        this.frameCount = 0
      }

      // 计算平均帧时间
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length

      // 获取内存信息
      const memory = this.getMemoryInfo()

      // 更新实体数量
      const entities = this.getEntityCount()

      // 更新指标
      this.metrics = {
        fps: this.fps,
        frameTime: avgFrameTime,
        memory,
        network: {
          latency: this.getAverageLatency(),
          packetLoss: 0
        },
        entities
      }

      // 通知监听器
      this.listeners.forEach((listener) => listener(this.metrics))

      this.animationFrameId = requestAnimationFrame(measure)
    }

    this.animationFrameId = requestAnimationFrame(measure)
  }

  /**
   * 停止监控
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * 获取内存信息
   */
  private getMemoryInfo(): PerformanceMetrics['memory'] {
    const performance = window.performance as any
    const memory = performance.memory

    if (memory) {
      const used = memory.usedJSHeapSize / 1048576 // MB
      const total = memory.totalJSHeapSize / 1048576 // MB
      return {
        used: Math.round(used * 100) / 100,
        total: Math.round(total * 100) / 100,
        percent: Math.round((used / total) * 100)
      }
    }

    return { used: 0, total: 0, percent: 0 }
  }

  /**
   * 获取实体数量
   */
  private getEntityCount(): PerformanceMetrics['entities'] {
    // 简化版本，返回 0
    // 实际实体数量需要从渲染系统获取
    return {
      players: 0,
      monsters: 0,
      items: 0,
      total: 0
    }
  }

  /**
   * 记录网络延迟
   */
  recordNetworkLatency(latency: number) {
    this.networkLatencies.push(latency)
    
    // 保持最近 20 次
    if (this.networkLatencies.length > 20) {
      this.networkLatencies.shift()
    }
  }

  /**
   * 获取平均延迟
   */
  private getAverageLatency(): number {
    if (this.networkLatencies.length === 0) return 0
    
    const avg = this.networkLatencies.reduce((a, b) => a + b, 0) / this.networkLatencies.length
    return Math.round(avg)
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    return this.metrics
  }

  /**
   * 注册监听器
   */
  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(callback)
    
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * 获取 FPS
   */
  getFPS(): number {
    return this.fps
  }

  /**
   * 获取帧时间
   */
  getFrameTime(): number {
    return this.metrics.frameTime
  }

  /**
   * 性能警告
   */
  getPerformanceWarning(): string | null {
    const { fps, frameTime, memory } = this.metrics

    if (fps < 30) {
      return `FPS 过低 (${fps})`
    }

    if (frameTime > 50) {
      return `帧时间过长 (${frameTime.toFixed(1)}ms)`
    }

    if (memory.percent > 90) {
      return `内存占用过高 (${memory.percent}%)`
    }

    return null
  }
}

// 单例
export const performanceMonitor = new PerformanceMonitor()

/**
 * React Hook - 使用性能指标
 */
export function usePerformanceMetrics() {
  // 简化版本，不集成到 gameStore
  // 组件可以直接使用 performanceMonitor.onMetricsUpdate
  
  useEffect(() => {
    performanceMonitor.start()

    return () => {
      performanceMonitor.stop()
    }
  }, [])
}

/**
 * 记录网络延迟
 */
export function recordNetworkLatency(latency: number) {
  performanceMonitor.recordNetworkLatency(latency)
}

/**
 * 获取性能指标
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return performanceMonitor.getMetrics()
}
