#!/bin/bash
# 社交系统自动化测试脚本（使用 curl）

API_BASE="http://localhost:3002/api/v1"

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 社交系统自动化测试${NC}"
echo -e "${BLUE}========================================${NC}\n"

PASSED=0
FAILED=0
TOKEN=""
CHAR_ID=""
PARTY_ID=""

# 测试 1: 健康检查
echo -e "${YELLOW}测试 1: 服务端健康检查${NC}"
if curl -s http://localhost:3002/health | grep -q "ok"; then
    echo -e "${GREEN}✅ 服务端正常运行${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 服务端不可用${NC}"
    ((FAILED++))
    exit 1
fi
echo ""

# 测试 2: 登录
echo -e "${YELLOW}测试 2: 登录测试账号${NC}"
LOGIN_RESULT=$(curl -s -X POST "${API_BASE}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test1@example.com","password":"password123"}')

# 检查登录是否成功
if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    TOKEN=$(echo "$LOGIN_RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    CHAR_ID=$(echo "$LOGIN_RESULT" | grep -o '"character":{[^}]*"id":"[^"]*"' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    CHAR_NAME=$(echo "$LOGIN_RESULT" | grep -o '"character":{[^}]*"name":"[^"]*"' | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ 登录成功${NC}"
        echo "   角色 ID: ${CHAR_ID}"
        echo "   角色名：${CHAR_NAME}"
        ((PASSED++))
    else
        echo -e "${RED}❌ 登录成功但未获取到 token${NC}"
        echo "$LOGIN_RESULT"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ 登录失败${NC}"
    echo "$LOGIN_RESULT"
    ((FAILED++))
    exit 1
fi
echo ""

# 测试 3: 获取好友列表
echo -e "${YELLOW}测试 3: 获取好友列表${NC}"
FRIENDS_RESULT=$(curl -s "${API_BASE}/social/friends" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$FRIENDS_RESULT" | grep -q '"success":true\|"data":'; then
    echo -e "${GREEN}✅ 获取好友列表成功${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 获取好友列表失败${NC}"
    echo "$FRIENDS_RESULT"
    ((FAILED++))
fi
echo ""

# 测试 4: 发送区域聊天
echo -e "${YELLOW}测试 4: 发送区域聊天消息${NC}"
CHAT_RESULT=$(curl -s -X POST "${API_BASE}/social/chat/zone" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "{\"senderId\":\"${CHAR_ID}\",\"content\":\"测试区域聊天消息 $(date +%H:%M:%S)\",\"zoneId\":\"zone_1\"}")

if echo "$CHAT_RESULT" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 发送聊天消息成功${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 发送聊天消息失败${NC}"
    echo "$CHAT_RESULT"
    ((FAILED++))
fi
echo ""

# 测试 5: 发送世界聊天
echo -e "${YELLOW}测试 5: 发送世界聊天消息${NC}"
GLOBAL_RESULT=$(curl -s -X POST "${API_BASE}/social/chat/global" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "{\"senderId\":\"${CHAR_ID}\",\"content\":\"测试世界聊天 $(date +%H:%M:%S)\"}")

if echo "$GLOBAL_RESULT" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 发送世界聊天成功${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 发送世界聊天失败${NC}"
    echo "$GLOBAL_RESULT"
    ((FAILED++))
fi
echo ""

# 测试 6: 获取聊天历史
echo -e "${YELLOW}测试 6: 获取聊天历史${NC}"
HISTORY_RESULT=$(curl -s "${API_BASE}/social/chat/history?limit=5" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$HISTORY_RESULT" | grep -q '"success":true\|"data":'; then
    echo -e "${GREEN}✅ 获取聊天历史成功${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 获取聊天历史失败${NC}"
    echo "$HISTORY_RESULT"
    ((FAILED++))
fi
echo ""

# 测试 7: 创建队伍
echo -e "${YELLOW}测试 7: 创建队伍${NC}"

# 先检查是否已在队伍中
CHECK_PARTY=$(curl -s "${API_BASE}/social/party/member/${CHAR_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$CHECK_PARTY" | grep -q '"party":'; then
    # 已在队伍中，先离开
    EXISTING_PARTY_ID=$(echo "$CHECK_PARTY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$EXISTING_PARTY_ID" ]; then
        curl -s -X POST "${API_BASE}/social/party/${EXISTING_PARTY_ID}/leave" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${TOKEN}" \
            -d "{\"characterId\":\"${CHAR_ID}\"}" > /dev/null
        echo "   清理旧队伍..."
    fi
fi

PARTY_RESULT=$(curl -s -X POST "${API_BASE}/social/party" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "{\"leaderId\":\"${CHAR_ID}\",\"name\":\"测试队伍 $(date +%H:%M:%S)\"}")

if echo "$PARTY_RESULT" | grep -q '"success":true'; then
    PARTY_ID=$(echo "$PARTY_RESULT" | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ 创建队伍成功${NC}"
    if [ -n "$PARTY_ID" ]; then
        echo "   队伍 ID: ${PARTY_ID}"
    fi
    ((PASSED++))
else
    echo -e "${RED}❌ 创建队伍失败${NC}"
    echo "$PARTY_RESULT"
    ((FAILED++))
fi
echo ""

# 测试 8: 获取队伍信息（如果有队伍）
if [ -n "$PARTY_ID" ]; then
    echo -e "${YELLOW}测试 8: 获取队伍信息${NC}"
    PARTY_INFO_RESULT=$(curl -s "${API_BASE}/social/party/${PARTY_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$PARTY_INFO_RESULT" | grep -q '"success":true\|"data":'; then
        echo -e "${GREEN}✅ 获取队伍信息成功${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ 获取队伍信息失败${NC}"
        echo "$PARTY_INFO_RESULT"
        ((FAILED++))
    fi
    echo ""
    
    # 测试 9: 离开队伍
    echo -e "${YELLOW}测试 9: 离开队伍${NC}"
    LEAVE_RESULT=$(curl -s -X POST "${API_BASE}/social/party/${PARTY_ID}/leave" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{\"characterId\":\"${CHAR_ID}\"}")
    
    if echo "$LEAVE_RESULT" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ 离开队伍成功${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ 离开队伍失败${NC}"
        echo "$LEAVE_RESULT"
        ((FAILED++))
    fi
    echo ""
fi

# 测试 10: GM 查询好友
echo -e "${YELLOW}测试 10: GM 工具 - 查询玩家好友${NC}"
GM_FRIENDS_RESULT=$(curl -s "${API_BASE}/gm/players/${CHAR_ID}/friends")

if echo "$GM_FRIENDS_RESULT" | grep -q '"success":true\|"data":'; then
    echo -e "${GREEN}✅ GM 查询好友成功${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ GM 查询好友失败${NC}"
    echo "$GM_FRIENDS_RESULT"
    ((FAILED++))
fi
echo ""

# 测试 11: GM 查询聊天
echo -e "${YELLOW}测试 11: GM 工具 - 查询聊天记录${NC}"
GM_CHAT_RESULT=$(curl -s "${API_BASE}/gm/chat/history?limit=5")

if echo "$GM_CHAT_RESULT" | grep -q '"success":true\|"data":'; then
    echo -e "${GREEN}✅ GM 查询聊天成功${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ GM 查询聊天失败${NC}"
    echo "$GM_CHAT_RESULT"
    ((FAILED++))
fi
echo ""

# 测试 12: 检查背包物品
echo -e "${YELLOW}测试 12: 检查背包物品${NC}"
INVENTORY_RESULT=$(curl -s "${API_BASE}/inventory?characterId=${CHAR_ID}")

if echo "$INVENTORY_RESULT" | grep -q '"success":true\|"data":'; then
    echo -e "${GREEN}✅ 获取背包信息成功${NC}"
    # 显示大喇叭数量
    HORNS=$(echo "$INVENTORY_RESULT" | grep -o '"name":"world_horn"[^}]*"quantity":[0-9]*' | grep -o '"quantity":[0-9]*' | cut -d':' -f2 | head -1)
    if [ -n "$HORNS" ]; then
        echo "   大喇叭数量：${HORNS}"
    fi
    ((PASSED++))
else
    echo -e "${RED}❌ 获取背包信息失败${NC}"
    echo "$INVENTORY_RESULT"
    ((FAILED++))
fi
echo ""

# 输出结果
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 测试结果${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 通过：${PASSED}${NC}"
echo -e "${RED}❌ 失败：${FAILED}${NC}"
TOTAL=$((PASSED + FAILED))
echo -e "${BLUE}📝 总计：${TOTAL}${NC}"
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo -e "${YELLOW}📈 通过率：${PASS_RATE}%${NC}"
fi
echo -e "${BLUE}========================================${NC}\n"

# 退出码
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
