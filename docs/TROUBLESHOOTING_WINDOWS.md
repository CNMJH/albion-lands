# 🔧 Windows 故障排查指南

**最后更新**: 2026-03-14  
**适用**: Windows 10/11

---

## 问题 1: 中文乱码

**现象**: 运行 batch 文件显示乱码

**原因**: Windows CMD 默认 GBK 编码，UTF-8 文件会显示乱码

**解决**:
1. 拉取最新代码（已修复为英文）
   ```powershell
   git pull origin main
   ```

2. 或临时修改 CMD 编码：
   ```cmd
   chcp 65001
   ```

---

## 问题 2: Node.js 未找到

**现象**: `node is not recognized...`

**解决**:
1. 安装 Node.js: https://nodejs.org/
2. 下载 **LTS 版本** (v18 或 v20)
3. 安装后重启 CMD
4. 验证：`node --version`

---

## 问题 3: 端口被占用

**现象**: `EADDRINUSE: address already in use :::3002`

**解决**:

**方法 1: 强制重启**
```powershell
.\force-restart.bat
```

**方法 2: 手动关闭**
```cmd
REM 查找占用端口的进程
netstat -ano | findstr :3002

REM 关闭进程 (替换 PID)
taskkill /PID <PID> /F
```

**方法 3: 使用 start.bat**
```powershell
.\start.bat
```

---

## 问题 4: 数据库错误

**现象**: `Prisma error` 或 `database is locked`

**解决**:
```powershell
cd server

REM 删除数据库
del prisma\dev.db
del prisma\dev.db-journal

REM 重新创建
npx prisma db push
```

---

## 问题 5: 依赖安装失败

**现象**: `npm install` 卡住或失败

**解决**:

**方法 1: 清理缓存**
```powershell
npm cache clean --force
```

**方法 2: 使用淘宝镜像**
```powershell
npm config set registry https://registry.npmmirror.com
npm install
```

**方法 3: 删除 node_modules**
```powershell
REM 服务端
cd server
rmdir /s /q node_modules
npm install

REM 客户端
cd ..\client
rmdir /s /q node_modules
npm install
```

---

## 问题 6: 页面空白

**现象**: 浏览器打开是空白页

**解决**:

1. **强制刷新**
   ```
   Ctrl + Shift + R
   ```

2. **检查服务**
   - 服务端：http://localhost:3002/health
   - 客户端：http://localhost:3001

3. **查看控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 和 Network 标签

---

## 问题 7: WebSocket 连接失败

**现象**: `WebSocket connection failed`

**解决**:

1. **确认服务端已启动**
   ```
   http://localhost:3002/health
   ```

2. **检查防火墙**
   - Windows 防火墙 → 允许应用通过防火墙
   - 添加 node.exe

3. **重启服务**
   ```powershell
   .\force-restart.bat
   ```

---

## 问题 8: 游戏卡在加载界面

**现象**: 一直显示 loading

**解决**:

1. **检查两个服务**
   - 服务端窗口：应显示 "Server Started"
   - 客户端窗口：应显示 "Local: http://localhost:3001"

2. **刷新页面**
   ```
   Ctrl + Shift + R
   ```

3. **清除缓存**
   ```powershell
   .\force-restart.bat
   ```

---

## 问题 9: Git 拉取失败

**现象**: `git pull` 失败或冲突

**解决**:

**方法 1: 强制重置**
```powershell
git fetch --all
git reset --hard origin/main
```

**方法 2: 备份后重新克隆**
```powershell
cd ..
git clone https://github.com/CNMJH/albion-lands.git
```

---

## 问题 10: 权限错误

**现象**: `EPERM: operation not permitted`

**解决**:

1. **以管理员身份运行**
   - 右键 CMD/PowerShell → 以管理员身份运行

2. **关闭占用进程**
   ```cmd
   taskkill /F /IM node.exe
   ```

3. **删除失败的文件**
   ```powershell
   rmdir /s /q node_modules
   ```

---

## 快速诊断命令

```powershell
# 检查 Node.js
node --version

# 检查 npm
npm --version

# 检查 Git
git --version

# 检查端口占用
netstat -ano | findstr :3002
netstat -ano | findstr :3001

# 查看进程
tasklist | findstr node

# 停止所有 node 进程
taskkill /F /IM node.exe

# 清理缓存
npm cache clean --force

# 重置项目
git fetch --all
git reset --hard origin/main
```

---

## 一键修复脚本

### 完全重置

```powershell
# 1. 停止所有进程
taskkill /F /IM node.exe

# 2. 清理缓存
npm cache clean --force

# 3. 删除 node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

# 4. 删除数据库
del server\prisma\dev.db

# 5. 重新安装
cd server
npm install
cd ..\client
npm install
cd ..

# 6. 初始化数据库
cd server
npx prisma db push
cd ..

# 7. 启动游戏
.\start.bat
```

---

## 获取帮助

### 日志位置

**服务端日志**:
```
server/logs/
```

**客户端日志**:
```
client/logs/
```

### 调试命令

**游戏内调试**:
- 按 F12 打开调试控制台
- 输入 `help` 查看命令

**浏览器开发者工具**:
- 按 F12
- 查看 Console 和 Network

---

## 常见错误代码

| 错误代码 | 含义 | 解决 |
|---------|------|------|
| EADDRINUSE | 端口被占用 | force-restart.bat |
| ENOENT | 文件不存在 | 检查路径 |
| EPERM | 权限错误 | 管理员运行 |
| ETIMEDOUT | 连接超时 | 检查网络 |
| MODULE_NOT_FOUND | 模块缺失 | npm install |

---

## 联系支持

- 📖 [完整安装指南](docs/INSTALL_WINDOWS.md)
- 📖 [快速开始](QUICKSTART.md)
- 💬 GitHub Issues: https://github.com/CNMJH/albion-lands/issues

---

**文档版本**: v1.0  
**最后更新**: 2026-03-14
