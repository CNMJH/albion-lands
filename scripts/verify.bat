@echo off
REM ====================================
REM 呼噜大陆 - 快速验证脚本
REM 用于 Windows 实测验证
REM ====================================

setlocal enabledelayedexpansion

echo.
echo ====================================
echo   呼噜大陆 - 快速验证脚本
echo ====================================
echo.

REM 检查 Git
echo [1/8] 检查 Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Git 未安装，请先安装 Git
    pause
    exit /b 1
)
echo [✓] Git 已安装
echo.

REM 拉取最新代码
echo [2/8] 拉取最新代码...
git pull origin main
if %errorlevel% neq 0 (
    echo [警告] Git pull 失败，请检查网络连接
)
echo.

REM 显示当前版本
echo [3/8] 当前版本信息...
git log --oneline -5
echo.

REM 检查 Node.js
echo [4/8] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Node.js 未安装，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo [✓] Node.js 已安装
node --version
echo.

REM 检查 npm
echo [5/8] 检查 npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] npm 未安装
    pause
    exit /b 1
)
echo [✓] npm 已安装
npm --version
echo.

REM 安装服务端依赖
echo [6/8] 安装服务端依赖...
cd server
if not exist node_modules (
    echo [信息] 首次安装，可能需要几分钟...
)
call npm install
if %errorlevel% neq 0 (
    echo [错误] 服务端依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo [✓] 服务端依赖安装完成
cd ..
echo.

REM 安装客户端依赖
echo [7/8] 安装客户端依赖...
cd client
if not exist node_modules (
    echo [信息] 首次安装，可能需要几分钟...
)
call npm install
if %errorlevel% neq 0 (
    echo [错误] 客户端依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo [✓] 客户端依赖安装完成
cd ..
echo.

REM 编译客户端
echo [8/8] 编译客户端...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 客户端编译失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

REM 显示验证清单
echo ====================================
echo   验证清单
echo ====================================
echo.
echo 请按以下步骤手动验证：
echo.
echo 1. 启动服务端
echo    cd server
echo    npm run dev
echo.
echo 2. 新开命令行，启动客户端
echo    cd client
echo    npm run dev
echo.
echo 3. 访问游戏
echo    http://localhost:3001
echo.
echo 4. 验证 UI 优化
echo    - 角色信息面板（顶部中央）
echo    - 技能栏（底部中央，QWER 键位）
echo    - 背包界面（按 B 键）
echo    - 聊天框（左下角）
echo    - 装备面板（按 C 键）
echo.
echo 5. 验证功能
echo    - 鼠标右键移动
echo    - 鼠标右键攻击
echo    - QWER 技能释放
echo    - 小地图显示
echo    - 社交系统
echo.
echo ====================================
echo.
echo [✓] 预验证完成！
echo.
echo 详细验证指南请查看：
echo docs/WINDOWS_VERIFICATION.md
echo.
pause
