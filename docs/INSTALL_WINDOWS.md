# 🎮 呼噜大陆 - Windows 一键安装指南

**最后更新**: 2026-03-14  
**版本**: v0.4.0 Beta  
**平台**: Windows 10/11  
**难度**: ⭐⭐ (简单)

---

## 🚀 快速开始（5 分钟）

### 步骤 1：安装 Node.js

1. 访问 https://nodejs.org/
2. 下载 **LTS 版本** (推荐 v18 或 v20)
3. 双击安装，一路点击 "Next"
4. 安装完成后，打开 CMD 验证：
   ```cmd
   node --version
   ```
   显示 `v18.x.x` 或 `v20.x.x` 即成功

### 步骤 2：安装 Git（可选）

如果已有 Git 可跳过此步

1. 访问 https://git-scm.com/
2. 下载 Windows 版本
3. 双击安装，一路 "Next"
4. 验证：
   ```cmd
   git --version
   ```

### 步骤 3：下载游戏

**方法 A: 使用 Git（推荐）**
```cmd
# 选择存放游戏的目录
cd C:\Users\你的用户名\Documents\Games

# 克隆项目
git clone https://github.com/CNMJH/albion-lands.git

# 进入项目
cd albion-lands
```

**方法 B: 手动下载**
1. 访问 https://github.com/CNMJH/albion-lands
2. 点击绿色 "Code" 按钮
3. 选择 "Download ZIP"
4. 解压到任意目录

### 步骤 4：一键安装

**在项目目录打开 PowerShell**：
1. 在文件夹空白处按住 `Shift` + 右键
2. 选择 "在此处打开 PowerShell 窗口"
3. 运行安装脚本：

```powershell
.\install.bat
```

> ⏱️ **预计时间**: 5-10 分钟（首次安装）

---

## 🎮 启动游戏

### 方法 1: 使用启动器（推荐）

```powershell
.\launcher.bat
```

启动器会自动：
- ✅ 检查依赖
- ✅ 启动服务端
- ✅ 启动客户端
- ✅ 打开浏览器

### 方法 2: 手动启动

**需要两个终端窗口：**

#### 终端 1 - 服务端
```powershell
cd server
npm run dev
```

等待看到：
```
╔════════════════════════════════════════════════╗
║          Hulu Lands Server Started             ║
╠════════════════════════════════════════════════╣
║  HTTP:     http://0.0.0.0:3002                 ║
║  WebSocket: ws://0.0.0.0:3002/ws               ║
╚════════════════════════════════════════════════╝
```

#### 终端 2 - 客户端
```powershell
cd client
npm run dev
```

等待看到：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
```

### 方法 3: 强制重启脚本

如果遇到问题：
```powershell
.\force-restart.bat
```

这会重启所有服务

---

## 🎯 进入游戏

### 1. 打开浏览器

启动器会自动打开，或手动访问：
```
http://localhost:3001
```

### 2. 注册账号

首次游戏需要注册：

**方式 A: 游戏内注册**
1. 点击登录界面的 "注册" 按钮
2. 输入邮箱和密码
3. 点击注册

**方式 B: 使用测试账号**
```
邮箱：test1@example.com
密码：password123
```

**方式 C: 命令行创建账号**
```powershell
cd server
node scripts/create-test-user.js newplayer@test.com password123 新玩家
```

### 3. 开始游戏

1. 输入账号密码登录
2. 创建角色名
3. 进入游戏世界！

---

## 🎮 游戏操作

### 基础操作

| 按键 | 功能 |
|------|------|
| **鼠标右键** | 移动/攻击 |
| **鼠标左键** | 攻击/选择 |
| **WASD** | 移动 |
| **Shift** | 冲刺 |

### 快捷键

| 按键 | 功能 |
|------|------|
| **QWERAS** | 技能 |
| **B** | 背包 |
| **C** | 装备 |
| **M** | 拍卖行 |
| **E** | 拾取/交易 |
| **F1** | 死亡统计 |
| **F2** | 复活点 |
| **F10** | 快捷键提示 |
| **F11** | 性能监控 |
| **F12** | 调试控制台 |
| **Escape** | 关闭所有 UI |
| **PrintScreen** | 截图 |

---

## 🛠️ 故障排查

### 问题 1: 端口被占用

**错误**: `EADDRINUSE: address already in use`

**解决**:
```powershell
# 方法 1: 关闭占用程序
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# 方法 2: 使用重启脚本
.\force-restart.bat
```

### 问题 2: 数据库错误

**错误**: `Prisma error`

**解决**:
```powershell
cd server
npx prisma migrate deploy
npx prisma db push
```

### 问题 3: 客户端无法连接服务端

**错误**: `WebSocket connection failed`

**解决**:
1. 确认服务端已启动（端口 3002）
2. 检查防火墙设置
3. 重启服务：`.\force-restart.bat`

### 问题 4: 页面空白

**解决**:
1. 按 `Ctrl + Shift + R` 强制刷新
2. 清除浏览器缓存
3. 检查浏览器控制台（F12）

### 问题 5: 游戏卡在加载界面

**解决**:
1. 确认服务端和客户端都已启动
2. 检查网络连接
3. 刷新页面（Ctrl + Shift + R）

---

## 📊 系统要求

### 最低配置

| 项目 | 要求 |
|------|------|
| **操作系统** | Windows 10 |
| **CPU** | 双核 2.0 GHz |
| **内存** | 4 GB RAM |
| **显卡** | 集成显卡 |
| **存储** | 1 GB 可用空间 |
| **网络** | 宽带连接 |

### 推荐配置

| 项目 | 要求 |
|------|------|
| **操作系统** | Windows 10/11 |
| **CPU** | 四核 2.5 GHz |
| **内存** | 8 GB RAM |
| **显卡** | 独立显卡 |
| **存储** | 2 GB 可用空间 |
| **网络** | 光纤连接 |

---

## 🔧 高级设置

### 修改端口

编辑 `server/.env`:
```
PORT=3002  # 服务端端口
```

编辑 `client/.env`:
```
VITE_SERVER_URL=http://localhost:3002
VITE_PORT=3001  # 客户端端口
```

### 修改数据库

编辑 `server/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 查看日志

