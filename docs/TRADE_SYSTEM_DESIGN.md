# 交易系统设计文档

## 📅 设计日期
2026-03-12

## 🎯 设计目标
实现玩家间面对面交易系统，支持安全可靠的物品和货币交换。

---

## 🎮 核心功能

### 1. 交易请求
- [ ] 右键玩家发起交易
- [ ] 交易请求通知
- [ ] 接受/拒绝交易
- [ ] 交易距离限制 (100px)

### 2. 交易界面
- [ ] 双栏布局 (双方物品)
- [ ] 拖拽添加物品
- [ ] 货币输入框
- [ ] 物品预览

### 3. 交易确认
- [ ] 锁定交易 (确认按钮)
- [ ] 双方确认后生效
- [ ] 倒计时自动取消
- [ ] 交易取消机制

### 4. 交易执行
- [ ] 验证物品存在
- [ ] 验证背包空间
- [ ] 原子交换 (同时转移)
- [ ] 交易记录

### 5. 交易安全
- [ ] 防欺诈设计
- [ ] 交易确认锁
- [ ] 交易记录查询
- [ ] 异常检测

---

## 📋 数据库设计

### Trade 模型
```prisma
model Trade {
  id            String    @id @default(uuid())
  initiatorId   String
  recipientId   String
  status        String    // PENDING, ACCEPTED, COMPLETED, CANCELLED
  createdAt     DateTime  @default(now())
  completedAt   DateTime?
  
  initiatorItems TradeItem[] @relation("InitiatorItems")
  recipientItems TradeItem[] @relation("RecipientItems")
}
```

### TradeItem 模型
```prisma
model TradeItem {
  id          String   @id @default(uuid())
  tradeId     String
  ownerId     String   // 原所有者
  itemId      String
  quantity    Int      @default(1)
  slot        String   // INITIATOR, RECIPIENT
  
  trade       Trade    @relation(fields: [tradeId], references: [id])
  item        Item     @relation(fields: [itemId], references: [id])
}
```

---

## 🔧 技术实现

### 服务端 API

#### 1. 发起交易
```http
POST /api/v1/trade/request
Body: {
  initiatorId: "uuid",
  recipientId: "uuid"
}
```

#### 2. 响应交易
```http
POST /api/v1/trade/respond
Body: {
  tradeId: "uuid",
  accept: boolean
}
```

#### 3. 添加物品
```http
POST /api/v1/trade/add-item
Body: {
  tradeId: "uuid",
  itemId: "uuid",
  quantity: number,
  slot: "INITIATOR" | "RECIPIENT"
}
```

#### 4. 确认交易
```http
POST /api/v1/trade/confirm
Body: {
  tradeId: "uuid",
  userId: "uuid"
}
```

#### 5. 取消交易
```http
POST /api/v1/trade/cancel
Body: {
  tradeId: "uuid",
  userId: "uuid"
}
```

### 客户端系统

#### TradeSystem.ts
- 发起交易
- 管理交易 UI
- 拖拽处理
- 交易确认

---

## 🎨 视觉效果

### 交易界面
```
┌─────────────────────────────────────────────────┐
│              🤝 交易                             │
├───────────────────────────┬─────────────────────┤
│  玩家 A (你)              │  玩家 B             │
├───────────────────────────┼─────────────────────┤
│  [物品 1] [物品 2]        │  [物品 3] [物品 4]  │
│  [物品 5]                 │                     │
│                           │                     │
│  💰 银币：1000            │  💰 银币：500       │
├───────────────────────────┴─────────────────────┤
│  [✅ 确认]  [❌ 取消]                           │
└─────────────────────────────────────────────────┘
```

### 交易状态
- **等待响应**: 黄色提示
- **交易中**: 绿色边框
- **已确认**: 金色锁图标
- **已完成**: 绿色成功提示
- **已取消**: 红色失败提示

---

## ⚖️ 交易规则

### 距离限制
- 最大交易距离：100px
- 超出距离自动取消

### 时间限制
- 交易请求超时：30 秒
- 交易确认超时：60 秒

### 交易限制
- 不能交易绑定物品
- 不能交易任务物品
- 银币交易上限：1,000,000
- 物品数量限制：背包上限

### 手续费 (后期)
- 高额交易收取 1% 手续费
- 防止洗钱

---

## 🔒 安全机制

### 1. 双重确认
- 双方都必须点击确认
- 一方修改后需重新确认

### 2. 物品锁定
- 交易中的物品被锁定
- 不能使用/出售/丢弃

### 3. 原子交换
- 同时转移物品和货币
- 失败则全部回滚

### 4. 交易记录
- 所有交易永久记录
- 可查询历史交易
- 异常交易检测

---

## 📊 实现优先级

### P0 (核心功能)
1. ⏳ 交易请求/响应
2. ⏳ 交易界面
3. ⏳ 添加/移除物品
4. ⏳ 交易确认/取消
5. ⏳ 物品交换逻辑

### P1 (重要功能)
6. ⏳ 拖拽添加物品
7. ⏳ 货币交易
8. ⏳ 交易记录查询
9. ⏳ 交易倒计时

### P2 (优化功能)
10. ⏳ 交易历史 UI
11. ⏳ 物品预览
12. ⏳ 交易搜索
13. ⏳ 异常检测

---

**呼噜大陆开发组**  
2026-03-12
