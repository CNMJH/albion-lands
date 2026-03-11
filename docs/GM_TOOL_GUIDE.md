# 🎮 GM 管理工具使用指南

## 📋 概述

GM 工具是呼噜大陆的管理后台，提供玩家管理、物品管理、经济监控等功能。

**访问地址**: http://localhost:3002/gm/

---

## 🔧 功能模块

### 1. 📊 仪表盘

**功能**:
- 服务器概览（玩家数、在线数、物品数、订单数）
- 最近日志查看

**API**:
- `GET /api/v1/gm/dashboard` - 获取仪表盘数据

---

### 2. 👥 玩家管理

**功能**:
- 查看所有玩家列表
- 查看玩家详情（背包、装备）
- 修改玩家等级
- 给予物品
- 给予货币（银币/金币）
- 传送玩家
- 重置背包
- 删除玩家

**API**:
- `GET /api/v1/gm/players` - 玩家列表
- `GET /api/v1/gm/players/:id` - 玩家详情
- `POST /api/v1/gm/players/:id/level` - 修改等级
- `POST /api/v1/gm/players/:id/items` - 给予物品
- `POST /api/v1/gm/players/:id/currency` - 给予货币
- `POST /api/v1/gm/players/:id/teleport` - 传送玩家
- `POST /api/v1/gm/players/:id/inventory/reset` - 重置背包
- `DELETE /api/v1/gm/players/:id` - 删除玩家

**操作示例**:

#### 修改玩家等级
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{playerId}/level \
  -H "Content-Type: application/json" \
  -d '{"level": 50}'
```

#### 给予物品
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{playerId}/items \
  -H "Content-Type: application/json" \
  -d '{"itemId": "iron_sword", "quantity": 1}'
```

#### 给予货币
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{playerId}/currency \
  -H "Content-Type: application/json" \
  -d '{"silver": 10000, "gold": 1000}'
```

#### 传送玩家
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{playerId}/teleport \
  -H "Content-Type: application/json" \
  -d '{"zoneId": "zone_3", "x": 500, "y": 400}'
```

---

### 3. 🎒 物品管理

**功能**:
- 查看所有物品模板
- 创建新物品

**API**:
- `GET /api/v1/gm/items` - 物品列表
- `POST /api/v1/gm/items` - 创建物品

**创建物品示例**:
```bash
curl -X POST http://localhost:3002/api/v1/gm/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "传说之剑",
    "type": "Weapon",
    "rarity": "Legendary",
    "stats": {"attack": 100, "critical": 0.2},
    "slot": "MainHand",
    "minLevel": 50,
    "stackSize": 1,
    "basePrice": 10000
  }'
```

---

### 4. 💰 市场监控

**功能**:
- 查看所有市场订单
- 监控经济系统

**API**:
- `GET /api/v1/gm/market` - 市场订单列表

---

### 5. 🌲 资源节点

**功能**:
- 查看所有资源节点状态
- 监控采集系统

**API**:
- `GET /api/v1/gm/resources` - 资源节点列表

---

### 6. 📝 日志查看

**功能**:
- 查看游戏日志
- 按类型筛选
- GM 操作记录

**API**:
- `GET /api/v1/gm/logs?type=GM_ACTION&limit=100` - 游戏日志

**日志类型**:
- `GM_ACTION` - GM 操作
- `GM_BROADCAST` - GM 广播
- `COMBAT` - 战斗日志
- `TRADE` - 交易日志

---

### 7. 🖥️ 服务器状态

**功能**:
- 查看服务器运行时间
- 内存使用情况
- 系统信息

**API**:
- `GET /api/v1/gm/server/status` - 服务器状态

---

## 🎯 常用操作

### 新手村测试账号管理

#### 创建测试物品
```bash
# 给予测试角色全套装备
curl -X POST http://localhost:3002/api/v1/gm/players/{testPlayerId}/items \
  -H "Content-Type: application/json" \
  -d '{"itemId": "iron_sword", "quantity": 1}'

curl -X POST http://localhost:3002/api/v1/gm/players/{testPlayerId}/items \
  -H "Content-Type: application/json" \
  -d '{"itemId": "leather_armor", "quantity": 1}'
```

#### 设置测试等级
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{testPlayerId}/level \
  -H "Content-Type: application/json" \
  -d '{"level": 20}'
