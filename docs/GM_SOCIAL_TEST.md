# GM 工具社交管理功能测试指南

## 前置条件

1. **启动服务端**
```bash
cd /home/tenbox/albion-lands/server
npm run dev
```

2. **启动客户端**（可选，用于验证游戏内功能）
```bash
cd /home/tenbox/albion-lands/client
npm run dev
```

3. **访问 GM 工具**
```
http://localhost:3002/gm/
```

## 测试场景

### 场景 1: 查询玩家社交信息

**步骤**:
1. 打开 GM 工具 → 点击"💬 社交管理"
2. 在"查询玩家 ID"输入框输入测试玩家 ID
3. 点击"查询"按钮

**预期结果**:
- ✅ 显示玩家好友列表（名称、等级、状态、关系状态）
- ✅ 显示玩家队伍信息（如有）
- ✅ 显示聊天记录查询界面

**测试数据**:
```sql
-- 查询测试玩家
SELECT id, name, level FROM "Character" WHERE email = 'test@example.com';
-- 假设得到 ID: char_xxx
```

### 场景 2: 查看好友关系

**步骤**:
1. 在社交管理面板查询玩家
2. 查看"好友关系"表格

**预期结果**:
- ✅ 显示所有好友（双向）
- ✅ 正确显示在线状态（绿色=在线，灰色=离线）
- ✅ 显示关系状态（pending/accepted/blocked）

**验证 SQL**:
```sql
SELECT 
  f.status,
  c.name as characterName,
  fr.name as friendName,
  c."isOnline",
  fr."isOnline"
FROM "Friend" f
LEFT JOIN "Character" c ON f."characterId" = c.id
LEFT JOIN "Character" fr ON f."friendId" = fr.id
WHERE f."characterId" = 'char_xxx' OR f."friendId" = 'char_xxx';
```

### 场景 3: 查看队伍信息

**步骤**:
1. 在社交管理面板查询玩家
2. 查看"队伍信息"区域

**预期结果**:
- ✅ 如果玩家有队伍，显示队伍名称、成员列表
- ✅ 显示队长标识（👑）
- ✅ 显示每个成员的等级、在线状态、所在区域
- ✅ 如果玩家无队伍，显示"未加入队伍"

**验证 SQL**:
```sql
SELECT 
  p.name as partyName,
  p."maxMembers",
  pm.role,
  c.name as memberName,
  c.level,
  c."isOnline",
  c."zoneId"
FROM "PartyMember" pm
JOIN "Party" p ON pm."partyId" = p.id
JOIN "Character" c ON pm."characterId" = c.id
WHERE pm."characterId" = 'char_xxx';
```

### 场景 4: 查看聊天记录

**步骤**:
1. 在社交管理面板查询玩家（或直接在聊天历史中查看）
2. 选择聊天类型（全部/区域/世界/私聊/队伍）
3. 点击"查询"

**预期结果**:
- ✅ 显示聊天消息列表
- ✅ 显示发送者名称和等级
- ✅ 显示消息类型和内容
- ✅ 显示发送时间
- ✅ 每条消息有"删除"按钮

**测试聊天**:
```bash
# 使用 curl 测试发送聊天消息
curl -X POST http://localhost:3002/api/v1/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "char_xxx",
    "type": "zone",
    "content": "测试消息",
    "zoneId": "zone_1"
  }'
```

### 场景 5: 删除聊天消息

**步骤**:
1. 在聊天记录列表中找到要删除的消息
2. 点击"删除"按钮
3. 确认删除

**预期结果**:
- ✅ 弹出确认对话框
- ✅ 确认后消息从列表消失
- ✅ 数据库中消息被删除

**验证 SQL**:
```sql
-- 删除前查询
SELECT COUNT(*) FROM "ChatMessage" WHERE id = 'msg_xxx';
-- 应该返回 1

-- 删除后查询
SELECT COUNT(*) FROM "ChatMessage" WHERE id = 'msg_xxx';
-- 应该返回 0
```

### 场景 6: 给予大喇叭

**步骤**:
1. 在社交管理面板的"大喇叭管理"区域
2. 输入玩家 ID
3. 输入数量（如 10）
4. 点击"给予"按钮

**预期结果**:
- ✅ 弹出成功提示
- ✅ 玩家获得大喇叭道具
- ✅ 记录 GM 操作日志

**验证 SQL**:
```sql
-- 查询玩家的大喇叭数量
SELECT quantity 
FROM "InventoryItem" 
WHERE "characterId" = 'char_xxx' 
  AND "itemId" = (SELECT id FROM "Item" WHERE templateId = 'world_horn');
```

**测试脚本**:
```bash
# 使用已有的脚本
cd /home/tenbox/albion-lands/server
node scripts/add-world-horn.js
```

### 场景 7: 查看大喇叭统计

**步骤**:
1. 在社交管理面板点击"查看大喇叭统计"按钮

**预期结果**:
- ✅ 显示全服大喇叭总数
- ✅ 显示拥有大喇叭的玩家数量
- ✅ 显示前 20 名玩家的分布（玩家 ID: 数量）

