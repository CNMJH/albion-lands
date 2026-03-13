@echo off
title Hulu Lands - Quick Start
color 0A

echo.
echo ========================================
echo     呼噜大陆 - 快速启动工具
echo ========================================
echo.

:: Kill old processes
echo [1/4] 停止旧进程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo   ✅ 完成
echo.

:: Start server
echo [2/4] 启动服务端...
start "Hulu Lands Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 2 /nobreak >nul
echo   ✅ 服务端启动中
echo.

:: Start client
echo [3/4] 启动客户端...
start "Hulu Lands Client" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 2 /nobreak >nul
echo   ✅ 客户端启动中
echo.

:: Open browser
echo [4/4] 打开浏览器...
timeout /t 3 /nobreak >nul
start http://localhost:3001
echo   ✅ 浏览器已打开
echo.

echo ========================================
echo        启动完成！
echo ========================================
echo.
echo 游戏地址：http://localhost:3001
echo.
echo 测试账号:
echo   邮箱：test1@example.com
echo   密码：password123
echo.
echo 快捷键:
echo   右键 - 移动/攻击
echo   左键 - 普通攻击
echo   B - 背包
echo   C - 装备
echo   M - 拍卖行
echo   Enter - 聊天
echo   Escape - 关闭 UI
echo.
echo 按任意键关闭此窗口
echo ========================================
pause >nul
