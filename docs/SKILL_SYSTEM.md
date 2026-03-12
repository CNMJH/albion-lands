# 技能系统文档

## 概述

技能系统允许玩家使用各种技能进行战斗、治疗和辅助。系统包含 30 种技能，分布在 8 种武器类型上。

---

## 技能配置

### 技能类型

- **Damage** - 伤害技能，对目标造成伤害
- **Heal** - 治疗技能，恢复目标生命值
- **Buff** - 增益技能，为自己或队友添加正面效果
- **Debuff** - 减益技能，对敌人添加负面效果
- **Dash** - 位移技能，瞬间移动到目标位置
- **Shield** - 护盾技能，为目标添加吸收伤害的护盾

### 目标类型

- **Self** - 自己
- **Single** - 单体目标
- **AOE** - 范围效果
- **Direction** - 方向性（指定方向或位置）

### 技能列表

#### 剑技能（Sword）
| 技能 ID | 名称 | 类型 | 效果 | 冷却 | 能量 |
|--------|------|------|------|------|------|
| sword_heavy_strike | 重击 | Damage | 150% 伤害 | 3s | 10 |
| sword_whirlwind | 旋风斩 | Damage | 120% AOE 伤害 | 8s | 25 |
| sword_block | 格挡 | Shield | 减伤 50%，5 秒 | 15s | 20 |
| sword_charge | 冲锋 | Damage | 100% 伤害 + 眩晕 | 10s | 15 |

#### 斧技能（Axe）
| 技能 ID | 名称 | 类型 | 效果 | 冷却 | 能量 |
|--------|------|------|------|------|------|
| axe_chop | 劈砍 | Damage | 180% 伤害 | 4s | 15 |
| axe_berserk | 狂暴 | Buff | 攻击 +30%，8 秒 | 20s | 30 |
| axe_blood_suck | 吸血打击 | Damage | 130% 伤害 + 吸血 | 12s | 20 |
| axe_shockwave | 震荡波 | Debuff | 100% AOE + 减速 | 15s | 25 |

#### 锤技能（Hammer）
| 技能 ID | 名称 | 类型 | 效果 | 冷却 | 能量 |
|--------|------|------|------|------|------|
| hammer_smash | 猛击 | Damage | 160% 伤害 | 4s | 15 |
| hammer_armor_break | 破甲攻击 | Debuff | 防御 -30%，10 秒 | 15s | 20 |
| hammer_stun | 眩晕重击 | Damage | 120% 伤害 + 眩晕 2s | 18s | 25 |
| hammer_counter | 反击 | Damage | 格挡 +200% 反击 | 20s | 30 |

#### 匕首技能（Dagger）
| 技能 ID | 名称 | 类型 | 效果 | 冷却 | 能量 |
|--------|------|------|------|------|------|
| dagger_backstab | 背刺 | Damage | 200% 伤害 | 6s | 20 |
| dagger_poison | 毒刃 | Debuff | 中毒，10 伤害/秒 | 15s | 25 |
| dagger_stealth | 隐身 | Buff | 隐身，5 秒 | 30s | 40 |
| dagger_evasion | 闪避 | Buff | 闪避 +50%，6 秒 | 20s | 25 |

#### 弓技能（Bow）
| 技能 ID | 名称 | 类型 | 效果 | 冷却 | 能量 |
|--------|------|------|------|------|------|
| bow_shot | 射击 | Damage | 130% 伤害 | 2s | 8 |
| bow_multishot | 多重箭 | Damage | 3 支箭×80% | 10s | 30 |
| bow_eagle_eye | 鹰眼 | Buff | 命中 +50%，暴击 +30% | 20s | 25 |
| bow_escape | 逃脱射击 | Damage | 后跳 +100% 伤害 | 12s | 15 |

#### 弩技能（Crossbow）
| 技能 ID | 名称 | 类型 | 效果 | 冷却 | 能量 |
|--------|------|------|------|------|------|
| crossbow_snipe | 狙击 | Damage | 250% 伤害 | 15s | 35 |
| crossbow_pierce | 穿透箭 | Damage | 直线 150% 伤害 | 12s | 25 |
| crossbow_reload | 快速装填 | Buff | 攻速 +50%，8 秒 | 20s | 20 |

