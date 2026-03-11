# 聊天系统设计文档

## 概述

聊天系统是 MMORPG 社交功能的核心，支持多种聊天频道和通信方式。

**设计原则**:
- 区域聊天为主，全服聊天为辅
- 支持多种频道类型
- 防止刷屏和滥用
- 高性能实时通信

---

## 频道类型

### 1. 区域聊天 (Zone Chat) - 默认频道

**用途**: 同一地图区域内的玩家交流

**特点**:
- 默认显示当前地图的其他玩家聊天
- 只有同区域玩家能收到消息
- 无需消耗道具
- 支持所有玩家使用

**技术实现**:
```typescript
interface ZoneChatMessage {
  type: 'zone'
  senderId: string
  zoneId: string      // 区域 ID
  content: string
  position?: {x, y}   // 可选：发送者位置
}
```

**广播逻辑**:
```typescript
// 只广播给同区域玩家
clients.forEach(client => {
  if (client.position?.zoneId === message.zoneId) {
    send(client, message)
  }
})
```

---

### 2. 世界聊天 (Global Chat) - 大喇叭

**用途**: 全服喊话，重要公告

**特点**:
- 全服玩家都能收到
- **需要消耗道具**：大喇叭 (World Horn)
- 有使用冷却时间 (CD: 10 秒)
- 有每日使用限制 (可选：50 次/天)
- 消息高亮显示

**消耗道具**:
```typescript
interface WorldHornItem {
  id: 'item_world_horn'
  name: '大喇叭'
  description: '使用后可以进行全服喊话'
  maxStack: 99
}
```

**技术实现**:
```typescript
interface GlobalChatMessage {
  type: 'global'
  senderId: string
  content: string
  isHighlighted: true  // 高亮显示
  itemConsumed: 'world_horn'
}
```

**验证逻辑**:
```typescript
async function sendGlobalMessage(characterId: string, content: string) {
  // 检查是否拥有大喇叭
  const hasHorn = await InventoryService.hasItem(characterId, 'world_horn')
  if (!hasHorn) {
    throw new Error('需要消耗大喇叭')
  }
  
  // 检查 CD
  const lastGlobalTime = await getLastGlobalChatTime(characterId)
  if (Date.now() - lastGlobalTime < 10000) {
    throw new Error('冷却时间中')
  }
  
  // 扣除道具
  await InventoryService.removeItem(characterId, 'world_horn', 1)
  
  // 发送消息
  await ChatService.sendGlobalMessage(characterId, content)
  
  // 记录使用时间
  await setLastGlobalChatTime(characterId, Date.now())
}
```

---

### 3. 私聊 (Whisper)

**用途**: 一对一私密对话

**特点**:
- 指定接收者
- 双向对话记录
- 被拉黑则无法发送
- 无需消耗

**技术实现**:
```typescript
interface WhisperMessage {
  type: 'whisper'
  senderId: string
  receiverId: string
  content: string
}
```

---

### 4. 队伍聊天 (Party Chat)

**用途**: 队伍成员内部交流

**特点**:
- 仅队伍成员可见
- 无需消耗
- 跨区域通信

**技术实现**:
```typescript
interface PartyChatMessage {
  type: 'party'
  senderId: string
  partyId: string
  content: string
}
```

---

### 5. 交易频道 (Trade Chat) - 可选

**用途**: 物品买卖信息发布

**特点**:
- 独立频道
- 可筛选显示
- 支持物品链接

---

## UI 设计

### 聊天窗口布局

```
┌─────────────────────────────────────┐
│ [本地] [队伍] [世界] [交易]         │ ← 频道标签
├─────────────────────────────────────┤
│ [系统] 欢迎来到呼噜大陆！            │
│ [区域] 玩家 A: 有人一起打怪吗？      │
│ [区域] 玩家 B: 组队来人              │
│ [队伍] 队友 C: 准备开怪              │
│ [世界] ★★★ 玩家 D: 出售 +5 武器 ★★★│ ← 高亮
│ [系统] 玩家 E 加入了游戏             │
├─────────────────────────────────────┤
│ 输入消息...                  [发送] │ ← 输入框
└─────────────────────────────────────┘
```

