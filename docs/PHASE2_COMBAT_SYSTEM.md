# 阶段 2：核心玩法开发 - 战斗系统

## ✅ 已完成

### 客户端
- [x] **CombatSystem.ts** - 战斗系统核心
  - 移动控制（WASD + 右键点击）
  - 基础攻击（左键点击）
  - 技能快捷键（1-8）
  - 网络消息处理

- [x] **MonsterAI.ts** - 怪物 AI 系统
  - 12 种怪物模板（5 个区域）
  - 5 种 AI 状态（idle/patrol/chase/attack/return）
  - 仇恨系统
  - 巡逻逻辑

- [x] **gameStore.ts** - 状态管理更新
  - 怪物列表
  - 战斗日志
  - HP 更新方法

### 服务端
- [x] **CombatService.ts** - 战斗服务
  - 伤害计算
  - 玩家攻击怪物
  - 怪物攻击玩家
  - 奖励发放

- [x] **WebSocketServer.ts** - WebSocket 更新
  - 移动处理
  - 攻击处理
  - 技能处理
  - 怪物管理
  - 怪物 AI 循环

## 📊 怪物分布

| 区域 | 等级 | 怪物种类 | 数量 |
|------|------|----------|------|
| zone_1 | 1-10 | 绿色史莱姆、蓝色史莱姆、野兔 | 3 |
| zone_2 | 10-25 | 灰狼、野猪、鹿 | 3 |
| zone_3 | 25-40 | 毒蜘蛛、黑熊 | 2 |
| zone_4 | 40-60 | 幼龙、石头傀儡 | 2 |
| zone_5 | 60+ | 骷髅王、恶魔 | 2 |

## 🎮 操作说明

### 移动
- **WASD / 方向键** - 移动角色
- **右键点击** - 点击移动

### 战斗
- **左键点击** - 基础攻击
- **1-8 数字键** - 使用技能

## 📡 网络消息

### 客户端 → 服务端
```typescript
// 移动
{ type: 'move', payload: { dx: number, dy: number } }

// 攻击
{ type: 'attack', payload: { type: 'basic' | 'skill' } }

// 技能
{ type: 'skill', payload: { skillIndex: number } }
```

### 服务端 → 客户端
```typescript
// 移动确认
{ type: 'move', payload: { x: number, y: number } }

// 攻击结果
{ type: 'attack', payload: { targetId: string, damage: number } }

// 怪物 HP
{ type: 'monsterHP', payload: { monsterId: string, hp: number } }

// 怪物死亡
{ type: 'monsterDeath', payload: { 
  monsterId: string, 
  expGained: number, 
  silverGained: number 
} }

// 玩家更新
{ type: 'playerUpdate', payload: { exp: number, silver: number } }
```

## 🔄 下一步

1. [ ] 集成到 GameRenderer
2. [ ] 添加怪物渲染
3. [ ] 添加战斗特效
4. [ ] 添加血条 UI
5. [ ] 背包系统
6. [ ] 经济系统（采集、制造）

## 🧪 测试

1. 启动服务端和客户端
2. 登录游戏
3. 使用 WASD 移动
4. 右键点击地面移动
5. 左键点击攻击怪物
6. 查看战斗日志

## 📝 注意事项

- 伤害计算公式：`damage = (attack * 2 - defense) * levelFactor * variance`
- 怪物仇恨范围：80-220 像素（根据怪物类型）
- 攻击范围：50 像素
- 攻击冷却：1 秒
