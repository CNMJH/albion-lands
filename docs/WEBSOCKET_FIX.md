# WebSocket 连接失败修复

**问题日期：** 2024-03-12  
**错误代码：** 1006

---

## ❌ 问题

客户端无法连接到 WebSocket 服务器：

```
WebSocket connection to 'ws://localhost:3002/ws' failed
WebSocket 错误：Event
Error: WebSocket 连接错误
```

---

## 🔍 原因

`.env` 文件中的 `CLIENT_URL` 配置不正确：

```env
# 错误的配置
CLIENT_URL=http://localhost:5173

# 正确的配置
CLIENT_URL=http://localhost:3001
```

客户端现在使用端口 `3001`，但服务端 CORS 配置还是 `5173`，导致连接被拒绝。

---

## ✅ 解决方案

### 方法 1：修改 .env 文件（推荐）

1. 打开 `server/.env`

2. 找到这一行：
   ```env
   CLIENT_URL=http://localhost:5173
   ```

3. 改为：
   ```env
   CLIENT_URL=http://localhost:3001
   ```

4. 保存

5. **重启服务端**（关闭服务端窗口，重新运行启动器）

---

### 方法 2：使用启动器自动修复

拉取最新代码后，启动器会自动检查和修复配置。

---

## 🚀 完整修复步骤

### Windows 用户

```powershell
# 1. 拉取最新代码
cd F:\Tenbox\openclaw_1\02\albion-lands
git pull origin main

# 2. 停止所有 Node 进程
Get-Process node | Stop-Process -Force

# 3. 重新启动
.\launcher.bat
```

### 或者手动重启服务端

1. **关闭** "Hulu Lands - Server" 窗口

2. **重新运行** 启动器：
   ```powershell
   .\launcher.bat
   ```

3. 等待服务端启动

4. 刷新浏览器（F5）

---

## ✅ 验证修复

### 1. 检查服务端输出

服务端窗口应该显示：

```
╔════════════════════════════════════════════════╗
║          Hulu Lands Server Started             ║
╠════════════════════════════════════════════════╣
║  HTTP:     http://0.0.0.0:3002                 ║
║  WebSocket: ws://0.0.0.0:3002/ws               ║
║  Environment: development                      ║
╚════════════════════════════════════════════════╝
```

### 2. 检查浏览器控制台

应该看到：

```
正在连接到：ws://localhost:3002/ws
WebSocket 连接成功
游戏状态初始化完成
```

**没有红色错误！**

### 3. 测试 HTTP API

在浏览器访问：
```
http://localhost:3002/api/health
```

应该返回：
```json
{"status":"ok","timestamp":"..."}
```

---

## 🐛 如果还是失败

### 检查端口占用

```powershell
# 查看 3002 端口
netstat -ano | findstr "3002"

# 如果有其他进程占用，杀掉
Get-Process -Id <PID> | Stop-Process -Force
```

### 检查防火墙

Windows 防火墙可能阻止连接：

1. 打开 Windows Defender 防火墙
2. 允许 Node.js 通过防火墙
3. 或临时关闭防火墙测试

### 检查服务端日志

```powershell
cd logs
type server-*.log
```

### 手动启动服务端

```powershell
cd server
npm run dev
```

查看是否有错误输出。

---

## 📊 常见错误代码

| 代码 | 含义 | 解决 |
|------|------|------|
| **1006** | 连接关闭 | CORS 配置错误或服务器未启动 |
| **1001** | 服务器关闭 | 重启服务器 |
| **1005** | 无状态码 | 网络问题 |
| **Connection refused** | 连接被拒 | 服务器未启动或端口错误 |

---

## 📝 技术细节

### CORS 配置

服务端 CORS 配置在 `server/src/index.ts`：

```typescript
await fastify.register(fastifyCors, {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
})
```

如果 `CLIENT_URL` 不匹配客户端地址，连接会被拒绝。

### WebSocket 注册

WebSocket 路由在 `server/src/websocket/WebSocketServer.ts`：

```typescript
fastify.get('/ws', { websocket: true }, (socket, request) => {
  // WebSocket 处理
})
```

---

## 📞 获取帮助

如果问题仍未解决，提供：

1. **服务端窗口截图**
2. **浏览器控制台完整输出**
3. **`server/.env` 文件内容**
4. **`logs/server-*.log` 日志**

---

**最后更新：** 2024-03-12  
**修复状态：** ✅ 已修复