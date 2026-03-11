#!/bin/bash
# 启动 Hulu Lands 服务端
cd /home/tenbox/albion-lands/server

# 检查端口是否被占用
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 被占用，正在清理..."
    kill -9 $(lsof -ti:3000) 2>/dev/null
    sleep 1
fi

echo "🚀 启动服务端..."
exec node node_modules/.bin/tsx src/index.ts
