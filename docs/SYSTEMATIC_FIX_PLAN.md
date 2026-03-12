# 呼噜大陆 - 系统性修复计划

**创建日期：** 2026-03-13 00:00  
**目标：** 从底层开始，按照设计文档，一步步修复整理核心功能  
**原则：** 每步都要浏览器测试验证，确保功能正常

---

## 📋 修复顺序（自底向上）

```
┌─────────────────────────────────────────┐
│  第 6 层：浏览器测试验证                 │
│  (Playwright headed 模式)               │
└─────────────────────────────────────────┘
              ▲
              │ 测试验证
┌─────────────────────────────────────────┐
│  第 5 层：客户端渲染                     │
│  (GameRenderer, CombatRenderer,         │
│   MonsterRenderer, MinimapRenderer)     │
└─────────────────────────────────────────┘
              ▲
              │ 渲染数据
┌─────────────────────────────────────────┐
│  第 4 层：客户端系统                     │
│  (PlayerControls, Combat, Inventory,    │
│   Equipment, Skill, Social)             │
└─────────────────────────────────────────┘
              ▲
              │ WebSocket/HTTP
┌─────────────────────────────────────────┐
│  第 3 层：服务端路由                     │
│  (auth, characters, equipment,          │
│   inventory, combat, social)            │
└─────────────────────────────────────────┘
              ▲
              │ 业务逻辑
┌─────────────────────────────────────────┐
│  第 2 层：服务端服务                     │
│  (ItemService, EquipmentService,        │
│   CombatService, QuestService)          │
└─────────────────────────────────────────┘
              ▲
              │ 数据访问
┌─────────────────────────────────────────┐
│  第 1 层：数据库 (Prisma Schema)        │
│  (SQLite + Prisma ORM)                  │
└─────────────────────────────────────────┘
```

---

## 🔧 第 1 步：数据库层修复

### 1.1 检查数据库 Schema

**状态：** ✅ 已完成  
**文件：** `server/prisma/schema.prisma`

**检查项：**
- [x] User/Character 模型完整
- [x] Item/Inventory 模型完整
- [x] Equipment 字段（JSON 存储）
- [x] Stats 字段（JSON 存储）
- [x] 社交系统（Friend/Party/Chat）
- [x] 任务系统（Quest/QuestProgress）
- [x] 成就系统（Achievement/AchievementProgress）
- [x] 技能系统（Skill/CharacterSkill）

### 1.2 数据库迁移

**命令：**
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

**验证：**
```bash
npx prisma studio
```

### 1.3 种子数据

**需要创建的种子数据：**
- [ ] 5 个区域（Zone）
- [ ] 30 件初始装备（T1-T5）
- [ ] 30 种怪物配置
- [ ] 50 种物品（材料/消耗品）
- [ ] 10 个初始任务
- [ ] 20 个成就
- [ ] 30 个技能（8 武器×4 技能 - 部分复用）

**文件：** `server/prisma/seed-*.ts`

---

## 🔧 第 2 步：服务端服务层修复

### 2.1 ItemService（物品服务）

**文件：** `server/src/services/ItemService.ts`

**功能：**
- [ ] 获取物品列表
- [ ] 获取物品详情
- [ ] 物品掉落计算
- [ ] 物品堆叠逻辑

**优先级：** 🔴 P0

### 2.2 EquipmentService（装备服务）

**文件：** `server/src/services/EquipmentService.ts`

**功能：**
- [ ] 获取角色装备（按 characterId）
- [ ] 装备物品（equip）
- [ ] 卸下装备（unequip）
- [ ] 计算角色属性（getStats）
- [ ] 装备对比（compare）

**当前问题：** ❌ 500 错误（characterId 为空）

**修复：**
```typescript
// 添加 characterId 验证
if (!characterId || characterId.trim() === '') {
  return reply.code(400).send({ 
    error: '角色 ID 不能为空',
    message: '请先创建角色或登录'
  })
}
```

**优先级：** 🔴 P0

### 2.3 CombatService（战斗服务）

**文件：** `server/src/services/CombatService.ts`

**功能：**
- [ ] 玩家攻击怪物
- [ ] 怪物攻击玩家
- [ ] 伤害计算
- [ ] 掉落计算
- [ ] 经验奖励

**优先级：** 🔴 P0

### 2.4 GatheringService（采集服务）

**文件：** `server/src/services/GatheringService.ts`

**功能：**
- [ ] 采集资源点
- [ ] 冷却时间检查
- [ ] 获得物品
- [ ] 熟练度提升

**优先级：** 🟡 P1

### 2.5 CraftingService（制造服务）

**文件：** `server/src/services/CraftingService.ts`

**功能：**
- [ ] 制造物品
- [ ] 配方检查
- [ ] 材料消耗
- [ ] 制造成功/失败

