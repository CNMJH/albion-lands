#!/bin/bash

# Hulu Lands 本地测试脚本
# 用于在 Linux 上快速启动和测试游戏

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "  Hulu Lands - 本地测试启动"
echo "========================================"
echo ""

# 1. 停止旧进程
echo "[1/6] 停止旧进程..."
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# 2. 检查配置
echo ""
echo "[2/6] 检查配置..."
if [ ! -f "server/.env" ]; then
    echo "创建 .env 文件..."
    cp server/.env.example server/.env
fi
echo "CLIENT_URL: $(grep CLIENT_URL server/.env)"
echo "PORT: $(grep "^PORT=" server/.env)"

# 3. 启动服务端
echo ""
echo "[3/6] 启动服务端 (端口 3002)..."
cd server
npm run dev > ../logs/server-test.log 2>&1 &
SERVER_PID=$!
echo "服务端 PID: $SERVER_PID"
cd ..

# 等待服务端启动
echo "等待服务端启动..."
for i in {1..10}; do
    if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
        echo "✅ 服务端已启动"
        break
    fi
    sleep 1
done

# 4. 检查服务端健康
echo ""
echo "[4/6] 检查服务端健康..."
curl -s http://localhost:3002/api/health | head -1 || echo "❌ 服务端未响应"

# 5. 启动客户端
echo ""
echo "[5/6] 启动客户端 (端口 3001)..."
cd client
npm run dev > ../logs/client-test.log 2>&1 &
CLIENT_PID=$!
echo "客户端 PID: $CLIENT_PID"
cd ..

# 等待客户端启动
echo "等待客户端启动..."
for i in {1..10}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ 客户端已启动"
        break
    fi
    sleep 1
done

# 6. 测试连接
echo ""
echo "[6/6] 测试连接..."
echo "HTTP 测试:"
curl -s http://localhost:3002/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3002/api/health

echo ""
echo "========================================"
echo "  启动完成！"
echo "========================================"
echo ""
echo "服务端：http://localhost:3002"
echo "客户端：http://localhost:3001"
echo "GM 工具：http://localhost:3002/gm/"
echo ""
echo "日志:"
echo "  服务端：logs/server-test.log"
echo "  客户端：logs/client-test.log"
echo ""
echo "停止服务:"
echo "  kill $SERVER_PID $CLIENT_PID"
echo "  或运行：./stop-test.sh"
echo ""

# 保存 PID
echo $SERVER_PID > logs/server-test.pid
echo $CLIENT_PID > logs/client-test.pid
