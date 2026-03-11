#!/bin/bash
# 测试社交系统

echo "🧪 社交系统测试"
echo "================"
echo ""

cd /home/tenbox/albion-lands/server

# 1. 准备测试数据
echo "📦 准备测试数据..."
node scripts/prepare-test-data.js
echo ""

# 2. 添加大喇叭
echo "📢 添加大喇叭道具..."
node scripts/add-world-horn.js
node scripts/add-horn-to-test-players.js
echo ""

# 3. 启动服务端（后台）
echo "🚀 启动服务端..."
pkill -f "tsx src/index.ts" 2>/dev/null || true
sleep 2

node node_modules/.bin/tsx src/index.ts > /tmp/server.log 2>&1 &
SERVER_PID=$!
echo "   服务端 PID: $SERVER_PID"

# 等待服务端启动
echo "   等待服务端启动..."
sleep 5

# 检查服务端是否启动
if ! curl -s http://localhost:3002/api/health > /dev/null; then
    echo "❌ 服务端启动失败"
    cat /tmp/server.log
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "✅ 服务端已启动"
echo ""

# 4. 运行测试
echo "🧪 运行测试..."
node scripts/quick-test-social.js
TEST_RESULT=$?

# 5. 停止服务端
echo ""
echo "🛑 停止服务端..."
kill $SERVER_PID 2>/dev/null

# 6. 输出结果
echo ""
if [ $TEST_RESULT -eq 0 ]; then
    echo "🎉 测试通过！"
else
    echo "⚠️  测试失败，请查看错误信息"
fi

exit $TEST_RESULT
