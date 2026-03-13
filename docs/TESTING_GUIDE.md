# 功能测试验证指南

**日期**: 2026-03-13  
**版本**: v0.2.0-alpha  
**测试覆盖**: P0+P1+P2 (93% 功能)

---

## 🚀 快速启动

### 1. 启动服务端

```bash
cd /home/tenbox/albion-lands/server
npm run dev
```

**验证**: 访问 http://localhost:3002/health 应返回 `{"status":"ok"}`

### 2. 启动客户端

```bash
cd /home/tenbox/albion-lands/client
npm run dev
```

**验证**: 访问 http://localhost:3001 应看到游戏界面

---

## 📋 测试清单

### P0 核心功能 (100%)

#### ✅ 移动控制
- [ ] 右键点击地面移动
- [ ] 右键点击敌人攻击
- [ ] Shift 键冲刺
- [ ] 角色面向移动方向

**测试截图**: `screenshots/p0-move.png`

---

#### ✅ 战斗系统
- [ ] QWER 技能释放
- [ ] 技能冷却显示
- [ ] 技能特效（金黄色光环）
- [ ] 攻击范围检测

**测试截图**: `screenshots/p0-combat.png`

---

#### ✅ 背包系统 (B 键)
- [ ] B 键打开/关闭背包
- [ ] 物品显示正常
- [ ] 物品数量显示
- [ ] 50 格容量

**测试截图**: `screenshots/p0-backpack.png`

---

#### ✅ 装备系统 (C 键)
- [ ] C 键打开/关闭装备
- [ ] 6 个装备槽位显示
- [ ] 属性面板显示
- [ ] 战力评分显示
- [ ] 耐久度条显示

**测试截图**: `screenshots/p0-equipment.png`

---

#### ✅ 死亡掉落
- [ ] 死亡后装备耐久度 -10
- [ ] 安全区不掉落
- [ ] 危险区掉落物品
- [ ] 掉落物黄色发光圈
- [ ] E 键拾取掉落物

**测试截图**: `screenshots/p0-death.png`

---

#### ✅ PVP 系统
- [ ] 安全区无法攻击玩家
- [ ] 危险区可以 PVP
- [ ] 伤害数字显示
- [ ] 击杀公告（屏幕顶部）

**GM 工具测试**: http://localhost:3002/gm/pvp-test.html

---

#### ✅ 交易系统
- [ ] E 键发起交易
- [ ] 双重确认机制
- [ ] 物品和银币交换
- [ ] 交易成功提示

**GM 工具测试**: http://localhost:3002/gm/trade-test.html

---

#### ✅ 拍卖行 (M 键)
- [ ] M 键打开/关闭
- [ ] 购买标签页
- [ ] 出售标签页
- [ ] 历史标签页
- [ ] 费用预览（1% 上架费 +5% 成交税）

**测试截图**: `screenshots/p0-market.png`

---

#### ✅ 小地图
- [ ] 右上角显示 200x200
- [ ] 玩家位置标记
- [ ] 缩放比例正确

**测试截图**: `screenshots/p0-minimap.png`

---

#### ✅ 聊天系统 (Enter 键)
- [ ] Enter 打开聊天框
- [ ] 聊天激活时禁用快捷键
- [ ] 区域聊天正常

**测试截图**: `screenshots/p0-chat.png`

---

### P1 游戏内容 (100%)

#### ✅ 死亡统计 (F1 键)
- [ ] F1 打开/关闭
- [ ] 总死亡次数
- [ ] PVP/PVE 死亡分类
- [ ] 最危险地图
- [ ] 死亡记录列表

**测试截图**: `screenshots/p1-death-stats.png`

---

#### ✅ 复活点绑定 (F2 键)
- [ ] F2 打开/关闭
- [ ] 绑定当前位置
- [ ] 查询已绑定复活点
- [ ] 重置到初始城市

**测试截图**: `screenshots/p1-respawn.png`

---

#### ✅ 地图系统
**API 测试**:
```bash
curl http://localhost:3002/api/v1/maps
curl http://localhost:3002/api/v1/maps/starter_city
```

**验证**: 返回 5 张地图数据

---

#### ✅ NPC 系统
**API 测试**:
```bash
curl http://localhost:3002/api/v1/npcs
curl http://localhost:3002/api/v1/npcs/:npcId
```

**验证**: 返回 NPC 列表和详情

---

#### ✅ 采集系统
**API 测试**:
```bash
curl -X POST http://localhost:3002/api/v1/gathering/gather \
  -H "Content-Type: application/json" \
  -d '{"characterId":"1fc5bfa9-a54b-406c-abaa-adb032a3f59a","resourceType":"herb"}'
```

**验证**: 获得资源和经验

---

#### ✅ 制造系统
**API 测试**:
```bash
curl -X POST http://localhost:3002/api/v1/crafting/craft \
  -H "Content-Type: application/json" \
  -d '{"characterId":"1fc5bfa9-a54b-406c-abaa-adb032a3f59a","recipeId":"health_potion_1"}'
```

**验证**: 制造成功并获得物品

---

#### ✅ 每日任务
**API 测试**:
```bash
curl http://localhost:3002/api/v1/daily-quests/1fc5bfa9-a54b-406c-abaa-adb032a3f59a
```

**验证**: 返回每日任务列表

---

### P2 优化功能 (100%)

