@echo off
title Hulu Lands - 移动和网格修复
color 0B

echo.
echo ========================================
echo     呼噜大陆 - 移动和网格修复
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

echo [3/5] 重建项目...
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

echo [4/5] 启动游戏...
start "Hulu Lands Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 2 /nobreak >nul
start "Hulu Lands Client" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:3001
echo   ✅ 游戏已启动
echo.

echo [5/5] 打开诊断工具...
timeout /t 2 /nobreak >nul
start http://localhost:3001/diagnose-move.html
echo   ✅ 诊断工具已打开
echo.

echo ========================================
echo        修复完成！
echo ========================================
echo.
echo 新增功能:
echo   ✅ 地面网格更明显（白色边框 + 十字线）
echo   ✅ Canvas 自动 focus
echo   ✅ 移动调试日志增强
echo   ✅ 诊断工具页面
echo.
echo 验证步骤:
echo   1. 登录后查看地面网格（应该很清晰）
echo   2. 右键点击地面移动角色
echo   3. 按 F12 查看控制台日志
echo   4. 如果没有反应，打开诊断工具
echo.
echo 诊断工具地址:
echo   http://localhost:3001/diagnose-move.html
echo.
echo 按任意键关闭此窗口
pause >nul
