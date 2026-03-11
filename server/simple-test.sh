#!/bin/bash
# 简化测试脚本

set -e

cd /home/tenbox/albion-lands/server

echo "🧪 社交系统简化测试"
echo "===================="
echo ""

# 1. 停止旧进程
echo "清理旧进程..."
pkill -9 -f "tsx src/index.ts" 2>/dev/null || true
sleep 2

# 2. 启动服务端
echo "启动服务端..."
npx tsx src/index.ts > /tmp/server-simple.log 2>&1 &
SERVER_PID=$!
echo "服务端 PID: $SERVER_PID"

# 3. 等待启动
echo "等待服务端启动..."
for i in {1..15}; do
    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        echo "✅ 服务端已启动"
        break
    fi
    sleep 1
done

# 4. 测试登录
echo ""
echo "测试登录..."
LOGIN_RESULT=$(curl -s -X POST "http://localhost:3002/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test1@example.com","password":"password123"}')

echo "$LOGIN_RESULT"

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo "✅ 登录成功"
    TOKEN=$(echo "$LOGIN_RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:50}..."
    
    # 5. 测试聊天
    echo ""
    echo "测试聊天..."
    CHAT_RESULT=$(curl -s -X POST "http://localhost:3002/api/v1/chat/send" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d '{"type":"zone","content":"简化测试消息","zoneId":"zone_1"}')
    
    echo "$CHAT_RESULT"
    
    if echo "$CHAT_RESULT" | grep -q '"success":true'; then
        echo "✅ 聊天成功"
    else
        echo "❌ 聊天失败"
    fi
else
    echo "❌ 登录失败"
    # 显示日志
    echo ""
    echo "服务端日志:"
    tail -50 /tmp/server-simple.log | grep -A 5 "登录\|error\|Error" || true
fi

# 6. 停止服务端
echo ""
echo "停止服务端..."
kill $SERVER_PID 2>/dev/null || true

echo "完成"
