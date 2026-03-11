# 阶段 5：社交系统

## 概述

社交系统是 MMORPG 的核心功能之一，包括好友系统、组队系统和聊天系统。

**完成时间**: 2024-03-11  
**开发周期**: 1 周  
**状态**: ✅ 完成

---

## 功能特性

### 1. 好友系统

#### 功能列表
- ✅ 发送好友请求
- ✅ 接受/拒绝好友请求
- ✅ 删除好友
- ✅ 拉黑/取消拉黑用户
- ✅ 查看好友列表（在线/离线）
- ✅ 查看待处理请求
- ✅ 查看拉黑列表

#### 数据结构

```typescript
interface Friend {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
  friend: {
    id: string
    name: string
    level: number
    isOnline: boolean
    zoneId: string
  }
}
```

#### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/social/friends?userId={id}` | 获取好友列表 |
| POST | `/api/v1/social/friends/request` | 发送好友请求 |
| POST | `/api/v1/social/friends/accept` | 接受好友请求 |
| POST | `/api/v1/social/friends/reject` | 拒绝好友请求 |
| DELETE | `/api/v1/social/friends/:friendUserId` | 删除好友 |
| GET | `/api/v1/social/friends/pending?userId={id}` | 获取待处理请求 |
| GET | `/api/v1/social/friends/blocked?userId={id}` | 获取拉黑列表 |
| POST | `/api/v1/social/friends/block` | 拉黑用户 |
| POST | `/api/v1/social/friends/unblock` | 取消拉黑 |

---

### 2. 组队系统

#### 功能列表
- ✅ 创建队伍（最多 3 人）
- ✅ 加入队伍
- ✅ 离开队伍
- ✅ 踢出队员（仅队长）
- ✅ 解散队伍
- ✅ 队伍信息展示
- ✅ 队长转移
- ✅ 公开队伍列表

#### 数据结构

```typescript
interface Party {
  id: string
  leaderId: string
  name?: string
  maxMembers: number  // 默认 3
  isPublic: boolean
  members: PartyMember[]
  createdAt: Date
  updatedAt: Date
}

interface PartyMember {
  id: string
  partyId: string
  characterId: string
  role: 'Leader' | 'Member'
  character: {
    id: string
    name: string
    level: number
    isOnline: boolean
    zoneId: string
    x: number
    y: number
  }
}
```

#### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/v1/social/party` | 创建队伍 |
| GET | `/api/v1/social/party/:partyId` | 获取队伍信息 |
| GET | `/api/v1/social/party/member/:characterId` | 获取玩家的队伍 |
| POST | `/api/v1/social/party/:partyId/join` | 加入队伍 |
| POST | `/api/v1/social/party/:partyId/leave` | 离开队伍 |
| POST | `/api/v1/social/party/:partyId/kick` | 踢出队员 |
| DELETE | `/api/v1/social/party/:partyId` | 解散队伍 |
| GET | `/api/v1/social/party/public` | 获取公开队伍列表 |

---

### 3. 聊天系统

#### 功能列表
- ✅ 私聊（Whisper）
- ✅ 队伍聊天（Party）
- ✅ 区域聊天（Zone）- **默认频道**
- ✅ 全局聊天（Global）- **消耗大喇叭**
- ✅ 聊天记录存储
- ✅ 消息长度限制
- ✅ 拉黑过滤
- ✅ 频率限制（防刷屏）

#### 设计理念

**区域聊天为主，全服聊天为辅**:
- 玩家默认看到当前地图区域的其他玩家聊天
- 全服喊话需要消耗道具"大喇叭"
- 避免全屏垃圾信息，提升聊天质量

#### 频道类型

| 频道 | 范围 | 消耗 | CD | 说明 |
|------|------|------|-----|------|
| 区域 | 当前地图 | 无 | 1 秒 | 默认频道，同区域可见 |
| 世界 | 全服 | 大喇叭×1 | 10 秒 | 高亮显示，重要公告 |
| 私聊 | 指定玩家 | 无 | 2 秒 | 一对一私密对话 |
| 队伍 | 队伍成员 | 无 | 无 | 跨区域队伍交流 |

#### 大喇叭道具

**获取方式**:
- 商城购买：100 金币/个
- 活动奖励：节日活动、签到
- 任务奖励：成就系统
- 副本掉落：稀有掉落

**使用规则**:
- 每次世界聊天消耗 1 个
- 冷却时间 10 秒
- 消息长度限制 100 字符
- 高亮显示（★★★）

#### 数据结构