**优先级：** 🟡 P1

### 2.6 QuestService（任务服务）

**文件：** `server/src/services/QuestService.ts`

**功能：**
- [ ] 接受任务
- [ ] 提交任务
- [ ] 更新任务进度
- [ ] 任务完成检查

**优先级：** 🟡 P1

### 2.7 SocialService（社交服务）

**文件：** `server/src/services/` (FriendService, PartyService, ChatService)

**功能：**
- [ ] 添加好友
- [ ] 创建队伍
- [ ] 发送消息
- [ ] 组队战斗

**优先级：** 🟢 P2

---

## 🔧 第 3 步：服务端路由层修复

### 3.1 路由结构

```
server/src/routes/
├── index.ts           # 路由总入口
├── auth.ts           # 认证（登录/注册）
├── characters.ts     # 角色管理
├── equipment.ts      # 装备（❌ 500 错误）
├── inventory.ts      # 背包
├── items.ts          # 物品
├── market.ts         # 市场
├── quests.ts         # 任务
├── skills.ts         # 技能
├── social.ts         # 社交
└── gm.ts             # GM 工具
```

### 3.2 修复顺序

1. **auth.ts** - 认证基础（✅ 已存在）
2. **characters.ts** - 角色管理（✅ 已存在）
3. **equipment.ts** - 装备管理（❌ 修复 500 错误）
4. **inventory.ts** - 背包管理（✅ 已存在）
5. **combat.ts** - 战斗接口（❌ 待创建）
6. **social.ts** - 社交功能（✅ 已存在）

### 3.3 新增 combat.ts

**文件：** `server/src/routes/combat.ts`

**端点：**
```typescript
// 玩家攻击
POST /api/v1/combat/attack
{
  "characterId": "uuid",
  "targetId": "uuid",
  "skillId": "uuid?"
}

// 怪物攻击
POST /api/v1/combat/monster-attack
{
  "monsterId": "uuid",
  "targetId": "uuid"
}

// 战斗结果
{
  "damage": 100,
  "critical": false,
  "dodged": false,
  "loot": [...],
  "exp": 50
}
```

**优先级：** 🔴 P0

---

## 🔧 第 4 步：客户端系统层修复

### 4.1 PlayerControlsSystem（玩家控制）

**文件：** `client/src/systems/PlayerControlsSystem.ts`

**功能：**
- [x] 鼠标右键移动（LOL 风格）
- [x] 鼠标右键攻击
- [x] QWER 技能键
- [x] UI 快捷键（B/C/I 等）
- [ ] 移动同步到服务端
- [ ] 攻击同步到服务端
- [ ] 技能同步到服务端

**当前问题：** 
- ❌ 移动功能未验证（WebSocket 问题）
- ❌ 攻击/技能无反馈

**修复：**
```typescript
// 添加移动同步
private sendMoveMessage(x: number, y: number): void {
  this.networkManager.send('move', { x, y })
  console.log('📍 发送移动消息:', { x, y })
}

// 添加攻击同步
private sendAttackMessage(targetId: string): void {
  this.networkManager.send('attack', { targetId })
  console.log('⚔️ 发送攻击消息:', { targetId })
}
```

**优先级：** 🔴 P0

### 4.2 CombatSystem（战斗系统）

**文件：** `client/src/systems/CombatSystem.ts`

**功能：**
- [ ] 监听战斗事件
- [ ] 播放攻击动画
- [ ] 播放受击动画
- [ ] 显示伤害数字
- [ ] 死亡处理

**优先级：** 🔴 P0

### 4.3 EquipmentSystem（装备系统）

**文件：** `client/src/systems/EquipmentSystem.ts`

**功能：**
- [ ] 加载角色装备
- [ ] 更新装备 UI
- [ ] 计算属性
- [ ] 装备/卸下动画

**当前问题：** ❌ API 500 错误导致无法加载

**优先级：** 🔴 P0

### 4.4 InventorySystem（背包系统）

**文件：** `client/src/systems/InventorySystem.ts`

**功能：**
- [x] 背包 UI 显示
- [ ] 物品拖拽
- [ ] 物品使用
- [ ] 物品丢弃

**优先级：** 🟡 P1

### 4.5 SkillSystem（技能系统）

**文件：** `client/src/systems/SkillSystem.ts`

**功能：**
- [ ] 技能配置加载
- [ ] 技能冷却
- [ ] 技能效果
- [ ] 技能升级

**优先级：** 🟡 P1

### 4.6 MonsterAI（怪物 AI）

**文件：** `client/src/systems/MonsterAI.ts`

**功能：**
- [ ] 怪物巡逻
- [ ] 怪物追击
- [ ] 怪物攻击
- [ ] 怪物死亡

