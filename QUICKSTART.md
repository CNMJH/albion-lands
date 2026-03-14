# 🚀 呼噜大陆 - 5 分钟快速开始指南

**适合**: 新手玩家  
**时间**: 5 分钟  
**难度**: ⭐⭐

---

## 第一步：安装 Node.js (2 分钟)

1. 打开 https://nodejs.org/
2. 点击绿色按钮 "Download LTS"
3. 下载完成后双击安装
4. 一路点击 "Next" → "Install" → "Finish"

**验证安装**:
```cmd
打开 CMD，输入：node --version
看到 v18.x.x 或 v20.x.x 即成功
```

---

## 第二步：下载游戏 (1 分钟)

**方法 A: 使用 Git**
```cmd
cd C:\Users\你的用户名\Documents\Games
git clone https://github.com/CNMJH/albion-lands.git
cd albion-lands
```

**方法 B: 手动下载**
1. 访问 https://github.com/CNMJH/albion-lands
2. 点击 "Code" → "Download ZIP"
3. 解压到任意目录

---

## 第三步：一键安装 (2 分钟)

1. 在游戏文件夹空白处
2. 按住 `Shift` + 右键
3. 选择 "在此处打开 PowerShell 窗口"
4. 运行：
```powershell
.\install.bat
```

等待安装完成（看到 "安装完成！🎉"）

---

## 第四步：启动游戏 (30 秒)

运行：
```powershell
.\launcher.bat
```

浏览器会自动打开游戏！

---

## 第五步：注册登录 (30 秒)

**使用测试账号**:
```
邮箱：test1@example.com
密码：password123
```

或注册新账号：
1. 点击 "注册"
2. 输入邮箱和密码
3. 点击注册
4. 登录游戏

---

## 🎮 开始游戏！

### 基础操作

| 操作 | 功能 |
|------|------|
| **鼠标右键** | 移动角色 |
| **WASD** | 移动角色 |
| **鼠标左键** | 攻击 |
| **QWERAS** | 技能 |
| **B** | 背包 |
| **C** | 装备 |
| **E** | 拾取 |

### 快捷键提示

按 **F10** 查看完整快捷键列表

---

## ❓ 遇到问题？

### 问题 1: 端口被占用

**解决**:
```powershell
.\force-restart.bat
```

### 问题 2: 页面空白

**解决**:
- 按 `Ctrl + Shift + R` 强制刷新
- 确认服务端和客户端都已启动

### 问题 3: 无法登录

**解决**:
- 检查服务端是否启动（端口 3002）
- 使用测试账号：test1@example.com / password123

---

## 📚 更多帮助

- 📖 [完整安装指南](docs/INSTALL_WINDOWS.md)
- 📖 [Windows 设置指南](docs/WINDOWS_SETUP.md)
- 📖 [玩家操作指南](docs/PLAYER_CONTROLS.md)

---

## ✅ 检查清单

- [ ] Node.js 已安装
- [ ] 游戏已下载
- [ ] 依赖已安装
- [ ] 服务已启动
- [ ] 可以登录游戏
- [ ] 角色可以移动

---

**祝你游戏愉快！** 🎉

**版本**: v0.4.0 Beta  
**更新日期**: 2026-03-14
