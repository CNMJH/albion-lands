# 小地图功能文档 (Minimap)

**版本：** 1.0  
**创建日期：** 2026-03-12  
**实现文件：** `client/src/renderer/MinimapRenderer.ts`

---

## 📍 功能概述

小地图是 MMORPG 游戏中必不可少的 UI 元素，提供以下功能：

- **玩家位置显示** - 蓝色箭头指示玩家当前位置和朝向
- **怪物位置显示** - 红色圆点显示附近怪物
- **队友位置显示** - 绿色圆点显示队友位置
- **资源点显示** - 黄色圆点显示采集资源（可选）
- **点击移动** - 点击小地图快速移动（待实现）
- **视野范围** - 半透明圆圈显示玩家视野

---

## 🎨 视觉效果

```
┌─────────────────────────────────┐
│  🗺️ 小地图 (200x200px)          │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  深色背景 (#1a1a2e)         │ │
│ │  网格线 (#3a3a6e)           │ │
│ │                             │ │
│ │      🔴 怪物                │ │
│ │                             │ │
│ │         🟢 队友             │ │
│ │                             │ │
│ │    🔵→ 玩家 (带方向)        │ │
│ │                             │ │
│ │  ◯ 视野范围 (30px)          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

位置：右上角 (top: 10px, right: 10px)
边框：2px solid #333
圆角：4px
Z-Index: 1000
```

---

## ⚙️ 技术实现

### 1. 核心类结构

```typescript
export class MinimapRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private size: number = 200      // 小地图尺寸
  private scale: number = 0.05    // 缩放比例 (世界坐标 → 小地图坐标)
  
  // 显示配置
  private showPlayers: boolean = true
  private showMonsters: boolean = true
  private showResources: boolean = false
  
  // 方法
  constructor()
  render(): void
  update(): void
  toggleShowPlayers(): void
  toggleShowMonsters(): void
  toggleShowResources(): void
  destroy(): void
}
```

### 2. 坐标转换

```typescript
// 世界坐标 → 小地图坐标
const minimapX = worldX * scale
const minimapY = worldY * scale

// 缩放比例
scale = 0.05  // 6400px 世界 → 320px 小地图
```

### 3. 渲染流程

```
每帧更新 (update)
   ↓
清空画布 (clearRect)
   ↓
绘制背景 (深色矩形)
   ↓
绘制网格线 (横竖线)
   ↓
绘制边界 (红色边框)
   ↓
绘制玩家 (蓝色箭头 + 旋转)
   ↓
绘制怪物 (红色圆点，仅附近)
   ↓
绘制队友 (绿色圆点)
   ↓
绘制视野范围 (蓝色圆圈)
```

---

## 🎮 使用方法

### 1. 自动初始化

小地图在 `GameCanvas.tsx` 中自动创建：

```typescript
// GameCanvas.tsx
const minimap = new MinimapRenderer()
minimapRef.current = minimap

// 游戏循环中自动更新
const handleUpdate = (deltaTime: number) => {
  if (minimapRef.current) {
    minimapRef.current.update()
  }
}
renderer.on('update', handleUpdate)
```

### 2. 切换显示选项

```typescript
// 通过控制台命令切换
minimap.toggleShowPlayers()    // 切换玩家显示
minimap.toggleShowMonsters()   // 切换怪物显示
minimap.toggleShowResources()  // 切换资源显示
```

### 3. 清理

```typescript
// 组件卸载时自动清理
minimap.destroy()  // 移除 canvas 元素
```

---

## 📊 性能优化

### 1. 只渲染附近对象

```typescript
// 只绘制距离玩家 < 小地图半径的怪物
const dx = mx - playerX
const dy = my - playerY
const dist = Math.sqrt(dx * dx + dy * dy)

if (dist < this.size / 2) {
  // 绘制怪物
}
```

### 2. 简单图形

- 玩家：三角形 (6 个顶点)
- 怪物/队友：圆形 (arc)
- 网格：直线 (beginPath/lineTo)

### 3. Canvas 2D

使用原生 Canvas 2D API，无需额外库：
- 轻量级
- 高性能
- 支持旋转/缩放

