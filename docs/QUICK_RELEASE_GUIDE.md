# 📝 GitHub Release 快速创建指南

**URL**: https://github.com/CNMJH/albion-lands/releases/new

---

## 1️⃣ 登录 GitHub

访问：https://github.com/login

---

## 2️⃣ 填写 Release 信息

### Tag version
```
v0.3.0-alpha
```

### Target
```
main (latest)
```

### Release title
```
v0.3.0-alpha - 双 100% 测试通过 🎉
```

### Release description (复制以下内容)

```markdown
## 🎊 发布亮点

- ✅ **API 测试 100%**: 19/19 通过
- ✅ **UI 测试 100%**: 15/15 通过
- ✅ **P0 核心功能**: 11/11 完成
- ✅ **P1 游戏内容**: 5/5 完成
- ✅ **P2 优化功能**: 6/6 完成
- ✅ **总进度**: 93% (143/153)

---

## ✨ 核心功能

### 🎮 P0 - 核心玩法
- ⚔️ LOL 风格控制（右键移动/攻击，QWER 技能）
- 💀 死亡掉落（安全区规则、耐久度系统）
- ⚔️ PVP 系统（玩家对战、击杀公告）
- 🤝 交易系统（原子交换、双重确认）
- 🏪 拍卖行（市场订单、税费系统）
- 🛡️ 装备系统（6 槽位、战力评分）
- 🗺️ 小地图（200x200px Canvas）

### 🌍 P1 - 游戏内容
- 🗺️ 5 区域地图、安全等级系统
- 🧙 5 种 NPC 类型
- ⛏️ 采集/制造系统
- 📋 每日任务系统

### 🏆 P2 - 优化功能
- 🎖️ 成就系统（7 种类型）
- 📊 排行榜（5 种排名）
- 🏦 仓库系统（100 格）
- 🔌 断线重连
- 📦 物品详情统计
- 📈 死亡统计/复活点绑定

---

## 🧪 测试成绩

### API 测试 (19/19) ✅
```
总测试数：19
✅ 通过：19
❌ 失败：0
通过率：100%
```

### UI 测试 (15/15) ✅
```
Running 15 tests using 1 worker
✅ 15 passed (38.2s)
```

---

## 🔧 技术栈

**客户端**: Pixi.js v7 + React 18 + TypeScript + Zustand + Vite  
**服务端**: Node.js 18 + Fastify + SQLite + Prisma  
**测试**: Playwright + Shell Scripts

---

## 🚀 快速开始

### Windows 用户
```batch
launcher.bat
```

### Linux/Mac 用户
```bash
# 服务端
cd server && npm run dev

# 客户端（新终端）
cd client && npm run dev
```

访问：http://localhost:3001

---

## 🎮 测试账号

| 账号 | 密码 |
|------|------|
| test1@example.com | password123 |
| test2@example.com | password123 |
| test3@example.com | password123 |

---

## 🎯 操作指南

### 基础操作
- **移动**: 鼠标右键点击地面
- **攻击**: 鼠标右键点击敌人
- **技能**: QWER 键
- **拾取**: E 键
- **冲刺**: Shift 键

### UI 快捷键
- **B**: 背包
- **C**: 装备
- **M**: 拍卖行
- **Enter**: 聊天
- **F1**: 死亡统计
- **F2**: 复活点

---

## 📊 性能指标

| 指标 | 实际 |
|------|------|
| 首屏加载 | ~3 秒 |
| API 响应 | ~50ms |
| FPS | 60 |
| API 测试 | 100% |
| UI 测试 | 100% |

---

## 📁 文档链接

- [发布说明](https://github.com/CNMJH/albion-lands/blob/main/docs/RELEASE_NOTES_v0.3.0.md)
- [API 测试报告](https://github.com/CNMJH/albion-lands/blob/main/docs/API_100_PERCENT_REPORT.md)
- [UI 测试报告](https://github.com/CNMJH/albion-lands/blob/main/docs/UI_TEST_100_PERCENT_REPORT.md)
- [Windows 安装指南](https://github.com/CNMJH/albion-lands/blob/main/docs/WINDOWS_SETUP.md)
- [测试指南](https://github.com/CNMJH/albion-lands/blob/main/docs/TESTING_GUIDE.md)

---

## ⏭️ 未来计划

- [ ] 世界 BOSS 系统
- [ ] 随机事件系统
- [ ] 公会系统
- [ ] 外观/时装系统
- [ ] 坐骑系统

---

## 📞 反馈

- **Issues**: https://github.com/CNMJH/albion-lands/issues
- **项目主页**: https://github.com/CNMJH/albion-lands

---

**MIT License** © 2026 Hulu Lands Team
```

---

## 3️⃣ 勾选选项

- [ ] ✅ Set as the latest release

---

## 4️⃣ 点击发布

点击绿色按钮：**"Publish release"**

---

## 5️⃣ 验证发布

发布后访问：https://github.com/CNMJH/albion-lands/releases

应该能看到 v0.3.0-alpha 版本。

---

## 6️⃣ 分享 Release

复制 Release 链接分享给测试玩家：

```
https://github.com/CNMJH/albion-lands/releases/tag/v0.3.0-alpha
```

---

## 📣 通知模板（微信群/Discord）

```
🎉 Hulu Lands v0.3.0-alpha 发布啦！

✅ API 测试 100% (19/19)
✅ UI 测试 100% (15/15)
✅ P0+P1+P2 功能 93% 完成

🎮 立即体验：
https://github.com/CNMJH/albion-lands/releases/tag/v0.3.0-alpha

📋 测试账号：
test1@example.com / password123

欢迎反馈 Bug 和建议！🐛
```

---

**预计时间**: 5-10 分钟  
**难度**: ⭐ (简单)
