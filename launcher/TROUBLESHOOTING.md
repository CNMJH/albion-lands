# 启动器故障排查指南

**更新时间：** 2024-03-12  
**版本：** v2.1

---

## 🔍 问题：窗口闪退

### 症状

```
1. 双击 launcher.bat
2. 窗口打开
3. 显示几行输出
4. 窗口突然关闭
```

---

## 🛠️ 解决方案（按顺序尝试）

### 方案 1：使用调试版本（推荐）

**步骤：**

1. 拉取最新代码
   ```powershell
   cd F:\Tenbox\openclaw_1\02\albion-lands
   git pull origin main
   ```

2. 运行调试版本
   ```powershell
   .\debug-launcher.bat
   ```

3. 查看详细输出，找出哪里出错

4. 截图发给开发者

---

### 方案 2：从命令行运行

**步骤：**

1. 打开 PowerShell 或 CMD

2. 进入项目目录
   ```powershell
   cd F:\Tenbox\openclaw_1\02\albion-lands
   ```

3. 运行启动器
   ```powershell
   .\launcher.bat
   ```

**好处：**
- 窗口不会自动关闭
- 可以看到完整错误信息
- 可以复制错误内容

---

### 方案 3：启用调试模式

**步骤：**

1. 编辑 `launcher.bat`

2. 找到这一行：
   ```batch
   set "DEBUG=0"
   ```

3. 改为：
   ```batch
   set "DEBUG=1"
   ```

4. 保存并重新运行

**效果：**
- 显示更多调试信息
- 显示每个命令的执行结果
- 帮助定位问题

---

### 方案 4：手动检查环境

**检查 Git：**
```powershell
git --version
```

应该显示：
```
git version 2.x.x.windows.x
```

**检查 Node.js：**
```powershell
node --version
```

应该显示：
```
v18.x.x 或更高
```

**检查 npm：**
```powershell
npm --version
```

应该显示：
```
9.x.x 或更高
```

---

### 方案 5：检查项目文件

**步骤：**

1. 确认目录结构：
   ```
   albion-lands/
   ├── launcher.bat
   ├── debug-launcher.bat
   ├── server/
   │   ├── package.json
   │   └── .env.example
   └── client/
       └── package.json
   ```

2. 如果缺少文件，重新拉取：
   ```powershell
   git pull origin main
   ```

---

## 📋 常见错误及解决

### 错误 1：Git 未安装

**错误信息：**
```
[ERROR] Git is not installed or not in PATH
```

**解决：**
1. 下载 Git：https://git-scm.com/download/win
2. 安装时选择"添加到 PATH"
3. 重启命令行
4. 验证：`git --version`

---

### 错误 2：Node.js 未安装

**错误信息：**
```
[ERROR] Node.js is not installed or not in PATH
```

**解决：**
1. 下载 Node.js：https://nodejs.org/
2. 选择 LTS 版本（18.x 或更高）
3. 安装
4. 重启命令行
5. 验证：`node --version`

---

### 错误 3：权限不足

**错误信息：**
```
[WARN] Not running as administrator
```

**解决：**
1. 右键 `launcher.bat`
2. 选择"以管理员身份运行"
3. 或创建快捷方式，设置为"以管理员身份运行"

---

### 错误 4：项目文件缺失

**错误信息：**
```
[WARN] server\package.json NOT found
```

**解决：**
1. 确认在当前目录
2. 重新拉取代码：
   ```powershell
   git pull origin main
   ```

---

### 错误 5：端口被占用

**错误信息：**
```
[WARN] Port 3001 is already in use
```

**解决：**
1. 选择"Kill process"
2. 或手动停止：
   ```powershell
   Get-Process node | Stop-Process -Force
   ```

---

## 📊 调试输出示例

### 正常输出

```
========================================
   DEBUG MODE - Detailed Output
========================================

[DEBUG] Script directory: F:\Tenbox\openclaw_1\02\albion-lands

[TEST 1] Checking Git...
[OK] Git found in PATH

[TEST 2] Getting Git version...
[DEBUG] Git output: git version 2.39.5.windows.1
[OK] Git version: git version 2.39.5.windows.1

[TEST 3] Checking Node.js...
[OK] Node.js found in PATH

[TEST 4] Getting Node.js version...
[DEBUG] Node output: v18.20.4
[OK] Node.js version: v18.20.4

[TEST 5] Checking npm...
[OK] npm found in PATH

[TEST 6] Getting npm version...
[DEBUG] npm output: 9.2.0
[OK] npm version: 9.2.0

... (继续)
```

### 异常输出

```
[TEST 2] Getting Git version...
[DEBUG] Git output: 'git' is not recognized...
[OK] Git version: unknown

[WARN] Git version detection failed, but Git is available
```

**说明：** Git 安装有问题，需要重新安装。

---

## 🔧 高级调试

### 查看日志文件

**位置：**
```
logs/launcher-YYYYMMDD-HHMMSS.log
```

**查看方法：**
```powershell
cd logs
dir /od
type launcher-*.log
```

---

### 手动运行各步骤

**1. 检查 Git：**
```powershell
where git
git --version
```

**2. 检查 Node.js：**
```powershell
where node
node --version
npm --version
```

**3. 检查项目：**
```powershell
dir server\package.json
dir client\package.json
```

**4. 检查端口：**
```powershell
netstat -ano | findstr "3001"
netstat -ano | findstr "3002"
```

**5. 检查进程：**
```powershell
tasklist | findstr "node"
```

---

## 📞 获取帮助

### 提供信息

遇到问题时，请提供：

1. **调试输出截图**
   - 运行 `debug-launcher.bat`
   - 截图完整输出

2. **系统信息**
   - Windows 版本
   - Git 版本
   - Node.js 版本

3. **错误信息**
   - 完整错误文本
   - 错误发生的位置

4. **日志文件**
   - `logs/launcher-*.log`
   - 如果有服务端/客户端日志也提供

---

## ✅ 验证修复

修复后应该看到：

```
========================================
          DEBUG SUMMARY
========================================

Git:      git version 2.39.5.windows.1
Node.js:  v18.20.4
npm:      9.2.0

Project:  FOUND

[INFO] All checks passed!
[INFO] You can run launcher.bat now
```

---

## 📝 快速参考

| 命令 | 用途 |
|------|------|
| `debug-launcher.bat` | 详细诊断 |
| `launcher.bat` | 正常启动 |
| `git --version` | 检查 Git |
| `node --version` | 检查 Node.js |
| `npm --version` | 检查 npm |
| `Get-Process node` | 查看 Node 进程 |
| `netstat -ano` | 查看端口 |

---

**最后更新：** 2024-03-12  
**文档位置：** `launcher/TROUBLESHOOTING.md`
