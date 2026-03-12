# 装备系统测试与使用指南

**版本：** 1.0  
**创建日期：** 2026-03-12  
**状态：** ✅ 核心功能完成

---

## 🎯 功能概览

装备系统已实现以下核心功能：

```
┌─────────────────────────────────────────┐
│         装备系统功能清单                 │
├─────────────────────────────────────────┤
│ ✅ 6 个装备槽位（主手/副手/胸甲/腿甲/鞋/饰）│
│ ✅ 装备穿戴/卸下                        │
│ ✅ 属性计算（攻击/防御/血量/攻速/移速）  │
│ ✅ 装备对比                             │
│ ✅ 5 阶装备（T1-T5）                    │
│ ✅ 3 种品质（普通/稀有/传奇）            │
│ ✅ 30 件初始装备                        │
│ ✅ API 端点（5 个）                      │
└─────────────────────────────────────────┘
```

---

## 🗄️ 数据库设置

### 1. 自动迁移（已完成）

```bash
cd server
npx prisma migrate dev --name add_equipment_fields
```

✅ 已自动执行，创建了 `stats` 和扩展 `Item` 表字段

### 2. 装备数据种子

```bash
# 创建初始装备数据
npx tsx prisma/seed-equipment.ts
```

**输出示例：**
```
🔧 开始创建装备数据...
✅ 创建：铜剑 (T1 Common)
✅ 创建：铜斧 (T1 Common)
✅ 创建：铁剑 (T2 Common)
...
📊 装备数据创建完成
   ✅ 创建：30 个
   ⏭️  跳过：0 个
   📦 总计：30 个
```

---

## 🔧 API 测试

### 1. 获取角色装备

```bash
curl http://localhost:3002/api/v1/equipment/{characterId}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "MainHand": "uuid-xxx",
    "Armor": "uuid-yyy",
    "Legs": "uuid-zzz"
  }
}
```

### 2. 获取角色属性

```bash
curl http://localhost:3002/api/v1/equipment/{characterId}/stats
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "attack": 100,
    "defense": 50,
    "hp": 500,
    "attackSpeed": 1.2,
    "moveSpeed": 200
  }
}
```

### 3. 装备物品

```bash
curl -X POST http://localhost:3002/api/v1/equipment/{characterId}/equip \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "item-uuid",
    "slot": "MainHand"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "equipment": {
      "MainHand": "item-uuid"
    },
    "stats": {
      "attack": 60,
      "defense": 50,
      "hp": 500,
      "attackSpeed": 1.2,
      "moveSpeed": 200
    },
    "previousItemId": "old-uuid"
  }
}
```

### 4. 卸下装备

```bash
curl -X POST http://localhost:3002/api/v1/equipment/{characterId}/unequip \
  -H "Content-Type: application/json" \
  -d '{
    "slot": "MainHand"
  }'
```

### 5. 对比物品

```bash
curl -X POST http://localhost:3002/api/v1/equipment/{characterId}/compare \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "new-item-uuid",
    "slot": "MainHand"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "better": true,
    "upgrades": [
      "attack +10",
      "attackSpeed +0.2"
    ],
    "downgrades": []
  }
}
```

---

## 🎮 客户端使用

### 1. 初始化装备系统

```typescript
import { EquipmentSystem } from './systems/EquipmentSystem'

// 创建装备系统实例
const equipmentSystem = new EquipmentSystem(characterId)

// 监听装备变化
equipmentSystem.on('equipmentChanged', (data) => {
  console.log('装备变化:', data)
  // 更新 UI
})
```

### 2. 装备物品

```typescript
// 装备物品
const result = await equipmentSystem.equipItem(itemId, 'MainHand')

if (result.success) {
  console.log('装备成功！')
  // 更新 UI
} else {
  console.error('装备失败:', result.error)
}
```

### 3. 卸下装备

```typescript
// 卸下装备
const result = await equipmentSystem.unequipItem('MainHand')

if (result.success) {
  console.log('卸下成功！')
}
```

### 4. 获取装备和属性

