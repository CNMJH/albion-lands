# 🔧 游戏卡在"正在加载游戏资源..."修复指南

**症状：** 页面一直显示"正在加载游戏资源..."，进度条不动

**原因：** 99% 是 WebSocket 连接失败导致

---

## 🔍 问题诊断

### 步骤 1：打开浏览器开发者工具

1. 按 `F12` 打开开发者工具
2. 切换到 **Console** 标签
3. 刷新页面（`Ctrl+F5`）

### 步骤 2：查看错误信息

**常见错误：**

#### 错误 1：WebSocket 连接失败
```
WebSocket connection to 'ws://localhost:3002/ws' failed
```
**原因：** 服务端未启动或端口错误

#### 错误 2：连接被拒绝
```
Error: Connection refused
```
**原因：** 服务端在 3000 端口，但客户端在连 3002

#### 错误 3：CORS 错误
```
Access-Control-Allow-Origin header is missing
```
**原因：** 服务端 CLIENT_URL 配置错误

#### 错误 4：资源加载超时
```
Timeout waiting for resource load
```
**原因：** 网络慢或资源文件不存在

---

## ✅ 解决方案

### 方案 1：检查服务端是否启动

**在 PowerShell 窗口 1 查看：**

```powershell
cd F:\Tenbox\openclaw_1\02\albion-lands\server
npm run dev
```

**应该看到：**
```
╔════════════════════════════════════════════════╗
║          Hulu Lands Server Started             ║
╠════════════════════════════════════════════════╣
║  HTTP:     http://0.0.0.0:3002                 ║
║  WebSocket: ws://0.0.0.0:3002/ws               ║
╚════════════════════════════════════════════════╝
```

**如果没有看到这个输出：**
1. 服务端可能崩溃了
2. 查看终端错误信息
3. 重新启动服务端

---

### 方案 2：验证 WebSocket 连接

**在浏览器 Console 中输入：**

```javascript
// 测试 WebSocket 连接
const ws = new WebSocket('ws://localhost:3002/ws');
ws.onopen = () => console.log('✓ WebSocket 连接成功');
ws.onerror = (e) => console.log('✗ WebSocket 连接失败', e);
ws.onclose = () => console.log('WebSocket 连接关闭');
```

**结果分析：**

| 输出 | 原因 | 解决 |
|------|------|------|
| `✓ WebSocket 连接成功` | 连接正常 | 检查其他问题 |
| `✗ WebSocket 连接失败` | 服务端问题 | 重启服务端 |
| 无输出 | 被防火墙阻止 | 关闭防火墙 |

---

### 方案 3：检查服务端 .env 配置

**文件：** `server/.env`

**必须包含：**
```env
# 服务器配置
NODE_ENV=development
PORT=3002
HOST=0.0.0.0
LOG_LEVEL=info

# 客户端 URL（CORS）
CLIENT_URL=http://localhost:3001
```

**如果文件不存在：**
```powershell
cd F:\Tenbox\openclaw_1\02\albion-lands\server
copy .env.example .env
```

**然后重启服务端：**
```powershell
# 停止服务端（Ctrl+C）
# 重新启动
npm run dev
```

---

### 方案 4：检查客户端配置

**文件：** `client/vite.config.ts`

**应该包含：**
```typescript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:3002',
      changeOrigin: true,
    },
    '/ws': {
      target: 'ws://localhost:3002',
      ws: true,
    },
  },
},
```

**如果配置错误：**
```powershell
# 拉取最新修复
cd F:\Tenbox\openclaw_1\02\albion-lands
git pull origin main

# 清理缓存
cd client
Remove-Item -Recurse -Force node_modules\.vite

# 重启客户端
npm run dev
```

---

### 方案 5：检查防火墙

**Windows 防火墙可能阻止连接**

**临时关闭防火墙测试：**
1. 打开 Windows 安全中心
2. 防火墙和网络保护
3. 暂时关闭专用网络防火墙

**或者添加例外：**
```powershell
# 以管理员身份运行 PowerShell
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

---

### 方案 6：检查端口占用

**查看端口使用情况：**

```powershell
# 查看 3002 端口
netstat -ano | findstr :3002