### 频道标签说明

| 标签 | 对应类型 | 说明 |
|------|---------|------|
| 本地 | zone | 当前区域聊天 (默认) |
| 队伍 | party | 队伍聊天 (无队伍时禁用) |
| 世界 | global | 全服聊天 (消耗大喇叭) |
| 交易 | trade | 交易信息 (可选) |

---

## 消息格式

### 普通消息
```
[频道] 发送者名称：消息内容
```

### 高亮消息 (世界频道)
```
[世界] ★★★ 发送者名称：消息内容 ★★★
```

### 系统消息
```
[系统] 系统消息内容
```

---

## 技术实现

### 数据库 Schema

```prisma
model ChatMessage {
  id         String   @id @default(uuid())
  type       String   // zone, global, whisper, party, trade
  senderId   String
  sender     Character @relation(fields: [senderId], references: [id])
  receiverId String?  // whisper 目标
  partyId    String?  // party 聊天 ID
  zoneId     String?  // zone 聊天 ID
  content    String
  isHighlighted Boolean @default(false)  // 是否高亮
  createdAt  DateTime @default(now())
}
```

### WebSocket 消息

#### 客户端 → 服务端
```typescript
// 发送聊天消息
{
  type: 'chat',
  data: {
    channel: 'zone' | 'global' | 'whisper' | 'party',
    content: string,
    receiverId?: string,  // whisper 需要
    partyId?: string,     // party 需要
    zoneId?: string       // zone 需要
  }
}

// 使用大喇叭
{
  type: 'useWorldHorn',
  data: {
    content: string
  }
}
```

#### 服务端 → 客户端
```typescript
// 收到聊天消息
{
  type: 'chatMessage',
  payload: {
    id: string,
    channel: string,
    senderName: string,
    senderLevel: number,
    content: string,
    isHighlighted: boolean,
    timestamp: number
  }
}

// 大喇叭使用成功
{
  type: 'worldHornUsed',
  payload: {
    success: true,
    remaining: 5  // 剩余数量
  }
}

// 错误
{
  type: 'chatError',
  payload: {
    error: '需要消耗大喇叭' | '冷却时间中' | '消息过长'
  }
}
```

---

## 限制和规则

### 消息长度
- 普通消息：500 字符
- 世界消息：100 字符 (防止刷屏)

### 频率限制
- 区域聊天：1 秒/条
- 世界聊天：10 秒/条 (CD)
- 私聊：2 秒/条

### 屏蔽规则
- 敏感词过滤
- 拉黑用户消息不显示
- 重复消息检测

### 世界聊天消耗
```typescript
const WORLD_CHAT_LIMITS = {
  cooldown: 10000,        // 10 秒 CD
  dailyLimit: 50,         // 每日 50 次 (可选)
  itemCost: {
    itemId: 'world_horn',
    quantity: 1
  }
}
```

---

## 大喇叭道具

### 获取方式
1. **商城购买**: 100 金币/个
2. **活动奖励**: 节日活动、签到
3. **任务奖励**: 成就系统
4. **副本掉落**: 稀有掉落

### 道具属性
```typescript
{
  id: 'world_horn',
  name: '大喇叭',
  type: 'consumable',
  rarity: 'common',
  description: '使用后可以进行全服喊话',
  maxStack: 99,
  cooldown: 10,  // 秒
  effect: 'enable_global_chat'
}
```

---

## 性能优化

### 1. 区域聊天优化
- 只广播给同区域玩家
- 使用空间索引加速区域查询
- 消息缓存 (最近 100 条)

