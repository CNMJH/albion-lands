# 装备系统设计文档

**版本：** 1.0  
**创建日期：** 2026-03-12  
**设计原则：** 装备决定职业、自由搭配、简化操作

---

## 📋 设计哲学

### 核心理念

```
┌─────────────────────────────────────────┐
│         装备决定职业（无固定职业）       │
├─────────────────────────────────────────┤
│ 1. 无职业限制 - 可以穿任何装备          │
│ 2. 装备决定技能 - 穿上武器解锁技能      │
│ 3. 自由搭配 - 混合搭配不同流派          │
│ 4. 简化操作 - 一键装备、自动对比        │
└─────────────────────────────────────────┘
```

### 与阿尔比恩对比

| 特性 | 阿尔比恩 | 呼噜大陆 H5 | 简化说明 |
|------|----------|-------------|----------|
| 装备槽 | 8 个 | 6 个 | 去掉头部、手部 |
| 装备限制 | 有职业限制 | 无限制 | 更自由 |
| 品质分级 | 7 阶×4 品质 | 5 阶×3 品质 | 简化为 T1-T5 |
| 装备耐久 | 有 | 无 | H5 简化 |
| 装备修复 | 需要修理 | 无需修理 | 减少操作 |
| 套装效果 | 有 | 无 | 初期不需要 |

---

## ⚔️ 装备槽位（6 个精简）

```
┌─────────────────────────────────────────┐
│           角色装备界面                   │
├─────────────────────────────────────────┤
│                                         │
│    ┌─────┐         ┌─────┐             │
│    │主手 │         │副手 │             │
│    │武器 │         │盾牌 │             │
│    └─────┘         └─────┘             │
│                                         │
│    ┌─────────────────────────────┐     │
│    │        胸甲（衣服）          │     │
│    └─────────────────────────────┘     │
│                                         │
│    ┌─────────────────────────────┐     │
│    │        腿甲（裤子）          │     │
│    └─────────────────────────────┘     │
│                                         │
│    ┌─────┐         ┌─────┐             │
│    │鞋子 │         │饰品 │             │
│    └─────┘         └─────┘             │
│                                         │
└─────────────────────────────────────────┘
```

### 装备槽位说明

| 槽位 | 英文 | 装备类型 | 属性 |
|------|------|----------|------|
| 主手 | MainHand | 剑/斧/锤/匕首/弓/弩/法杖/魔典 | 攻击力、攻速 |
| 副手 | OffHand | 盾牌/火炬/魔法书 | 防御、抗性 |
| 胸甲 | Armor | 布甲/皮甲/锁甲/板甲 | 血量、防御 |
| 腿甲 | Legs | 布裤/皮裤/锁甲裤/板甲裤 | 血量、防御 |
| 鞋子 | Boots | 布鞋/皮鞋/锁甲鞋/板甲鞋 | 移速、防御 |
| 饰品 | Accessory | 项链/戒指 | 特殊属性 |

---

## 📊 装备属性系统

### 基础属性（6 种）

| 属性 | 说明 | 影响 |
|------|------|------|
| **攻击力** | 物理/魔法攻击 | 技能伤害 |
| **防御力** | 物理/魔法防御 | 受到伤害减少 |
| **血量** | HP 最大值 | 生存能力 |
| **攻速** | 攻击速度 | DPS、技能冷却 |
| **移速** | 移动速度 | 风筝、追击 |
| **冷却缩减** | 技能 CD 减少 | 技能释放频率 |

### 进阶属性（后期）

| 属性 | 说明 | 获取方式 |
|------|------|----------|
| 暴击率 | 暴击几率 | 高级装备 |
| 暴击伤害 | 暴击伤害倍率 | 高级装备 |
| 吸血 | 造成伤害回血 | 特殊装备 |
| 穿透 | 无视防御 | PVP 装备 |
| 抗性 | 元素抗性 | 特定副本 |

---

## 🎯 装备品质（3 种精简）

```
品质等级：普通 < 稀有 < 传奇
```

