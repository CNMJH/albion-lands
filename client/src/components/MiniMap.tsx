import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import './MiniMap.css'

/**
 * 小地图组件
 * 显示当前区域和玩家位置
 */
export function MiniMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 创建小地图应用
    const app = new PIXI.Application({
      width: 150,
      height: 150,
      backgroundColor: 0x16213e,
      resolution: window.devicePixelRatio,
    })

    containerRef.current.appendChild(app.view as HTMLCanvasElement)
    appRef.current = app

    // 绘制简单地图
    drawMap(app)

    return () => {
      app.destroy(true)
      appRef.current = null
    }
  }, [])

  const drawMap = (app: PIXI.Application) => {
    // 绘制区域边界
    const border = new PIXI.Graphics()
    border.lineStyle(2, 0x4a5568)
    border.drawRect(5, 5, 140, 140)
    app.stage.addChild(border)

    // 绘制玩家位置（中心）
    const player = new PIXI.Graphics()
    player.beginFill(0xe74c3c)
    player.drawCircle(75, 75, 5)
    player.endFill()
    app.stage.addChild(player)

    // 绘制一些标记点
    const markers = [
      { x: 50, y: 50, color: 0x3498db }, // NPC
      { x: 100, y: 50, color: 0x2ecc71 }, // 资源
      { x: 50, y: 100, color: 0xf39c12 }, // 传送点
      { x: 100, y: 100, color: 0x9b59b6 }, // 副本
    ]

    markers.forEach(marker => {
      const graphics = new PIXI.Graphics()
      graphics.beginFill(marker.color)
      graphics.drawRect(marker.x - 3, marker.y - 3, 6, 6)
      graphics.endFill()
      app.stage.addChild(graphics)
    })
  }

  return (
    <div className="minimap-container" ref={containerRef}>
      <div className="minimap-border">
        <div className="minimap-title">小地图</div>
      </div>
    </div>
  )
}