**当前问题：** ❌ 未初始化，怪物不显示

**修复：**
```typescript
// GameCanvas.tsx 添加怪物初始化
const monsterAI = new MonsterAI(renderer)
monsterAI.spawnMonster('slime', 400, 300)
monsterAI.spawnMonster('wolf', 600, 400)
```

**优先级：** 🔴 P0

---

## 🔧 第 5 步：客户端渲染层修复

### 5.1 GameRenderer（游戏渲染器）

**文件：** `client/src/renderer/GameRenderer.ts`

**功能：**
- [x] Pixi 应用初始化
- [x] 摄像机跟随
- [x] 窗口大小适配
- [ ] 性能优化（Batch 渲染）

**优先级：** ✅ 已完成

### 5.2 CombatRenderer（战斗渲染器）

**文件：** `client/src/renderer/CombatRenderer.ts`

**功能：**
- [x] 玩家精灵渲染
- [ ] 怪物精灵渲染
- [ ] 攻击动画
- [ ] 伤害数字
- [ ] 死亡动画

**优先级：** 🔴 P0

### 5.3 MonsterRenderer（怪物渲染器）

**文件：** `client/src/renderer/MonsterRenderer.ts`

**功能：**
- [ ] 怪物加载
- [ ] 怪物动画
- [ ] 怪物血条
- [ ] 怪物名称

**当前问题：** ❌ 未调用

**修复：**
```typescript
// MonsterRenderer.ts
export class MonsterRenderer {
  private monsters: Map<string, PIXI.Container> = new Map()
  
  spawnMonster(type: string, x: number, y: number): void {
    const container = new PIXI.Container()
    const sprite = PIXI.Sprite.from(`assets/monsters/${type}.png`)
    container.addChild(sprite)
    container.x = x
    container.y = y
    
    this.renderer.getStage().addChild(container)
    this.monsters.set(type, container)
  }
}
```

**优先级：** 🔴 P0

### 5.4 MinimapRenderer（小地图渲染器）

**文件：** `client/src/renderer/MinimapRenderer.ts`

**功能：**
- [ ] 玩家位置显示
- [ ] 怪物位置显示
- [ ] 队友位置显示
- [ ] 点击移动

**当前问题：** ⚠️ 与 MiniMap.tsx 重复

**修复：** 合并为单一实现

**优先级：** 🟡 P1

### 5.5 AttackEffectRenderer（攻击特效）

**文件：** `client/src/renderer/AttackEffectRenderer.ts`

**功能：**
- [x] 攻击波纹动画
- [ ] 技能特效
- [ ] Buff/Debuff 特效

**优先级：** ✅ 已完成

---

## 🔧 第 6 步：浏览器测试验证

### 6.1 测试流程

```typescript
# 1. 启动浏览器
browser_use(action='start', headed=True)

# 2. 打开游戏
browser_use(action='open', url='http://localhost:3001')

# 3. 等待加载
browser_use(action='wait_for', wait_time=3)

# 4. 截图
browser_use(action='screenshot', path='screenshots/step_x.png')

# 5. 功能测试
browser_use(action='click', selector='#game-canvas')
browser_use(action='press_key', key='b')  # 测试背包
browser_use(action='snapshot')  # 检查 UI 状态

# 6. 网络请求检查
browser_use(action='network_requests', include_static=False)

# 7. 停止浏览器
browser_use(action='stop')
```

### 6.2 测试检查清单

**每步修复后都要执行：**

**基础功能：**
- [ ] 游戏加载成功（无白屏/黑屏）
- [ ] Canvas 渲染正常
- [ ] 无 500 错误
- [ ] 无控制台报错

**核心玩法：**
- [ ] 玩家可以移动
- [ ] 怪物可见
- [ ] 可以攻击怪物
- [ ] 伤害数字显示
- [ ] 背包可以打开
- [ ] 装备面板显示属性

**性能：**
- [ ] FPS > 30
- [ ] 内存 < 200MB
- [ ] 网络延迟 < 100ms

---

## 📅 修复时间表

### 第 1 天：数据库 + 服务端基础（8 小时）

**上午（4 小时）：**
- [ ] 1.1 检查数据库 Schema（0.5h）
- [ ] 1.2 数据库迁移（0.5h）
- [ ] 1.3 创建种子数据（3h）

**下午（4 小时）：**
- [ ] 2.1 ItemService 修复（1h）
- [ ] 2.2 EquipmentService 修复（1h）
- [ ] 2.3 CombatService 创建（2h）

**验收：**
- ✅ 数据库正常
- ✅ 种子数据完整
- ✅ API 无 500 错误

---

### 第 2 天：服务端路由 + 客户端系统（8 小时）

