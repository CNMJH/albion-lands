# 🚨 呼噜大陆 - 紧急修复指南

**创建时间**: 2026-03-13  
**优先级**: P0 - 紧急

---

## ❗ 问题现状

用户反馈："问题很多，压根就完全没法玩"

**可能的问题**:
1. 角色无法移动
2. 地面不可见
3. UI 不显示
4. 登录失败
5. 连接断开

---

## 🚀 5 分钟快速修复

### 步骤 1：运行健康检查

```bash
cd /home/tenbox/albion-lands
./scripts/health-check.bat
```

查看哪些项是 ❌，按提示修复。

---

### 步骤 2：一键修复所有

```bash
./scripts/fix-all.bat
```

这会：
- 停止旧进程
- 清理缓存
- 重新安装依赖
- 重建项目
- 初始化数据库

**耗时**: 约 5-10 分钟

---

### 步骤 3：快速启动

```bash
./start.bat
```

这会：
- 启动服务端（端口 3002）
- 启动客户端（端口 3001）
- 自动打开浏览器

**等待**: 约 10-20 秒

---

### 步骤 4：测试游戏

1. **访问**: http://localhost:3001
2. **登录**: test1@example.com / password123
3. **测试移动**: 右键点击地面
4. **测试 UI**: 按 B 键打开背包

---

## 🔍 详细诊断

### 问题 1：角色无法移动

**症状**: 右键点击没反应

**诊断**:
```bash
# 1. 打开浏览器控制台（F12）
# 2. 右键点击游戏画面
# 3. 查看控制台输出
```

**期望输出**:
```
🖱️ [Canvas] 鼠标点击：button=2
🖱️ 右键点击 - 移动/攻击：{ x: 500, y: 300 }
📍 移动目标已发送
```

**如果没有输出**:
```javascript
// 在控制台中输入
document.querySelector('canvas').focus();
```

**如果还是不行**:
```bash
# 访问诊断工具
http://localhost:3001/diagnose.html
```

---

### 问题 2：地面不可见

**症状**: 画面纯白或纯色

**诊断**:
```bash
# 检查控制台
F12 → Console
```

**期望日志**:
```
🗺️ MapSystem: 地图初始化完成
```

**修复**:
```bash
# 检查素材文件
ls client/public/tiles/
# 应该有：dirt_1.png 等
```

---

### 问题 3：UI 不显示

**症状**: 按 B/C/M 没反应

**诊断**:
```bash
# 检查控制台错误
F12 → Console
```

**修复**:
```bash
# 重建客户端
cd client
npm run build
```

---

### 问题 4：登录失败

**症状**: 点击登录没反应或报错

**诊断**:
```bash
# 检查服务端
curl http://localhost:3002/api/v1/health
# 应该返回：{"status": "ok"}
```

**如果没有响应**:
```bash
# 重启服务端
cd server
npm run dev
```

---

### 问题 5：连接断开

**症状**: 游戏画面卡住

**诊断**:
```javascript
// 在控制台中输入
console.log('WebSocket:', network.ws?.readyState);
// 1 = 已连接 ✅
// 3 = 已断开 ❌
```

**如果断开**:
```bash
# 重启服务端
cd server
npm run dev
```

---

## 📋 完整测试清单

### 启动测试

- [ ] 运行 `./start.bat`
- [ ] 看到两个命令行窗口（服务端 + 客户端）
- [ ] 浏览器自动打开 http://localhost:3001

**服务端输出**:
```
✅ 服务器运行在 http://localhost:3002
✅ WebSocket 运行在 ws://localhost:3002/ws
```

**客户端输出**:
```
✅ Vite 运行在 http://localhost:3001
```

---

### 登录测试

- [ ] 看到登录界面
- [ ] 输入 test1@example.com
- [ ] 输入 password123
- [ ] 点击登录
- [ ] 进入游戏画面

**期望画面**:
- ✅ 深色背景（#1a1a2e）
- ✅ 网格地面
- ✅ 角色在中央
- ✅ UI 按钮在右侧

---

### 移动测试

- [ ] 右键点击地面
- [ ] 角色移动
- [ ] 控制台有日志

**控制台日志**:
```
🖱️ 右键点击：{ x: ..., y: ... }
📍 移动目标已发送
```

---

### UI 测试

- [ ] 按 B - 背包打开
- [ ] 按 C - 装备打开
- [ ] 按 M - 拍卖行打开
- [ ] 按 Enter - 聊天打开
- [ ] 按 Escape - 全部关闭

---

## 🐛 常见错误

### 错误 1：端口被占用

```
Error: listen EADDRINUSE: address already in use :::3002
```

**修复**:
```bash
# Windows
netstat -ano | findstr :3002
taskkill /F /PID <PID>

# Linux/Mac
lsof -i :3002
kill -9 <PID>
```

---

### 错误 2：数据库不存在

```
Error: Can't find database
```

**修复**:
```bash
cd server
npx prisma migrate dev
```

---

### 错误 3：依赖缺失

```
Error: Cannot find module 'xxx'
```

**修复**:
```bash
cd client  # 或 server
npm install
```

---

### 错误 4：Canvas 不聚焦

**症状**: 键盘无反应

**修复**:
```javascript
// 在控制台中输入
document.querySelector('canvas').focus();
document.querySelector('canvas').tabIndex = 0;
```

---

## 📞 获取帮助

### 查看日志

**服务端日志**:
```bash
cd server
npm run dev
# 查看输出
```

**客户端日志**:
```
F12 → Console
```

---

### 报告问题

**请提供**:
1. 问题描述
2. 复现步骤
3. 控制台日志（截图）
4. 健康检查结果

**示例**:
```
问题：角色无法移动
步骤：
1. 登录游戏
2. 右键点击地面
3. 没反应

控制台：
🖱️ [Canvas] 鼠标点击：button=2
❌ 玩家数据不存在

健康检查：
✅ 服务端
✅ 客户端
✅ 数据库
```

---

## ✅ 验收标准

游戏可玩，当：

- [ ] ✅ 可以登录
- [ ] ✅ 可以看到角色
- [ ] ✅ 可以移动（右键）
- [ ] ✅ 可以攻击（左键）
- [ ] ✅ 可以打开 UI（B/C/M）
- [ ] ✅ 可以看到小地图
- [ ] ✅ 可以聊天（Enter）

**全部通过才算修复！**

---

## 🎯 立即行动

```bash
# 1. 健康检查
./scripts/health-check.bat

# 2. 如有问题，一键修复
./scripts/fix-all.bat

# 3. 启动游戏
./start.bat

# 4. 测试
# 访问 http://localhost:3001
# 登录：test1@example.com / password123
```

---

**🔧 开始修复！**
