# 🎮 角色无法移动 - 快速修复指南

**问题**: 右键点击地面，角色不移动  
**最常见原因**: Canvas 没有获得焦点

---

## ⚡ 30 秒快速修复

### 方法 1: 点击游戏画面

1. 打开游戏：http://localhost:3001
2. **用鼠标左键点击游戏画面**（任意位置）
3. 右键点击地面移动

**原理**: 点击游戏画面会让 Canvas 获得焦点

---

### 方法 2: 按 F12 检查日志

1. 按 `F12` 打开开发者工具
2. 切换到 **Console** 标签
3. 右键点击地面
4. 查看是否有日志：

**正常日志**:
```
🖱️ 右键点击 - 移动/攻击：{x: 400, y: 300}
🎯 玩家移动到 (400, 300)
📍 移动目标已发送：target=(400, 300), distance=100
```

**如果没有日志**:
→ Canvas 没有接收到鼠标事件
→ 继续方法 3

---

### 方法 3: 在控制台执行修复代码

1. 按 `F12` 打开开发者工具
2. 切换到 **Console** 标签
3. 复制粘贴以下代码，按 Enter：

```javascript
const canvas = document.querySelector('canvas');
canvas.tabIndex = 1;
canvas.focus();
canvas.style.border = '3px solid #00ff88';
console.log('✅ Canvas 已强制 focus - 现在试试右键点击地面移动！');
```

4. 现在右键点击地面，应该可以移动了！

---

## 🔍 如果还是不行

### 检查 1: 玩家数据是否存在

在控制台执行：
```javascript
const store = window.__GAME_STORE__ || {};
console.log('玩家数据:', store.player);
```

**如果显示 `undefined`**:
- 你还没有登录
- 或者角色数据加载失败
- 请先登录游戏

---

### 检查 2: WebSocket 连接

在控制台执行：
```javascript
console.log('WebSocket 状态:', navigator.onLine ? '在线' : '离线');
```

**如果显示 `离线`**:
- 检查网络连接
- 确认服务端已启动：http://localhost:3002/health

---

### 检查 3: 使用诊断工具

访问：http://localhost:3001/move-diagnose.html

点击所有测试按钮，查看结果。

---

## 📋 完整测试流程

1. **启动游戏**
   ```powershell
   .\start.bat
   ```

2. **登录游戏**
   - 邮箱：test1@example.com
   - 密码：password123

3. **打开控制台** (F12)

4. **点击游戏画面** (让 Canvas 获得焦点)

5. **右键点击地面**

6. **查看控制台日志**:
   ```
   🖱️ 右键点击 - 移动/攻击：{x: ..., y: ...}
   🎯 玩家移动到 (...)
   ```

7. **观察角色** - 应该向目标移动

---

## 🎯 预期行为

### 成功移动的标志:

1. ✅ 控制台显示移动日志
2. ✅ Network 标签显示 WebSocket 消息
3. ✅ 角色向目标位置移动
4. ✅ 移动时脚下有灰尘特效
5. ✅ 角色面向移动方向

---

## ❌ 常见错误

### 错误 1: 点击地面无反应

**原因**: Canvas 没有焦点  
**解决**: 先左键点击游戏画面

### 错误 2: 控制台显示 "玩家数据不存在"

**原因**: 未登录或登录失败  
**解决**: 重新登录

### 错误 3: 移动但角色不动

**原因**: 网络延迟或服务端问题  
**解决**: 检查服务端日志

---

## 📞 需要帮助？

请提供以下截图：

1. **浏览器控制台** (F12 → Console)
2. **Network 标签** (F12 → Network)
3. **游戏画面** (显示角色位置)

---

**快速测试**: http://localhost:3001/move-diagnose.html  
**完整文档**: docs/MOVE_ISSUE_DIAGNOSIS.md
