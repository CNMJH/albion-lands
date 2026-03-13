#!/bin/bash

# 快速功能验证脚本
# 测试所有核心 API 端点

BASE_URL="http://localhost:3002"
CHARACTER_ID="1fc5bfa9-a54b-406c-abaa-adb032a3f59a"

echo "========================================="
echo "  Hulu Lands 功能验证脚本"
echo "  版本：v0.2.0-alpha"
echo "========================================="
echo ""

# 检查服务端是否运行
echo "🔍 检查服务端状态..."
HEALTH=$(curl -s $BASE_URL/health)
if [ $? -ne 0 ]; then
    echo "❌ 服务端未启动！请先运行：cd server && npm run dev"
    exit 1
fi
echo "✅ 服务端正常：$HEALTH"
echo ""

# 测试计数器
TOTAL=0
PASS=0
FAIL=0

# 测试函数
test_api() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    
    TOTAL=$((TOTAL + 1))
    echo -n "📡 测试 $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" $url)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" $url)
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo "✅ $response"
        PASS=$((PASS + 1))
    else
        echo "❌ $response"
        FAIL=$((FAIL + 1))
    fi
}

echo "========================================="
echo "  P0 核心功能测试"
echo "========================================="
test_api "健康检查" "$BASE_URL/health"
test_api "物品列表" "$BASE_URL/api/v1/items?limit=1"
test_api "地图列表" "$BASE_URL/api/v1/maps"
test_api "NPC 列表" "$BASE_URL/api/v1/npcs"
test_api "背包查询" "$BASE_URL/api/v1/inventory/$CHARACTER_ID"
test_api "装备查询" "$BASE_URL/api/v1/equipment/$CHARACTER_ID"
test_api "技能查询" "$BASE_URL/api/v1/skills/$CHARACTER_ID"
test_api "市场订单" "$BASE_URL/api/v1/market/orders"
echo ""

echo "========================================="
echo "  P1 游戏内容测试"
echo "========================================="
test_api "死亡记录" "$BASE_URL/api/v1/combat/deaths/$CHARACTER_ID"
test_api "PVP 统计" "$BASE_URL/api/v1/pvp/stats/$CHARACTER_ID"
test_api "任务查询" "$BASE_URL/api/v1/quests/$CHARACTER_ID"
test_api "每日任务" "$BASE_URL/api/v1/daily-quests/$CHARACTER_ID"
test_api "好友列表" "$BASE_URL/api/v1/social/friends/$CHARACTER_ID"
echo ""

echo "========================================="
echo "  P2 优化功能测试"
echo "========================================="
test_api "成就查询" "$BASE_URL/api/v1/achievements/$CHARACTER_ID"
test_api "等级排行榜" "$BASE_URL/api/v1/leaderboard/level?limit=10"
test_api "PVP 排行榜" "$BASE_URL/api/v1/leaderboard/pvp?limit=10"
test_api "财富排行榜" "$BASE_URL/api/v1/leaderboard/wealth?limit=10"
test_api "仓库查询" "$BASE_URL/api/v1/bank/$CHARACTER_ID"
test_api "离线奖励" "$BASE_URL/api/v1/player/offline-rewards/$CHARACTER_ID"
echo ""

echo "========================================="
echo "  测试结果汇总"
echo "========================================="
echo "总测试数：$TOTAL"
echo "✅ 通过：$PASS"
echo "❌ 失败：$FAIL"
echo "通过率：$((PASS * 100 / TOTAL))%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 所有测试通过！"
    exit 0
else
    echo "⚠️  有 $FAIL 个测试失败，请检查服务端日志"
    exit 1
fi