```

#### 给予测试货币
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{testPlayerId}/currency \
  -H "Content-Type: application/json" \
  -d '{"silver": 50000, "gold": 5000}'
```

---

## 🔐 安全说明

### 当前状态
⚠️ **注意**: 当前版本**没有认证机制**，任何人都可以访问 GM 工具！

### 生产环境必须添加
1. **HTTP Basic Auth** 或 **JWT 认证**
2. **IP 白名单**限制
3. **操作日志**记录所有 GM 操作
4. **权限分级**（不同 GM 不同权限）

### 添加认证示例（待实现）
```typescript
// 在 gm.ts 路由中添加认证中间件
fastify.addHook('preHandler', async (request, reply) => {
  const token = request.headers.authorization
  
  if (!token || !verifyGMToken(token)) {
    reply.status(401).send({ error: '未授权访问' })
  }
})
```

---

## 📊 数据库表

GM 工具操作涉及的主要数据库表：

### Character (角色表)
- `id` - 角色 ID
- `name` - 角色名
- `level` - 等级
- `exp` - 经验
- `silver` - 银币
- `gold` - 金币
- `zoneId` - 区域 ID
- `x`, `y` - 坐标
- `isOnline` - 在线状态

### Item (物品表)
- `id` - 物品 ID
- `name` - 名称
- `type` - 类型
- `rarity` - 稀有度
- `stats` - 属性 (JSON)
- `slot` - 装备部位
- `basePrice` - 基础价格

### InventoryItem (背包表)
- `id` - 背包项 ID
- `characterId` - 角色 ID
- `itemId` - 物品 ID
- `quantity` - 数量
- `isEquipped` - 是否装备

### GameLog (游戏日志表)
- `id` - 日志 ID
- `type` - 类型
- `message` - 消息
- `data` - 数据 (JSON)
- `characterId` - 关联角色
- `createdAt` - 创建时间

---

## 🛠️ 开发说明

### 添加新的 GM 功能

1. **在 `server/src/routes/gm.ts` 添加 API 路由**
```typescript
fastify.post('/api/v1/gm/new-feature', async (request, reply) => {
  // 实现功能
  reply.send({ success: true, data: {} })
})
```

2. **在前端 `server/public/gm/gm-app.js` 添加调用函数**
```javascript
async function callNewFeature() {
  const res = await fetch(`${API_BASE}/new-feature`, {
    method: 'POST',
  })
  const data = await res.json()
  // 处理结果
}
```

3. **在 `server/public/gm/index.html` 添加 UI**
```html
<button onclick="callNewFeature()">新功能</button>
```

---

## 🐛 常见问题

### 1. 无法访问 GM 工具
**检查**:
- 服务器是否启动
- 端口是否正确 (3002)
- 静态文件服务是否配置

### 2. API 返回 404
**检查**:
- 路由前缀是否正确 (`/api/v1/gm`)
- 路由是否注册

### 3. 给予物品失败
**可能原因**:
- 物品 ID 不存在
- 玩家背包已满
- 玩家 ID 不存在

### 4. 操作无日志记录
**检查**:
- `prisma.gameLog.create()` 是否调用
- 数据库连接是否正常

---

## 📝 最佳实践

### 1. 所有操作记录日志
```typescript
await prisma.gameLog.create({
  data: {
    type: 'GM_ACTION',
    message: 'GM 给予物品',
    characterId: playerId,
    data: JSON.stringify({ itemId, quantity }),
  },
})
```

### 2. 验证输入参数
```typescript
if (!level || level < 1 || level > 100) {
  return reply.status(400).send({
    success: false,
    error: '等级必须在 1-100 之间',
  })
}
```

### 3. 事务操作
```typescript
await prisma.$transaction(async (tx) => {
  // 多个数据库操作
  await tx.character.update(...)
  await tx.inventoryItem.create(...)
})
```

### 4. 错误处理
```typescript
try {
  // 操作
} catch (error) {
  fastify.log.error('操作失败:', error)
  reply.status(500).send({ success: false, error: '服务器错误' })
}
```

---

## 🚀 待开发功能

- [ ] GM 认证系统
- [ ] 权限分级
- [ ] 批量操作
- [ ] 数据导出
- [ ] 实时监控
- [ ] 全服广播（WebSocket）
- [ ] 封禁/解封账号
- [ ] 角色数据回滚
- [ ] 活动管理
- [ ] 公告系统

---

**GM 工具是强大的管理工具，请谨慎使用！** ⚠️
