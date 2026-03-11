#!/bin/bash
# 呼噜大陆 - 快速启动脚本

echo "╔════════════════════════════════════════════╗"
echo "║         Hulu Lands 启动脚本                ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# 进入工作目录
cd /home/tenbox/albion-lands

# 1. 启动服务端
echo "🚀 [1/2] 启动服务端..."
cd server
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 被占用，正在清理..."
    kill -9 $(lsof -ti:3000) 2>/dev/null
    sleep 1
fi

# 后台启动服务端
node node_modules/.bin/tsx src/index.ts > ../logs/server.log 2>&1 &
SERVER_PID=$!
echo "✅ 服务端已启动 (PID: $SERVER_PID)"
echo "   HTTP: http://localhost:3000"
echo "   WebSocket: ws://localhost:3000/ws"
echo ""

# 等待服务端启动
sleep 3

# 检查服务端状态
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 服务端健康检查通过"
else
    echo "⚠️  服务端未响应，请查看 logs/server.log"
fi
echo ""

# 2. 启动客户端
echo "🎨 [2/2] 启动客户端..."
cd ../client
npm run dev > ../logs/client.log 2>&1 &
CLIENT_PID=$!
echo "✅ 客户端已启动 (PID: $CLIENT_PID)"
echo "   访问地址：http://localhost:5173"
echo ""

echo "╔════════════════════════════════════════════╗"
echo "║           服务器启动完成！                 ║"
echo "╠════════════════════════════════════════════╣"
echo "║  客户端：http://localhost:5173             ║"
echo "║  服务端：http://localhost:3000             ║"
echo "║  WebSocket: ws://localhost:3000/ws         ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "💡 提示："
echo "   - 查看服务端日志：tail -f logs/server.log"
echo "   - 查看客户端日志：tail -f logs/client.log"
echo "   - 停止服务：kill $SERVER_PID $CLIENT_PID"
echo ""