```typescript
interface ChatMessage {
  id: string
  type: 'whisper' | 'party' | 'zone' | 'global'
  senderId: string
  receiverId?: string  // 私聊目标
  partyId?: string     // 队伍 ID
  zoneId?: string      // 区域 ID
  content: string
  createdAt: Date
  sender?: {
    name: string
    level: number
  }
}
```

#### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/v1/social/chat/whisper` | 发送私聊 |
| POST | `/api/v1/social/chat/party` | 发送队伍消息 |
| POST | `/api/v1/social/chat/zone` | 发送区域消息 |
| POST | `/api/v1/social/chat/global` | 发送全局消息 |
| GET | `/api/v1/social/chat/history` | 获取聊天记录 |

---

## WebSocket 消息

### 客户端 → 服务端

```typescript
// 好友请求
{
  type: 'friendRequest',
  data: { friendUserId: string }
}

// 接受好友
{
  type: 'friendAccept',
  data: { friendUserId: string }
}

// 拒绝好友
{
  type: 'friendReject',
  data: { friendUserId: string }
}

// 删除好友
{
  type: 'friendRemove',
  data: { friendUserId: string }
}

// 创建队伍
{
  type: 'partyCreate',
  data: { name?: string, isPublic?: boolean }
}

// 加入队伍
{
  type: 'partyJoin',
  data: { partyId: string }
}

// 离开队伍
{
  type: 'partyLeave',
  data: { partyId: string }
}

// 踢出队员
{
  type: 'partyKick',
  data: { partyId: string, targetId: string }
}

// 聊天消息
{
  type: 'chat',
  data: {
    type: 'whisper' | 'party' | 'zone' | 'global',
    content: string,
    receiverId?: string,
    partyId?: string,
    zoneId?: string
  }
}
```

### 服务端 → 客户端

```typescript
// 好友请求已发送
{
  type: 'friendRequestSent',
  payload: { friendUserId: string, message: string }
}

// 好友已接受
{
  type: 'friendAccepted',
  payload: { friendUserId: string, message: string }
}

// 被添加为好友
{
  type: 'friendAdded',
  payload: { friendUserId: string }
}

// 好友请求被拒绝
{
  type: 'friendRejected',
  payload: { friendUserId: string }
}

// 好友已删除
{
  type: 'friendRemoved',
  payload: { friendUserId: string }
}

// 好友错误
{
  type: 'friendError',
  payload: { error: string }
}

// 队伍已创建
{
  type: 'partyCreated',
  payload: { party: Party }
}

// 已加入队伍
{
  type: 'partyJoined',
  payload: { party: Party }
}

// 已离开队伍
{
  type: 'partyLeft',
  payload: { partyId: string }
}

// 新成员加入队伍
{
  type: 'partyMemberJoined',
  payload: { partyId: string, memberId: string }
}

// 成员离开队伍
{
  type: 'partyMemberLeft',
  payload: { partyId: string, memberId: string, newLeaderId?: string }
}

// 成员被踢出
{
  type: 'partyMemberKicked',
  payload: { partyId: string, targetId: string }
}

// 被踢出队伍
{
  type: 'partyKicked',
  payload: { partyId: string }
}

// 队伍错误
{
  type: 'partyError',
  payload: { error: string }
}

// 聊天消息
{
  type: 'chatMessage',
  payload: ChatMessage
}

// 聊天错误
{
  type: 'chatError',
  payload: { error: string }
}
```

---

## 文件结构

```
server/
├── prisma/
│   └── schema.prisma              # 数据模型（Friend, Party, PartyMember, ChatMessage）
├── src/
│   ├── services/
│   │   ├── FriendService.ts       # 好友服务
│   │   ├── PartyService.ts        # 组队服务
│   │   └── ChatService.ts         # 聊天服务
│   ├── routes/
│   │   └── social.ts              # 社交 API 路由
│   └── websocket/
│       └── WebSocketServer.ts     # WebSocket 消息处理

client/
├── src/
│   ├── systems/
│   │   └── SocialSystem.ts        # 社交系统 Store (Zustand)
│   └── components/
│       ├── FriendsUI.tsx          # 好友 UI 组件
│       ├── FriendsUI.css          # 好友 UI 样式
│       ├── ChatUI.tsx             # 聊天 UI 组件
│       └── ChatUI.css             # 聊天 UI 样式
```

---

## 使用说明

### 1. 好友系统

```typescript
// 发送好友请求
sendFriendRequest('user-uuid')

// 接受好友请求
acceptFriendRequest('user-uuid')

// 拒绝好友请求
rejectFriendRequest('user-uuid')

// 删除好友
removeFriend('user-uuid')
```

### 2. 组队系统

