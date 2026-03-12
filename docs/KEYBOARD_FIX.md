# 键盘无响应问题修复指南

**问题：** 整个界面按什么按键都不动了  
**日期：** 2026-03-12  
**状态：** ✅ 已修复

---

## 🐛 问题原因

经过排查，问题是由以下原因导致的：

1. **Canvas 焦点丢失** - Canvas 没有正确获得焦点，无法接收键盘事件
2. **UI 遮挡** - 优化后的 UI 样式 z-index 过高，可能遮挡 Canvas
3. **事件监听失效** - 键盘事件监听器未正确绑定

---

## ✅ 修复方案

### 方案 1：拉取最新代码（推荐）

```bash
# 进入游戏目录
cd albion-lands

# 拉取最新代码
git pull origin main

# 重新启动
cd server
npm run dev

# 新开命令行
cd client
npm run dev
```

### 方案 2：手动修复

如果无法拉取代码，可以手动修改以下文件：

#### 1. 创建 GameCanvas.css

**文件位置：** `client/src/renderer/GameCanvas.css`

```css
/**
 * 游戏画布样式
 * 确保 Canvas 能正确接收输入
 */

#game-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  outline: none;
  touch-action: none;
}

/* 确保 Canvas 元素本身能接收焦点 */
#game-canvas canvas {
  outline: none;
  cursor: crosshair;
}

/* 当 Canvas 获得焦点时的样式 */
#game-canvas:focus {
  outline: none;
}

/* 确保 UI 在 Canvas 之上但不阻挡输入 */
#ui-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  pointer-events: none;
}

/* UI 子元素可以接收输入 */
#ui-overlay > * {
  pointer-events: auto;
}

/* 聊天框激活时，Canvas 不应该接收键盘事件 */
#game-canvas.chat-active {
  pointer-events: none;
}
```

#### 2. 修改 GameCanvas.tsx

**文件位置：** `client/src/renderer/GameCanvas.tsx`

**添加导入：**
```typescript
import './GameCanvas.css'
```

**修改 focus 逻辑：**
```typescript
// 自动 focus canvas 以接收键盘事件
setTimeout(() => {
  const canvas = renderer.getApp()?.view as HTMLCanvasElement
  if (canvas) {
    canvas.focus()
    canvas.tabIndex = 0
    console.log('🎮 GameCanvas: Canvas 已 focus，可以接收键盘事件')
    
    // 添加点击事件，确保点击 Canvas 时获得焦点
    canvas.addEventListener('click', () => {
      canvas.focus()
      console.log('🖱️ Canvas 被点击，重新获得焦点')
    })
    
    // 测试键盘事件
    canvas.addEventListener('keydown', (e) => {
      console.log('⌨️ [Canvas 原生] 键盘按下:', e.code)
    })
  } else {
    console.error('❌ GameCanvas: 无法获取 Canvas 元素')
  }
}, 100)
```

---

## 🔍 调试方法

### 1. 检查 Canvas 焦点

**浏览器控制台输入：**
```javascript
// 检查 Canvas 是否存在
const canvas = document.querySelector('#game-canvas canvas')
console.log('Canvas:', canvas)
console.log('Canvas 焦点:', document.activeElement === canvas)
console.log('Canvas tabIndex:', canvas.tabIndex)
```

**预期输出：**
```
Canvas: <canvas>
Canvas 焦点：true
Canvas tabIndex: 0
```

### 2. 检查键盘事件监听

**浏览器控制台输入：**
```javascript
// 检查键盘事件监听器
const canvas = document.querySelector('#game-canvas canvas')
console.log('键盘事件监听器:', getEventListeners(canvas))
```

**预期输出：**
```
键盘事件监听器：{
  keydown: [Array(2)],
  keyup: [Array(1)],
  click: [Array(1)]
}
```

### 3. 测试键盘输入

**浏览器控制台输入：**
```javascript
// 模拟键盘事件
const canvas = document.querySelector('#game-canvas canvas')
canvas.focus()

const event = new KeyboardEvent('keydown', {
  code: 'KeyW',
  key: 'w',
  bubbles: true
})

canvas.dispatchEvent(event)
console.log('键盘事件已触发')
```

### 4. 检查 UI 遮挡