#### 法杖技能（Staff）
| 技能 ID | 名称 | 类型 | 效果 | 冷却 | 能量 |
|--------|------|------|------|------|------|
| staff_fireball | 火球术 | Damage | 180% 魔法伤害 | 3s | 20 |
| staff_frost | 冰霜新星 | Debuff | 120% AOE + 减速 | 10s | 30 |
| staff_lightning | 雷电术 | Damage | 200% 魔法伤害 | 8s | 35 |
| staff_teleport | 传送 | Dash | 瞬移 200 距离 | 20s | 40 |

#### 魔典技能（Tome）
| 技能 ID | 名称 | 类型 | 效果 | 冷却 | 能量 |
|--------|------|------|------|------|------|
| tome_heal | 治疗术 | Heal | 恢复 100 HP | 5s | 25 |
| tome_shield | 神圣护盾 | Shield | 80 护盾，8 秒 | 15s | 30 |
| tome_cleanse | 净化 | Buff | 移除所有 Debuff | 20s | 35 |

---

## 客户端实现

### 文件结构

```
client/src/
├── config/
│   └── skills.ts           # 技能配置数据
├── systems/
│   └── SkillSystem.ts      # 技能系统核心逻辑
├── components/ui/
│   └── SkillBar.tsx        # 技能栏 UI 组件
│   └── SkillBar.css        # 技能栏样式
└── stores/
    └── gameStore.ts        # 添加 skills 字段
```

### SkillSystem 类

**位置：** `client/src/systems/SkillSystem.ts`

**主要方法：**
- `useSkill(skillId, targetId, x, y)` - 释放技能
- `startCooldown(skillId, cooldownTime)` - 开始冷却
- `isOnCooldown(skillId)` - 检查是否在冷却
- `addBuff(playerId, buff)` - 添加 Buff
- `getBuffs(playerId)` - 获取玩家 Buff 列表
- `update(deltaTime)` - 更新冷却和 Buff（每帧调用）

**使用示例：**
```typescript
import { skillSystem } from './systems/SkillSystem'

// 释放技能
skillSystem.useSkill('sword_heavy_strike', targetId)

// 检查冷却
if (!skillSystem.isOnCooldown('sword_heavy_strike')) {
  skillSystem.useSkill('sword_heavy_strike')
}

// 获取 Buff
const buffs = skillSystem.getBuffs(playerId)
```

### SkillBar 组件

**位置：** `client/src/components/ui/SkillBar.tsx`

**功能：**
- 显示 8 个技能快捷栏
- 显示能量条（MP）
- 冷却遮罩效果
- 冷却时间倒计时
- 技能图标和快捷键提示

**快捷键：** 数字键 `1-8` 对应技能栏位 0-7

---

## 服务端实现

### 数据库 Schema

**位置：** `server/prisma/schema.prisma`

```prisma
// 技能模板
model Skill {
  id              String   @id @default(uuid())
  name            String
  description     String
  type            String
  weaponType      String
  damageMultiplier Float?
  healAmount      Int?
  cooldown        Int
  energyCost      Int
  range           Int
  duration        Int?
  radius          Int?
  icon            String?
  
  characterSkills CharacterSkill[]
}

// 角色技能
model CharacterSkill {
  id          String   @id @default(uuid())
  characterId String
  skillId     String
  level       Int      @default(1)
  slot        Int      @default(-1)
  cooldownUntil DateTime?
  
  character   Character
  skill       Skill
}
```

### API 路由

**位置：** `server/src/routes/skills.ts`

**GET** `/api/v1/skills/:characterId`
- 获取角色技能列表

**POST** `/api/v1/skills/:characterId/equip`
- 装备技能到快捷栏
- Body: `{ skillId: string, slot: number }`

**POST** `/api/v1/skills/calculate-damage`
- 计算技能伤害
- Body: `{ characterId, skillId, targetLevel }`
- Response: `{ damage, isCritical }`

**POST** `/api/v1/skills/:characterId/start-cooldown`
- 开始技能冷却
- Body: `{ skillId, cooldownSeconds }`

**GET** `/api/v1/skills-config`
- 获取所有技能配置

---

## 控制方案

### 技能释放

