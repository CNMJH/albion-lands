#!/bin/bash

# ============================================
# 任务系统自动化测试脚本
# ============================================

BASE_URL="http://localhost:3002/api/v1/quests"
CHARACTER_ID="test-character-id"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}📜 任务系统自动化测试${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

PASS=0
FAIL=0

# 测试函数
run_test() {
  local test_name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  echo -e "${YELLOW}测试 $((PASS + FAIL + 1)): ${test_name}${NC}"
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
  else
    response=$(curl -s -w "\n%{http_code}" -X "${method}" \
      -H "Content-Type: application/json" \
      -d "${data}" \
      "${BASE_URL}${endpoint}")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
    echo -e "${GREEN}✅ ${test_name}成功${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ ${test_name}失败 (HTTP ${http_code})${NC}"
    echo "Response: $body"
    FAIL=$((FAIL + 1))
  fi
  echo ""
}

# 1. 获取任务列表
run_test "获取所有任务" "GET" "" ""

# 2. 获取任务详情
run_test "获取任务详情" "GET" "/quest_welcome" ""

# 3. 获取 NPC 列表
run_test "获取 NPC 列表" "GET" "/npcs" ""

# 4. 获取 NPC 详情
run_test "获取 NPC 详情" "GET" "/npcs/npc_village_elder" ""

# 5. 获取 NPC 任务
run_test "获取 NPC 任务" "GET" "/npcs/npc_village_elder/quests" ""

# 6. 获取每日任务
run_test "获取每日任务" "GET" "/daily/list" ""

# 7. 接取任务
run_test "接取任务" "POST" "/quest_welcome/accept" "{\"characterId\": \"${CHARACTER_ID}\"}"

# 8. 获取角色任务
run_test "获取角色任务" "GET" "/character/${CHARACTER_ID}" ""

# 9. 获取成就列表
run_test "获取成就列表" "GET" "/achievements" ""

# 10. 提交任务（模拟）
# 注意：实际需要先更新进度才能提交
# run_test "提交任务" "POST" "/quest_welcome/complete" "{\"characterId\": \"${CHARACTER_ID}\"}"

# 统计结果
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}📊 测试结果${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ 通过：${PASS}${NC}"
echo -e "${RED}❌ 失败：${FAIL}${NC}"
echo -e "${BLUE}📝 总计：$((PASS + FAIL))${NC}"

if [ $FAIL -eq 0 ]; then
  PERCENT=100
else
  PERCENT=$((PASS * 100 / (PASS + FAIL)))
fi

echo -e "${YELLOW}📈 通过率：${PERCENT}%${NC}"
echo -e "${BLUE}=========================================${NC}"

# 退出码
if [ $FAIL -eq 0 ]; then
  exit 0
else
  exit 1
fi
