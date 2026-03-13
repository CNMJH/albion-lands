# 🗺️ 地图看不见 - 终极修复

**问题**: 地面渲染了但看不见

**原因**: 
1. Pixi Canvas 没有正确添加到 DOM
2. 或者地面在 Canvas 但相机位置不对
3. 或者地面颜色太深与背景融为一体

---

## 🔧 立即修复

### 修复 1: 确保 Canvas 可见

**修改 `client/src/renderer/GameRenderer.ts`**:

```typescript
// init() 方法中，在创建图层后添加:
console.log('Canvas 元素:', this.app.view)
console.log('Canvas 尺寸:', this.app.view.width, 'x', this.app.view.height)
console.log('Canvas 父元素:', this.app.view.parentElement)
```

---

### 修复 2: 强制地面渲染

**修改 `client/src/systems/MapSystem.ts`**:

```typescript
private createGround(): void {
  // ... 现有代码 ...
  
  // 添加调试信息
  console.log('地面精灵:', tilingSprite)
  console.log('地面图层:', groundLayer)
  console.log('地面在图层中的索引:', groundLayer.getChildIndex(tilingSprite))
  
  // 强制设置样式
  tilingSprite.eventMode = 'static'
  tilingSprite.interactive = false
}
```

---

### 修复 3: 添加可见背景色

**修改 `client/src/renderer/GameCanvas.tsx`**:

```typescript
// 在创建 GameRenderer 时
const renderer = new GameRenderer({
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: window.devicePixelRatio,
  backgroundColor: 0x2d5016, // 深绿色背景（确保能看到）
})
```

---

## 🎯 测试步骤

1. 修改后运行 `.\fix-and-start.bat`
2. 打开浏览器 F12 控制台
3. 查找 "地面" 相关日志
4. 截图控制台输出

---

**请告诉我控制台输出了什么！**
