# GM 工具更新日志

## 2024-03-11 - 社交系统管理功能

### 新增功能

#### 1. 社交管理面板 💬

**位置**: GM 工具 → 社交管理

**功能**:
- 查询玩家社交信息（好友、队伍、聊天记录）
- 查看玩家好友列表及状态
- 查看玩家队伍信息
- 查看和删除聊天消息
- 给予玩家大喇叭道具
- 查看全服大喇叭统计

#### 2. 好友关系管理

**API**:
- `GET /api/v1/gm/players/:id/friends` - 获取玩家好友列表

**显示信息**:
- 好友名称
- 等级
- 在线状态
- 关系状态（pending/accepted/blocked）

#### 3. 队伍信息管理

**API**:
- `GET /api/v1/gm/players/:id/party` - 获取玩家队伍信息

**显示信息**:
- 队伍名称
- 成员列表（3 人上限）
- 成员等级、在线状态、所在区域
- 队长标识（👑）

#### 4. 聊天记录管理

**API**:
- `GET /api/v1/gm/chat/history` - 获取聊天记录
- `DELETE /api/v1/gm/chat/:id` - 删除聊天消息

**功能**:
- 按类型筛选（区域/世界/私聊/队伍）
- 查看消息内容、发送者、时间
- 删除不当消息
- 支持查询特定玩家的聊天

#### 5. 大喇叭道具管理

**API**:
- `POST /api/v1/gm/players/:id/give-horn` - 给予大喇叭
- `GET /api/v1/gm/items/world-horn/stats` - 大喇叭统计

**功能**:
- 给予指定玩家大喇叭（1-99 个）
- 查看全服大喇叭分布
- 统计拥有玩家数量和总数量

### 界面更新

#### 侧边栏
新增"💬 社交管理"菜单项

#### 社交管理面板布局

```
┌─────────────────────────────────────┐
│ 查询玩家 ID [____________] [查询]   │
├─────────────────────────────────────┤
│ 好友关系                            │
│ ┌─────────────────────────────────┐ │
│ │ 名称 │ 等级 │ 状态 │ 关系状态 │ │
│ ├─────────────────────────────────┤ │
│ │ ...                              │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 队伍信息                            │
│ [队伍名称] (2/3 人)                 │
│ 👑 玩家 A Lv.10 在线 - zone_1       │
│   玩家 B Lv.8 离线                  │
├─────────────────────────────────────┤
│ 聊天记录                            │
│ 类型 [全部 ▼] [查询]                │
│ ┌─────────────────────────────────┐ │
│ │ 发送者 │ 类型 │ 内容 │ 操作 │   │
│ ├─────────────────────────────────┤ │
│ │ ...                              │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 大喇叭管理                          │
│ 给予玩家大喇叭 [ID] [数量] [给予]   │
│ [查看大喇叭统计]                    │
│ ┌─────────────────────────────────┐ │
│ │ 全服统计：10 人，共 500 个        │ │
│ │ 玩家 A: 50 个                    │ │
│ │ 玩家 B: 30 个                    │ │
│ │ ...                              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/gm/players/:id/friends` | 获取玩家好友 |
| GET | `/api/v1/gm/players/:id/party` | 获取玩家队伍 |
| GET | `/api/v1/gm/chat/history` | 获取聊天记录 |
| DELETE | `/api/v1/gm/chat/:id` | 删除聊天消息 |
| POST | `/api/v1/gm/players/:id/give-horn` | 给予大喇叭 |
| GET | `/api/v1/gm/items/world-horn/stats` | 大喇叭统计 |

### 使用场景

#### 1. 处理玩家举报
```
1. 收到玩家举报不当言论
2. GM 工具 → 社交管理
3. 输入被举报玩家 ID
4. 查看聊天记录，筛选类型
5. 确认违规后删除消息
6. 必要时禁言玩家
```

#### 2. 调查玩家问题
```
1. 玩家反馈好友系统异常
2. GM 工具 → 社交管理
3. 输入玩家 ID 查询
4. 查看好友关系状态
5. 查看队伍信息
6. 根据情况处理
```

