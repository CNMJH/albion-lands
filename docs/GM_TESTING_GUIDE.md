# 🎮 GM 工具快速测试指南

## 🚀 启动服务器

```bash
# 进入服务端目录
cd server

# 启动开发服务器
npm run dev
```

服务器启动后，访问：
- **GM 工具**: http://localhost:3002/gm/
- **API 文档**: http://localhost:3002/api/v1

---

## 🧪 测试步骤

### 1. 查看仪表盘

访问 http://localhost:3002/gm/

应该看到：
- 玩家数量统计
- 在线玩家数量
- 物品总数
- 市场订单数
- 最近日志

### 2. 查看玩家列表

点击左侧 "👥 玩家管理"

应该看到测试账号：
- 测试角色 (Lv10)
- 位置：zone_1

### 3. 修改玩家等级

在玩家列表中点击 "操作" 按钮

选择 "1. 修改等级"，输入 `50`

刷新页面，等级应该变为 50

### 4. 给予物品

在玩家操作中继续选择 "2. 给予物品"

输入物品 ID（从物品列表查看），数量 `1`

### 5. 查看物品列表

点击左侧 "🎒 物品管理"

应该看到初始物品：
- 铜矿石
- 铁矿石
- 橡木
- 松木
- 草药
- 铁剑
- 皮甲
- 生命药水
- 等等...

### 6. 创建新物品

使用 API 创建传说物品：

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

刷新物品列表，应该看到新创建的 "传说之剑"

### 7. 查看资源节点

点击左侧 "🌲 资源节点"

应该看到 zone_1 的资源：
- 铜矿
- 橡树
- 草药

### 8. 给予货币

在玩家操作中选择 "3. 给予货币"

输入：
- 银币：`10000`
- 金币：`100`

刷新玩家列表，应该看到货币增加

### 9. 传送玩家

在玩家操作中选择 "4. 传送"

输入：
- 区域 ID: `zone_2`
- X: `500`
- Y: `400`

### 10. 查看日志

点击左侧 "📝 日志查看"

应该看到所有 GM 操作记录：
- GM 修改等级
- GM 给予物品
- GM 给予货币
- GM 传送玩家

---

## 📋 测试物品 ID 列表

使用这些 ID 来测试给予物品功能：

### 材料
- `copper_ore` - 铜矿石
- `iron_ore` - 铁矿石
- `oak_log` - 橡木
- `pine_log` - 松木
- `herb` - 草药
- `stone` - 石头
- `twig` - 树枝

### 装备
- `iron_sword` - 铁剑
- `steel_sword` - 钢剑
- `oak_bow` - 橡木弓
- `cloth_armor` - 布甲
- `leather_armor` - 皮甲

### 消耗品
- `health_potion` - 生命药水
- `mana_potion` - 法力药水
- `bread` - 面包
- `cooked_meat` - 烤肉

---

## 🔧 常用 API 测试

### 获取玩家列表
```bash
curl http://localhost:3002/api/v1/gm/players
```

### 获取玩家详情
```bash
curl http://localhost:3002/api/v1/gm/players/{playerId}
```

### 修改等级
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{playerId}/level \
  -H "Content-Type: application/json" \
  -d '{"level": 30}'
```

### 给予物品
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{playerId}/items \
  -H "Content-Type: application/json" \
  -d '{"itemId": "iron_sword", "quantity": 1}'
```

### 给予货币
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{playerId}/currency \
  -H "Content-Type: application/json" \
  -d '{"silver": 5000, "gold": 500}'
```

### 传送玩家
```bash
curl -X POST http://localhost:3002/api/v1/gm/players/{playerId}/teleport \
  -H "Content-Type: application/json" \
  -d '{"zoneId": "zone_3", "x": 600, "y": 500}'
```

### 获取物品列表
```bash
curl http://localhost:3002/api/v1/gm/items
```

### 创建物品
```bash
curl -X POST http://localhost:3002/api/v1/gm/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试物品",
    "type": "Material",
    "rarity": "Common",
    "minLevel": 1,
    "stackSize": 99,
    "basePrice": 100
  }'
```

### 获取资源节点
```bash
curl http://localhost:3002/api/v1/gm/resources
```

### 获取日志
```bash
curl "http://localhost:3002/api/v1/gm/logs?type=GM_ACTION&limit=50"
```

### 获取服务器状态
```bash
curl http://localhost:3002/api/v1/gm/server/status
```

---

## ⚠️ 注意事项

1. **没有认证**: 当前版本任何人都可以访问 GM 工具
2. **谨慎操作**: GM 操作会直接影响游戏数据
3. **备份数据**: 重要操作前备份数据库
4. **记录日志**: 所有 GM 操作都会记录到 GameLog 表

---

## 🐛 故障排查

### 无法访问 GM 工具
```bash
# 检查服务器是否启动
curl http://localhost:3002/health

# 应该返回：{"status":"ok","timestamp":xxx}
```

### API 返回 404
```bash
# 检查路由是否注册
curl http://localhost:3002/api/v1

# 应该返回 API 信息
```

### 静态文件无法加载
```bash
# 检查 public 目录是否存在
ls server/public/gm/

# 应该看到 index.html 和 gm-app.js
```

### 数据库错误
```bash
# 检查数据库文件
ls server/prisma/dev.db

# 重新生成 Prisma 客户端
cd server && npx prisma generate
```

---

## 📊 数据库检查

### 使用 Prisma Studio 查看数据
```bash
cd server
npx prisma studio
```

在浏览器打开 http://localhost:5555

可以查看：
- Character - 角色数据
- Item - 物品模板
- InventoryItem - 背包数据
- GameLog - 游戏日志

---

**祝测试顺利！** 🎮
