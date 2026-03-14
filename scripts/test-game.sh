#!/bin/bash
# 游戏功能测试脚本

echo "======================================"
echo "🎮 呼噜大陆 - 功能测试脚本"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_api() {
  local name=$1
  local url=$2
  local expected=$3
  
  TOTAL=$((TOTAL + 1))
  echo -n "测试 $name... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$response" == "$expected" ]; then
    echo -e "${GREEN}✅ 通过${NC} (HTTP $response)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌ 失败${NC} (HTTP $response, 期望 $expected)"
    FAILED=$((FAILED + 1))
  fi
}

# 测试函数 - JSON 响应
test_api_json() {
  local name=$1
  local url=$2
  local expected=$3
  
  TOTAL=$((TOTAL + 1))
  echo -n "测试 $name... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$response" == "$expected" ]; then
    echo -e "${GREEN}✅ 通过${NC} (HTTP $response)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌ 失败${NC} (HTTP $response, 期望 $expected)"
    FAILED=$((FAILED + 1))
  fi
}

echo "📋 测试环境检查"
echo "--------------------------------------"

# 检查服务端
echo -n "检查服务端 (localhost:3002)... "
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 运行中${NC}"
else
  echo -e "${RED}❌ 未运行${NC}"
  echo "提示：请先运行 ./start.bat 启动服务端"
  exit 1
fi

# 检查客户端
echo -n "检查客户端 (localhost:3001)... "
if curl -s http://localhost:3001/ > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 运行中${NC}"
else
  echo -e "${RED}❌ 未运行${NC}"
  echo "提示：请先运行 ./start.bat 启动客户端"
  exit 1
fi

echo ""
echo "🎯 API 功能测试"
echo "--------------------------------------"

# 健康检查
test_api "健康检查" "http://localhost:3002/health" "200"

# 用户 API
test_api_json "用户列表" "http://localhost:3002/api/v1/users" "200"

# 角色 API
test_api_json "角色列表" "http://localhost:3002/api/v1/characters" "200"

# 物品 API
test_api_json "物品列表" "http://localhost:3002/api/v1/items" "200"

# 地图 API
test_api_json "地图列表" "http://localhost:3002/api/v1/maps" "200"

# NPC API
test_api_json "NPC 列表" "http://localhost:3002/api/v1/npcs" "200"

# 技能 API
test_api_json "技能列表" "http://localhost:3002/api/v1/skills" "200"

# 成就 API
test_api_json "成就列表" "http://localhost:3002/api/v1/achievements" "200"

# 排行榜 API
test_api_json "排行榜" "http://localhost:3002/api/v1/leaderboard" "200"

# 市场 API
test_api_json "市场订单" "http://localhost:3002/api/v1/market/orders" "200"

echo ""
echo "🌐 WebSocket 连接测试"
echo "--------------------------------------"

# WebSocket 测试（使用 websocat 或 wscat）
echo -n "WebSocket 连接... "
if command -v websocat &> /dev/null; then
  timeout 2 websocat ws://localhost:3002/ws > /dev/null 2>&1 &
  WS_PID=$!
  sleep 1
  if ps -p $WS_PID > /dev/null; then
    echo -e "${GREEN}✅ 可连接${NC}"
    PASSED=$((PASSED + 1))
    kill $WS_PID 2>/dev/null
  else
    echo -e "${RED}❌ 连接失败${NC}"
    FAILED=$((FAILED + 1))
  fi
else
  echo -e "${YELLOW}⚠️  跳过 (websocat 未安装)${NC}"
fi

TOTAL=$((TOTAL + 1))

echo ""
echo "📊 测试结果汇总"
echo "======================================"
echo "总测试用例：$TOTAL"
echo -e "通过：${GREEN}$PASSED${NC}"
echo -e "失败：${RED}$FAILED${NC}"
echo "通过率：$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)%"
echo "======================================"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ 所有测试通过！${NC}"
  exit 0
else
  echo -e "${RED}❌ 部分测试失败，请检查日志${NC}"
  exit 1
fi