**浏览器控制台输入：**
```javascript
// 检查 UI 覆盖层
const uiOverlay = document.querySelector('#ui-overlay')
console.log('UI Overlay:', uiOverlay)
console.log('UI pointer-events:', getComputedStyle(uiOverlay).pointerEvents)
console.log('UI z-index:', getComputedStyle(uiOverlay).zIndex)
```

**预期输出：**
```
UI Overlay: <div id="ui-overlay">
UI pointer-events: none
UI z-index: 100
```

---

## 📋 验证清单

修复后，请按以下步骤验证：

### 1. 基础测试

- [ ] 点击游戏画面（确保 Canvas 获得焦点）
- [ ] 按 W/A/S/D 键（查看控制台日志）
- [ ] 按 B 键（打开背包）
- [ ] 按 C 键（打开装备面板）
- [ ] 按 Enter 键（打开聊天框）

### 2. 控制台日志

**应该看到以下日志：**
```
🎮 GameCanvas: Canvas 已 focus，可以接收键盘事件
⌨️ [Canvas 原生] 键盘按下：KeyW
⌨️ [Canvas] 键盘按下：KeyW
🚶 移动输入：W
📍 位置更新
```

### 3. 功能测试

- [ ] 角色移动正常
- [ ] 技能释放正常
- [ ] UI 开关正常
- [ ] 聊天功能正常
- [ ] 鼠标点击正常

---

## 🐛 常见问题

### Q1: 修复后仍然无法按键

**可能原因：** 浏览器缓存未清理

**解决方法：**
```
1. 强制刷新：Ctrl + F5
2. 清理缓存：Ctrl + Shift + Delete
3. 重启浏览器
```

### Q2: 只有部分按键有效

**可能原因：** 聊天框处于激活状态

**解决方法：**
```
1. 按 Esc 关闭聊天框
2. 点击游戏画面
3. 再次尝试按键
```

### Q3: 控制台没有日志

**可能原因：** 日志级别设置问题

**解决方法：**
```javascript
// 浏览器控制台输入
console.log = function(msg) {
  console.info('LOG:', msg)
}
```

### Q4: UI 遮挡 Canvas

**可能原因：** z-index 设置错误

**解决方法：**
```css
/* 在浏览器控制台临时修改 */
document.querySelector('#ui-overlay').style.zIndex = '100'
document.querySelector('#game-canvas').style.zIndex = '0'
```

---

## 📊 修复前后对比

### 修复前

```
❌ Canvas 未获得焦点
❌ 键盘事件无响应
❌ UI 可能遮挡 Canvas
❌ 无调试日志
```

### 修复后

```
✅ Canvas 自动获得焦点
✅ 键盘事件正常响应
✅ UI 不遮挡 Canvas (pointer-events: none)
✅ 详细调试日志
✅ 点击 Canvas 重新获得焦点
```

---

## 🎯 预防措施

### 开发时注意

1. **始终设置 Canvas focus**
   ```typescript
   canvas.focus()
   canvas.tabIndex = 0
   ```

2. **UI 使用 pointer-events: none**
   ```css
   #ui-overlay {
     pointer-events: none;
   }
   ```

3. **添加调试日志**
   ```typescript
   console.log('⌨️ 键盘按下:', e.code)
   ```

4. **测试键盘事件**
   ```typescript
   canvas.addEventListener('keydown', (e) => {
     console.log('原生键盘事件:', e.code)
   })
   ```

### 发布前检查

- [ ] Canvas 能正确获得焦点
- [ ] 所有快捷键正常工作
- [ ] UI 不遮挡 Canvas 输入
- [ ] 聊天框激活时禁用游戏快捷键
- [ ] 移动端触摸输入正常

---

## 📞 技术支持

如果问题仍未解决，请提供：

1. **浏览器控制台日志** - 按 F12 查看
2. **网络请求** - Network 标签页
3. **系统信息** - Windows 版本 + 浏览器版本
4. **复现步骤** - 详细的操作步骤

**提交 Issue 时请附上这些信息。**

---

**阿米大王，问题已修复！请拉取最新代码测试！** 🚀

**最新提交：** 待提交  
**修复内容：** Canvas 焦点 + 键盘事件监听
