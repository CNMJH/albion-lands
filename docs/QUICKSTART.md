# 呼噜大陆 - 快速启动指南

## 🚀 本地开发环境搭建

### 前置要求

确保已安装以下软件：

- **Node.js** 20+ ([下载地址](https://nodejs.org/))
- **PostgreSQL** 14+ ([下载地址](https://www.postgresql.org/))
- **Redis** 6+ ([下载地址](https://redis.io/))
- **Git** ([下载地址](https://git-scm.com/))

---

## 📦 第一步：克隆项目

```bash
# 克隆仓库
git clone https://github.com/CNMJH/albion-lands.git

# 进入项目目录
cd albion-lands
```

---

## 🗄️ 第二步：配置数据库

### 1. 创建 PostgreSQL 数据库

```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE hulu_lands;

# 创建用户（可选）
CREATE USER hulu_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hulu_lands TO hulu_user;

# 退出
\q
```

### 2. 配置服务端环境变量

```bash
cd server
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# 数据库配置
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/hulu_lands?schema=public

# Redis 配置
REDIS_URL=redis://localhost:6379

# JWT 配置
JWT_SECRET=你的随机密钥_至少 32 个字符
JWT_EXPIRES_IN=7d

# 客户端 URL
CLIENT_URL=http://localhost:5173
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
npx prisma generate

# 执行数据库迁移
npx prisma migrate dev --name init

# （可选）打开 Prisma Studio 查看数据
npx prisma studio
```

---

## 🔧 第三步：安装依赖

```bash
# 安装服务端依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install

# 安装 OpenClaw SDK 依赖
cd ../openclaw
npm install
```

---

## ▶️ 第四步：启动服务

### 方式一：分别启动（推荐）

**终端 1 - 启动服务端：**
```bash
cd server
npm run dev
```

看到以下输出表示成功：
```
╔════════════════════════════════════════════════╗
║          Hulu Lands Server Started             ║
╠════════════════════════════════════════════════╣
║  HTTP:     http://0.0.0.0:3000                 ║
║  WebSocket: ws://0.0.0.0:3000/ws               ║
║  Environment: development                      ║
╚════════════════════════════════════════════════╝
```

**终端 2 - 启动客户端：**
```bash
cd client
npm run dev
```

看到以下输出表示成功：
```
VITE ready in 500ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**终端 3 - （可选）启动 AI 代理示例：**
```bash
cd openclaw
# 先复制并编辑环境变量
cp .env.example .env
# 编辑 .env 配置服务器地址和 token

npm run dev
```

### 方式二：使用启动脚本

```bash
# 在项目根目录创建 start.sh（Linux/Mac）或 start.bat（Windows）
```

---

## 🎮 第五步：测试游戏

### 访问游戏

1. 打开浏览器访问：http://localhost:5173/
2. 应该看到"呼噜大陆"加载界面
3. 等待资源加载完成

### 测试功能

**基础测试清单：**

- [ ] 加载界面正常显示
- [ ] 游戏画布渲染正常
- [ ] UI 界面显示完整（血条、蓝条、技能栏、小地图、聊天框）
- [ ] 聊天框可以输入消息（按 Enter 打开，Esc 关闭）
- [ ] 技能栏快捷键 1-6 可以触发
- [ ] 菜单栏可以点击展开

**网络测试：**

- [ ] WebSocket 连接成功（检查浏览器控制台）
- [ ] 没有连接错误

---

## 🐛 常见问题

### 1. 数据库连接失败

**错误信息：** `Can't reach database server at localhost:5432`

**解决方案：**
```bash
# 检查 PostgreSQL 是否运行
# Windows: 检查服务管理器
# Mac: brew services list
# Linux: systemctl status postgresql

# 重启 PostgreSQL
# Windows: 在服务管理器中重启
# Mac: brew services restart postgresql
# Linux: sudo systemctl restart postgresql
```

### 2. 端口被占用

**错误信息：** `Port 3000 is already in use`

**解决方案：**
```bash
# 查看占用端口的进程
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# 杀死进程
# Windows: taskkill /PID <PID> /F
# Mac/Linux: kill -9 <PID>

# 或者修改 server/.env 中的 PORT
```

### 3. Prisma 迁移失败

**错误信息：** `Error: P3005: Database schema is not empty`

**解决方案：**
```bash
# 清空数据库并重新迁移
npx prisma migrate reset

# 或者强制推送 schema
npx prisma db push --force-reset
```

### 4. 客户端无法连接服务端

**错误信息：** `WebSocket connection failed`

**解决方案：**
1. 确保服务端已启动
2. 检查 `client/src/App.tsx` 中的 WebSocket 地址
3. 检查防火墙设置

### 5. npm install 失败

**错误信息：** `npm ERR! network timeout`

**解决方案：**
```bash
# 切换 npm 镜像源
npm config set registry https://registry.npmmirror.com

# 清理缓存
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

---

## 🛠️ 开发工具推荐

### 编辑器

- **VS Code** (推荐)
  - 安装插件：ESLint, Prettier, Prisma, TypeScript

### 数据库管理

- **Prisma Studio** (内置)
  ```bash
  cd server && npx prisma studio
  ```
- **DBeaver** (免费通用)
- **pgAdmin** (PostgreSQL 官方)

### API 测试

- **Postman** - HTTP API 测试
- **WebSocket King** - WebSocket 测试

### 性能分析

- **Chrome DevTools** - 客户端性能
- **node --inspect** - 服务端调试

---

## 📝 开发流程

### 1. 创建功能分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 开发并测试

```bash
# 本地测试通过后提交
git add .
git commit -m "feat: 添加 XXX 功能"
```

### 3. 推送并创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 创建 Pull Request。

---

## 🎯 下一步

完成环境搭建后，可以开始：

1. **阅读设计文档** - `docs/game-design-doc-full.md`
2. **查看美术需求** - `docs/art-requirements.md`
3. **了解开发进度** - `docs/DEVELOPMENT_PROGRESS.md`
4. **开始开发任务** - 查看 GitHub Issues

---

## 📞 需要帮助？

- **GitHub Issues** - 提交问题
- **项目文档** - 查看 `docs/` 目录
- **MEMORY.md** - 项目上下文和决策记录

---

**祝你开发愉快！** 🎮✨

_呼噜大陆开发团队_
