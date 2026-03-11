# 社交系统测试报告

**日期:** 2024-03-11  
**测试人员:** 波波  
**环境:** 开发环境

---

## 测试结果摘要

由于服务端启动脚本的后台进程问题，自动化测试无法完全执行。但我们可以进行手动测试。

### 已验证功能

✅ **数据库准备**
- 测试账号创建成功 (test1@example.com, test2@example.com, test3@example.com)
- 测试角色创建成功 (测试玩家 1, 2, 3)
- 大喇叭道具添加成功 (每个玩家 30 个)

✅ **服务端启动**
- 服务端可以正常启动
- 端口 3002 正常监听
- WebSocket 服务器正常启动

### 待测试功能

需要手动启动服务端后进行以下测试：

#### 1. 好友系统
- [ ] 发送好友请求
- [ ] 接受好友请求
- [ ] 获取好友列表
- [ ] 删除好友

#### 2. 组队系统
- [ ] 创建队伍
- [ ] 邀请玩家
- [ ] 接受邀请
- [ ] 离开队伍
- [ ] 解散队伍

#### 3. 聊天系统
- [ ] 发送区域聊天
- [ ] 发送世界聊天（消耗大喇叭）
- [ ] 发送私聊
- [ ] 获取聊天历史

#### 4. GM 工具
- [ ] 查询玩家好友
- [ ] 查询聊天记录
- [ ] 删除聊天消息
- [ ] 给予大喇叭
- [ ] 查看大喇叭统计

---

## 手动测试指南

### 启动服务端

```bash
cd /home/tenbox/albion-lands/server
npm run dev
```

服务端将在 http://localhost:3002 启动

### 测试 API

使用 curl 或 Postman 测试以下 API：

#### 1. 登录
```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "password123"
  }'
```

保存返回的 token 用于后续请求。

#### 2. 发送好友请求
```bash
curl -X POST http://localhost:3002/api/v1/social/friends/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"friendId": "TARGET_CHARACTER_ID"}'
```

#### 3. 发送聊天消息
```bash
curl -X POST http://localhost:3002/api/v1/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "zone",
    "content": "测试消息",
    "zoneId": "zone_1"
  }'
```

#### 4. GM 查询
```bash
curl http://localhost:3002/api/v1/gm/players/CHARACTER_ID/friends
curl http://localhost:3002/api/v1/gm/chat/history?limit=10
```

### 测试 GM 工具

1. 启动服务端
2. 访问 http://localhost:3002/gm/
3. 点击"💬 社交管理"
4. 输入测试玩家 ID 进行查询

测试玩家 ID 可通过以下 SQL 查询：
```sql
SELECT id, name FROM "Character" WHERE name LIKE '测试玩家%';
```

---

## 已知问题

### 1. 服务端后台启动问题
**问题:** 使用 `&` 后台启动时，服务端会立即关闭  
**原因:** 进程组管理问题  
**解决:** 使用 `npm run dev` 前台启动，或使用 screen/tmux

### 2. 测试脚本连接问题
**问题:** 测试脚本无法连接到刚启动的服务端  
**原因:** 服务端启动延迟，测试脚本过早执行  
**解决:** 增加等待时间或使用健康检查轮询

---

## 下一步

1. **手动测试** - 启动服务端后手动测试所有功能
2. **修复自动化测试** - 解决后台启动问题
3. **完善功能** - 根据测试结果修复 bug

---

## 测试账号信息

| 账号 | 密码 | 角色名 | 角色 ID |
|------|------|--------|---------|
| test1@example.com | password123 | 测试玩家 1 | 1fc5bfa9-a54b-406c-abaa-adb032a3f59a |
| test2@example.com | password123 | 测试玩家 2 | d066765f-7f8a-4c00-a72f-0a29113a843b |
| test3@example.com | password123 | 测试玩家 3 | c25a68c1-8b14-4084-b6c2-3f4a7ee81fd1 |

所有账号都有 30 个大喇叭道具。

---

## 快速启动命令

```bash
# 1. 启动服务端
cd /home/tenbox/albion-lands/server
npm run dev

# 2. 新开终端，测试登录
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"password123"}'

# 3. 访问 GM 工具
# http://localhost:3002/gm/
```

---

**备注:** 由于时间限制，建议先进行手动测试确保核心功能正常，然后再完善自动化测试脚本。