#### ✅ 成就系统
**API 测试**:
```bash
curl http://localhost:3002/api/v1/achievements/1fc5bfa9-a54b-406c-abaa-adb032a3f59a
curl -X POST http://localhost:3002/api/v1/achievements/update \
  -H "Content-Type: application/json" \
  -d '{"characterId":"1fc5bfa9-a54b-406c-abaa-adb032a3f59a","type":"monster_kill","value":10}'
```

**验证**: 返回成就进度和奖励

---

#### ✅ 排行榜系统
**API 测试**:
```bash
curl http://localhost:3002/api/v1/leaderboard/level?limit=10
curl http://localhost:3002/api/v1/leaderboard/pvp?limit=10
curl http://localhost:3002/api/v1/leaderboard/wealth?limit=10
curl http://localhost:3002/api/v1/leaderboard/my-rank/1fc5bfa9-a54b-406c-abaa-adb032a3f59a
```

**验证**: 返回排行榜数据

---

#### ✅ 仓库系统
**API 测试**:
```bash
curl http://localhost:3002/api/v1/bank/1fc5bfa9-a54b-406c-abaa-adb032a3f59a
curl -X POST http://localhost:3002/api/v1/bank/deposit \
  -H "Content-Type: application/json" \
  -d '{"characterId":"1fc5bfa9-a54b-406c-abaa-adb032a3f59a","itemId":"xxx","quantity":1}'
curl -X POST http://localhost:3002/api/v1/bank/withdraw \
  -H "Content-Type: application/json" \
  -d '{"characterId":"1fc5bfa9-a54b-406c-abaa-adb032a3f59a","itemId":"xxx","quantity":1}'
```

**验证**: 存入/取出成功

---

#### ✅ 断线重连
**API 测试**:
```bash
curl -X POST http://localhost:3002/api/v1/player/disconnect \
  -H "Content-Type: application/json" \
  -d '{"characterId":"1fc5bfa9-a54b-406c-abaa-adb032a3f59a"}'
curl -X POST http://localhost:3002/api/v1/player/reconnect \
  -H "Content-Type: application/json" \
  -d '{"characterId":"1fc5bfa9-a54b-406c-abaa-adb032a3f59a"}'
curl http://localhost:3002/api/v1/player/offline-rewards/1fc5bfa9-a54b-406c-abaa-adb032a3f59a
curl -X POST http://localhost:3002/api/v1/player/claim-offline-rewards \
  -H "Content-Type: application/json" \
  -d '{"characterId":"1fc5bfa9-a54b-406c-abaa-adb032a3f59a"}'
```

**验证**: 断线保存/重连恢复/离线奖励

---

#### ✅ 物品详情
**API 测试**:
```bash
curl http://localhost:3002/api/v1/items/:itemId
curl "http://localhost:3002/api/v1/items/compare?itemId1=xxx&itemId2=yyy"
```

**验证**: 返回物品详情和市场数据

---

## 🧪 Playwright 自动化测试

### 运行完整测试

```bash
cd /home/tenbox/albion-lands
npx playwright test tests/full-features.spec.ts --headed
```

### 测试覆盖率

- ✅ 游戏加载
- ✅ 背包功能 (B 键)
- ✅ 装备功能 (C 键)
- ✅ 聊天功能 (Enter 键)
- ✅ 拍卖行功能 (M 键)
- ✅ 小地图显示
- ✅ 技能栏显示
- ✅ 死亡统计 (F1 键)
- ✅ 复活点面板 (F2 键)
- ✅ API 健康检查

---

## 📊 测试结果记录

### 浏览器测试

| 功能 | 状态 | 截图 | 时间 |
|------|------|------|------|
| 游戏加载 | ⏳ | - | - |
| 背包功能 | ⏳ | - | - |
| 装备功能 | ⏳ | - | - |
| 聊天功能 | ⏳ | - | - |
| 拍卖行 | ⏳ | - | - |
| 小地图 | ⏳ | - | - |
| 死亡统计 | ⏳ | - | - |
| 复活点 | ⏳ | - | - |

### API 测试

| 端点 | 状态 | 响应时间 |
|------|------|----------|
| /health | ⏳ | - |
| /api/v1/maps | ⏳ | - |
| /api/v1/npcs | ⏳ | - |
| /api/v1/achievements | ⏳ | - |
| /api/v1/leaderboard | ⏳ | - |
| /api/v1/bank | ⏳ | - |
| /api/v1/player | ⏳ | - |

---

## 🎯 测试重点

### 关键路径测试
1. **登录 → 移动 → 战斗 → 死亡 → 复活 → 拾取**
2. **采集 → 制造 → 装备 → 交易 → 拍卖**
3. **断线 → 重连 → 离线奖励**

### 边界测试
1. 背包满时无法拾取
2. 仓库满时无法存入
3. 安全区无法 PVP
4. 等级不足无法制造高级物品

### 性能测试
1. 首屏加载 < 5 秒
2. API 响应 < 500ms
3. 同屏角色 < 20 个

---

## 📝 问题记录

### 发现的问题

| 问题 | 优先级 | 状态 |
|------|--------|------|
| - | - | - |

### 待优化项

| 优化项 | 优先级 | 状态 |
|--------|--------|------|
| - | - | - |

---

## ✅ 测试完成标准

- [ ] 所有 P0 功能测试通过
- [ ] 所有 P1 功能测试通过
- [ ] 所有 P2 功能 API 测试通过
- [ ] 无 500 错误
- [ ] 截图保存完整
- [ ] 性能指标达标

**完成度**: 0% → 100%

---

## 🚀 下一步

测试完成后：
1. 整理测试报告
2. 修复发现的问题
3. 准备 Beta Release v0.3.0
4. 创建 GitHub Release
