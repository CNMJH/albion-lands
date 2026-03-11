#!/bin/bash
# 启动呼噜大陆服务端（后台运行）
cd /home/tenbox/albion-lands/server
nohup node node_modules/.bin/tsx src/index.ts > ../logs/server.log 2>&1 &
echo $! > ../logs/server.pid
echo "服务端已启动 (PID: $(cat ../logs/server.pid))"
sleep 3
curl -s http://localhost:3002/health && echo " ✅"
