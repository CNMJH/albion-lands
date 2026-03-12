# 启动器修复说明

**修复时间：** 2024-03-12  
**问题：** Windows CMD 编码问题

---

## ❌ 问题原因

### 编码冲突

Windows CMD 默认使用 **GBK** 编码，而文件是 **UTF-8** 编码。

**错误信息：**
```
'代码' is not recognized as an internal or external command
'安装依赖' is not recognized...
'配置文件' is not recognized...
'开浏览器' is not recognized...
```

**原因：**
- 批处理文件中的中文注释被 CMD 错误解析
- 中文被当作命令执行

---

## ✅ 修复方案

### 1. 移除所有中文注释

**修复前：**
```batch
:: 检查 Git 是否安装
where git >nul 2>nul
```

**修复后：**
```batch
:: Check Git
where git >nul 2>nul
```

### 2. 移除中文输出

**修复前：**
```batch
echo [信息] 检查运行环境...
echo   ✓ Git 已安装
```

**修复后：**
```batch
echo [INFO] Checking environment...
echo   OK - Git installed
```

### 3. 修复文件占用问题

**修复前：**
```batch
echo 启动日志 > startup.log  :: 多个进程写入同一文件
```

**修复后：**
```batch
:: 使用时间戳生成唯一日志文件名
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set logfile=logs\server-%datetime:~0,8%-%datetime:~8,6%.log
```

---

## 📊 修复对比

| 项目 | 修复前 | 修复后 |
|------|--------|--------|
| 注释语言 | 中文 | 英文 |
| 输出语言 | 中文 | 英文 |
| 日志文件 | startup.log（冲突） | 时间戳命名（独立） |
| CMD 兼容性 | ❌ 错误 | ✅ 正常 |

---

## 🚀 使用方法

### 拉取修复后的代码

```powershell
cd F:\Tenbox\openclaw_1\02\albion-lands
git pull origin main
```

### 运行启动器

```powershell
.\launcher.bat
```

### 预期输出

```
========================================
          Hulu Lands Launcher
========================================

[INFO] Checking environment...
  OK - Git installed
  OK - Node.js installed

[INFO] Project exists, pulling latest code...

[1/6] Pulling latest code from GitHub...
Already up to date.

[2/6] Checking server configuration...
  OK - .env exists

[3/6] Checking server dependencies...
  OK - Server dependencies installed

[4/6] Checking client dependencies...
  OK - Client dependencies installed

[5/6] Cleaning old processes...
  Stopping Node.js processes...
  OK - Old processes cleaned

[6/6] Starting game services...

========================================
Starting server...
========================================

Waiting for server to start (5 seconds)...

========================================
Starting client...
========================================

Waiting for client to start (10 seconds)...

========================================
Opening game page...
========================================

========================================
OK - Launch complete!
========================================

Game opened in default browser
Address: http://localhost:3001

Server console: Hulu Lands - Server window
Client console: Hulu Lands - Client window

Log directory: logs\

========================================
Tips:
- Close game by closing both console windows
- Next run will auto-update code
- Check logs folder for issues
========================================
```

---

## 📁 文件变更

| 文件 | 变更 |
|------|------|
| `launcher.bat` | 移除中文注释和输出 |
| `create-shortcut.bat` | 移除中文输出 |

---

## 🎯 验证步骤

### 1. 拉取最新代码

```powershell
git pull origin main
```

### 2. 运行启动器

```powershell
.\launcher.bat
```

### 3. 检查输出

应该看到：
- ✅ 英文输出
- ✅ 无 `'xxx' is not recognized` 错误
- ✅ 正常启动服务端和客户端
- ✅ 浏览器自动打开

### 4. 检查游戏

访问 http://localhost:3001 应该能看到登录界面。

---

## 📝 提交信息

**提交：** `a894e9d`  
**信息：** `fix: 修复启动器编码问题（移除中文注释）`

---

## 🔍 为什么用英文？

| 原因 | 说明 |
|------|------|
| **兼容性** | Windows CMD 对 UTF-8 支持不完善 |
| **编码问题** | 中文在不同系统可能显示为乱码 |
| **命令解析** | 中文可能被误解析为命令 |
| **国际化** | 英文在所有系统都能正常显示 |

---

## 📞 如果还有问题

### 查看日志

```powershell
# 查看最新日志
cd logs
dir /od
type server-*.log
```

### 手动启动

```powershell
# 手动启动服务端
cd server
npm run dev

# 新窗口启动客户端
cd client
npm run dev
```

### 检查进程

```powershell
# 查看 Node 进程
Get-Process node

# 停止所有 Node 进程
Get-Process node | Stop-Process -Force
```

---

**现在拉取代码重新运行应该可以正常工作了！** 🚀

**GitHub:** https://github.com/CNMJH/albion-lands  
**最新提交:** `a894e9d`
