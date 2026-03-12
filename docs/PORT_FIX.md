# 🔧 端口冲突修复指南

**问题：** 游戏加载失败，提示"游戏加载失败，请刷新页面重试"

**原因：** 服务端和客户端都使用了 3000 端口，导致冲突

---

## 📋 问题诊断

从启动日志可以看到：

```
服务端：http://0.0.0.0:3000
客户端：http://localhost:3000/
```

**两个服务都使用了 3000 端口！** ❌

---

## ✅ 已修复配置

### 正确配置应该是：

| 服务 | 端口 | 地址 |
|------|------|------|
| **服务端** | 3002 | http://localhost:3002 |
| **客户端** | 3001 | http://localhost:3001 |
| **WebSocket** | 3002 | ws://localhost:3002/ws |
| **GM 工具** | 3002 | http://localhost:3002/gm/ |

---

## 🚀 在 Windows 上重新启动

### 步骤 1：更新代码

```powershell
cd F:\Tenbox\openclaw_1\02\albion-lands

# 拉取最新修复
git pull origin main
```

### 步骤 2：创建服务端 .env 文件

```powershell
cd server

# 复制环境变量配置
copy .env.example .env
```

**.env 文件内容应该是：**
```env
# 服务器配置
NODE_ENV=development
PORT=3002
HOST=0.0.0.0
LOG_LEVEL=info

# 客户端 URL（CORS）
CLIENT_URL=http://localhost:3001

# 数据库
DATABASE_URL=file:./dev.db

# JWT
JWT_SECRET=hululands-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 游戏配置
GAME_SERVER_NAME=呼噜大陆 (Hulu Lands)
MAX_PLAYERS_PER_ZONE=50
TICK_RATE=30
```

### 步骤 3：重新启动服务

**打开两个 PowerShell 窗口：**

#### 窗口 1 - 启动服务端

```powershell
cd F:\Tenbox\openclaw_1\02\albion-lands\server
npm run dev
```

**等待看到：**
```
╔════════════════════════════════════════════════╗
║          Hulu Lands Server Started             ║
╠════════════════════════════════════════════════╣
║  HTTP:     http://0.0.0.0:3002                 ║
║  WebSocket: ws://0.0.0.0:3002/ws               ║
║  Environment: development                      ║
╚════════════════════════════════════════════════╝
```

#### 窗口 2 - 启动客户端

```powershell
cd F:\Tenbox\openclaw_1\02\albion-lands\client
npm run dev
```

**等待看到：**
```
VITE v5.4.21  ready in xxx ms

➜  Local:   http://localhost:3001/
➜  Network: http://10.10.239.53:3001/
```

---

## 🎯 访问游戏

打开浏览器访问：**http://localhost:3001**

> ⚠️ **注意：** 不是 3000 端口！

---

## 🧪 验证连接

### 方法 1：检查服务端 API

在浏览器访问：
```
http://localhost:3002/api/health
```

应该返回：
```json
{"status": "ok"}
```

### 方法 2：检查客户端

在浏览器按 `F12` 打开开发者工具，查看 Console：

**正常情况：**
```
连接 WebSocket 成功
游戏初始化完成
```

**错误情况（如果还是失败）：**
```
WebSocket 连接失败
无法连接到服务器
```

---

## 🔍 常见问题

### 问题 1：还是显示 3000 端口

**原因：** 浏览器缓存或 Vite 缓存

**解决：**
```powershell
# 清理 Vite 缓存
cd client
Remove-Item -Recurse -Force node_modules\.vite

# 重新启动
npm run dev
```

### 问题 2：端口仍然被占用

**错误：** `EADDRINUSE: address already in use`

**解决：**
```powershell
# 查看所有 Node 进程
Get-Process node

# 杀死所有 Node 进程
Get-Process node | Stop-Process -Force

# 或者重启电脑
```

### 问题 3：CORS 错误

**错误：** `Access-Control-Allow-Origin`

**解决：** 确保服务端 .env 文件中：
```env
CLIENT_URL=http://localhost:3001
```

---

## 📊 端口分配表

| 服务 | 端口 | 用途 | 必须 |
|------|------|------|------|
| 服务端 HTTP | 3002 | API 接口 | ✅ |
| 服务端 WebSocket | 3002 | 实时通信 | ✅ |
| 客户端 Vite | 3001 | 开发服务器 | ✅ |
| GM 工具 | 3002/gm/ | 管理员工具 | ⏳ |
| 数据库 | - | SQLite 文件 | 自动 |

---

## 🎉 成功标志

启动后应该看到：

### 服务端（窗口 1）
```
✓ Server running at http://localhost:3002
✓ WebSocket ready at ws://localhost:3002/ws
✓ GM Tool at http://localhost:3002/gm/
✓ Database connected (SQLite)
```

### 客户端（窗口 2）
```
VITE ready in 305ms
➜  Local:   http://localhost:3001/
```

### 浏览器
- ✅ 可以访问 http://localhost:3001
- ✅ 页面正常加载
- ✅ Console 无错误
- ✅ 可以看到登录按钮

---

## 📝 修改总结

已修复的文件：

| 文件 | 修改 | 说明 |
|------|------|------|
| `client/vite.config.ts` | 3000→3001, 4000→3002 | 客户端端口和代理 |
| `server/src/index.ts` | 3000→3002 | 服务端默认端口 |
| `server/.env.example` | 3000→3002 | 环境变量模板 |

**提交：** `d224dcb - fix: 修复端口配置`

---

## 🆘 仍然无法解决？

1. **检查防火墙** - 确保 3001 和 3002 端口未被阻止
2. **检查杀毒软件** - 某些杀毒软件会阻止本地服务器
3. **使用管理员权限** - 右键 PowerShell → 以管理员身份运行
4. **查看完整日志** - 提供两个终端的完整输出

---

**修复完成后，游戏应该可以正常加载！** 🎮

**GitHub 仓库：** https://github.com/CNMJH/albion-lands