### 2. 世界聊天优化
- 独立消息队列
- 限制发送频率
- 消息去重

### 3. 数据库优化
- 定期清理旧消息 (保留 7 天)
- 消息分表 (按类型)
- 索引优化 (zoneId, createdAt)

---

## 安全考虑

### 1. 敏感词过滤
```typescript
const bannedWords = ['敏感词 1', '敏感词 2', ...]

function filterMessage(content: string): string {
  let filtered = content
  bannedWords.forEach(word => {
    filtered = filtered.replace(new RegExp(word, 'g'), '*'.repeat(word.length))
  })
  return filtered
}
```

### 2. 频率限制
```typescript
const rateLimits = new Map<string, number>()

function checkRateLimit(characterId: string, limit: number): boolean {
  const lastTime = rateLimits.get(characterId) || 0
  if (Date.now() - lastTime < limit) {
    return false
  }
  rateLimits.set(characterId, Date.now())
  return true
}
```

### 3. 举报系统
- 玩家可举报不当言论
- GM 可查看聊天记录
- 自动审核 + 人工审核

---

## 扩展功能

### 1. 表情系统
```typescript
interface ChatMessage {
  // ...
  emotes?: string[]  // 表情 ID 列表
}
```

### 2. 物品链接
```typescript
// 聊天中发送物品
[item:12345]  // 物品 ID

// 解析为可点击链接
<item-link id="12345">强化 +5 长剑</item-link>
```

### 3. 组队链接
```typescript
// 发送组队邀请链接
[party-join:party-id]  // 点击加入队伍
```

### 4. 位置分享
```typescript
// 分享当前位置
[location:zone_1:100:200]  // 区域 ID, X, Y
```

---

## 测试用例

### 1. 区域聊天测试
```typescript
// 测试 1: 同区域玩家能收到消息
test('zone chat - same zone', () => {
  player1.zoneId = 'zone_1'
  player2.zoneId = 'zone_1'
  sendZoneMessage(player1, 'zone_1', 'hello')
  expect(player2).toHaveReceived('hello')
})

// 测试 2: 不同区域玩家收不到消息
test('zone chat - different zone', () => {
  player1.zoneId = 'zone_1'
  player2.zoneId = 'zone_2'
  sendZoneMessage(player1, 'zone_1', 'hello')
  expect(player2).not.toHaveReceived('hello')
})
```

### 2. 世界聊天测试
```typescript
// 测试 1: 有大喇叭可以发送
test('global chat - has horn', () => {
  player.inventory.add('world_horn', 1)
  const result = sendGlobalMessage(player, 'hello')
  expect(result.success).toBe(true)
  expect(player.inventory.get('world_horn')).toBe(0)
})

// 测试 2: 没有大喇叭不能发送
test('global chat - no horn', () => {
  const result = sendGlobalMessage(player, 'hello')
  expect(result.success).toBe(false)
  expect(result.error).toBe('需要消耗大喇叭')
})

// 测试 3: CD 时间内不能发送
test('global chat - cooldown', () => {
  player.inventory.add('world_horn', 2)
  sendGlobalMessage(player, 'hello1')
  const result = sendGlobalMessage(player, 'hello2')
  expect(result.success).toBe(false)
  expect(result.error).toBe('冷却时间中')
})
```

---

## 总结

### 核心特性
- ✅ **区域聊天**: 默认频道，同区域可见
- ✅ **世界聊天**: 消耗大喇叭，全服可见
- ✅ **私聊**: 一对一私密对话
- ✅ **队伍聊天**: 队伍内部交流
- ✅ **频率限制**: 防止刷屏
- ✅ **敏感词过滤**: 内容审核

### 经济系统整合
- 大喇叭道具消耗
- 商城售卖
- 活动获取

### 下一步
1. 实现大喇叭道具
2. 添加敏感词过滤
3. 实现举报系统
4. 添加表情和物品链接
5. 性能优化和压力测试
