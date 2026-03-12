# 拍卖行系统设计文档

## 📅 设计日期
2026-03-12

## 🎯 设计目标
实现全服玩家间市场交易系统，支持自由定价、自动匹配、交易税等经济功能。

---

## 🎮 核心功能

### 1. 创建订单
- [ ] 出售订单 (卖家挂单)
- [ ] 购买订单 (买家挂单)
- [ ] 设置价格 (单价×数量)
- [ ] 设置有效期 (24h/48h/72h)

### 2. 浏览市场
- [ ] 按物品搜索
- [ ] 按类别筛选
- [ ] 价格排序 (低→高/高→低)
- [ ] 时间排序

### 3. 购买物品
- [ ] 立即购买
- [ ] 部分购买 (购买部分数量)
- [ ] 自动匹配最低价格
- [ ] 银币扣除

### 4. 取消订单
- [ ] 取消未售出订单
- [ ] 退还物品
- [ ] 扣除手续费

### 5. 交易税
- [ ] 上架手续费 (1%)
- [ ] 成交税 (5%)
- [ ] 税收系统

---

## 📋 数据库设计

### MarketOrder 模型
```prisma
model MarketOrder {
  id          String   @id @default(uuid())
  sellerId    String
  itemId      String
  quantity    Int
  price       Int      // 单价
  type        String   // SELL, BUY
  status      String   // ACTIVE, COMPLETED, CANCELLED, EXPIRED
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  
  seller      Character @relation(fields: [sellerId], references: [id])
  item        Item      @relation(fields: [itemId], references: [id])
}
```

### TransactionHistory 模型
```prisma
model TransactionHistory {
  id        String   @id @default(uuid())
  orderId   String
  buyerId   String
  sellerId  String
  itemId    String
  quantity  Int
  price     Int      // 成交价
  tax       Int      // 税费
  createdAt DateTime @default(now())
}
```

---

## 🔧 技术实现

### 服务端 API

#### 1. 创建订单
```http
POST /api/v1/market/order
Body: {
  sellerId: "uuid",
  itemId: "uuid",
  quantity: number,
  price: number,
  type: "SELL" | "BUY",
  duration: 24 | 48 | 72 // 小时
}
```

#### 2. 查询市场
```http
GET /api/v1/market/orders
Query: ?itemId=uuid&sortBy=price|time&sortOrder=asc|desc
```

#### 3. 购买物品
```http
POST /api/v1/market/buy
Body: {
  orderId: "uuid",
  buyerId: "uuid",
  quantity: number
}
```

#### 4. 取消订单
```http
POST /api/v1/market/cancel
Body: {
  orderId: "uuid",
  sellerId: "uuid"
}
```

### 客户端系统

#### MarketSystem.ts
- 创建订单
- 查询市场
- 购买物品
- 取消订单
- 价格趋势

---

## 🎨 视觉效果

### 市场界面
```
┌─────────────────────────────────────────────────┐
│  🏪 拍卖行                                      │
├─────────────────────────────────────────────────┤
│  搜索：[输入物品名称]  类别：[全部 ▼]          │
├─────────────────────────────────────────────────┤
│  物品名称      数量    单价      总价   卖家   │
├─────────────────────────────────────────────────┤
│  [铁剑]       x10    💰50    💰500   玩家 A   │
│  [铁剑]       x5     💰55    💰275   玩家 B   │
│  [皮甲]       x3     💰100   💰300   玩家 C   │
├─────────────────────────────────────────────────┤
│  我的订单 (3)          [创建订单]              │
│  - 铁剑 x10 @ 💰50 (售出 5/10)                 │
│  - 皮甲 x3  @ 💰100 (未售出)                   │
└─────────────────────────────────────────────────┘
```

### 创建订单界面
```
┌─────────────────────────────────┐
│  📝 创建订单                    │
├─────────────────────────────────┤
│  类型：○ 出售  ● 购买          │
│  物品：[选择物品 ▼]            │
│  数量：[100]                   │
│  单价：[50] 💰                 │
│  总价：5000 💰                 │
│  手续费：50 💰 (1%)            │
│  有效期：[24 小时 ▼]           │
├─────────────────────────────────┤
│  [确认创建]  [取消]            │
└─────────────────────────────────┘
```

---

## ⚖️ 经济规则

### 手续费
- **上架费**: 1% (无论是否售出)
- **成交税**: 5% (仅成交时收取)
- **最低价格**: 1 银币
- **最高价格**: 1,000,000 银币

### 订单有效期
- **24 小时**: 标准
- **48 小时**: +0.5% 手续费
- **72 小时**: +1% 手续费

### 匹配规则
- **购买**: 自动匹配最低价格
- **出售**: 自动匹配最高出价
- **部分成交**: 允许部分数量成交

---

## 📊 实现优先级

### P0 (核心功能)
1. ⏳ 创建出售订单
2. ⏳ 查询市场
3. ⏳ 购买物品
4. ⏳ 取消订单
5. ⏳ 交易税系统

### P1 (重要功能)
6. ⏳ 创建购买订单
7. ⏳ 价格趋势图
8. ⏳ 我的订单管理
9. ⏳ 交易历史

### P2 (优化功能)
10. ⏳ 快速出售
11. ⏳ 收藏物品
12. ⏳ 价格提醒
13. ⏳ 批量操作

---

**呼噜大陆开发组**  
2026-03-12
