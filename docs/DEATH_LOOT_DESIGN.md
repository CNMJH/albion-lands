# 死亡掉落系统设计文档

## 📋 设计目标

实现阿尔比恩核心机制：死亡掉落装备，增加游戏风险性和刺激性。

---

## 🎯 核心规则

### 1. 安全区域规则

| 区域 | 安全等级 | 死亡惩罚 |
|------|---------|----------|
| 区域 1: 新手村庄 | 9-10 (安全区) | 仅耐久损失，不掉落 |
| 区域 2: 平原旷野 | 6-8 (安全区) | 仅耐久损失，不掉落 |
| 区域 3: 迷雾森林 | 3-4 (低危区) | 掉落 1 件非装备物品 |
| 区域 4: 巨龙山脉 | 1-2 (高危区) | 掉落 1-2 件装备 |
| 区域 5: 深渊遗迹 | 0 (死亡区) | 掉落 3-5 件装备 |

### 2. 掉落计算逻辑

```
if (安全等级 >= 6) {
  // 安全区 - 不掉落
  掉落 = []
} else if (安全等级 >= 3) {
  // 低危区 - 掉落非装备物品
  掉落数量 = random(0, 1)
  掉落 = 从背包随机选择非装备物品
} else if (安全等级 >= 1) {
  // 高危区 - 掉落装备
  掉落数量 = random(1, 2)
  掉落 = 从装备栏随机选择装备
} else {
  // 死亡区 - 大量掉落
  掉落数量 = random(3, 5)
  掉落 = 从装备栏随机选择装备
}
```

### 3. 保护机制

- **新手保护**: Lv.10 以下玩家不掉落装备
- **保险系统**: 可购买保险保护 1 件装备 (后期实现)
- **耐久损失**: 死亡时所有装备耐久 -10

---

## 🏗️ 技术实现

### 数据库 Schema 更新

```prisma
// 死亡记录表
model DeathRecord {
  id          String   @id @default(uuid())
  characterId String
  killerId    String?  // 击杀者 (PVP 时)
  mapId       String   // 死亡地图
  safetyLevel Int      // 安全等级
  droppedItems Json    // 掉落物品列表
  createdAt   DateTime @default(now())
  
  character   Character @relation(fields: [characterId], references: [id])
}

// 掉落物品表
model DroppedItem {
  id          String   @id @default(uuid())
  mapId       String   // 掉落地图
  x           Int      // X 坐标
  y           Int      // Y 坐标
  itemId      String   // 物品 ID
  ownerId     String?  // 原主人 (可拾取保护)
  expireAt    DateTime // 过期时间 (30 分钟)
  createdAt   DateTime @default(now())
  
  item        Item     @relation(fields: [itemId], references: [id])
}
```

### 服务端 API

```typescript
// 死亡处理
POST /api/v1/combat/death
Body: {
  characterId: string,
  killerId?: string,
  mapId: string,
  safetyLevel: number
}

Response: {
  droppedItems: Array<{
    itemId: string,
    itemName: string,
    slot?: string  // 如果是装备
  }>,
  durabilityLoss: number,
  respawnLocation: {
    mapId: string,
    x: number,
    y: number
  }
}

// 拾取掉落物
POST /api/v1/combat/loot
Body: {
  characterId: string,
  droppedItemId: string
}

Response: {
  success: boolean,
  item: Item
}

// 查询掉落物
GET /api/v1/combat/drops/:mapId
Response: {
  drops: Array<DroppedItem>
}
```

### 客户端逻辑

```typescript
// 死亡处理
async handleDeath(killerId?: string) {
  // 1. 播放死亡动画
  this.playDeathAnimation()
  
  // 2. 发送死亡请求
  const result = await api.post('/combat/death', {
    characterId: this.characterId,
    killerId,
    mapId: this.currentMapId,
    safetyLevel: this.currentSafetyLevel
  })
  
  // 3. 显示掉落提示
  this.showDeathReport(result.droppedItems)
  
  // 4. 更新装备耐久
  this.updateEquipmentDurability(result.durabilityLoss)
  
  // 5. 复活
  setTimeout(() => {
    this.respawn(result.respawnLocation)
  }, 3000)
}

// 拾取掉落物
async lootDroppedItem(droppedItemId: string) {
  const result = await api.post('/combat/loot', {
    characterId: this.characterId,
    droppedItemId
  })
  
  if (result.success) {
    this.addToInventory(result.item)
    this.showPickupNotification(result.item)
  }
}
```

---

## 🎨 UI 设计

### 死亡报告面板

```
┌─────────────────────────────────┐
│   💀 你被击败！                  │
├─────────────────────────────────┤
│   击杀者：[AI] 哥布林战士       │
│   地点：巨龙山脉                │
│                                 │
│   掉落物品：                    │
│   - 铁剑 (T2)                   │
│   - 皮甲 (T2)                   │
│                                 │
│   耐久损失：-10                 │
│                                 │
│   3 秒后复活...                  │
└─────────────────────────────────┘
```

### 掉落物标记

```
地图上显示：
📦 铁剑 (T2)
   [拾取]
```

---

## 📋 实现清单

### 服务端
- [ ] 更新 Prisma Schema
- [ ] 创建数据库迁移
- [ ] 实现 DeathService
- [ ] 实现掉落物生成逻辑
- [ ] 实现拾取逻辑
- [ ] 添加 API 路由
- [ ] WebSocket 死亡通知

### 客户端
- [ ] 死亡动画系统
- [ ] 死亡报告 UI
- [ ] 掉落物渲染
- [ ] 拾取交互
- [ ] 复活逻辑
- [ ] 耐久度更新

### 测试
- [ ] 安全区死亡测试
- [ ] 危险区死亡测试
- [ ] PVP 死亡测试
- [ ] PVE 死亡测试
- [ ] 拾取功能测试

---

**设计人**: 波波  
**日期**: 2026-03-12  
**状态**: 待实现
