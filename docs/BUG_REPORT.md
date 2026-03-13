# 🚨 呼噜大陆 - 问题报告与修复

**创建时间**: 2026-03-13  
**状态**: 紧急修复中

---

## ❗ 当前问题

用户反馈："问题很多，压根就完全没法玩"

---

## 🔍 已知问题清单

### P0 - 阻塞性问题

- [ ] **角色无法移动** - 右键点击无反应
- [ ] **地面贴图不可见** - 地图纯白或纯色
- [ ] **玩家数据未加载** - 登录后看不到角色
- [ ] **WebSocket 连接失败** - 无法与服务端通信

### P1 - 严重问题

- [ ] **输入监听失效** - 键盘/鼠标无响应
- [ ] **Canvas Focus 问题** - 无法接收键盘事件
- [ ] **玩家精灵不显示** - 画面中没有角色
- [ ] **UI 无法打开** - B/C/M 键无反应

### P2 - 一般问题

- [ ] **小地图不显示** - 左上角空白
- [ ] **技能栏不显示** - 底部空白
- [ ] **聊天框不显示** - 左下角空白
- [ ] **物品 Tooltip 缺失** - hover 无提示

---

## 🔧 快速修复方案

### 方案 1：一键修复（推荐）

```bash
cd /home/tenbox/albion-lands
./scripts/fix-all.bat
```

然后按照提示启动：

**命令行 1（服务端）**:
```bash
cd server
npm run dev
```

**命令行 2（客户端）**:
```bash
cd client
npm run dev
```

---

### 方案 2：手动修复

#### 步骤 1：清理缓存

```bash
# Windows
rmdir /s /q client\node_modules\.vite
rmdir /s /q client\dist
rmdir /s /q server\node_modules\.prisma

# Linux/Mac
rm -rf client/node_modules/.vite
rm -rf client/dist
rm -rf server/node_modules/.prisma
```

---

#### 步骤 2：重新安装

```bash
cd client
npm install

cd ../server
npm install
```

---

#### 步骤 3：重建

```bash
cd client
npm run build

cd ../server
npx prisma generate
```

---

#### 步骤 4：启动

**终端 1 - 服务端**:
```bash
cd server
npm run dev
```

应该看到：
```
✅ 服务器运行在 http://localhost:3002
✅ WebSocket 运行在 ws://localhost:3002/ws
✅ 数据库：server/prisma/dev.db
```

**终端 2 - 客户端**:
```bash
cd client
npm run dev
```

应该看到：
```
✅ Vite 运行在 http://localhost:3001
```

---

## 🧪 测试清单

### 登录测试

- [ ] 访问 http://localhost:3001
- [ ] 看到登录界面
- [ ] 输入 test1@example.com / password123
- [ ] 点击登录
- [ ] 进入游戏画面

**预期结果**:
- ✅ 看到游戏画面（深色背景 + 网格）
- ✅ 看到角色（中央）
- ✅ 看到 UI 按钮（右侧）
- ✅ 看到小地图（左上角）

---

### 移动测试

- [ ] 右键点击地面
- [ ] 角色移动到点击位置

**检查控制台**:
```
🖱️ [Canvas] 鼠标点击：button=2
🖱️ 右键点击 - 移动/攻击：{ x: 500, y: 300 }
📍 移动目标已发送
```

---

### UI 测试

- [ ] 按 B 键 - 打开背包
- [ ] 按 C 键 - 打开装备
- [ ] 按 M 键 - 打开拍卖行
- [ ] 按 Enter - 打开聊天
- [ ] 按 Escape - 关闭所有 UI

---

## 📋 诊断步骤

### 第 1 步：检查服务状态

```bash
# 检查服务端
curl http://localhost:3002/api/v1/health

# 应该返回：
# {"status": "ok", "timestamp": "..."}
```

**如果失败**:
- 服务端未启动
- 端口被占用
- 数据库错误

---

### 第 2 步：检查客户端

访问：http://localhost:3001

**按 F12 打开控制台**

应该看到：
```
GameCanvas: 开始初始化渲染器...
GameCanvas: 初始化完成
✅ 玩家操作系统初始化完成
🎮 GameCanvas: Canvas 已 focus
```

**如果没看到**:
- 客户端未启动
- 构建失败
- 代码错误

---

### 第 3 步：检查玩家数据

**在控制台中输入**:
```javascript
const state = useGameStore.getState();
console.log('玩家:', state.player);
console.log('登录:', state.isAuthenticated);
```

**正常输出**:
```
玩家：{ id: "...", name: "...", x: 3200, y: 3200 }
登录：true
```

**异常输出**:
```
玩家：null
登录：false
```
→ 需要重新登录

---

### 第 4 步：检查网络连接

**在控制台中输入**:
```javascript
console.log('WebSocket:', network.ws?.readyState);
```

**状态码**:
- `0` = 连接中 ❌
- `1` = 已连接 ✅
- `2` = 关闭中 ❌
- `3` = 已关闭 ❌

**如果是 3**:
- 服务端未启动
- WebSocket URL 错误
- 防火墙阻止

---

## 🐛 常见问题

### Q1: 白屏/黑屏

**原因**: 渲染器未初始化

**解决**:
```bash
# 清理缓存
rm -rf client/node_modules/.vite

# 重建
cd client && npm run build
```

---

### Q2: 按什么都没反应

**原因**: Canvas 没有 focus

**解决**:
1. 点击游戏画面
2. 或者在控制台输入：
```javascript
document.querySelector('canvas').focus();
```

---

### Q3: 登录失败

**原因**: 服务端未启动

**解决**:
```bash
cd server
npm run dev
```

---

### Q4: 角色不显示

**原因**: 玩家数据未加载

**检查**:
1. 确认已登录
2. 检查控制台错误
3. 查看网络请求（F12 → Network）

---

## 📞 报告问题

**请提供以下信息**:

1. **问题描述**: 发生了什么？
2. **复现步骤**: 怎么操作会出现问题？
3. **截图/日志**: F12 控制台输出
4. **环境信息**: 
   - 操作系统：Windows/Mac/Linux
   - 浏览器：Chrome/Firefox/Edge
   - 版本号

**示例**:
```
问题：角色无法移动
步骤：
1. 登录游戏
2. 右键点击地面
3. 角色不动

控制台输出:
🖱️ [Canvas] 鼠标点击：button=2
❌ 玩家数据不存在

环境:
- Windows 11
- Chrome 120
```

---

## ✅ 验收标准

游戏可以正常游玩，当：

- [ ] 可以登录
- [ ] 可以看到角色
- [ ] 可以移动（右键点击）
- [ ] 可以攻击（左键点击）
- [ ] 可以打开 UI（B/C/M 键）
- [ ] 可以看到小地图
- [ ] 可以聊天（Enter 键）

**全部通过才算修复完成！**

---

## 🎯 下一步

1. 运行 `./scripts/fix-all.bat`
2. 按照提示启动服务端和客户端
3. 测试登录和移动
4. 报告任何问题

---

**🔧 立即开始修复！**