# 查看 3001 端口
netstat -ano | findstr :3001
```

**如果端口被占用：**
```powershell
# 杀死占用进程（替换 PID）
taskkill /PID <PID> /F

# 或者重启电脑
```

---

## 🧪 完整测试流程

### 1. 重启所有服务

```powershell
# 窗口 1 - 服务端
cd F:\Tenbox\openclaw_1\02\albion-lands\server
npm run dev

# 窗口 2 - 客户端
cd F:\Tenbox\openclaw_1\02\albion-lands\client
npm run dev
```

### 2. 验证服务端

浏览器访问：
```
http://localhost:3002/api/health
```

应该返回：
```json
{"status":"ok"}
```

### 3. 验证客户端

浏览器访问：
```
http://localhost:3001
```

按 `F12` 查看 Console，应该看到：
```
✓ WebSocket 连接成功
游戏初始化完成
```

### 4. 测试登录

1. 点击登录按钮
2. 使用测试账号：`test1@example.com` / `password123`
3. 应该能进入游戏

---

## 📊 常见错误代码

### 错误代码 1：`ECONNREFUSED`

```
Error: connect ECONNREFUSED 127.0.0.1:3002
```

**原因：** 服务端未启动

**解决：** 启动服务端

---

### 错误代码 2：`ETIMEDOUT`

```
Error: connect ETIMEDOUT 127.0.0.1:3002
```

**原因：** 防火墙阻止或端口错误

**解决：** 检查防火墙，确认端口

---

### 错误代码 3：`ERR_INVALID_URL`

```
Error: Invalid URL: ws://localhost:3000/ws
```

**原因：** WebSocket URL 错误

**解决：** 检查客户端配置中的 WebSocket 地址

---

### 错误代码 4：`Failed to load resource`

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**原因：** API 请求失败

**解决：** 确认服务端已启动，检查代理配置

---

## 🎯 快速修复脚本

**在 PowerShell 中运行：**

```powershell
# 1. 停止所有 Node 进程
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. 清理缓存
cd F:\Tenbox\openclaw_1\02\albion-lands
Remove-Item -Recurse -Force client\node_modules\.vite -ErrorAction SilentlyContinue

# 3. 拉取最新代码
git pull origin main

# 4. 创建 .env 文件
cd server
if (!(Test-Path .env)) {
    copy .env.example .env
    Write-Host "✓ .env 文件已创建"
}

# 5. 提示用户手动启动
Write-Host "`n=================================="
Write-Host "请按以下步骤启动："
Write-Host "=================================="
Write-Host "1. 窗口 1: cd server && npm run dev"
Write-Host "2. 窗口 2: cd ..\client && npm run dev"
Write-Host "3. 浏览器访问：http://localhost:3001"
Write-Host "==================================`n"
```

---

## 📞 仍然无法解决？

### 提供以下信息寻求帮助：

1. **服务端终端输出**（完整）
2. **客户端终端输出**（完整）
3. **浏览器 Console 错误**（截图）
4. **浏览器 Network 标签**（截图）
5. **操作系统版本**（Windows 10/11）
6. **Node.js 版本**（`node --version`）

### 检查清单：

- [ ] 服务端已启动（看到 "Server Started"）
- [ ] 客户端已启动（看到 "Local: http://localhost:3001"）
- [ ] 服务端 .env 文件存在
- [ ] 端口 3001 和 3002 未被占用
- [ ] 防火墙已关闭或添加例外
- [ ] 浏览器 Console 无严重错误
- [ ] WebSocket 连接测试成功

---

## 🎉 成功标志

启动后应该看到：

### 服务端
```
✓ Server running at http://localhost:3002
✓ WebSocket ready at ws://localhost:3002/ws
```

### 客户端
```
VITE ready in xxx ms
➜  Local:   http://localhost:3001/
```

### 浏览器 Console
```
✓ WebSocket 连接成功
游戏初始化完成
加载进度：100%
```

### 游戏页面
- ✅ 加载进度条走到 100%
- ✅ 显示登录界面
- ✅ 可以看到游戏场景

---

**按照以上步骤，应该能解决卡在加载界面的问题！** 🎮

**GitHub Issues:** https://github.com/CNMJH/albion-lands/issues