| 操作 | 按键 | 说明 |
|------|------|------|
| 技能 1 | `1` | 使用快捷栏第 1 个技能 |
| 技能 2 | `2` | 使用快捷栏第 2 个技能 |
| 技能 3 | `3` | 使用快捷栏第 3 个技能 |
| 技能 4 | `4` | 使用快捷栏第 4 个技能 |
| 技能 5 | `5` | 使用快捷栏第 5 个技能 |
| 技能 6 | `6` | 使用快捷栏第 6 个技能 |
| 技能 7 | `7` | 使用快捷栏第 7 个技能 |
| 技能 8 | `8` | 使用快捷栏第 8 个技能 |

### 限制

- 聊天框激活时禁用技能快捷键
- 技能需要足够的能量（MP）
- 技能有冷却时间
- 每个技能有施法距离限制

---

## 伤害计算

### 公式

```
基础攻击 = 角色等级 × 10
技能伤害 = 基础攻击 × 技能倍率
暴击判定 = 10% 概率
暴击伤害 = 技能伤害 × 1.5
防御减免 = 防御 / (防御 + 100)
最终伤害 = 技能伤害 × (1 - 防御减免)
```

### 示例

```
角色等级：10
技能：重击（150% 倍率）
目标等级：5

基础攻击 = 10 × 10 = 100
技能伤害 = 100 × 1.5 = 150
暴击（10% 概率）= 150 × 1.5 = 225
目标防御 = 5 × 5 = 25
防御减免 = 25 / (25 + 100) = 0.2
最终伤害 = 225 × (1 - 0.2) = 180
```

---

## Buff 系统

### Buff 类型

- **Buff** - 正面效果（攻击力提升、闪避等）
- **Debuff** - 负面效果（减速、中毒等）
- **Shield** - 护盾（吸收伤害）

### Buff 接口

```typescript
interface Buff {
  id: string           // Buff ID（通常是技能 ID）
  type: string         // 'buff' | 'debuff' | 'shield'
  value: number        // 效果值
  duration: number     // 持续时间（秒）
  remainingTime: number // 剩余时间（秒）
  stacks?: number      // 层数（可选）
}
```

### Buff 管理

- Buff 有持续时间，到期自动移除
- 相同 Buff 刷新持续时间
- 技能可以移除 Buff（如净化）

---

## 下一步

### 待完成功能

- [ ] 技能效果动画
- [ ] 技能音效
- [ ] 技能升级系统
- [ ] 技能点数获取
- [ ] 技能前置条件
- [ ] 技能连招系统
- [ ] PVP 技能平衡
- [ ] 怪物技能 AI

### 优先级

1. **P0** - 技能效果动画（视觉反馈）
2. **P0** - 服务端 WebSocket 技能消息处理
3. **P1** - 技能升级系统
4. **P1** - 技能音效
5. **P2** - 技能连招系统

---

## 相关文件

- `client/src/config/skills.ts` - 30 种技能配置
- `client/src/systems/SkillSystem.ts` - 技能系统核心
- `client/src/components/ui/SkillBar.tsx` - 技能栏 UI
- `server/src/routes/skills.ts` - 技能 API 路由
- `server/prisma/schema.prisma` - 技能数据库模型
- `server/prisma/seed-skills.ts` - 技能初始数据

---

## 测试

### 客户端测试

```bash
cd client
npm run dev
```

进入游戏后：
1. 按数字键 `1-8` 释放技能
2. 观察技能栏冷却效果
3. 检查能量消耗
4. 查看控制台日志

### 服务端测试

```bash
cd server
npm run dev
```

测试 API：
```bash
# 获取技能配置
curl http://localhost:3002/api/v1/skills-config

# 获取角色技能
curl http://localhost:3002/api/v1/skills/{characterId}

# 装备技能
curl -X POST http://localhost:3002/api/v1/skills/{characterId}/equip \
  -H "Content-Type: application/json" \
  -d '{"skillId":"sword_heavy_strike","slot":0}'

# 计算伤害
curl -X POST http://localhost:3002/api/v1/skills/calculate-damage \
  -H "Content-Type: application/json" \
  -d '{"characterId":"xxx","skillId":"sword_heavy_strike","targetLevel":5}'
```

---

**完成时间：** 2026-03-12  
**状态：** ✅ 核心功能完成  
**下一步：** 技能动画和 WebSocket 集成