**上午（4 小时）：**
- [ ] 3.1 路由检查（0.5h）
- [ ] 3.2 equipment.ts 修复（1h）
- [ ] 3.3 combat.ts 创建（2.5h）

**下午（4 小时）：**
- [ ] 4.1 PlayerControlsSystem 修复（2h）
- [ ] 4.2 CombatSystem 修复（1h）
- [ ] 4.3 EquipmentSystem 修复（1h）

**验收：**
- ✅ 装备 API 正常
- ✅ 战斗 API 正常
- ✅ 客户端可以发送移动/攻击

---

### 第 3 天：渲染层 + 集成测试（8 小时）

**上午（4 小时）：**
- [ ] 5.1 GameRenderer 检查（0.5h）
- [ ] 5.2 CombatRenderer 修复（1.5h）
- [ ] 5.3 MonsterRenderer 修复（2h）

**下午（4 小时）：**
- [ ] 5.4 MinimapRenderer 合并（2h）
- [ ] 6.1 浏览器测试验证（2h）

**验收：**
- ✅ 怪物可见
- ✅ 可以攻击怪物
- ✅ 伤害数字显示
- ✅ 所有测试通过

---

### 第 4 天：完善 + 优化（8 小时）

**上午（4 小时）：**
- [ ] 4.4 InventorySystem 完善（2h）
- [ ] 4.5 SkillSystem 完善（2h）

**下午（4 小时）：**
- [ ] 4.6 MonsterAI 完善（2h）
- [ ] 性能优化（2h）

**验收：**
- ✅ 背包功能完整
- ✅ 技能系统完整
- ✅ 怪物 AI 智能
- ✅ FPS > 60

---

## 🎯 验收标准

### Alpha 版本（第 3 天结束）

**必须达成：**
- [ ] 数据库完整（5 区域 + 30 装备 + 30 怪物）
- [ ] 服务端 API 无 500 错误
- [ ] 客户端可以移动/攻击
- [ ] 怪物可见且可以击杀
- [ ] 背包/装备 UI 正常
- [ ] 浏览器测试 100% 通过

**期望达成：**
- [ ] 技能系统可用
- [ ] 任务系统可用
- [ ] 社交系统可用

### Beta 版本（第 7 天结束）

**必须达成：**
- [ ] 完整战斗循环（打怪→掉落→换装备→变强）
- [ ] 5 个区域可探索
- [ ] 30 种怪物可击杀
- [ ] 50 种物品可收集
- [ ] 性能达标（FPS>60, 内存<200MB）

**期望达成：**
- [ ] 任务系统完整
- [ ] 社交系统完整
- [ ] 经济系统完整

---

## 📊 进度跟踪

### 第 1 层：数据库

- [ ] 1.1 Schema 检查
- [ ] 1.2 数据库迁移
- [ ] 1.3 种子数据

**完成度：** 0%

### 第 2 层：服务端服务

- [ ] 2.1 ItemService
- [ ] 2.2 EquipmentService（❌ 500 错误）
- [ ] 2.3 CombatService
- [ ] 2.4 GatheringService
- [ ] 2.5 CraftingService
- [ ] 2.6 QuestService
- [ ] 2.7 SocialService

**完成度：** 0%

### 第 3 层：服务端路由

- [ ] 3.1 路由检查
- [ ] 3.2 equipment.ts 修复
- [ ] 3.3 combat.ts 创建

**完成度：** 0%

### 第 4 层：客户端系统

- [ ] 4.1 PlayerControlsSystem（❌ 移动未验证）
- [ ] 4.2 CombatSystem
- [ ] 4.3 EquipmentSystem（❌ API 错误）
- [ ] 4.4 InventorySystem
- [ ] 4.5 SkillSystem
- [ ] 4.6 MonsterAI（❌ 未初始化）

**完成度：** 0%

### 第 5 层：客户端渲染

- [ ] 5.1 GameRenderer
- [ ] 5.2 CombatRenderer
- [ ] 5.3 MonsterRenderer（❌ 未调用）
- [ ] 5.4 MinimapRenderer（⚠️ 重复）
- [ ] 5.5 AttackEffectRenderer

**完成度：** 0%

### 第 6 层：浏览器测试

- [ ] 6.1 测试流程
- [ ] 6.2 检查清单

**完成度：** 0%

---

## 🚀 立即开始

**第一步：** 修复 EquipmentService 500 错误

**原因：** 
1. 最快修复（1 小时）
2. 影响装备面板显示
3. 阻塞后续测试

**命令：**
```bash
cd /home/tenbox/albion-lands
# 查看当前代码
cat server/src/services/EquipmentService.ts | head -50
# 修复代码
# ...
# 浏览器测试验证
```

---

**阿米大王，准备好了吗？我们开始第一步！** 🛠️
