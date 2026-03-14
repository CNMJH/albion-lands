@echo off
REM ==========================================
REM Hulu Lands - Windows 一键安装脚本
REM 版本：v1.0
REM 最后更新：2026-03-14
REM ==========================================

echo.
echo ╔════════════════════════════════════════════════╗
echo ║       呼噜大陆 - 一键安装程序                  ║
echo ║       Hulu Lands Installer                     ║
echo ╚════════════════════════════════════════════════╝
echo.

REM 检查 Node.js
echo [1/6] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js!
    echo.
    echo 请先安装 Node.js:
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载 LTS 版本 (v18 或 v20)
    echo 3. 双击安装
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

REM 检查 npm
echo [2/6] 检查 npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 npm!
    echo.
    echo 请重新安装 Node.js
    pause
    exit /b 1
)
echo ✅ npm 已安装

REM 进入项目目录
echo [3/6] 检查项目目录...
if not exist "server" (
    echo ❌ 未找到 server 目录!
    echo.
    echo 请确保在正确的目录运行此脚本
    pause
    exit /b 1
)
if not exist "client" (
    echo ❌ 未找到 client 目录!
    echo.
    echo 请确保在正确的目录运行此脚本
    pause
    exit /b 1
)
echo ✅ 项目目录正确

REM 安装服务端依赖
echo [4/6] 安装服务端依赖...
echo 这可能需要 3-5 分钟...
cd server
if exist "node_modules" (
    echo 检测到已有依赖，跳过安装
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 服务端依赖安装失败!
        pause
        exit /b 1
    )
)
cd ..
echo ✅ 服务端依赖安装完成

REM 安装客户端依赖
echo [5/6] 安装客户端依赖...
echo 这可能需要 3-5 分钟...
cd client
if exist "node_modules" (
    echo 检测到已有依赖，跳过安装
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 客户端依赖安装失败!
        pause
        exit /b 1
    )
)
cd ..
echo ✅ 客户端依赖安装完成

REM 初始化数据库
echo [6/6] 初始化数据库...
cd server
if exist "prisma\dev.db" (
    echo 检测到已有数据库，跳过初始化
) else (
    echo 创建数据库...
    call npx prisma db push
    if %errorlevel% neq 0 (
        echo ❌ 数据库初始化失败!
        pause
        exit /b 1
    )
)
cd ..
echo ✅ 数据库初始化完成

echo.
echo ╔════════════════════════════════════════════════╗
echo ║           安装完成！ 🎉                        ║
echo ╚════════════════════════════════════════════════╝
echo.
echo 下一步:
echo 1. 运行 launcher.bat 启动游戏
echo 2. 或运行 force-restart.bat 重启所有服务
echo.
echo 游戏地址：http://localhost:3001
echo 服务端地址：http://localhost:3002
echo.
pause