---

## 🎨 样式配置

### 颜色方案

| 元素 | 颜色 | 说明 |
|------|------|------|
| 背景 | `rgba(26, 26, 46, 0.9)` | 深色半透明 |
| 网格线 | `rgba(58, 58, 110, 0.3)` | 淡紫色 |
| 边界 | `#ff4444` | 红色警告 |
| 玩家 | `#00BFFF` | 亮蓝色 |
| 怪物 | `#ff4444` | 红色危险 |
| 队友 | `#00ff00` | 绿色安全 |
| 视野 | `rgba(0, 191, 255, 0.2)` | 淡蓝色 |

### 尺寸配置

| 属性 | 值 | 说明 |
|------|-----|------|
| 小地图尺寸 | 200px | 正方形 |
| 缩放比例 | 0.05 | 世界坐标缩小 20 倍 |
| 玩家箭头 | 6px | 三角形大小 |
| 怪物/队友点 | 3px | 圆形半径 |
| 视野范围 | 30px | 圆形半径 |
| 边框粗细 | 2px | 红色边界 |

---

## 🔄 待实现功能

### 1. 点击移动

```typescript
// TODO: 点击小地图发送移动指令
this.canvas.addEventListener('click', (e) => {
  const worldX = (x / this.size) * 6400
  const worldY = (y / this.size) * 6400
  
  // 发送移动指令到服务端
  networkManager.send('move', { x: worldX, y: worldY })
})
```

### 2. 资源点显示

```typescript
// TODO: 显示附近资源点
if (this.showResources) {
  state.resources.forEach(resource => {
    // 绘制黄色圆点
  })
}
```

### 3. 标记系统

```typescript
// TODO: 玩家自定义标记
function addMarker(x: number, y: number, type: string) {
  // 添加标记到小地图
}
```

### 4. 地图边界检测

```typescript
// TODO: 显示安全区/危险区边界
function drawZoneBoundaries() {
  // 不同区域用不同颜色边框
}
```

### 5. 快捷键切换

```typescript
// TODO: M 键切换小地图显示
document.addEventListener('keydown', (e) => {
  if (e.key === 'M') {
    minimap.toggleVisible()
  }
})
```

---

## 🐛 已知问题

### 1. 性能问题

**问题：** 大量怪物时小地图可能卡顿  
**解决：** 限制显示最近 50 个怪物

### 2. 缩放适配

**问题：** 不同地图大小需要不同缩放比例  
**解决：** 根据地图大小动态计算 scale

### 3. 旋转同步

**问题：** 玩家旋转可能不同步  
**解决：** 监听 player.rotation 变化事件

---

## 📝 更新日志

### v1.0 (2026-03-12)

**新增功能：**
- ✅ 基础小地图渲染
- ✅ 玩家位置显示（带方向）
- ✅ 怪物位置显示
- ✅ 队友位置显示
- ✅ 视野范围显示
- ✅ 网格背景
- ✅ 点击移动（框架）

**技术实现：**
- ✅ Canvas 2D API
- ✅ Zustand 状态同步
- ✅ 每帧自动更新
- ✅ 组件清理

---

## 🎯 下一步

1. **点击移动** - 实现点击小地图移动功能
2. **资源显示** - 添加采集资源点显示
3. **标记系统** - 允许玩家添加自定义标记
4. **区域边界** - 显示安全区/危险区边界
5. **快捷键** - M 键切换小地图显示/隐藏
6. **小地图设置** - 允许玩家自定义颜色/大小

---

## 📚 相关文件

| 文件 | 说明 |
|------|------|
| `client/src/renderer/MinimapRenderer.ts` | 小地图渲染器 |
| `client/src/renderer/GameCanvas.tsx` | 游戏画布（集成小地图） |
| `client/src/stores/gameStore.ts` | 游戏状态（玩家/怪物位置） |
| `docs/LOL_CONTROLS.md` | 控制系统文档 |

---

**实现状态：** ✅ 基础功能完成 (70%)  
**下一步：** 点击移动 + 资源显示
