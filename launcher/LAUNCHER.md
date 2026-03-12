# 🚀 呼噜大陆 - Windows 一键启动器

**最后更新：** 2024-03-12  
**版本：** v1.0.0

---

## 📋 功能特性

### ✨ 核心功能

- ✅ **自动更新** - 从 GitHub 拉取最新代码
- ✅ **环境检查** - 自动检测 Git、Node.js
- ✅ **依赖管理** - 自动安装 npm 依赖
- ✅ **配置生成** - 自动创建 .env 文件
- ✅ **一键启动** - 同时启动服务端和客户端
- ✅ **自动打开浏览器** - 启动后自动打开游戏页面
- ✅ **进程管理** - 自动清理旧进程
- ✅ **日志记录** - 保存启动日志和运行日志

### 🎯 优势

| 传统方式 | 一键启动器 |
|----------|------------|
| 手动 git pull | ✅ 自动拉取 |
| 手动 npm install | ✅ 自动检查安装 |
| 手动创建 .env | ✅ 自动生成 |
| 打开多个终端 | ✅ 自动打开 |
| 手动输入命令 | ✅ 双击即可 |
| 手动打开浏览器 | ✅ 自动打开 |

---

## 📦 前提条件

确保已安装：

| 软件 | 版本 | 下载地址 |
|------|------|----------|
| **Git** | 最新 | https://git-scm.com/download/win |
| **Node.js** | 18+ | https://nodejs.org/ |

---

## 🚀 使用方法

### 方法 1：双击批处理文件（推荐）

1. **找到启动器文件**
   ```
   albion-lands/launcher.bat
   ```

2. **双击运行**
   - 第一次运行会自动克隆项目
   - 以后运行会自动更新

3. **等待启动完成**
   - 自动打开浏览器
   - 显示两个控制台窗口

### 方法 2：创建桌面快捷方式

1. **运行创建脚本**
   ```
   双击：create-shortcut.bat
   ```

2. **桌面会出现快捷方式**
   ```
   呼噜大陆启动器.lnk
   ```

3. **以后双击快捷方式即可**

---

## 📊 启动流程

```
开始
  ↓
检查 Git、Node.js
  ↓
检查项目是否存在 → 否 → 克隆项目
  ↓
Git pull 更新
  ↓
检查并创建 .env
  ↓
检查并安装依赖
  ↓
清理旧进程
  ↓
启动服务端
  ↓
启动客户端
  ↓
打开浏览器
  ↓
完成
```

---

## 🔧 故障排查

### 问题 1：Git 拉取失败
```powershell
# 检查网络
ping github.com

# 重新克隆
Remove-Item -Recurse -Force albion-lands
git clone https://github.com/CNMJH/albion-lands.git
```

### 问题 2：npm install 失败
```powershell
# 清理缓存
npm cache clean --force

# 重新安装
cd server && npm install
cd ..\client && npm install
```

### 问题 3：端口被占用
```powershell
# 停止所有 Node 进程
Get-Process node | Stop-Process -Force
```

---

## 📞 获取帮助

- **GitHub:** https://github.com/CNMJH/albion-lands
- **Issues:** https://github.com/CNMJH/albion-lands/issues

---

**祝你游戏愉快！** 🎮
