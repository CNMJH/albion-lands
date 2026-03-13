# 🎮 角色移动问题诊断指南

**请按顺序执行以下步骤，并告诉我结果**

---

## 🔍 第一步：打开浏览器控制台

1. 启动游戏
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签

---

## 📋 第二步：检查关键日志

**游戏启动后，你应该看到以下日志**：

### ✅ 正常情况
```
🎮 玩家操作系统初始化完成（LOL 风格）
🎮 玩家操作系统：开始设置输入监听...
🎮 玩家操作系统：输入监听设置完成（双模式）
🎮 GameCanvas: Canvas 已 focus，可以接收键盘事件
✅ 玩家精灵已创建
🗺️ MapSystem: 地图初始化完成
```

### ❌ 异常情况

**如果没有看到 "玩家操作系统初始化完成"**:
```
→ PlayerControlsSystem 未初始化
→ 检查 GameCanvas.tsx 中是否创建了 PlayerControlsSystem
```

**如果没有看到 "Canvas 已 focus"**:
```
→ Canvas 没有获得焦点
→ 点击游戏画面试试
```

---

## 🖱️ 第三步：测试右键点击

**在控制台中输入**:
```javascript
console.log('测试：右键点击监听');
```

**然后右键点击游戏画面**

### ✅ 正常情况
```
🖱️ 右键点击：{ x: 100, y: 200 }
🚶 点击地面，移动到：{ x: 100, y: 200 }
🚶 移动中：{ x: 3210, y: 3210, angle: 45°, distance: 100 }
📍 移动已发送：dx=10.0, dy=10.0
```

### ❌ 异常情况

**如果没有任何日志**:
```
→ 鼠标事件未监听
→ 可能原因：
  1. Canvas 没有 focus
  2. GameRenderer 事件未转发
  3. PlayerControlsSystem 未初始化
```

**如果只有 "右键点击" 没有 "移动中"**:
```
→ 移动逻辑有问题
→ 检查玩家数据是否存在
```

---

## ⌨️ 第四步：测试键盘

**按 W/A/S/D 键**

### ✅ 正常情况
```
⌨️ [Global] 键盘按下：KeyW
🚶 移动中：{ x: 3210, y: 3210, ... }
```

### ❌ 异常情况

**如果没有任何日志**:
```
→ 键盘事件未监听
→ 检查 PlayerControlsSystem.setupGlobalInput()
```

---

## 📊 第五步：检查玩家数据

**在控制台中输入**:
```javascript
const state = useGameStore.getState();
console.log('玩家数据:', state.player);
console.log('玩家位置:', state.player?.x, state.player?.y);
```

### ✅ 正常情况
```
玩家数据：{
  id: "xxx",
  name: "测试玩家",
  x: 3200,
  y: 3200,
  ...
}
玩家位置：3200 3200
```

### ❌ 异常情况

**如果 player 是 null**:
```
→ 玩家数据未加载
→ 检查登录状态
```

**如果 x/y 是 undefined**:
```
→ 玩家位置数据缺失
→ 检查服务端返回的数据
```

---

## 🎯 第六步：检查移动更新

**在控制台中输入**:
```javascript
// 检查 PlayerControlsSystem 是否存在
console.log('Controls:', playerControlsRef.current);
console.log('isMoving:', playerControlsRef.current?.isMoving);
console.log('moveTarget:', playerControlsRef.current?.moveTarget);
```

### ✅ 正常情况
```
Controls: PlayerControlsSystem {...}
isMoving: true/false
moveTarget: { x: 100, y: 200 }
```

### ❌ 异常情况

**如果 Controls 是 undefined**:
```
→ PlayerControlsSystem 未正确创建
→ 检查 GameCanvas.tsx 中的初始化
```

---

## 🔧 快速修复尝试

### 修复 1：强制 Canvas Focus

**在控制台中输入**:
```javascript
const canvas = document.querySelector('canvas');
if (canvas) {
  canvas.focus();
  canvas.tabIndex = 0;
  console.log('✅ Canvas 已强制 focus');
}
```

---

### 修复 2：手动触发移动

**在控制台中输入**:
```javascript
// 模拟右键点击
const state = useGameStore.getState();
if (state.player) {
  const newX = state.player.x + 100;
  const newY = state.player.y + 100;
  
  state.updatePlayer({ x: newX, y: newY });
  console.log('✅ 手动移动玩家到:', newX, newY);
}
```

---

### 修复 3：检查网络发送

**在控制台中输入**:
```javascript
// 检查 NetworkManager
console.log('Network:', network);
console.log('WebSocket 状态:', network.ws?.readyState);
```

**WebSocket 状态**:
- `0` = CONNECTING
- `1` = OPEN ✅
- `2` = CLOSING
- `3` = CLOSED ❌

---

## 📝 请告诉我

**执行完以上步骤后，请告诉我**:

1. **看到了哪些日志？**（复制粘贴控制台输出）
2. **右键点击有反应吗？**（有/没有日志）
3. **键盘有反应吗？**（有/没有日志）
4. **玩家数据存在吗？**（null/有数据）
5. **Canvas focus 了吗？**（是/否）

**这样我可以准确定位问题！**

---

## 🐛 已知问题

### 问题 1：Canvas 没有 tabIndex

**症状**: 键盘事件不触发

**修复**:
```javascript
// 在 GameCanvas.tsx 中
canvas.tabIndex = 0
```

---

### 问题 2：右键菜单阻止失败

**症状**: 右键点击弹出菜单

**修复**:
```css
/* 在 CSS 中添加 */
canvas {
  touch-action: none;
}
```

---

### 问题 3：玩家数据未同步

**症状**: 本地移动了，但服务端没收到

**修复**:
```javascript
// 检查 network.send() 是否调用
console.log('发送移动:', network.send);
```

---

**🎯 现在请执行诊断步骤，并告诉我结果！**