```typescript
// 获取当前装备
const equipment = equipmentSystem.getEquipment()
console.log(equipment)
// { MainHand: "uuid", Armor: "uuid", ... }

// 获取当前属性
const stats = equipmentSystem.getStats()
console.log(stats)
// { attack: 100, defense: 50, hp: 500, ... }

// 获取指定槽位
const mainHand = equipmentSystem.getSlot('MainHand')
```

### 5. 对比物品

```typescript
// 对比背包物品和当前装备
const comparison = await equipmentSystem.compareItem(itemId, 'MainHand')

console.log('是否更好:', comparison.better)
console.log('提升:', comparison.upgrades)
console.log('降低:', comparison.downgrades)
```

---

## 📊 装备数据示例

### T1 新手装备（1-5 级）

| 名称 | 槽位 | 属性 | 价格 |
|------|------|------|------|
| 铜剑 | 主手 | 攻击 +10, 攻速 +1.0 | 50 银 |
| 铜斧 | 主手 | 攻击 +12, 攻速 +0.9 | 55 银 |
| 木盾 | 副手 | 防御 +5, 血量 +20 | 40 银 |
| 布衣 | 胸甲 | 防御 +5, 血量 +20 | 40 银 |
| 布裤 | 腿甲 | 防御 +3, 血量 +15 | 30 银 |
| 布鞋 | 鞋子 | 防御 +2, 血量 +10, 移速 +5 | 25 银 |

### T3 进阶装备（16-25 级）

| 名称 | 槽位 | 属性 | 价格 |
|------|------|------|------|
| 钢剑 | 主手 | 攻击 +50, 攻速 +1.0 | 500 银 |
| 钢斧 | 主手 | 攻击 +60, 攻速 +0.9 | 520 银 |
| 骑士盾 | 副手 | 防御 +30, 血量 +120 | 800 银 |
| 锁甲 | 胸甲 | 防御 +30, 血量 +120 | 600 银 |
| 锁甲裤 | 腿甲 | 防御 +20, 血量 +80 | 450 银 |
| 锁甲鞋 | 鞋子 | 防御 +12, 血量 +50, 移速 +15 | 350 银 |

### T5 传奇装备（40+ 级）

| 名称 | 槽位 | 属性 | 价格 | 特效 |
|------|------|------|------|------|
| 龙牙剑 | 主手 | 攻击 +150, 攻速 +1.5 | 10000 银 | 攻击 10% 触发 200% 伤害 |
| 世界树之斧 | 主手 | 攻击 +180, 攻速 +1.2 | 12000 银 | 暴击率 +20% |
| 神之盾 | 副手 | 防御 +100, 血量 +500 | 15000 银 | 格挡 30% 伤害 |
| 龙鳞甲 | 胸甲 | 防御 +100, 血量 +500 | 12000 银 | 火焰抗性 +50% |
| 龙鳞裤 | 腿甲 | 防御 +70, 血量 +350 | 9000 银 | 冰冻抗性 +50% |
| 龙鳞靴 | 鞋子 | 防御 +40, 血量 +200, 移速 +50 | 7000 银 | 免疫减速 |

---

## 🧪 测试流程

### 1. 启动服务器

```bash
cd server
npm run dev
```

### 2. 创建测试角色

```bash
# 使用测试账号登录
test1@example.com / password123
```

### 3. 获取测试物品

```bash
# 查看数据库中可用的装备
npx prisma studio
# 浏览 Item 表
```

### 4. 测试装备流程

```typescript
// 1. 创建背包物品（GM 工具或手动）
// 2. 装备物品
const result = await equipmentSystem.equipItem(itemId, 'MainHand')
console.log(result)

// 3. 检查属性变化
const stats = equipmentSystem.getStats()
console.log('装备后属性:', stats)

// 4. 卸下装备
await equipmentSystem.unequipItem('MainHand')

// 5. 再次检查属性
const stats2 = equipmentSystem.getStats()
console.log('卸下后属性:', stats2)
```

### 5. 测试装备对比

```typescript
// 1. 装备铜剑（T1）
await equipmentSystem.equipItem(t1SwordId, 'MainHand')

// 2. 对比钢剑（T3）
const comparison = await equipmentSystem.compareItem(t3SwordId, 'MainHand')
console.log(comparison)
// { better: true, upgrades: ['attack +40'], downgrades: [] }
```

