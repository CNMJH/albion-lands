# 🔧 角色无法移动 - 诊断与修复指南

**创建时间**: 2026-03-14  
**问题**: 角色无法移动  
**影响**: 核心玩法

---

## 📋 诊断步骤

### 步骤 1: 检查浏览器控制台

1. 打开游戏：http://localhost:3001
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签
4. 登录游戏
5. 查看是否有以下日志：

**正常情况应该看到**:
```
✅ 玩家操作系统初始化完成（LOL 风格）
📊 配置：{moveSpeed: 200, attackRange: 150, ...}
✅ gameRenderer 存在
🎮 玩家操作系统：开始设置输入监听...
🎮 玩家操作系统：输入监听设置完成（双模式）
```

**如果看到错误**:
```
❌ PlayerControlsSystem: gameRenderer 为 null!
```
→ 说明初始化顺序有问题

---

### 步骤 2: 检查 Canvas Focus

角色无法移动的**最常见原因**是 Canvas 没有获得焦点！

**检查方法**:
1. 游戏加载后，**点击游戏画面**（任意位置）
2. 查看浏览器控制台是否显示：
   ```
   🖱️ 鼠标点击：button=2
   🖱️ 右键点击 - 移动/攻击：{x: 400, y: 300}
   ```

3. 如果没有显示，说明 Canvas 没有接收到鼠标事件

**解决方法**:
```javascript
// 在浏览器控制台执行
const canvas = document.querySelector('canvas');
canvas.focus();
console.log('Canvas focused:', document.activeElement === canvas);
```

---

### 步骤 3: 检查玩家数据

移动需要玩家数据存在！

**在控制台执行**:
```javascript
const state = window.__GAME_STORE__;
console.log('Player:', state?.player);
console.log('Position:', state?.player?.x, state?.player?.y);
```

**如果显示 `undefined`**:
- 玩家数据未加载
- 检查登录状态
- 检查 WebSocket 连接

---

### 步骤 4: 检查网络请求

移动指令需要发送到服务端！

**在控制台执行**:
```javascript
// 检查 Network 标签
// 右键点击地面移动
// 查看是否有 'move' 类型的 WebSocket 消息
```

**正常情况**:
```json
{
  "type": "move",
  "data": {
    "dx": 100,
    "dy": 50,
    "targetX": 500,
    "targetY": 300,
    "timestamp": 1234567890
  }
}
```

---

### 步骤 5: 使用诊断工具

访问专用诊断页面：
```
http://localhost:3001/move-diagnose.html
```

**检查项目**:
- ✅ 浏览器环境
- ✅ LocalStorage
- ✅ WebSocket 支持
- ✅ Canvas 支持
- ✅ Canvas 事件监听
- ✅ 服务端连接
- ✅ WebSocket 连接

---

## 🛠️ 常见原因和解决方案

### 原因 1: Canvas 没有 Focus ⭐⭐⭐

**症状**: 点击地面无反应，控制台无日志

**解决**:
```javascript
// 方法 1: 手动 focus
const canvas = document.querySelector('canvas');
canvas.tabIndex = 1;
canvas.focus();

// 方法 2: 修改 GameCanvas.tsx
// 在 start() 后添加：
canvas.focus();
```

---

### 原因 2: 玩家数据未加载 ⭐⭐

**症状**: 控制台显示 `玩家数据不存在`

**解决**:
1. 确认已登录
2. 检查角色创建
3. 查看 WebSocket 连接状态

```javascript
// 在控制台检查
const store = useGameStore.getState();
console.log('Player:', store.player);
console.log('Character ID:', store.characterId);
```

---

### 原因 3: UI 遮挡 ⭐

**症状**: 点击地面但触发了其他 UI

**解决**:
1. 按 `Escape` 关闭所有 UI
2. 检查是否有透明遮罩层
3. 查看 z-index 设置

```css
/* 检查 GameCanvas 的 z-index */
.game-canvas {
  z-index: 1; /* 确保在最上层 */
}
```

---

### 原因 4: 输入监听器未绑定 ⭐⭐⭐

**症状**: 控制台没有显示输入监听日志

**解决**:
检查 PlayerControlsSystem 是否正确初始化