| 品质 | 颜色 | 属性加成 | 获取方式 |
|------|------|----------|----------|
| **普通** | 白色 | 基础属性 | 制造、打怪 |
| **稀有** | 蓝色 | +20% 属性 | BOSS、副本 |
| **传奇** | 紫色 | +50% 属性 + 特效 | 世界 BOSS、活动 |

### 品质示例

```typescript
// T3 铁剑（普通）
{
  name: "铁剑",
  tier: "T3",
  quality: "Common",
  stats: {
    attack: 50,
    attackSpeed: 1.0
  }
}

// T3 铁剑（稀有）
{
  name: "铁剑 +1",
  tier: "T3",
  quality: "Uncommon",
  stats: {
    attack: 60,      // +20%
    attackSpeed: 1.2 // +20%
  }
}

// T3 铁剑（传奇）
{
  name: "勇者铁剑",
  tier: "T3",
  quality: "Legendary",
  stats: {
    attack: 75,      // +50%
    attackSpeed: 1.5 // +50%
  },
  special: {
    effect: "攻击有 10% 几率触发额外伤害"
  }
}
```

---

## 📈 装备等级（5 阶精简）

```
T1 < T2 < T3 < T4 < T5
新手 → 入门 → 进阶 → 专家 → 大师
```

| 等级 | 名称 | 物品等级 | 区域 | 怪物等级 |
|------|------|----------|------|----------|
| **T1** | 新手装备 | 1-10 | 新手村 | 1-5 |
| **T2** | 入门装备 | 11-20 | 平原 | 6-15 |
| **T3** | 进阶装备 | 21-30 | 迷雾森林 | 16-25 |
| **T4** | 专家装备 | 31-40 | 巨龙山脉 | 26-35 |
| **T5** | 大师装备 | 41-50 | 深渊 | 36-50 |

### 属性成长

```typescript
// 武器攻击力成长
T1: 10-20
T2: 25-40
T3: 45-70
T4: 75-100
T5: 105-150

// 防具防御力成长
T1: 5-10
T2: 15-25
T3: 30-45
T4: 50-70
T5: 75-100
```

---

## 🔧 装备系统功能

### 1. 装备穿戴

```typescript
// 装备物品
function equipItem(itemId: string): {
  success: boolean
  error?: string
}

// 卸下装备
function unequipItem(slot: EquipmentSlot): {
  success: boolean
  item?: InventoryItem
}

// 批量换装（预设配置）
function loadEquipmentPreset(presetId: string): {
  success: boolean
}
```

### 2. 装备对比

```typescript
// 对比当前装备和背包物品
function compareItems(
  equippedItem: InventoryItem,
  backpackItem: InventoryItem
): ComparisonResult {
  return {
    better: boolean,      // 哪个更好
    upgrades: string[],   // 提升的属性
    downgrades: string[]  // 降低的属性
  }
}
```

### 3. 属性计算

```typescript
// 计算角色总属性（装备 + 基础）
function calculateCharacterStats(character: Character): CharacterStats {
  const baseStats = getBaseStats(character.level)
  const equipmentStats = getEquipmentStats(character.equipment)
  
  return {
    ...baseStats,
    ...equipmentStats,
    // 计算加成
    attack: baseStats.attack * (1 + equipmentStats.attackBonus),
    // ...
  }
}
```

### 4. 装备限制

```typescript
// 检查是否可以装备
function canEquip(character: Character, item: Item): {
  canEquip: boolean
  reason?: string
} {
  // 等级限制
  if (character.level < item.minLevel) {
    return { canEquip: false, reason: "等级不足" }
  }
  
  // 职业限制（无）
  // 呼噜大陆无职业限制
  
  return { canEquip: true }
}
```

---

## 🎮 用户界面

### 1. 装备界面

