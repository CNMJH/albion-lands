# 移动问题调试指南

**问题：** WASD 移动不工作  
**时间：** 2026-03-12

---

## 已修复的问题

### 1. Canvas Focus 问题
**问题：** Canvas 没有自动 focus，键盘事件无法捕获  
**修复：** 
```typescript
// GameCanvas.tsx
setTimeout(() => {
  const canvas = renderer.getApp()?.view as HTMLCanvasElement
  if (canvas) {
    canvas.focus()
    console.log('GameCanvas: Canvas 已 focus')
  }
}, 100)
```

### 2. 双重输入监听
**问题：** 只依赖 Canvas 监听，如果 Canvas 失去 focus 就失效  
**修复：** 添加全局键盘监听作为备用
```typescript
// PlayerControlsSystem.ts
private setupInputHandlers(): void {
  // 方案 1：通过 GameRenderer 监听（canvas focus 时）
  this.setupGameRendererInput()
  
  // 方案 2：全局监听（备用方案）
  this.setupGlobalInput()
}
```

### 3. 玩家精灵创建延迟
**问题：** 玩家精灵 1 秒后才创建，导致看不到角色  
**修复：** 立即创建玩家精灵
```typescript
// GameCanvas.tsx
combatRenderer.createPlayerSprite() // 立即创建
```

### 4. 调试日志不足
**问题：** 无法追踪按键事件和移动逻辑  
**修复：** 添加详细日志
```typescript
console.log('⌨️ [Canvas] 键盘按下:', e.code)
console.log('⌨️ [Global] 键盘按下:', e.code)
console.log('🚶 移动输入:', { dx, dy, deltaTime })
console.log('📍 玩家位置更新:', { x: newX, y: newY })
```

---

## 测试步骤

### 1. 启动游戏
```bash
cd client
npm run dev
```

### 2. 打开浏览器控制台（F12）

### 3. 检查初始化日志
应该看到：
```
✅ 玩家操作系统初始化完成
🎮 玩家操作系统：开始设置输入监听...
🎮 玩家操作系统：输入监听设置完成（双模式）
GameCanvas: Canvas 已 focus，可以接收键盘事件
GameCanvas: 玩家精灵已创建
```

### 4. 测试 WASD 移动
按 W 键，应该看到：
```
⌨️ [Canvas] 键盘按下：KeyW
⌨️ [Global] 键盘按下：KeyW
🚶 移动输入：{ dx: 0, dy: -1, deltaTime: 0.016 }
📍 玩家位置更新：{ x: 0, y: -3.2 }
```

### 5. 检查玩家精灵
- 应该能看到一个蓝色圆形（玩家）
- 按 WASD 时应该移动

---

## 常见问题排查

### Q1: 按 WASD 没有任何日志
**原因：** 键盘事件没有被监听  
**解决：**
1. 检查控制台是否有 "输入监听设置完成" 日志
2. 尝试点击游戏窗口（确保 focus）
3. 检查是否有其他程序占用键盘

### Q2: 有日志但玩家不移动
**原因：** 玩家位置更新了但渲染没跟上  
**解决：**
1. 检查是否有 "📍 玩家位置更新" 日志
2. 检查玩家精灵是否创建（"玩家精灵已创建" 日志）
3. 检查是否有渲染错误

### Q3: 移动很卡顿
**原因：** 网络延迟或发送频率太高  
**解决：**
1. 检查网络状态
2. 调整 `moveSendInterval` 参数（默认 100ms）
3. 检查服务器日志

### Q4: 只能向一个方向移动
**原因：** 某个方向的按键监听失效  
**解决：**
1. 检查按键日志是否都正常
2. 检查 `keysPressed` Set 是否正确维护
3. 测试每个方向键

---

## 调试技巧

### 1. 实时查看玩家位置
```javascript
// 在浏览器控制台执行
setInterval(() => {
  const state = window.__GAME_STATE__
  if (state && state.player) {
    console.log('玩家位置:', state.player.x, state.player.y)
  }
}, 1000)
```

### 2. 手动触发移动
```javascript
// 在浏览器控制台执行
const controls = window.__PLAYER_CONTROLS__
if (controls) {
  controls.keysPressed.add('KeyW')
  console.log('模拟按 W 键')
}
```

### 3. 检查按键状态
```javascript
// 在浏览器控制台执行
const controls = window.__PLAYER_CONTROLS__
if (controls) {
  console.log('当前按下的键:', Array.from(controls.keysPressed))
}
```

---

## 预期行为

### 正常移动流程
1. 按 W 键
2. Canvas 和 Global 都收到事件
3. `keysPressed` 添加 'KeyW'
4. `handleMovement` 检测到移动输入
5. 计算移动增量
6. 更新本地玩家位置
7. 缓冲移动数据
8. 100ms 后发送到服务器
9. 玩家精灵移动到新位置
10. 摄像机跟随玩家

### 预期日志输出
```
GameCanvas: 开始初始化渲染器...
GameCanvas: Canvas 已 focus，可以接收键盘事件
✅ 玩家操作系统初始化完成
🎮 玩家操作系统：开始设置输入监听...
🎮 玩家操作系统：输入监听设置完成（双模式）
GameCanvas: 玩家精灵已创建
GameCanvas: 初始化完成
游戏循环启动

[按 W 键]
⌨️ [Canvas] 键盘按下：KeyW
⌨️ [Global] 键盘按下：KeyW
🚶 移动输入：{ dx: 0, dy: -1, deltaTime: 0.016666 }
📍 玩家位置更新：{ x: 0, y: -3.333 }
📍 玩家位置更新：0, -3.333

[持续按 W 键]
🚶 移动输入：{ dx: 0, dy: -1, deltaTime: 0.016666 }
📍 玩家位置更新：{ x: 0, y: -6.666 }
📍 玩家位置更新：0, -6.666
```

---

## 下一步优化

如果移动基本工作，继续优化：

### P0 - 必须修复
- [ ] 玩家精灵显示（蓝色圆形）
- [ ] 移动平滑（插值）
- [ ] 摄像机跟随
- [ ] 边界检测

### P1 - 应该优化
- [ ] 移动动画（行走动画）
- [ ] 移动音效
- [ ] 尘土效果
- [ ] 碰撞检测

### P2 - 可以改进
- [ ] 奔跑功能（Shift）
- [ ] 潜行功能（Ctrl）
- [ ] 跳跃功能（Space）
- [ ] 坐骑系统

---

## 相关文件

- `client/src/renderer/GameCanvas.tsx` - 游戏画布初始化
- `client/src/systems/PlayerControlsSystem.ts` - 玩家输入处理
- `client/src/renderer/CombatRenderer.ts` - 玩家精灵渲染
- `client/src/stores/gameStore.ts` - 玩家状态管理

---

**状态：** 🔧 调试中  
**下一步：** 测试验证移动功能