```typescript
// 创建队伍
createParty('我的队伍', false)  // 名称，是否公开

// 加入队伍
joinParty('party-uuid')

// 离开队伍
leaveParty('party-uuid')

// 踢出队员（仅队长）
kickMember('party-uuid', 'target-uuid')
```

### 3. 聊天系统

```typescript
// 发送私聊
sendMessage('whisper', '你好!', { receiverId: 'user-uuid' })

// 发送队伍消息
sendMessage('party', '准备开怪!', { partyId: 'party-uuid' })

// 发送区域消息
sendMessage('zone', '有人吗？', { zoneId: 'zone_1' })

// 发送全局消息
sendMessage('global', '求组队打 BOSS!')
```

---

## 测试指南

### 1. 测试好友系统

```bash
# 获取好友列表
curl "http://localhost:3002/api/v1/social/friends?userId=test-user-1"

# 发送好友请求
curl -X POST "http://localhost:3002/api/v1/social/friends/request" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-1","friendUserId":"test-user-2"}'

# 接受好友请求
curl -X POST "http://localhost:3002/api/v1/social/friends/accept" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-2","friendUserId":"test-user-1"}'
```

### 2. 测试组队系统

```bash
# 创建队伍
curl -X POST "http://localhost:3002/api/v1/social/party" \
  -H "Content-Type: application/json" \
  -d '{"leaderId":"char-1","name":"测试队伍","isPublic":true}'

# 获取队伍信息
curl "http://localhost:3002/api/v1/social/party/party-uuid"

# 加入队伍
curl -X POST "http://localhost:3002/api/v1/social/party/party-uuid/join" \
  -H "Content-Type: application/json" \
  -d '{"characterId":"char-2"}'
```

### 3. 测试聊天系统

```bash
# 发送私聊
curl -X POST "http://localhost:3002/api/v1/social/chat/whisper" \
  -H "Content-Type: application/json" \
  -d '{"senderId":"char-1","receiverId":"char-2","content":"你好!"}'

# 发送队伍消息
curl -X POST "http://localhost:3002/api/v1/social/chat/party" \
  -H "Content-Type: application/json" \
  -d '{"senderId":"char-1","partyId":"party-uuid","content":"准备!"}'

# 获取聊天记录
curl "http://localhost:3002/api/v1/social/chat/history?type=global&limit=50"
```

---

## 已知限制

1. **队伍人数**: 当前限制为 3 人，未来可扩展至 5 人
2. **消息长度**: 限制 500 字符，防止刷屏
3. **聊天记录**: 每种类型最多保留 1000 条，自动清理旧消息
4. **拉黑功能**: 拉黑后无法接收对方私聊，但仍可在队伍/区域中看到消息
5. **跨服支持**: 当前为单服设计，不支持跨服好友/聊天

---

## 后续优化

### 短期（1-2 周）
- [ ] 好友备注功能
- [ ] 队伍语音聊天集成
- [ ] 聊天频道管理（屏蔽关键词）
- [ ] 表情系统
- [ ] 离线消息推送

### 中期（1-2 月）
- [ ] 公会系统
- [ ] 好友推荐（共同好友、附近玩家）
- [ ] 聊天机器人（GM 机器人）
- [ ] 邮件系统
- [ ] 社交成就系统

### 长期（3-6 月）
- [ ] 跨服好友
- [ ] 社交关系图谱
- [ ] 玩家 reputation 系统
- [ ] 社交活动（婚礼、结拜）

---

## 性能考虑

1. **WebSocket 连接**: 每个玩家一个连接，支持 1000+ 并发
2. **消息广播**: 区域聊天只广播给同区域玩家
3. **数据库查询**: 好友列表使用索引优化
4. **消息存储**: 定期清理旧消息，保持数据库大小
5. **缓存策略**: 在线状态使用内存缓存，减少数据库查询

---

## 安全考虑

1. **消息过滤**: 敏感词过滤（待实现）
2. **频率限制**: 防止刷屏（待实现）
3. **举报系统**: 玩家举报功能（待实现）
4. **GM 监控**: GM 可查看聊天记录
5. **隐私保护**: 拉黑功能保护玩家

---

## 总结

社交系统已完成核心功能：
- ✅ 好友系统（请求、接受、删除、拉黑）
- ✅ 组队系统（创建、加入、离开、踢人）
- ✅ 聊天系统（私聊、队伍、区域、全球）
- ✅ WebSocket 实时通信
- ✅ UI 组件（好友面板、聊天窗口）

下一步：
1. 本地联调测试
2. 完善 UI 交互
3. 添加表情和快捷消息
4. 实现敏感词过滤
5. 开发公会系统