```
┌─────────────────────────────────────────┐
│           角色面板 (C 键)                │
├─────────────────────────────────────────┤
│  ┌─────────┐    ┌──────────────────┐   │
│  │ 角色头像 │    │  装备槽位        │   │
│  │ 名字     │    │  [主手] [副手]   │   │
│  │ 等级     │    │  [胸甲]         │   │
│  │ 经验条   │    │  [腿甲]         │   │
│  └─────────┘    │  [鞋子] [饰品]   │   │
│                 └──────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  属性面板                        │   │
│  │  攻击力：100 (+20)              │   │
│  │  防御力：50 (+10)               │   │
│  │  血量：500 (+100)               │   │
│  │  攻速：1.2 (+0.3)               │   │
│  │  移速：200 (+20)                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 2. 装备提示框

```
┌─────────────────────────────────────────┐
│  铁剑 (T3)                        普通  │
├─────────────────────────────────────────┤
│  物品等级：21                            │
│  需要等级：16                            │
│                                         │
│  攻击力 +50                             │
│  攻速 +1.0                              │
│                                         │
│  点击装备 / 右键卸下                     │
└─────────────────────────────────────────┘
```

### 3. 装备对比提示

```
┌─────────────────────────────────────────┐
│  钢剑 (T3)                        稀有  │
├─────────────────────────────────────────┤
│  vs 当前装备：铁剑                      │
│                                         │
│  攻击力 +60      ▲ +10 (绿色)           │
│  攻速 +1.2       ▲ +0.2 (绿色)          │
│                                         │
│  右键装备 / 点击取消                     │
└─────────────────────────────────────────┘
```

---

## 🗄️ 数据库设计

### Character 表扩展

```prisma
model Character {
  // ... 现有字段
  
  // 装备（JSON 字符串）
  equipment String? // {
                    //   "MainHand": "uuid",
                    //   "OffHand": "uuid",
                    //   "Armor": "uuid",
                    //   "Legs": "uuid",
                    //   "Boots": "uuid",
                    //   "Accessory": "uuid"
                    // }
  
  // 属性（缓存，避免每次计算）
  stats String? // {
                //   "attack": 100,
                //   "defense": 50,
                //   "hp": 500,
                //   "attackSpeed": 1.2,
                //   "moveSpeed": 200
                // }
}
```

### Item 表扩展

```prisma
model Item {
  // ... 现有字段
  
  // 装备类型
  equipmentType String? // Weapon, Armor, Accessory
  
  // 装备槽位
  slot String? // MainHand, OffHand, Armor, Legs, Boots, Accessory
  
  // 属性（JSON）
  stats String // {
               //   "attack": 50,
               //   "defense": 0,
               //   "hp": 0,
               //   "attackSpeed": 1.0,
               //   "moveSpeed": 0
               // }
  
  // 品质
  quality String // Common, Uncommon, Legendary
  
  // 等级
  tier String // T1, T2, T3, T4, T5
  
  // 特殊效果
  specialEffect String?
}
```

---

## 🔄 装备系统工作流

### 1. 获取装备

```
打怪掉落 / 制造 / 购买
   ↓
添加到背包 (InventoryItem)
   ↓
显示在背包 UI
```

### 2. 装备流程

```
玩家点击装备
   ↓
检查是否满足条件（等级等）
   ↓
检查背包是否有该物品
   ↓
检查槽位是否已有装备
   ↓
如果有，卸下旧装备到背包
   ↓
更新 Character.equipment
   ↓
重新计算属性
   ↓
广播属性变化（WebSocket）
   ↓
更新 UI
```

### 3. 卸下流程

```
玩家右键卸下
   ↓
检查背包是否有空位
   ↓
更新 Character.equipment[slot] = null
   ↓
更新 InventoryItem.isEquipped = false
   ↓
重新计算属性
   ↓
广播属性变化
   ↓
更新 UI
```

---

## 🎯 API 设计

### HTTP 端点

```typescript
// 获取角色装备
GET /api/equipment/:characterId

// 装备物品
POST /api/equipment/:characterId/equip
{
  "itemId": "uuid",
  "slot": "MainHand"
}

// 卸下装备
POST /api/equipment/:characterId/unequip
{
  "slot": "MainHand"
}

// 获取属性
GET /api/equipment/:characterId/stats

