@echo off
REM ============================================
REM 呼噜大陆 - 全面问题修复脚本
REM ============================================

echo.
echo ============================================
echo   呼噜大陆 - 全面问题修复工具
echo ============================================
echo.

echo [1/5] 停止所有进程...
taskkill /F /IM node.exe >nul 2>&1
echo   - 已停止 Node 进程
echo.

echo [2/5] 清理缓存...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
    echo   - 已清理 Vite 缓存
)
if exist client\dist (
    rmdir /s /q client\dist
    echo   - 已清理构建文件
)
if exist server\node_modules\.prisma (
    rmdir /s /q server\node_modules\.prisma
    echo   - 已清理 Prisma 缓存
)
echo.

echo [3/5] 重新安装依赖...
cd client
call npm install
if errorlevel 1 (
    echo.
    echo [ERROR] 客户端依赖安装失败!
    pause
    exit /b 1
)
cd ..\server
call npm install
if errorlevel 1 (
    echo.
    echo [ERROR] 服务端依赖安装失败!
    pause
    exit /b 1
)
cd ..
echo.

echo [4/5] 重建项目...
cd client
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] 客户端构建失败!
    pause
    exit /b 1
)
cd ..
echo.

echo [5/5] 初始化数据库...
cd server
if not exist prisma\dev.db (
    echo   - 创建数据库...
    call npx prisma migrate dev --name init
) else (
    echo   - 数据库已存在
)
call npx prisma generate
cd ..
echo.

echo ============================================
echo   修复完成！
echo ============================================
echo.
echo 请按以下步骤启动游戏:
echo.
echo 1. 打开命令行 1 (服务端):
echo    cd server
echo    npm run dev
echo.
echo 2. 打开命令行 2 (客户端):
echo    cd client
echo    npm run dev
echo.
echo 3. 访问游戏:
echo    http://localhost:3001
echo.
echo 4. 测试账号:
echo    邮箱：test1@example.com
echo    密码：password123
echo.
echo ============================================
echo.
echo 如果还有问题，请查看:
echo - docs/MOVE_FIX_GUIDE.md - 移动问题诊断
echo - docs/QUICK_START.md - 快速启动指南
echo.
pause
