#!/bin/bash
# 自动化测试启动和管理脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志文件
LOG_FILE="$SCRIPT_DIR/../logs/test-server.log"
PID_FILE="$SCRIPT_DIR/../logs/test-server.pid"

# 函数：启动服务端
start_server() {
    echo -e "${BLUE}🚀 启动服务端...${NC}"
    
    # 检查是否已在运行
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if ps -p $OLD_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  服务端已在运行 (PID: $OLD_PID)${NC}"
            return 0
        fi
    fi
    
    # 清理旧进程
    pkill -f "tsx src/index.ts" 2>/dev/null || true
    sleep 2
    
    # 启动服务端
    nohup npx tsx src/index.ts > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"
    
    echo -e "${BLUE}   等待服务端启动...${NC}"
    
    # 等待服务端启动（最多 30 秒）
    for i in {1..30}; do
        if curl -s http://localhost:3002/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 服务端已启动 (PID: $SERVER_PID)${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ 服务端启动失败${NC}"
    echo -e "${RED}查看日志：$LOG_FILE${NC}"
    return 1
}

# 函数：停止服务端
stop_server() {
    echo -e "${BLUE}🛑 停止服务端...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            echo -e "${GREEN}✅ 服务端已停止${NC}"
        fi
        rm -f "$PID_FILE"
    else
        pkill -f "tsx src/index.ts" 2>/dev/null || true
        echo -e "${YELLOW}⚠️  未找到 PID 文件，尝试清理进程${NC}"
    fi
    
    sleep 2
}

# 函数：检查服务端状态
check_server() {
    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服务端运行正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 服务端未运行${NC}"
        return 1
    fi
}

# 函数：准备测试数据
prepare_data() {
    echo -e "${BLUE}📦 准备测试数据...${NC}"
    node scripts/prepare-test-data.js
    node scripts/add-horn-to-test-players.js
    echo -e "${GREEN}✅ 测试数据准备完成${NC}"
}

# 函数：运行测试
run_tests() {
    echo -e "${BLUE}🧪 运行测试...${NC}"
    echo ""
    
    # 运行 curl 测试脚本
    ./scripts/test-social-curl.sh
    TEST_RESULT=$?
    
    echo ""
    return $TEST_RESULT
}

# 主函数
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     呼噜大陆 - 自动化测试系统              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    case "${1:-all}" in
        start)
            start_server
            ;;
        stop)
            stop_server
            ;;
        restart)
            stop_server
            start_server
            ;;
        status)
            check_server
            ;;
        prepare)
            prepare_data
            ;;
        test)
            if ! check_server; then
                echo -e "${YELLOW}服务端未运行，正在启动...${NC}"
                start_server
            fi
            run_tests
            ;;
        all)
            # 完整流程：准备数据 -> 启动服务端 -> 运行测试 -> 停止服务端
            prepare_data
            echo ""
            
            if ! start_server; then
                exit 1
            fi
            echo ""
            
            if ! run_tests; then
                echo ""
                echo -e "${YELLOW}测试失败，保持服务端运行以便调试${NC}"
                echo -e "${YELLOW}停止命令：$0 stop${NC}"
                exit 1
            fi
            
            echo ""
            stop_server
            echo ""
            echo -e "${GREEN}🎉 所有测试通过！${NC}"
            ;;
        *)
            echo "用法：$0 {start|stop|restart|status|prepare|test|all}"
            echo ""
            echo "命令说明:"
            echo "  start   - 启动服务端"
            echo "  stop    - 停止服务端"
            echo "  restart - 重启服务端"
            echo "  status  - 检查服务端状态"
            echo "  prepare - 准备测试数据"
            echo "  test    - 运行测试（如果服务端未运行则自动启动）"
            echo "  all     - 完整流程（准备 + 启动 + 测试 + 停止）"
            exit 1
            ;;
    esac
}

main "$@"
