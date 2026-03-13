@echo off
title Hulu Lands - 一键修复所有问题
color 0C

echo.
echo ========================================
echo     呼噜大陆 - 一键修复工具
echo ========================================
echo.

echo [1/5] 停止旧进程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo   ✅ 完成
echo.

echo [2/5] 清理缓存...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
    echo   ✅ Vite 缓存已清理
)
if exist client\dist (
    rmdir /s /q client\dist
    echo   ✅ 构建文件已清理
)
echo.

echo [3/5] 重新安装依赖...
cd client
call npm install >nul 2>&1
echo   ✅ 客户端依赖已安装
cd ..\server
call npm install >nul 2>&1
echo   ✅ 服务端依赖已安装
cd ..
echo.

echo [4/5] 重建项目...
cd client
call npm run build >nul 2>&1
if errorlevel 1 (
    echo   ❌ 构建失败！
    pause
    exit /b 1
)
echo   ✅ 构建完成
cd ..
echo.

echo [5/5] 启动游戏...
start "Hulu Lands Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 2 /nobreak >nul
start "Hulu Lands Client" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:3001
echo   ✅ 游戏已启动
echo.

echo ========================================
echo        修复完成！
echo ========================================
echo.
echo 游戏地址：http://localhost:3001
echo.
echo 测试账号:
echo   邮箱：test1@example.com
echo   密码：password123
echo.
echo 按任意键关闭此窗口
pause >nul
