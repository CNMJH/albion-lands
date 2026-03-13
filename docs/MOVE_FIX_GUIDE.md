# 🔧 角色无法移动 - 快速诊断指南

**最后更新**: 2026-03-13  
**状态**: 诊断中

---

## 🚨 问题描述

用户反馈："按什么都没反应"，角色无法移动。

---

## 🔍 快速诊断（3 分钟）

### 第一步：启动游戏并打开控制台

```bash
# 1. 启动游戏
.\launcher.bat

# 2. 打开浏览器访问
http://localhost:3001

# 3. 按 F12 打开开发者工具
# 4. 切换到 Console 标签
```

---

### 第二步：检查关键日志

**游戏启动后，你应该看到以下日志**：

```
✅ 玩家操作系统初始化完成（LOL 风格）
📊 配置：{ moveSpeed: 200, attackRange: 150, ... }
✅ gameRenderer 存在
🎮 玩家操作系统：开始设置输入监听...
🎮 玩家操作系统：输入监听设置完成（双模式）
🎮 GameCanvas: Canvas 已 focus，可以接收键盘事件
```

**❌ 如果没看到这些日志** → PlayerControlsSystem 未初始化

---

### 第三步：测试右键点击

**右键点击游戏画面**，观察控制台：

```
✅ 正常输出:
🖱️ 右键点击：{ x: 500, y: 300 }
📊 当前玩家数据：{ id: "...", name: "...", x: 3200, y: 3200 }
📍 玩家当前位置：{ x: 3200, y: 3200 }
🚶 点击地面，移动到：{ x: 500, y: 300 }
📍 sendMoveTo 调用：{ x: 500, y: 300 }
📊 玩家数据：✅ 存在
🎯 玩家移动到 (500, 300)
📍 当前位置：{ x: 3200, y: 3200 }
📏 移动距离：1300 px
✅ 设置移动状态：{ isMoving: true, target: { x: 500, y: 300 } }
📍 移动目标已发送：target=(500, 300), distance=1300
```

**❌ 如果没有任何日志** → 输入监听未设置

**❌ 如果只有 "右键点击" 没有后续** → 玩家数据问题

---

### 第四步：检查玩家数据

**在控制台中输入**:

```javascript
const state = useGameStore.getState();
console.log('玩家:', state.player);
console.log('位置:', state.player?.x, state.player?.y);
```

**✅ 正常输出**:
```
玩家：{ id: "xxx", name: "测试玩家", x: 3200, y: 3200, ... }
位置：3200 3200
```

**❌ 异常输出**:
```
玩家：null
位置：undefined undefined
```
→ 玩家未登录或数据未加载

---

## 🛠️ 解决方案

### 方案 1：运行诊断工具

**访问诊断页面**:
```
http://localhost:3001/diagnose.html
```

按顺序点击按钮，生成诊断报告。

---

### 方案 2：运行修复脚本

```bash
cd /home/tenbox/albion-lands
./scripts/fix-move.bat
```

脚本会：
1. 清理缓存
2. 重新安装依赖
3. 重建项目

---

### 方案 3：手动修复

#### 检查 1：Canvas Focus

**在控制台中输入**:
```javascript
const canvas = document.querySelector('canvas');
if (canvas) {
  canvas.tabIndex = 0;
  canvas.focus();
  console.log('✅ Canvas 已 focus');
}
```

---

#### 检查 2：玩家数据

**在控制台中输入**:
```javascript
// 检查是否已登录
const state = useGameStore.getState();
console.log('登录状态:', state.isAuthenticated);
console.log('玩家:', state.player);
```

如果玩家是 null：
1. 确认已登录
2. 检查登录 API 是否成功
3. 查看网络请求（F12 → Network）

---

#### 检查 3：WebSocket 连接

**在控制台中输入**:
```javascript
console.log('WebSocket:', network.ws?.readyState);
// 1 = OPEN ✅
// 3 = CLOSED ❌
```

如果连接关闭：
1. 检查服务器是否运行
2. 查看 `server/.env` 配置
3. 重启服务器

---

## 📋 常见问题

### Q1: 按键盘没反应

**原因**: Canvas 没有 focus

**解决**:
```javascript
// 在控制台中输入
document.querySelector('canvas').focus();
```

---

### Q2: 右键点击没反应

**原因**: 输入监听未设置

**检查**:
1. 控制台有 "输入监听设置完成" 吗？
2. PlayerControlsSystem 初始化了吗？

---

### Q3: 有日志但角色不动

**原因**: 渲染问题或网络问题

**检查**:
```javascript
// 检查移动状态
console.log('isMoving:', playerControlsRef.current?.isMoving);
console.log('moveTarget:', playerControlsRef.current?.moveTarget);

// 检查网络
console.log('WebSocket:', network.ws?.readyState);
```

---

### Q4: 玩家数据是 null

**原因**: 未登录或登录失败

**解决**:
1. 确认已登录
2. 检查登录 API 响应
3. 查看浏览器控制台错误

---

## 📊 诊断清单

请按顺序检查：

- [ ] 游戏启动成功（看到登录界面）
- [ ] 成功登录（进入游戏画面）
- [ ] 控制台有 "玩家操作系统初始化完成"
- [ ] 控制台有 "Canvas 已 focus"
- [ ] 右键点击有 "右键点击" 日志
- [ ] 玩家数据存在（不是 null）
- [ ] WebSocket 连接正常（readyState = 1）
- [ ] 有 "移动目标已发送" 日志

**哪一步失败了，问题就在那里！**

---

## 🎯 下一步

**请告诉我**:

1. **哪一步失败了？**（复制上面的清单）
2. **控制台输出了什么？**（复制粘贴）
3. **玩家数据是什么？**（null 还是有数据）
4. **WebSocket 状态是什么？**（0/1/2/3）

**这样我可以准确定位问题！**

---

## 📞 联系开发者

如果以上方法都不行，请提供：

1. 控制台完整日志
2. 诊断工具报告（http://localhost:3001/diagnose.html）
3. 网络请求截图（F12 → Network）

---

**🔧 现在请开始诊断，并告诉我结果！**