**验证 SQL**:
```sql
-- 统计大喇叭分布
SELECT 
  "characterId",
  SUM(quantity) as totalQuantity
FROM "InventoryItem"
WHERE "itemId" = (SELECT id FROM "Item" WHERE templateId = 'world_horn')
GROUP BY "characterId"
ORDER BY totalQuantity DESC
LIMIT 20;
```

### 场景 8: 综合测试 - 处理玩家举报

**背景**: 玩家 A 举报玩家 B 在频道发布不当言论

**步骤**:
1. GM 收到举报（玩家 B ID: char_bbb）
2. 打开 GM 工具 → 社交管理
3. 输入 char_bbb 查询
4. 查看聊天记录，筛选"世界"类型
5. 找到违规消息
6. 点击"删除"
7. 确认删除

**预期结果**:
- ✅ 快速定位违规玩家
- ✅ 查看完整聊天历史
- ✅ 成功删除违规消息
- ✅ 记录 GM 操作日志

## API 测试

### 使用 curl 测试 API

```bash
# 1. 获取玩家好友
curl http://localhost:3002/api/v1/gm/players/char_xxx/friends

# 2. 获取玩家队伍
curl http://localhost:3002/api/v1/gm/players/char_xxx/party

# 3. 获取聊天记录
curl http://localhost:3002/api/v1/gm/chat/history
curl http://localhost:3002/api/v1/gm/chat/history?type=global

# 4. 删除聊天消息
curl -X DELETE http://localhost:3002/api/v1/gm/chat/msg_xxx

# 5. 给予大喇叭
curl -X POST http://localhost:3002/api/v1/gm/players/char_xxx/give-horn \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10}'

# 6. 获取大喇叭统计
curl http://localhost:3002/api/v1/gm/items/world-horn/stats
```

## 边界测试

### 测试 1: 查询不存在的玩家
```
输入：不存在的 ID
预期：显示"暂无好友"、"未加入队伍"等空状态
```

### 测试 2: 给予 0 个大喇叭
```
输入：数量 0
预期：提示错误或最小值为 1
```

### 测试 3: 给予负数大喇叭
```
输入：数量 -5
预期：提示错误
```

### 测试 4: 删除不存在的消息
```
输入：不存在的消息 ID
预期：提示删除失败
```

## 性能测试

### 测试 1: 大量聊天记录
```sql
-- 插入 1000 条测试消息
INSERT INTO "ChatMessage" ("senderId", type, content, "zoneId")
SELECT 
  'char_xxx',
  'zone',
  '测试消息 ' || i,
  'zone_1'
FROM generate_series(1, 1000) AS i;
```
**预期**: 页面加载时间 < 2 秒

### 测试 2: 大量好友
```sql
-- 插入 100 个测试好友
INSERT INTO "Friend" ("characterId", "friendId", status)
SELECT 
  'char_xxx',
  'char_test_' || i,
  'accepted'
FROM generate_series(1, 100) AS i;
```
**预期**: 页面加载时间 < 1 秒

## 问题排查

### 问题 1: GM 工具无法访问
```bash
# 检查服务端是否启动
curl http://localhost:3002/api/health

# 检查 GM 路由
curl http://localhost:3002/gm/
```

### 问题 2: 社交 API 返回错误
```bash
# 查看服务端日志
tail -f /home/tenbox/albion-lands/logs/server.log

# 检查数据库连接
cd /home/tenbox/albion-lands/server
npx prisma studio
```

### 问题 3: 数据不显示
```sql
-- 检查是否有测试数据
SELECT COUNT(*) FROM "Character";
SELECT COUNT(*) FROM "Friend";
SELECT COUNT(*) FROM "PartyMember";
SELECT COUNT(*) FROM "ChatMessage";
```

## 测试检查清单

- [ ] GM 工具可以正常访问
- [ ] 社交管理面板正常显示
- [ ] 可以查询玩家好友
- [ ] 可以查询玩家队伍
- [ ] 可以查看聊天记录
- [ ] 可以删除聊天消息
- [ ] 可以给予大喇叭
- [ ] 可以查看大喇叭统计
- [ ] 所有操作记录日志
- [ ] 边界情况处理正确
- [ ] 性能满足要求

## 测试报告模板

```
测试日期：YYYY-MM-DD
测试人员：[姓名]
环境：开发环境

通过的测试:
- [ ] 场景 1: 查询玩家社交信息
- [ ] 场景 2: 查看好友关系
- [ ] 场景 3: 查看队伍信息
- [ ] 场景 4: 查看聊天记录
- [ ] 场景 5: 删除聊天消息
- [ ] 场景 6: 给予大喇叭
- [ ] 场景 7: 查看大喇叭统计
- [ ] 场景 8: 综合测试

发现的问题:
1. [问题描述]
2. [问题描述]

建议:
1. [改进建议]
2. [改进建议]
```

---

**下一步**:
- 添加禁言/解禁功能
- 添加高级搜索（按名称、时间、关键词）
- 添加统计报表（聊天活跃度、好友网络图等）
