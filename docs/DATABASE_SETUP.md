# 呼噜大陆 - 数据库设置指南

## 方案 1：使用 SQLite（推荐用于本地开发）⭐

**优点：** 无需安装、零配置、快速启动

### 步骤：

1. **修改 schema.prisma**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. **运行迁移**
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

3. **完成！** 数据库已就绪

---

## 方案 2：使用 PostgreSQL（生产环境）

### 本地安装 PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE hululands;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
createdb hululands
```

**Windows:**
下载并安装：https://www.postgresql.org/download/windows/

### 使用 Docker（如果有 Docker）

```bash
# 启动 PostgreSQL
docker run -d \
  --name hululands_db \
  -e POSTGRES_DB=hululands \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# 等待启动
sleep 5

# 运行迁移
cd server
npx prisma migrate dev --name init
```

---

## 方案 3：使用云数据库（推荐用于生产）

**推荐服务：**
- Supabase（免费 PostgreSQL）
- Railway（免费额度）
- Neon（免费 PostgreSQL）
- AWS RDS

**步骤：**
1. 创建数据库实例
2. 获取连接字符串
3. 更新 `.env` 中的 `DATABASE_URL`
4. 运行迁移

---

## 验证数据库连接

```bash
cd server
npx prisma db pull  # 检查连接
npx prisma generate # 生成客户端
```

---

## 常见问题

### Q: Prisma migrate 失败？
A: 检查数据库连接字符串是否正确

### Q: 提示 "Database not found"？
A: 先创建数据库：`createdb hululands`

### Q: 权限错误？
A: 确保数据库用户有足够权限

---

**推荐：** 本地开发使用 SQLite，生产使用 PostgreSQL