// 对比物品
POST /api/equipment/:characterId/compare
{
  "equippedItemId": "uuid",
  "backpackItemId": "uuid"
}
```

### WebSocket 消息

```typescript
// 装备变化广播
{
  "type": "equipmentChanged",
  "data": {
    "characterId": "uuid",
    "slot": "MainHand",
    "itemId": "uuid" // null 表示卸下
  }
}

// 属性变化广播
{
  "type": "statsUpdated",
  "data": {
    "characterId": "uuid",
    "stats": {
      "attack": 100,
      "defense": 50,
      "hp": 500,
      "attackSpeed": 1.2,
      "moveSpeed": 200
    }
  }
}
```

---

## 📝 实现计划

### 阶段 1：核心功能（本周）

- [ ] 数据库 Schema 扩展（Item、Character）
- [ ] 装备服务（EquipmentService）
- [ ] 装备 API 路由
- [ ] 属性计算系统

### 阶段 2：客户端集成（下周）

- [ ] 装备系统（EquipmentSystem）
- [ ] 装备 UI 组件
- [ ] 属性面板
- [ ] 装备对比提示

### 阶段 3：优化完善（后期）

- [ ] 装备预设系统
- [ ] 批量换装
- [ ] 装备特效
- [ ] 传奇装备特殊效果

---

## 🎨 装备示例数据

### T1 新手装备

```typescript
// T1 铜剑
{
  id: "t1_copper_sword",
  name: "铜剑",
  type: "Weapon",
  slot: "MainHand",
  tier: "T1",
  quality: "Common",
  minLevel: 1,
  stats: {
    attack: 10,
    attackSpeed: 1.0
  },
  basePrice: 50
}

// T1 布衣
{
  id: "t1_cloth_armor",
  name: "布衣",
  type: "Armor",
  slot: "Armor",
  tier: "T1",
  quality: "Common",
  minLevel: 1,
  stats: {
    defense: 5,
    hp: 20
  },
  basePrice: 40
}
```

### T3 进阶装备

```typescript
// T3 铁剑
{
  id: "t3_iron_sword",
  name: "铁剑",
  type: "Weapon",
  slot: "MainHand",
  tier: "T3",
  quality: "Common",
  minLevel: 16,
  stats: {
    attack: 50,
    attackSpeed: 1.0
  },
  basePrice: 500
}

// T3 皮甲（稀有）
{
  id: "t3_leather_armor_uncommon",
  name: "精制皮甲",
  type: "Armor",
  slot: "Armor",
  tier: "T3",
  quality: "Uncommon",
  minLevel: 16,
  stats: {
    defense: 36,      // +20%
    hp: 72            // +20%
  },
  basePrice: 1200
}
```

### T5 传奇装备

```typescript
// T5 传奇武器
{
  id: "t5_legendary_sword",
  name: "龙牙剑",
  type: "Weapon",
  slot: "MainHand",
  tier: "T5",
  quality: "Legendary",
  minLevel: 40,
  stats: {
    attack: 150,
    attackSpeed: 1.5
  },
  specialEffect: "攻击有 10% 几率造成 200% 伤害",
  basePrice: 10000
}
```

---

## 🐛 注意事项

### 1. 数据一致性

- 装备时检查物品是否存在
- 卸下时检查背包空间
- 属性变化时广播给所有客户端

### 2. 性能优化

- 缓存角色属性（避免每次计算）
- 批量更新（一次换多件装备）
- 延迟计算（属性变化后 100ms 再更新 UI）

### 3. 安全性

- 服务端验证装备条件
- 防止客户端作弊（修改属性）
- 日志记录装备操作

---

## 📚 相关文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `server/prisma/schema.prisma` | 待更新 | 扩展 Item、Character 表 |
| `server/src/services/EquipmentService.ts` | 待创建 | 装备逻辑 |
| `server/src/routes/equipment.ts` | 待创建 | 装备 API |
| `client/src/systems/EquipmentSystem.ts` | 待创建 | 客户端装备系统 |
| `client/src/components/EquipmentPanel.tsx` | 待创建 | 装备 UI |
| `docs/EQUIPMENT_SYSTEM.md` | ✅ 本文档 | 设计文档 |

---

**下一步：** 开始实现阶段 1 核心功能
