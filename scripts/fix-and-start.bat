@echo off
echo ========================================
echo 呼噜大陆 - 快速修复脚本
echo ========================================
echo.

cd /d %~dp0..

echo [1/5] 停止所有 Node 进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] 清理缓存...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
    echo ✓ 已清理 Vite 缓存
)

echo [3/5] 拉取最新代码...
git pull origin main
if errorlevel 1 (
    echo ✗ Git 拉取失败，请检查网络连接
    pause
    exit /b 1
)

echo [4/5] 创建服务端 .env 文件...
if not exist server\.env (
    copy server\.env.example server\.env
    echo ✓ .env 文件已创建
) else (
    echo ✓ .env 文件已存在

echo [5/5] 检查依赖...
cd server
if not exist node_modules (
    echo 正在安装服务端依赖...
    call npm install
)

cd ..\client
if not exist node_modules (
    echo 正在安装客户端依赖...
    call npm install
)

echo.
echo ========================================
echo ✓ 修复完成！
echo ========================================
echo.
echo 请按以下步骤启动游戏：
echo.
echo 1. 打开 PowerShell 窗口 1，运行：
echo    cd server
echo    npm run dev
echo.
echo 2. 打开 PowerShell 窗口 2，运行：
echo    cd client
echo    npm run dev
echo.
echo 3. 浏览器访问：http://localhost:3001
echo.
echo ========================================
pause
