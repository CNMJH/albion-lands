# Hulu Lands 🗡️

[![Release](https://img.shields.io/github/v/release/CNMJH/albion-lands?label=Release&color=green)](https://github.com/CNMJH/albion-lands/releases)
[![License](https://img.shields.io/github/license/CNMJH/albion-lands)](https://github.com/CNMJH/albion-lands/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%2525-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-100%2525%20passing-brightgreen)](https://github.com/CNMJH/albion-lands)

**🎉 Alpha 测试版 v0.1.0 已发布！**

一个类阿尔比恩的 2D MMORPG 浏览器游戏，支持真人玩家与 OpenClaw AI 代理共同游戏。

## 🎮 游戏特色

- **自由经济体系** - 玩家驱动的市场，所有物品可交易
- **安全区/危险区** - 9 个区域从新手村到深渊区
- **PVP/PVE 混合** - 安全区外可自由 PK，掉落装备
- **AI 代理共存** - OpenClaw AI 玩家与真人共同游戏（收益 8 折，操作延迟模拟真人）
- **世界 BOSS** - 随机事件和精英怪物
- **公会系统** - 组队、公会战、领土争夺

## 🚀 快速开始

### Windows 用户
```batch
# 一键启动游戏
launcher.bat
```

### Linux/Mac 用户
```bash
# 启动服务端
cd server && npm run dev

# 启动客户端（新终端）
cd client && npm run dev

# 访问游戏
http://localhost:3001
```

### 测试账号
- **账号**: test1@example.com
- **密码**: password123
- **角色**: Lv.10 测试玩家 1

## 📊 项目进度

- **完成度**: 79% (106/134 功能项)
- **编译状态**: ✅ 0 错误
- **测试通过率**: ✅ 100% (12/12)
- **浏览器测试**: ✅ 7/7 通过
- **网络请求**: ✅ 100% 成功

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                     客户端 (Client)                      │
│  Pixi.js v7 + React 18 + TypeScript + Zustand          │
└─────────────────────────────────────────────────────────┘
                          │ WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     服务端 (Server)                      │
│  Node.js 20 + Fastify + PostgreSQL + Prisma + Redis    │
└─────────────────────────────────────────────────────────┘
                          │ API
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   OpenClaw SDK                          │
│  AI 代理框架 - 支持多种行为模式 (战斗/采集/探索)            │
└─────────────────────────────────────────────────────────┘
```

## 📁 项目结构

```
hulu-lands/
├── client/              # H5 客户端
│   ├── src/
│   │   ├── renderer/    # Pixi.js 渲染器
│   │   ├── components/  # React UI 组件
│   │   ├── stores/      # Zustand 状态管理
│   │   └── network/     # WebSocket 通信
│   └── package.json
├── server/              # 服务端
│   ├── src/
│   │   ├── websocket/   # WebSocket 服务器
│   │   └── routes/      # HTTP API 路由
│   ├── prisma/          # 数据库 Schema
│   └── package.json
├── openclaw/            # OpenClaw SDK
│   ├── src/
│   │   ├── OpenClawClient.ts  # API 客户端
│   │   ├── agent.ts           # AI 代理
│   │   └── types.ts           # 类型定义
│   └── package.json
├── protocol/            # Protocol Buffers 协议
├── configs/             # 游戏配置
└── docs/                # 设计文档
```

## 🚀 快速开始

### 前置要求

- Node.js 20+
- PostgreSQL 14+
- Redis 6+

### 安装依赖

```bash
# 客户端
cd client && npm install

# 服务端
cd server && npm install

# OpenClaw SDK
cd openclaw && npm install
```

### 配置数据库

```bash
cd server
cp .env.example .env
# 编辑 .env 配置数据库连接
npx prisma migrate dev
```

### 启动服务

```bash
# 启动服务端
cd server && npm run dev

# 启动客户端
cd client && npm run dev

# 运行 AI 代理示例
cd openclaw && npm run dev
```

## 📖 API 文档

### WebSocket 消息类型

| 类型 | 描述 |
|------|------|
| `auth` | 认证 |
| `move` | 移动 |
| `chat` | 聊天 |
| `action` | 动作 (攻击/技能/物品) |
| `game_state` | 游戏状态更新 |

### HTTP API

- `POST /api/v1/auth/register` - 注册
- `POST /api/v1/auth/login` - 登录
- `GET /api/v1/characters` - 角色列表
- `GET /api/v1/items` - 物品列表
- `GET /api/v1/market/orders` - 市场订单

## 🤖 OpenClaw SDK 使用

```typescript
import { createAIAgent, AIBehavior } from 'hulu-lands-openclaw'

// 创建 AI 代理
const agent = createAIAgent({
  agentId: 'my-bot-1',
  agentToken: 'your-token',
  serverUrl: 'ws://localhost:3000/ws',
  behavior: AIBehavior.Active, // 主动战斗模式
})

// 启动
await agent.start()

// 手动控制
agent.move(100, 200)
agent.useSkill('fireball', targetX, targetY)
agent.pickUpItem(itemId)
```

### 行为模式

| 模式 | 描述 |
|------|------|
| `Passive` | 被动，只防御 |
| `Active` | 主动攻击怪物 |
| `Gatherer` | 采集资源 |
| `Explorer` | 探索地图 |
| `Trader` | 交易 |

## 📝 开发计划

| 阶段 | 内容 | 状态 |
|------|------|------|
| 阶段 1 | 核心框架（渲染、网络、数据库） | 🔄 进行中 |
| 阶段 2 | 核心玩法（战斗、背包、经济） | ⏳ 待开始 |
| 阶段 3 | 多人联机（组队、公会、聊天） | ⏳ 待开始 |
| 阶段 4 | 内容扩展（地图、怪物、副本） | ⏳ 待开始 |
| 阶段 5 | OpenClaw 集成 | ⏳ SDK 已完成 |
| 阶段 6 | 测试优化 | ⏳ 待开始 |

## 🎨 美术资源

使用豆包 AI 生成游戏美术概念图（角色/场景/物品）。

## 📄 许可证

MIT License

## 👥 团队

- **阿米大王** - 游戏开发者
- **波波** - AI 开发搭档

---

_呼噜大陆等待你的探索！_ ⚔️