---

## 🎨 UI 集成（待实现）

### 1. 装备面板组件

```tsx
// client/src/components/EquipmentPanel.tsx
export function EquipmentPanel() {
  const equipment = equipmentSystem.getEquipment()
  const stats = equipmentSystem.getStats()

  return (
    <div className="equipment-panel">
      <div className="equipment-grid">
        <EquipmentSlot slot="MainHand" item={equipment.MainHand} />
        <EquipmentSlot slot="OffHand" item={equipment.OffHand} />
        <EquipmentSlot slot="Armor" item={equipment.Armor} />
        <EquipmentSlot slot="Legs" item={equipment.Legs} />
        <EquipmentSlot slot="Boots" item={equipment.Boots} />
        <EquipmentSlot slot="Accessory" item={equipment.Accessory} />
      </div>
      
      <div className="stats-panel">
        <StatRow label="攻击力" value={stats.attack} />
        <StatRow label="防御力" value={stats.defense} />
        <StatRow label="血量" value={stats.hp} />
        <StatRow label="攻速" value={stats.attackSpeed} />
        <StatRow label="移速" value={stats.moveSpeed} />
      </div>
    </div>
  )
}
```

### 2. 装备提示框

```tsx
// client/src/components/ui/ItemTooltip.tsx
export function ItemTooltip({ item, comparison }) {
  return (
    <div className="item-tooltip">
      <div className="item-header">
        <span className="item-name">{item.name}</span>
        <span className="item-quality">{item.quality}</span>
      </div>
      
      <div className="item-stats">
        {Object.entries(item.stats).map(([stat, value]) => (
          <div className="stat-row">
            <span>{statName(stat)}</span>
            <span className={comparison?.upgrades?.includes(stat) ? 'up' : 'down'}>
              +{value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🐛 已知问题

### 1. 装备图标缺失

**问题：** 装备图标路径 `/assets/items/{slot}.png` 不存在  
**解决：** 创建占位符图标或下载美术资源

### 2. 属性未实时更新

**问题：** 装备后属性需要刷新页面才能看到  
**解决：** 实现 WebSocket 广播属性变化

### 3. 装备预设未实现

**问题：** 批量换装功能（预设配置）未完成  
**解决：** 实现 `loadPreset()` API 和 UI

---

## 📝 下一步

### 阶段 1：核心功能（已完成 ✅）

- [x] 数据库 Schema 扩展
- [x] 装备服务（EquipmentService）
- [x] 装备 API 路由
- [x] 属性计算系统
- [x] 客户端装备系统
- [x] 初始装备数据（30 件）

### 阶段 2：UI 集成（待实现）

- [ ] 装备面板 UI 组件
- [ ] 装备槽位组件
- [ ] 属性面板组件
- [ ] 装备提示框
- [ ] 装备对比提示

### 阶段 3：优化完善（后期）

- [ ] 装备预设系统
- [ ] 批量换装
- [ ] 装备特效（传奇装备发光）
- [ ] WebSocket 属性广播
- [ ] 装备历史价格
- [ ] 装备搜索/过滤

---

## 📚 相关文件

| 文件 | 说明 |
|------|------|
| `docs/EQUIPMENT_SYSTEM.md` | 完整设计文档 |
| `server/src/services/EquipmentService.ts` | 服务端装备服务 |
| `server/src/routes/equipment.ts` | 装备 API 路由 |
| `client/src/systems/EquipmentSystem.ts` | 客户端装备系统 |
| `server/prisma/seed-equipment.ts` | 装备数据种子 |
| `server/prisma/schema.prisma` | 数据库 Schema |

---

## 🎯 快速开始

```bash
# 1. 启动服务器
cd server
npm run dev

# 2. 创建装备数据（如果还没有）
npx tsx prisma/seed-equipment.ts

# 3. 启动客户端
cd client
npm run dev

# 4. 测试装备系统
# 打开浏览器控制台，使用 EquipmentSystem API
```

---

**状态：** ✅ 核心功能完成，待 UI 集成  
**完成度：** 80%  
**下一步：** 创建装备面板 UI 组件
