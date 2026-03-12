# PVP 系统设计文档

## 📅 设计日期
2026-03-12

## 🎯 设计目标
实现玩家间对战系统，包括攻击、伤害计算、击杀统计等功能。

---

## 🎮 核心功能

### 1. PVP 攻击系统
- [ ] 玩家间普通攻击
- [ ] 玩家间技能攻击
- [ ] 攻击范围检测
- [ ] 攻击冷却时间
- [ ] 攻击动画和特效

### 2. 伤害计算系统
- [ ] 基础伤害计算
- [ ] 防御减免计算
- [ ] 暴击系统
- [ ] 伤害浮动 (±10%)
- [ ] 伤害数字显示

### 3. PVP 区域规则
- [ ] 安全区：禁止 PVP
- [ ] 危险区：允许 PVP
- [ ] PVP 标识显示
- [ ] 红名系统 (恶意 PK)

### 4. 击杀统计系统
- [ ] 击杀记录
- [ ] 死亡记录
- [ ] KDA 统计
- [ ] 击杀公告

### 5. PVP 奖励系统
- [ ] 击杀荣誉点数
- [ ] 排行榜
- [ ] PVP 装备
- [ ] 赛季奖励

---

## 📋 数据库设计

### PlayerKill 模型
```prisma
model PlayerKill {
  id          String   @id @default(uuid())
  killerId    String
  victimId    String
  mapId       String
  timestamp   DateTime @default(now())
  
  killer      Character @relation("KillerKills", fields: [killerId], references: [id])
  victim      Character @relation("VictimKills", fields: [victimId], references: [id])
}
```

### PVPStats 模型
```prisma
model PVPStats {
  id          String   @id @default(uuid())
  characterId String   @unique
  kills       Int      @default(0)
  deaths      Int      @default(0)
  assists     Int      @default(0)
  honorPoints Int      @default(0)
  
  character   Character @relation(fields: [characterId], references: [id])
}
```

---

## 🔧 技术实现

### 服务端 API

#### 1. 攻击玩家
```http
POST /api/v1/pvp/attack
Body: {
  attackerId: "uuid",
  targetId: "uuid",
  skillId?: "string",
  damage: number
}
```

#### 2. 查询 PVP 统计
```http
GET /api/v1/pvp/stats/:characterId
```

#### 3. PVP 排行榜
```http
GET /api/v1/pvp/leaderboard
Query: ?type=kills|honor&limit=100
```

### 客户端系统

#### PvPSystem.ts
- 攻击玩家逻辑
- 伤害计算
- PVP 标识渲染
- 击杀公告显示

---

## 🎨 视觉效果

### 伤害数字
- 普通伤害：白色数字
- 暴击伤害：金色大数字
- PVP 伤害：红色数字

### PVP 标识
- 敌对玩家：红色名字
- 队友：绿色名字
- 中立：白色名字

### 击杀公告
```
┌─────────────────────────────────┐
│ ⚔️ [玩家 A] 击杀了 [玩家 B]!    │
└─────────────────────────────────┘
```

---

## ⚖️ PVP 规则

### 安全区 (安全等级≥6)
- ❌ 禁止 PVP
- ❌ 无法攻击其他玩家
- ✅ 可以攻击怪物

### 危险区 (安全等级<6)
- ✅ 允许 PVP
- ✅ 可以攻击其他玩家
- ⚠️ 死亡会掉落装备

### 红名系统 (后期)
- 恶意 PK 其他玩家
- 红名玩家死亡必掉装备
- 红名玩家被击杀无惩罚

---

## 📊 平衡性

### 伤害公式
```
最终伤害 = (攻击力 - 防御力) × 技能系数 × 暴击系数 × 浮动系数

暴击系数 = 1.5 (暴击) 或 1.0 (普通)
浮动系数 = 0.9 ~ 1.1
```

### 属性换算
- 1 攻击力 = 1 伤害
- 1 防御力 = 0.5 伤害减免
- 1 暴击率 = 1% 暴击几率
- 1 暴击伤害 = 1% 暴击伤害加成

---

## 🎯 实现优先级

### P0 (核心功能)
1. ⏳ 玩家间攻击逻辑
2. ⏳ 伤害计算系统
3. ⏳ PVP 区域检测
4. ⏳ 击杀/死亡记录

### P1 (重要功能)
5. ⏳ PVP 统计面板
6. ⏳ 伤害数字显示
7. ⏳ PVP 标识渲染
8. ⏳ 击杀公告

### P2 (优化功能)
9. ⏳ PVP 排行榜
10. ⏳ 荣誉点数系统
11. ⏳ 红名系统
12. ⏳ PVP 装备

---

**呼噜大陆开发组**  
2026-03-12
