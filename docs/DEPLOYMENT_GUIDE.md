# 🚀 呼噜大陆部署指南

**让朋友加入游戏的完整方案**

---

## 📋 目录

1. [快速部署方案对比](#方案对比)
2. [方案一：Vercel + Railway（推荐，免费）](#方案一-vercel--railway)
3. [方案二：自建服务器](#方案二自建服务器)
4. [方案三：本地局域网](#方案三本地局域网)
5. [玩家注册和登录](#玩家注册和登录)
6. [常见问题](#常见问题)

---

## 🎯 方案对比

| 方案 | 成本 | 难度 | 适合场景 | 预计时间 |
|------|------|------|----------|----------|
| **Vercel + Railway** | 💚 免费 | ⭐⭐ 简单 | 测试/小范围 | 30 分钟 |
| **VPS 自建** | 💰 $5/月 | ⭐⭐⭐ 中等 | 正式运营 | 2 小时 |
| **局域网** | 💚 免费 | ⭐ 简单 | 本地测试 | 10 分钟 |

---

## 🚀 方案一：Vercel + Railway（推荐）

**最适合快速测试，完全免费！**

### 架构
```
客户端 → Vercel（免费托管）
         ↓
服务端 → Railway（免费托管）
         ↓
数据库 → Railway PostgreSQL（免费）
```

### 步骤

#### 1. 准备 GitHub 仓库
```bash
cd /home/tenbox/albion-lands
git push origin main
```
确保代码已推送到 GitHub：https://github.com/CNMJH/albion-lands

---

#### 2. 部署服务端到 Railway

**步骤**:
1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 `albion-lands` 仓库
5. 选择 `server` 目录作为 Root

**环境变量配置**:
```bash
# 在 Railway Dashboard → Variables 添加
DATABASE_URL=postgresql://postgres:postgres@containers-xxx.railway.app:5432/railway
JWT_SECRET=your-random-secret-key-here
NODE_ENV=production
CORS_ORIGIN=*
```

**创建 PostgreSQL 数据库**:
1. Railway Dashboard → New → Database
2. 复制生成的 `DATABASE_URL`
3. 填入上面的环境变量

**运行数据库迁移**:
```bash
# Railway Dashboard → New → Bash
npx prisma migrate deploy
npx prisma db seed
```

---

#### 3. 部署客户端到 Vercel

**步骤**:
1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择 `albion-lands` 仓库
5. Root Directory 设置为 `client`

**环境变量配置**:
```bash
# Vercel Dashboard → Settings → Environment Variables
VITE_SERVER_URL=https://your-server.railway.app
VITE_WS_URL=wss://your-server.railway.app/ws
```

**创建 `client/.vercel.env`**:
```bash
VITE_SERVER_URL=https://your-server.railway.app
VITE_WS_URL=wss://your-server.railway.app
```

---

#### 4. 修改服务端 CORS 配置

**编辑 `server/src/index.ts`**:
```typescript
// 修改 CORS 配置
app.register(require('@fastify/cors'), {
  origin: [
    'https://your-project.vercel.app',  // Vercel 客户端地址
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  credentials: true
})
```

---

#### 5. 测试访问

**获取访问地址**:
- Vercel 会给你：`https://hulu-lands.vercel.app`
- Railway 会给你：`https://hulu-lands-production.up.railway.app`

**分享给朋友**:
```
🎮 呼噜大陆测试服开放啦！

游戏地址：https://hulu-lands.vercel.app
服务器状态：✅ 运行中

注册方式：
1. 打开游戏地址
2. 点击"注册账号"
3. 填写邮箱和密码
4. 登录游戏

快来一起玩吧！🎉
```

---

## 🖥️ 方案二：自建服务器

**适合正式运营，完全控制**

### 推荐配置
- **CPU**: 2 核
- **内存**: 4GB
- **硬盘**: 40GB SSD
- **带宽**: 5Mbps+
- **系统**: Ubuntu 22.04

### 推荐服务商
- **腾讯云**: https://cloud.tencent.com (国内，便宜)
- **阿里云**: https://www.aliyun.com (国内，稳定)
- **DigitalOcean**: https://digitalocean.com (国外，简单)
- **Vultr**: https://vultr.com (国外，按小时)

---

### 步骤

#### 1. 购买服务器

**腾讯云轻量应用服务器**（推荐）:
- 2 核 2GB 4M: ¥60/年（新人价）
- 2 核 4GB 5M: ¥100/年（推荐）

**系统选择**: Ubuntu 22.04 LTS

---

#### 2. 安装基础软件

**SSH 登录服务器**:
```bash
ssh root@your-server-ip
```

**安装 Node.js 和依赖**:
```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 PM2（进程管理）
npm install -g pm2

# 安装 Nginx（反向代理）
apt install -y nginx

# 安装 Git
apt install -y git
```

---

#### 3. 部署代码

**克隆仓库**:
```bash
cd /home
git clone https://github.com/CNMJH/albion-lands.git
cd albion-lands
```

**安装服务端依赖**:
```bash
cd server
npm install
```

**安装客户端依赖并构建**:
```bash
cd ../client
npm install
npm run build
```

---

#### 4. 配置数据库

**安装 SQLite**（开发/小规模）:
```bash
apt install -y sqlite3
```

**或安装 PostgreSQL**（生产/大规模）:
```bash
apt install -y postgresql postgresql-contrib
sudo -u postgres psql
CREATE DATABASE hululands;
CREATE USER hululands_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hululands TO hululands_user;
\q
```

**修改 `server/.env`**:
```bash
# SQLite（简单）
DATABASE_URL="file:./dev.db"

# PostgreSQL（推荐）
DATABASE_URL="postgresql://hululands_user:your_password@localhost:5432/hululands"
```

**运行迁移**:
```bash
cd server
npx prisma migrate deploy
npx prisma db seed
```

---

#### 5. 配置 Nginx

**创建 Nginx 配置**:
```bash
nano /etc/nginx/sites-available/hululands
```

**添加配置**:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 你的域名或服务器 IP

    # 客户端静态文件
    location / {
        root /home/albion-lands/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # 服务端 API 代理
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 代理
    location /ws {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

**启用配置**:
```bash
ln -s /etc/nginx/sites-available/hululands /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

#### 6. 启动服务

**使用 PM2 启动服务端**:
```bash
cd /home/albion-lands/server
pm2 start src/index.ts --name "hulu-server" --interpreter ts-node
pm2 save
pm2 startup
```

**设置开机自启**:
```bash
# 复制 PM2 输出的命令并执行
pm2 startup
```

---

#### 7. 配置域名（可选）

**购买域名**（推荐）:
- 腾讯云：https://dnspod.cloud.qq.com
- 阿里云：https://wanwang.aliyun.com/domain
- Namecheap：https://namecheap.com

**DNS 配置**:
```
A 记录：
@ → your-server-ip
www → your-server-ip
```

**启用 HTTPS**（强烈推荐）:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

#### 8. 分享游戏地址

```
🎮 呼噜大陆正式开服啦！

游戏地址：https://your-domain.com
服务器：24 小时在线

注册方式：
1. 打开游戏地址
2. 点击"注册账号"
3. 填写邮箱和密码
4. 登录游戏

欢迎加入呼噜大陆！🎉
```

---

## 🏠 方案三：本地局域网

**最快测试，无需公网**

### 步骤

#### 1. 获取本机 IP

**Windows**:
```cmd
ipconfig
# 找到 IPv4 地址，例如：192.168.1.100
```

**Linux/Mac**:
```bash
ip addr show
# 或
ifconfig
# 找到 inet 地址，例如：192.168.1.100
```

---

#### 2. 修改服务端配置

**编辑 `server/.env`**:
```bash
HOST=0.0.0.0  # 监听所有网络接口
PORT=3002
CORS_ORIGIN=*
```

---

#### 3. 修改客户端配置

**编辑 `client/.env`**:
```bash
VITE_SERVER_URL=http://192.168.1.100:3002
VITE_WS_URL=ws://192.168.1.100:3002/ws
```

---

#### 4. 启动服务

**启动服务端**:
```bash
cd server
npm run dev
```

**启动客户端**:
```bash
cd client
npm run dev
```

---

#### 5. 防火墙设置

**Windows**:
```cmd
# 允许 Node.js 通过防火墙
# 控制面板 → Windows Defender 防火墙 → 允许应用通过防火墙
# 找到 node.exe，勾选"专用"和"公用"
```

**Linux**:
```bash
# 开放端口
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp
sudo ufw reload
```

---

#### 6. 分享地址

**在同一局域网内的朋友可以访问**:
```
游戏地址：http://192.168.1.100:3001
（替换为你的实际 IP）
```

**注意**: 
- 所有设备必须在同一 WiFi/局域网
- 关闭防火墙或添加例外

---

## 👥 玩家注册和登录

### 注册流程

1. **打开游戏地址**
   - Vercel: `https://your-project.vercel.app`
   - 本地：`http://localhost:3001`

2. **点击"注册账号"**

3. **填写信息**:
   - 邮箱：`player@example.com`
   - 密码：`password123`
   - 确认密码：`password123`

4. **注册成功**

---

### 登录流程

1. **输入账号密码**
   - 邮箱：`player@example.com`
   - 密码：`password123`

2. **创建角色**
   - 角色名：`勇敢的冒险者`
   - 外观：选择喜欢的样式

3. **进入游戏**

---

### 测试账号（开发环境）

**已预创建的账号**:
```
账号 1:
邮箱：test1@example.com
密码：password123

账号 2:
邮箱：test2@example.com
密码：password123

账号 3:
邮箱：test3@example.com
密码：password123
```

---

## ❓ 常见问题

### Q1: 朋友访问显示"无法连接服务器"？

**A**: 检查以下几点：
1. 服务端是否运行：`pm2 status`
2. 防火墙是否开放：`ufw status`
3. CORS 配置是否正确
4. 数据库是否连接正常

---

### Q2: WebSocket 连接失败？

**A**: 
1. 检查 WebSocket URL 是否正确
2. Nginx 配置中是否包含 WebSocket 代理
3. 防火墙是否允许 WebSocket

---

### Q3: 数据库迁移失败？

**A**:
```bash
# 重置数据库（开发环境）
cd server
npx prisma migrate reset
npx prisma db seed
```

---

### Q4: 客户端构建失败？

**A**:
```bash
cd client
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

---

### Q5: 如何查看服务器日志？

**A**:
```bash
# PM2 日志
pm2 logs hulu-server

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

### Q6: 如何备份数据库？

**A**:
```bash
# SQLite
cp server/prisma/dev.db server/prisma/dev.db.backup

# PostgreSQL
pg_dump -U hululands_user hululands > backup.sql
```

---

### Q7: 如何更新游戏？

**A**:
```bash
# 拉取最新代码
cd /home/albion-lands
git pull

# 重新构建客户端
cd client
npm install
npm run build

# 重启服务端
cd ../server
pm2 restart hulu-server
```

---

## 📊 性能优化建议

### 1. 启用 Gzip 压缩

**Nginx 配置**:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json application/javascript;
```

---

### 2. 配置 CDN（可选）

**Cloudflare**（免费）:
1. 注册 https://cloudflare.com
2. 添加域名
3. 修改 DNS 服务器
4. 启用 CDN 加速

---

### 3. 数据库优化

**SQLite** → **PostgreSQL**（当玩家>100 人）

```bash
# 修改 server/.env
DATABASE_URL="postgresql://user:pass@host:5432/hululands"
```

---

### 4. 启用 Redis 缓存

```bash
# docker-compose.yml 已包含 Redis
docker-compose up -d redis
```

---

## 🎉 分享模板

### 微信群/QQ 群公告

```
🎮【呼噜大陆】游戏开服公告 🎮

亲爱的玩家们：

呼噜大陆正式开服啦！🎉

🌐 游戏地址：https://your-domain.com
📅 开服时间：2026-03-13
👥 当前在线：XX 人

📝 注册指南：
1. 打开游戏地址
2. 点击"注册账号"
3. 填写邮箱和密码
4. 创建角色，开始冒险！

🎁 新手福利：
- 注册送新手礼包
- 前 100 名玩家额外奖励
- 邀请好友得金币

💬 玩家交流群：XXX
📖 游戏指南：docs/GAME_GUIDE.md

快来一起冒险吧！🗡️✨
```

---

### Discord/论坛帖子

```markdown
# 🎮 呼噜大陆 - 免费 2D MMORPG 开放测试！

**游戏类型**: 2D MMORPG  
**玩家人数**: 支持 1000+ 同时在线  
**游戏特色**: 
- ⚔️ 自由 PVP/PVE
- 💰 玩家驱动经济
- 🎯 任务系统
- 👥 社交系统
- 🏆 排行榜

**立即游玩**: https://your-domain.com

**开发日志**: https://github.com/CNMJH/albion-lands

欢迎加入我们的冒险！🎉
```

---

## 📞 技术支持

**遇到问题？**

1. **查看日志**: `pm2 logs hulu-server`
2. **检查状态**: `pm2 status`
3. **重启服务**: `pm2 restart all`
4. **GitHub Issues**: https://github.com/CNMJH/albion-lands/issues

---

**🎊 祝 deployment 成功，游戏大热！**