```javascript
// 在控制台检查
const controls = playerControls.getInstance();
console.log('Controls:', controls);
console.log('Input handlers:', controls?.keysPressed);
```

---

### 原因 5: 网络延迟/断线 ⭐

**症状**: 本地移动正常，但角色瞬移回原位

**解决**:
1. 检查服务端日志
2. 查看 WebSocket 连接
3. 验证移动同步逻辑

```javascript
// 检查网络延迟
const state = useGameStore.getState();
console.log('Network latency:', state.networkLatency);
```

---

## 🔍 深度诊断

### 检查输入监听器

```javascript
// 在控制台执行
const canvas = document.querySelector('canvas');
const listeners = getEventListeners(canvas);
console.log('Click listeners:', listeners.click);
console.log('Contextmenu listeners:', listeners.contextmenu);
console.log('Mousedown listeners:', listeners.mousedown);
```

**应该看到**:
- click: 1-2 个监听器
- contextmenu: 1 个监听器（阻止默认行为）
- mousedown: 可能有

---

### 检查移动状态

```javascript
// 在控制台执行
const controls = playerControls.getInstance();
console.log('Is moving:', controls?.isMoving);
console.log('Move target:', controls?.moveTarget);
console.log('Keys pressed:', controls?.keysPressed);
```

---

### 检查玩家位置更新

```javascript
// 在控制台执行
const store = useGameStore.getState();
console.log('Before move:', { x: store.player.x, y: store.player.y });

// 右键点击地面移动

// 1 秒后检查
setTimeout(() => {
  console.log('After move:', { x: store.player.x, y: store.player.y });
}, 1000);
```

---

## 📝 测试清单

### 基础测试
- [ ] Canvas 存在且可见
- [ ] Canvas 可以 focus（tabIndex >= 0）
- [ ] 点击 Canvas 有日志输出
- [ ] 玩家数据已加载
- [ ] WebSocket 已连接

### 移动测试
- [ ] 右键点击地面
- [ ] 控制台显示移动日志
- [ ] Network 显示 move 消息
- [ ] 角色向目标移动
- [ ] 移动时显示灰尘特效
- [ ] 移动时角色旋转

### 攻击测试
- [ ] 左键点击敌人
- [ ] 自动移动到攻击范围
- [ ] 执行攻击动画
- [ ] 显示攻击波纹

---

## 🎯 快速修复脚本

如果以上都无效，尝试这个**终极修复**：

```javascript
// 在浏览器控制台执行

// 1. 强制 focus Canvas
const canvas = document.querySelector('canvas');
canvas.tabIndex = 1;
canvas.focus();
canvas.style.outline = '2px solid #00ff88';
console.log('✅ Canvas 已强制 focus');

// 2. 检查玩家数据
const store = useGameStore.getState();
if (!store.player) {
  console.error('❌ 玩家数据不存在！');
} else {
  console.log('✅ 玩家数据存在:', store.player);
}

// 3. 检查控制系统
const controls = playerControls.getInstance();
if (!controls) {
  console.error('❌ 控制系统未初始化！');
} else {
  console.log('✅ 控制系统已初始化');
  console.log('配置:', controls.config);
}

// 4. 测试移动
console.log('🎯 测试移动...');
controls.sendMoveTo(store.player.x + 100, store.player.y + 100);

// 5. 监听移动事件
setTimeout(() => {
  console.log('📊 移动后位置:', store.player);
}, 1000);
```

---

## 📞 需要帮助？

请提供以下信息：

1. **浏览器控制台截图** (F12 → Console)
2. **Network 截图** (F12 → Network → WS)
3. **诊断工具结果** (http://localhost:3001/move-diagnose.html)
4. **游戏版本** (右下角或 F11 查看)
5. **浏览器版本** (Chrome/Firefox/Edge)

---

## 🔗 相关文档

- [玩家操作指南](docs/PLAYER_CONTROLS.md)
- [移动系统架构](docs/MOVEMENT_SYSTEM.md)
- [LOL 风格控制](docs/LOL_STYLE_CONTROLS.md)
- [故障排查指南](docs/TROUBLESHOOTING_WINDOWS.md)

---

**最后更新**: 2026-03-14  
**维护者**: 呼噜大陆开发团队