#### 3. 发放测试道具
```
1. 需要测试世界聊天功能
2. GM 工具 → 社交管理
3. 输入测试玩家 ID
4. 输入给予数量（如 10）
5. 点击"给予"
6. 玩家获得大喇叭
```

#### 4. 监控经济系统
```
1. 查看大喇叭统计
2. 了解道具分布情况
3. 分析消耗速率
4. 调整获取途径
```

### 技术实现

#### 后端 (server/src/routes/gm.ts)

```typescript
// 获取玩家好友
fastify.get('/api/gm/players/:id/friends', async (request, reply) => {
  const friends = await prisma.friend.findMany({
    where: {
      OR: [
        { characterId: id },
        { friendId: id },
      ],
    },
    include: {
      character: { select: { name, level, isOnline } },
      friend: { select: { name, level, isOnline } },
    },
  })
  // ...
})

// 获取聊天记录
fastify.get('/api/gm/chat/history', async (request, reply) => {
  const messages = await prisma.chatMessage.findMany({
    where: {
      type: type || undefined,
    },
    include: {
      sender: { select: { name, level } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  // ...
})

// 给予大喇叭
fastify.post('/api/gm/players/:id/give-horn', async (request, reply) => {
  // 检查物品
  // 增加数量或创建新物品
  // 记录日志
  // ...
})
```

#### 前端 (server/public/gm/gm-app.js)

```javascript
// 加载社交信息
async function loadSocialInfo() {
  const playerId = document.getElementById('socialPlayerId').value
  
  // 加载好友
  const friendsRes = await fetch(`/api/v1/gm/players/${playerId}/friends`)
  
  // 加载队伍
  const partyRes = await fetch(`/api/v1/gm/players/${playerId}/party`)
  
  // 更新 UI
  // ...
}

// 给予大喇叭
async function giveWorldHorn() {
  const playerId = document.getElementById('giveHornPlayerId').value
  const quantity = parseInt(document.getElementById('giveHornQuantity').value)
  
  const res = await fetch(`/api/v1/gm/players/${playerId}/give-horn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })
  // ...
}
```

### 安全考虑

1. **GM 权限**: 所有 GM 接口需要认证（当前临时跳过）
2. **操作日志**: 所有 GM 操作记录到 GameLog
3. **敏感操作**: 删除消息需要二次确认
4. **数量限制**: 大喇叭给予限制 1-99 个

### 待完善功能

1. **禁言系统**: 
   - 添加禁言/解禁功能
   - 需要 Character 模型添加 muteUntil 字段

2. **批量操作**:
   - 批量给予道具
   - 批量删除消息

3. **高级搜索**:
   - 按玩家名称搜索
   - 按时间范围搜索
   - 按内容关键词搜索

4. **统计报表**:
   - 聊天活跃度统计
   - 好友关系网络图
   - 队伍组成分析

### 测试建议

1. **功能测试**:
   - 查询在线/离线玩家
   - 查询有/无队伍玩家
   - 查询有/无好友玩家
   - 给予大喇叭并验证

2. **边界测试**:
   - 查询不存在的玩家 ID
   - 给予 0 个或负数大喇叭
   - 删除不存在的消息

3. **性能测试**:
   - 大量聊天记录加载
   - 大量好友列表显示

### 更新影响

- **数据库**: 无需新迁移（使用现有表）
- **兼容性**: 向后兼容
- **依赖**: 无新增依赖

---

## 总结

本次更新为 GM 工具添加了完整的社交系统管理功能，包括：
- ✅ 好友关系查询
- ✅ 队伍信息查询
- ✅ 聊天记录管理
- ✅ 大喇叭道具管理

GM 现在可以：
- 快速查看玩家社交信息
- 处理玩家举报和纠纷
- 管理聊天环境
- 发放测试道具
- 监控社交系统运行

下一步将添加：
- 禁言/解禁功能
- 高级搜索
- 统计报表
