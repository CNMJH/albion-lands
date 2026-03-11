# 🎮 阿尔比恩大陆 (Albion Lands)

**2D MMORPG 浏览器游戏 - 类阿尔比恩 + OpenClaw AI 支持**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-development-yellow.svg)

---

## 📖 项目简介

《阿尔比恩大陆》是一款受 Albion Online 启发的 2D 上帝视角 MMORPG 浏览器游戏。

**核心特色：**
- 🎯 **玩家驱动经济**：所有装备由玩家制造，所有资源由玩家采集
- ⚔️ **全物品掉落**：危险区域死亡掉落全部装备
- 🔄 **无职业限制**：装备决定能力，自由搭配
- 🤖 **AI 代理支持**：OpenClaw 自动化，真人玩家与 AI 平衡共存

---

## 🎮 核心玩法

```
采集资源 → 生产制造 → 装备角色 → 战斗/副本 → 获取奖励
     ↑                                        │
     └────────────── 市场交易 ←───────────────┘
```

### 游戏特色

| 系统 | 描述 |
|------|------|
| 🗺️ 世界地图 | 9 个区域，从安全新手村到危险深渊 |
| ⚔️ 战斗系统 | 实时战斗，技能组合，PVP/PVE |
| 💰 经济系统 | 玩家驱动市场，自由交易 |
| 🏰 社交系统 | 组队、公会、好友、聊天 |
| 🤖 OpenClaw | AI 代理自动化，有限 API 保证平衡 |

---

## 🏗️ 技术架构

### 客户端 (H5)
- **渲染引擎**: Pixi.js v7
- **UI 框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **网络通信**: WebSocket + Protocol Buffers

### 服务端
- **运行环境**: Node.js 20 + TypeScript
- **Web 框架**: Fastify
- **数据库**: PostgreSQL + Redis
- **消息队列**: RabbitMQ

### AI 集成
- **框架**: OpenClaw
- **API**: 有限制 WebSocket API
- **平衡**: AI 收益 8 折，操作延迟模拟真人

---

## 📁 项目结构

```
albion-lands/
├── docs/                    # 设计文档
│   └── GDD.md              # 游戏设计文档
├── client/                  # H5 客户端
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   ├── systems/        # 游戏系统
│   │   ├── network/        # 网络通信
│   │   └── renderer/       # 渲染引擎
│   └── package.json
├── server/                  # 服务端
│   ├── src/
│   │   ├── gateway/        # 网关服务
│   │   ├── game/           # 游戏逻辑
│   │   ├── database/       # 数据库
│   │   └── openclaw/       # OpenClaw API
│   └── package.json
├── openclaw/               # OpenClaw SDK
│   └── src/
├── configs/                # 游戏配置
│   ├── items.json          # 物品配置
│   ├── monsters.json       # 怪物配置
│   └── zones.json          # 区域配置
└── scripts/                # 工具脚本
```

---

## 🚀 开发计划

| 阶段 | 时间 | 内容 |
|------|------|------|
| 阶段 1 | 4 周 | 核心框架（渲染、网络、数据库） |
| 阶段 2 | 6 周 | 核心玩法（战斗、背包、经济） |
| 阶段 3 | 4 周 | 多人联机（组队、公会、聊天） |
| 阶段 4 | 8 周 | 内容扩展（地图、怪物、副本） |
| 阶段 5 | 4 周 | OpenClaw 集成 |
| 阶段 6 | 4 周 | 测试优化 |

**预计总周期：** 30 周

---

## 📖 文档

- [游戏设计文档](./docs/GDD.md) - 完整的游戏设计文档
- [API 文档](./docs/api.md) - 服务端 API 接口（待创建）
- [OpenClaw SDK](./openclaw/README.md) - AI 代理开发指南（待创建）

---

## 🤝 参与贡献

欢迎贡献！请查看：
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情

---

## 👥 团队

- **开发者**: CNMJH
- **AI 助手**: 波波

---

## 📞 联系方式

- **GitHub**: [@CNMJH](https://github.com/CNMJH)
- **项目地址**: https://github.com/CNMJH/albion-lands

---

_⚔️ 愿你在阿尔比恩大陆书写自己的传奇！_
