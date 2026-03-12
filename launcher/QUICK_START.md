#  呼噜大陆 - 一键启动快速指南

**创建时间：** 2024-03-12

---

## 🎯 3 步使用

### 步骤 1：下载启动器

```powershell
# 打开 PowerShell
cd F:\Tenbox\openclaw_1\02

# 拉取最新代码（包含启动器）
cd albion-lands
git pull origin main
```

### 步骤 2：运行启动器

**双击文件：**
```
albion-lands/launcher.bat
```

**或创建桌面快捷方式：**
```
双击：albion-lands/create-shortcut.bat
```

### 步骤 3：等待启动

启动器会自动：
1. ✅ 检查 Git、Node.js
2. ✅ 拉取最新代码
3. ✅ 安装依赖（首次）
4. ✅ 创建配置
5. ✅ 启动服务端和客户端
6. ✅ 打开浏览器

---

## 📁 文件位置

```
F:\Tenbox\openclaw_1\02\albion-lands\
├── launcher.bat           ← 双击这个！
├── launcher.ps1           ← PowerShell 版本
├── create-shortcut.bat    ← 创建桌面快捷方式
└── launcher/
    └── LAUNCHER.md        ← 详细说明
```

---

## 🎨 启动效果

### 控制台输出
```
========================================
       呼噜大陆 - 一键启动器
========================================

[1/6] 从 GitHub 拉取最新代码...
  ✓ 代码已更新到最新版本

[2/6] 检查服务端配置...
  ✓ .env 文件已存在

[3/6] 检查服务端依赖...
  ✓ 服务端依赖已安装

[4/6] 检查客户端依赖...
  ✓ 客户端依赖已安装

[5/6] 清理旧进程...
  ✓ 已清理旧进程

[6/6] 启动游戏服务...

✓ 启动完成！
游戏已在默认浏览器中打开
```

### 自动打开的窗口
- **窗口 1：** 呼噜大陆服务端
- **窗口 2：** 呼噜大陆客户端
- **浏览器：** http://localhost:3001

---

## 🔄 日常使用

### 每天首次启动
```
双击 launcher.bat
→ 自动更新代码
→ 自动启动
```

### 之后启动
```
双击桌面快捷方式
→ 快速启动
```

### 停止游戏
```
关闭两个控制台窗口
→ 服务自动停止
```

---

## ⚡ 优势

| 之前 | 现在 |
|------|------|
| 手动 git pull | ✅ 自动 |
| 手动 npm install | ✅ 自动 |
| 手动创建 .env | ✅ 自动 |
| 打开多个终端 | ✅ 自动 |
| 手动打开浏览器 | ✅ 自动 |
| 输入多个命令 | ✅ 双击即可 |

---

## 📞 遇到问题？

### 查看日志
```
albion-logs/
├── startup.log          # 启动日志
├── server-*.log        # 服务端日志
└── client-*.log        # 客户端日志
```

### 常见问题

**Q: Git 拉取失败？**
```powershell
# 检查网络
ping github.com

# 重新克隆
cd F:\Tenbox\openclaw_1\02
Remove-Item -Recurse -Force albion-lands
git clone https://github.com/CNMJH/albion-lands.git
```

**Q: 端口被占用？**
```powershell
# 停止所有 Node 进程
Get-Process node | Stop-Process -Force

# 重新启动 launcher.bat
```

**Q: 浏览器未打开？**
```powershell
# 手动打开
start http://localhost:3001
```

---

## 📝 更新说明

**每次运行 launcher.bat 都会：**
1. 自动从 GitHub 拉取最新代码
2. 自动检查是否需要安装依赖
3. 自动启动最新版本的 game

**所以你只需要：**
- 双击 launcher.bat
- 等待启动完成
- 开始游戏！

---

## 🎉 完成！

现在你有了：
- ✅ 一键启动器（launcher.bat）
- ✅ 桌面快捷方式（可选）
- ✅ 自动更新功能
- ✅ 完整的日志系统

**每次我更新代码后，你只需要：**
1. 双击 launcher.bat
2. 等待自动更新和启动
3. 开始游戏！

---

**GitHub 仓库：** https://github.com/CNMJH/albion-lands  
**启动器版本：** v1.0.0