**服务端日志**:
```powershell
cd server
Get-Content logs/server.log -Tail 50
```

**客户端日志**:
```powershell
cd client
Get-Content logs/client.log -Tail 50
```

---

## 📦 卸载

### 完全卸载

```powershell
# 1. 停止服务
.\force-restart.bat

# 2. 删除项目目录
cd ..
rmdir /s /q albion-lands

# 3. 删除全局依赖（可选）
npm uninstall -g @vercel/nodemon
```

---

## 🆘 获取帮助

### 文档

- 📖 [完整安装指南](docs/WINDOWS_SETUP.md)
- 📖 [游戏设计文档](docs/GAME_DESIGN_COMPLETE.md)
- 📖 [玩家操作指南](docs/PLAYER_CONTROLS.md)

### 社区

- 💬 GitHub Issues: https://github.com/CNMJH/albion-lands/issues
- 📧 邮箱：support@hululands.com

### 调试工具

**游戏内调试**:
- 按 `F12` 打开调试控制台
- 输入 `help` 查看命令列表

**浏览器开发者工具**:
- 按 `F12` 打开
- 查看 Console 和 Network 标签

---

## ✅ 安装检查清单

安装完成后，检查以下项目：

- [ ] Node.js 已安装 (`node --version`)
- [ ] Git 已安装 (`git --version`)
- [ ] 项目已下载
- [ ] 依赖已安装 (`node_modules` 目录存在)
- [ ] 数据库已初始化 (`server/prisma/dev.db` 存在)
- [ ] 服务端已启动 (访问 http://localhost:3002/health)
- [ ] 客户端已启动 (访问 http://localhost:3001)
- [ ] 可以登录游戏
- [ ] 角色可以移动
- [ ] 可以打开背包 (B 键)
- [ ] 可以打开装备 (C 键)

---

## 🎉 开始冒险！

安装完成后，你就可以：

1. 🗺️ 探索 5 张地图
2. ⚔️ 击败 30 种怪物
3. 🎒 收集 200 种物品
4. ✨ 学习 30 种技能
5. 🏆 完成成就系统
6. 👥 与其他玩家组队
7. 💰 参与自由经济
8. 🏰 挑战世界 BOSS

**祝你游戏愉快！** 🎮✨

---

## 📝 快速命令参考

```powershell
# 安装
.\install.bat

# 启动
.\launcher.bat

# 重启
.\force-restart.bat

# 查看服务端状态
cd server
npm run dev

# 查看客户端状态
cd client
npm run dev

# 重置数据库
cd server
npx prisma migrate reset

# 创建测试账号
cd server
node scripts/create-test-user.js

# 添加测试装备
cd server
node scripts/add-test-items.js
```

---

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**维护者**: 呼噜大陆开发团队
