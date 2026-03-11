#!/bin/bash
# 呼噜大陆 - 快速数据库设置脚本（SQLite 版本）

echo "🚀 呼噜大陆 - 数据库设置（SQLite 版本）"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 20+"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 版本：$(npm -v)"
echo ""

# 进入服务端目录
cd "$(dirname "$0")/server"

echo "📦 安装依赖..."
npm install --silent

echo ""
echo "🔧 配置 SQLite 数据库..."

# 备份原 schema
cp prisma/schema.prisma prisma/schema.prisma.pg

# 创建 SQLite 版本的 schema
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// 用户系统
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  
  character Character?
}

// 角色系统
model Character {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  
  name      String
  level     Int      @default(1)
  exp       Int      @default(0)
  
  // 货币
  silver    Int      @default(0)
  gold      Int      @default(0)
  
  // 位置
  zoneId    String   @default("zone_1")
  x         Float    @default(0)
  y         Float    @default(0)
  
  // 装备
  equipment Json?
  
  // 状态
  isOnline  Boolean  @default(false)
  lastLoginAt DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inventory InventoryItem[]
}

// 物品系统
model Item {
  id          String   @id @default(uuid())
  name        String
  type        ItemType
  rarity      ItemRarity @default(Common)
  
  stats       Json?
  slot        EquipmentSlot?
  minLevel    Int        @default(1)
  stackSize   Int        @default(99)
  basePrice   Int        @default(0)
  
  createdAt   DateTime @default(now())

  inventoryItems InventoryItem[]
  marketOrders   MarketOrder[]
}

enum ItemType {
  Weapon
  Armor
  Material
  Consumable
  Tool
  Misc
}

enum ItemRarity {
  Common
  Uncommon
  Rare
  Epic
  Legendary
}

enum EquipmentSlot {
  MainHand
  OffHand
  Armor
  Accessory
}

// 背包物品
model InventoryItem {
  id         String   @id @default(uuid())
  characterId String
  character  Character @relation(fields: [characterId], references: [id])
  itemId     String
  item       Item     @relation(fields: [itemId], references: [id])
  
  quantity   Int      @default(1)
  isEquipped Boolean  @default(false)
  
  createdAt  DateTime @default(now())
}

// 市场订单
model MarketOrder {
  id          String   @id @default(uuid())
  sellerId    String
  itemId      String
  item        Item     @relation(fields: [itemId], references: [id])
  
  quantity    Int
  unitPrice   Int
  
  status      OrderStatus @default(Pending)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum OrderStatus {
  Pending
  Completed
  Cancelled
}

// 地图区域
model Zone {
  id          String   @id @default(uuid())
  name        String
  safetyLevel Int      @default(10)
  minLevel    Int      @default(1)
  maxLevel    Int      @default(10)
  pvpEnabled  Boolean  @default(false)
  portals     Json?
  
  createdAt   DateTime @default(now())
}

// 好友
model Friend {
  id        String   @id @default(uuid())
  userId    String
  friendId  String
  
  createdAt DateTime @default(now())
  
  @@unique([userId, friendId])
}

// 组队
model Party {
  id        String   @id @default(uuid())
  leaderId  String
  
  members   PartyMember[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PartyMember {
  id        String   @id @default(uuid())
  partyId   String
  party     Party    @relation(fields: [partyId], references: [id])
  characterId String
  
  role      PartyRole @default(Member)
  
  joinedAt  DateTime @default(now())

  @@unique([partyId, characterId])
}

enum PartyRole {
  Leader
  Member
}

// 日志
model GameLog {
  id        String   @id @default(uuid())
  type      LogType
  message   String
  data      Json?
  characterId String?
  createdAt DateTime @default(now())
}

enum LogType {
  Login
  Logout
  Combat
  Trade
  System
  Error
}
EOF

echo "✅ Schema 配置完成（SQLite）"
echo ""

echo "🗄️  运行数据库迁移..."
npx prisma migrate dev --name init

echo ""
echo "📦 生成 Prisma 客户端..."
npx prisma generate

echo ""
echo "✅ 数据库设置完成！"
echo ""
echo "📂 数据库文件：server/prisma/dev.db"
echo ""
echo "🎮 下一步："
echo "   1. 启动服务端：cd server && npm run dev"
echo "   2. 启动客户端：cd client && npm run dev"
echo ""
