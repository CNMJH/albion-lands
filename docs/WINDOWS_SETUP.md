# 🎮 呼噜大陆 - Windows 启动指南

**最后更新：** 2024-03-12  
**版本：** v0.1.0  
**平台：** Windows 10/11

---

## 📋 目录

1. [前提条件](#前提条件)
2. [快速启动](#快速启动)
3. [开始游戏](#开始游戏)
4. [游戏操作](#游戏操作)
5. [GM 工具](#gm-工具)
6. [验证动画效果](#验证动画效果)
7. [常见问题](#常见问题)
8. [项目结构](#项目结构)
9. [测试清单](#测试清单)

---

## 📦 前提条件

确保你的 Windows 电脑已安装以下软件：

### 必需软件

| 软件 | 版本 | 下载地址 |
|------|------|----------|
| **Node.js** | 18+ | https://nodejs.org/ |
| **Git** | 最新 | https://git-scm.com/ |

### 验证安装

打开 PowerShell 或 CMD，运行：

```powershell
# 检查 Node.js 版本
node --version
# 应显示：v18.x.x 或更高

# 检查 npm 版本
npm --version
# 应显示：9.x.x 或更高

# 检查 Git 版本
git --version
# 应显示：git version 2.x.x
```

---

## 🚀 快速启动

### 步骤 1：克隆项目

```powershell
# 打开 PowerShell 或 CMD
# 选择你想存放项目的目录
cd C:\Users\你的用户名\Documents\Games

# 克隆项目
git clone https://github.com/CNMJH/albion-lands.git

# 进入项目目录
cd albion-lands
```

### 步骤 2：安装依赖

```powershell
# 安装服务端依赖
cd server
npm install

# 安装客户端依赖
cd ..\client
npm install
```

> ⏱️ **预计时间：** 3-5 分钟（取决于网络速度）

### 步骤 3：初始化数据库

```powershell
cd ..\server

# 运行数据库迁移
npx prisma migrate deploy

# 生成初始数据
npx prisma db seed
```

### 步骤 4：启动服务

**需要打开两个终端窗口：**

#### 终端 1 - 启动服务端

```powershell
# 新建一个 PowerShell 窗口
cd C:\Users\你的用户名\Documents\Games\albion-lands\server

# 启动开发服务器
npm run dev
```

**等待看到以下输出：**

```
✓ Server running at http://localhost:3002
✓ WebSocket ready at ws://localhost:3002/ws
✓ GM Tool at http://localhost:3002/gm/
✓ Database connected (SQLite)
```

#### 终端 2 - 启动客户端

```powershell
# 新建另一个 PowerShell 窗口
cd C:\Users\你的用户名\Documents\Games\albion-lands\client

# 启动开发服务器
npm run dev
```

**等待看到以下输出：**

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3001/
➜  Network: use --host to expose
```

---

## 🎯 开始游戏

### 方式 1：直接访问

打开浏览器（推荐 Chrome/Edge），访问：

**http://localhost:3001**

### 方式 2：使用测试账号登录

1. 访问 http://localhost:3001
2. 点击右上角 **"登录"** 按钮
3. 使用以下测试账号：

| 账号 | 密码 | 角色名 | 说明 |
|------|------|--------|------|
| `test1@example.com` | `password123` | 测试玩家 1 | 推荐用于单人测试 |
| `test2@example.com` | `password123` | 测试玩家 2 | 用于多人测试 |
| `test3@example.com` | `password123` | 测试玩家 3 | 用于多人测试 |

4. 点击 **"登录"** 按钮
5. 进入游戏世界！

---

## 🎮 游戏操作

### 键盘控制

| 按键 | 功能 | 说明 |
|------|------|------|
| `W` / `↑` | 向上移动 | 角色向上行走 |
| `S` / `↓` | 向下移动 | 角色向下行走 |
| `A` / `←` | 向左移动 | 角色向左行走 |
| `D` / `→` | 向右移动 | 角色向右行走 |
| `Space` | 攻击/确认 | 攻击目标或确认对话 |
| `I` | 打开背包 | 查看物品、装备 |
| `Q` | 打开任务面板 | 查看任务、成就 |
| `J` | 打开社交面板 | 好友、组队、聊天 |
| `C` | 打开制作面板 | 锻造、烹饪、炼金 |
| `G` | 打开采集面板 | 采矿、伐木、采集 |
| `Esc` | 关闭面板 | 关闭当前打开的面板 |

### 鼠标操作

| 操作 | 功能 |
|------|------|
| **点击地面** | 移动到该位置 |
| **点击怪物** | 选择为目标 |
| **点击 NPC** | 打开对话窗口 |
| **点击 UI 按钮** | 使用对应功能 |
| **拖拽物品** | 移动背包物品 |

### 战斗系统

1. **选择目标** - 点击怪物或按 `Tab` 切换目标
2. **发动攻击** - 按 `Space` 或点击攻击按钮
3. **查看血条** - 怪物和玩家都有血条显示
4. **获得奖励** - 击败怪物获得经验和银币

---

## 🛠️ GM 工具（管理员）

### 访问方式

打开浏览器访问：**http://localhost:3002/gm/**

### 功能列表

| 功能 | 说明 |
|------|------|
| **在线玩家** | 查看所有在线玩家信息 |
| **生成怪物** | 在指定位置生成怪物 |
| **全服消息** | 发送全服广播消息 |
| **社交管理** | 管理好友、组队系统 |
| **数据查询** | 查询玩家、物品数据 |

### 使用示例

**生成怪物：**
1. 选择怪物类型（史莱姆、蝙蝠、恶魔等）
2. 输入数量
3. 选择区域
4. 点击 **"生成"**

**发送全服消息：**
1. 在输入框填写消息内容
2. 点击 **"发送"**
3. 所有在线玩家会收到消息

---

## 🎬 验证动画效果

登录后你应该看到以下效果：

### 1. 怪物动画

- ✅ **史莱姆** - 蓝色果冻状，有呼吸动画
- ✅ **蝙蝠** - 黑色翅膀，有飞行动画
- ✅ **幽灵** - 半透明，有漂浮动画
- ✅ **恶魔** - 红色，有完整攻击/受伤/死亡动画
- ✅ **巨龙** - 红色，有喷火攻击动画
- ✅ **蜥蜴** - 绿色，有行走动画
- ✅ **美杜莎** - 蛇发，有石化技能动画

### 2. 玩家角色

- ✅ 可以移动（键盘或鼠标）
- ✅ 可以攻击怪物
- ✅ 血条显示在头顶
- ✅ 等级显示在名字旁

### 3. UI 系统

- ✅ **左上角** - 角色信息（头像、血条、魔法条）
- ✅ **右上角** - 小地图（显示周围环境和怪物）
- ✅ **底部** - 快捷栏（技能、物品）
- ✅ **右侧** - 任务追踪（当前任务进度）

### 4. 战斗特效

- ✅ **伤害数字** - 攻击时显示红色/白色数字
- ✅ **攻击动画** - 怪物攻击时有动作
- ✅ **受伤动画** - 怪物受伤时有反应
- ✅ **死亡动画** - 怪物死亡时播放死亡动画

---

## 🔧 常见问题

### 问题 1：端口被占用

**错误信息：**
```
Error: EADDRINUSE: address already in use :::3002
```

**解决方法：**

```powershell
# 1. 查看占用端口的进程
netstat -ano | findstr :3002
netstat -ano | findstr :3001

# 输出示例：
# TCP    0.0.0.0:3002    0.0.0.0:0    LISTENING    12345

# 2. 杀死进程（替换 PID）
taskkill /PID 12345 /F

# 3. 或者重启电脑（最简单）
```

### 问题 2：依赖安装失败

**错误信息：**
```
npm ERR! code ENOENT
npm ERR! syscall open
```

**解决方法：**

```powershell
# 1. 清理 npm 缓存
npm cache clean --force

# 2. 删除 node_modules 和 package-lock.json
cd server
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

cd ..\client
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 3. 重新安装
cd ..\server
npm install

cd ..\client
npm install
```

### 问题 3：数据库错误

**错误信息：**
```
Error: Can't reach database server
```

**解决方法：**

```powershell
cd server

# 1. 重置数据库
npx prisma migrate reset

# 2. 重新生成数据
npx prisma db seed

# 3. 检查数据库文件是否存在
ls prisma/dev.db
```

### 问题 4：客户端白屏

**可能原因：**
- 服务端未启动
- 网络连接问题
- 浏览器缓存

**解决方法：**

1. **检查服务端** - 确保终端 1 显示 "Server running"
2. **清除缓存** - 按 `Ctrl+Shift+Delete` 清除浏览器缓存
3. **开发者工具** - 按 `F12` 查看 Console 错误
4. **检查 Network** - 查看是否有失败的请求

### 问题 5：怪物不显示动画

**可能原因：**
- 动画配置未加载
- 浏览器不支持

**解决方法：**

1. 打开浏览器开发者工具（F12）
2. 查看 Console 是否有错误
3. 检查 Network 标签中 `monster_animations.json` 是否加载成功
4. 刷新页面（Ctrl+F5 强制刷新）

### 问题 6：npm run dev 命令找不到

**错误信息：**
```
npm ERR! missing script: dev
```

**解决方法：**

```powershell
# 确保在正确的目录
cd server    # 或 client

# 查看可用的脚本
npm run

# 应该有：
# dev - 启动开发服务器
# build - 构建生产版本
# test - 运行测试
```

---

## 📁 项目结构

```
albion-lands/
│
├── client/                      # 客户端 (React + Pixi.js + TypeScript)
│   ├── src/
│   │   ├── renderer/            # 渲染系统
│   │   │   ├── GameRenderer.ts  # 游戏渲染器
│   │   │   ├── MonsterRenderer.ts  # 怪物渲染器（含动画）
│   │   │   ├── SpriteAnimator.ts   # 动画播放器
│   │   │   └── CombatRenderer.ts   # 战斗渲染
│   │   ├── systems/             # 游戏系统
│   │   │   ├── CombatSystem.ts  # 战斗系统
│   │   │   ├── MonsterAI.ts     # 怪物 AI
│   │   │   ├── InventorySystem.ts  # 背包系统
│   │   │   └── QuestSystem.ts   # 任务系统
│   │   ├── network/             # 网络通信
│   │   │   └── NetworkManager.ts
│   │   ├── components/          # React 组件
│   │   ├── stores/              # 状态管理 (Zustand)
│   │   └── App.tsx              # 主应用
│   ├── assets/                  # 美术资源
│   │   ├── monsters/            # 怪物动画
│   │   ├── characters/          # 角色精灵
│   │   ├── tiles/               # 地砖
│   │   └── items/               # 物品图标
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # 服务端 (Node.js + Fastify + SQLite)
│   ├── src/
│   │   ├── services/            # 业务逻辑
│   │   │   ├── QuestService.ts  # 任务服务
│   │   │   ├── CombatService.ts # 战斗服务
│   │   │   └── SocialService.ts # 社交服务
│   │   ├── routes/              # API 路由
│   │   │   ├── quests.ts        # 任务 API
│   │   │   ├── combat.ts        # 战斗 API
│   │   │   └── social.ts        # 社交 API
│   │   ├── websocket/           # WebSocket 处理
│   │   └── index.ts             # 入口文件
│   ├── prisma/
│   │   ├── schema.prisma        # 数据库模型
│   │   ├── dev.db               # SQLite 数据库
│   │   └── seed.ts              # 初始数据
│   ├── gm/                      # GM 工具
│   │   ├── index.html
│   │   └── gm-app.js
│   ├── package.json
│   └── tsconfig.json
│
├── assets/monsters/             # 怪物动画资源
│   ├── demon/                   # 恶魔精灵图表
│   │   ├── idle.png             # 待机动画 (3 帧)
│   │   ├── walk.png             # 行走动画 (6 帧)
│   │   ├── attack.png           # 攻击动画 (4 帧)
│   │   ├── hurt.png             # 受伤动画 (2 帧)
│   │   └── death.png            # 死亡动画 (6 帧)
│   ├── dragon/                  # 巨龙精灵图表
│   ├── jinn_animation/          # 精灵精灵图表
│   ├── lizard/                  # 蜥蜴精灵图表
│   ├── medusa/                  # 美杜莎精灵图表
│   ├── small_dragon/            # 小巨龙精灵图表
│   └── monster_animations.json  # 动画配置文件
│
├── tools/                       # 开发工具
│   ├── merge_sprites.js         # 精灵图表合并工具
│   └── merge_sprites.py         # Python 版本（备用）
│
├── docs/                        # 文档
│   ├── WINDOWS_SETUP.md         # 本文档
│   ├── MONSTER_ANIMATION_INTEGRATION.md  # 动画集成报告
│   └── ...                      # 其他文档
│
├── .gitignore
├── package.json
└── README.md
```

---

## 📊 测试清单

### 基础功能

- [ ] 客户端可以访问（http://localhost:3001）
- [ ] 服务端正常运行（http://localhost:3002）
- [ ] 可以登录测试账号
- [ ] 角色可以移动（键盘和鼠标）
- [ ] 角色可以攻击

### 怪物动画

- [ ] 可以看到怪物（史莱姆、蝙蝠等）
- [ ] 怪物有 idle 动画（呼吸/漂浮）
- [ ] 怪物有 walk 动画（移动时）
- [ ] 攻击时播放攻击动画
- [ ] 受伤时播放受伤动画
- [ ] 死亡时播放死亡动画

### UI 系统

- [ ] 血条显示正常
- [ ] 等级显示正常
- [ ] 可以打开背包（I 键）
- [ ] 可以打开任务面板（Q 键）
- [ ] 可以打开社交面板（J 键）
- [ ] 任务追踪显示正常

### 战斗系统

- [ ] 可以选择怪物为目标
- [ ] 攻击时显示伤害数字
- [ ] 怪物血条会减少
- [ ] 击败怪物获得经验
- [ ] 玩家血条会变化（被攻击时）

### 网络通信

- [ ] WebSocket 连接正常
- [ ] 移动同步正常
- [ ] 战斗同步正常
- [ ] 聊天消息可以发送

---

## 💡 开发提示

### 热更新

- **客户端** - 修改代码后自动刷新（Vite HMR）
- **服务端** - 需要手动重启（Ctrl+C 然后 npm run dev）

### 查看日志

- **客户端日志** - 浏览器 Console（F12）
- **服务端日志** - 终端 1 输出
- **网络请求** - 浏览器 Network 标签（F12）

### 停止服务

在终端窗口按 `Ctrl+C` 停止服务。

### 生产构建

```powershell
# 客户端构建
cd client
npm run build

# 服务端构建
cd server
npm run build

# 启动生产服务器
npm start
```

---

## 📞 获取帮助

### 文档位置

| 文档 | 路径 | 说明 |
|------|------|------|
| 动画集成报告 | `docs/MONSTER_ANIMATION_INTEGRATION.md` | 动画系统技术细节 |
| 美术资源报告 | `docs/ART_ASSETS_REPORT.md` | 美术资源来源 |
| 怪物素材报告 | `docs/MONSTER_ASSETS_REPORT.md` | 怪物素材详情 |
| 任务系统完成报告 | `docs/PHASE6_COMPLETION_REPORT.md` | 任务系统文档 |

### GitHub 仓库

**https://github.com/CNMJH/albion-lands**

- 查看 Issues 了解已知问题
- 查看 Commits 了解最新变更
- 提交 Issue 报告新问题

### 技术栈

| 部分 | 技术 |
|------|------|
| **客户端** | React 18 + Pixi.js v7 + TypeScript + Zustand |
| **服务端** | Node.js 18 + Fastify + SQLite + Prisma |
| **通信** | WebSocket + HTTP REST API |
| **动画** | 自定义 SpriteAnimator + PIXI.Texture |

---

## 🎉 开始冒险！

一切准备就绪后：

1. 确保两个终端都在运行
2. 打开浏览器访问 http://localhost:3001
3. 登录测试账号
4. 开始你的呼噜大陆冒险！

**祝你玩得开心！** 🎮✨

---

## 📝 更新日志

### v0.1.0 (2024-03-12)

- ✅ 完成怪物动画系统集成
- ✅ 支持 6 种怪物、34 个动画、150+ 帧
- ✅ 实现战斗动画（攻击/受伤/死亡）
- ✅ 添加临时怪物颜色调整
- ✅ 编译通过（0 错误）
- ✅ 完善 Windows 启动文档

---

**文档维护：** 波波（AI 助手）  
**最后更新：** 2024-03-12
