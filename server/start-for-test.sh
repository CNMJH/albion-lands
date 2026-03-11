#!/bin/bash
# 启动服务端进行测试

echo "🚀 启动呼噜大陆服务端..."

cd /home/tenbox/albion-lands/server

# 检查端口是否被占用
if netstat -tlnp 2>/dev/null | grep -q ":3002" || ss -tlnp 2>/dev/null | grep -q ":3002"; then
    echo "⚠️  端口 3002 已被占用"
    echo "是否要停止现有服务？(y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        pkill -f "tsx src/index.ts" || true
        sleep 2
        echo "✅ 服务已停止"
    else
        echo "❌ 无法启动，请先停止现有服务"
        exit 1
    fi
fi

# 启动服务端
echo "📦 启动服务端..."
node node_modules/.bin/tsx src/index.ts &
SERVER_PID=$!

echo "✅ 服务端已启动 (PID: $SERVER_PID)"
echo "   HTTP: http://localhost:3002"
echo "   WebSocket: ws://localhost:3002/ws"
echo "   GM 工具：http://localhost:3002/gm/"
echo ""
echo "💡 提示："
echo "   - 按 Ctrl+C 停止服务"
echo "   - 查看日志：tail -f /home/tenbox/albion-lands/logs/server.log"
echo ""

# 等待启动
sleep 3

# 健康检查
if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "✅ 服务端健康检查通过"
else
    echo "⚠️  服务端未响应"
fi

# 保持运行
wait $SERVER_PID
