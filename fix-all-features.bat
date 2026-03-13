@echo off
title Hulu Lands - 完整功能修复
color 0A

echo.
echo ========================================
echo     呼噜大陆 - 完整功能修复
echo ========================================
echo.

echo [1/4] 停止旧进程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo   ✅ 完成
echo.

echo [2/4] 清理缓存...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
    echo   ✅ Vite 缓存已清理
)
if exist client\dist (
    rmdir /s /q client\dist
    echo   ✅ 构建文件已清理
)
echo.

echo [3/4] 重建项目...
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

echo [4/4] 启动游戏...
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
echo 新增功能:
echo   ✅ 角色移动自动朝向移动方向
echo   ✅ 移动灰尘特效
echo   ✅ 角色脚下阴影
echo   ✅ 地图添加 10 只怪物
echo   ✅ 背包赠送测试装备
echo.
echo 游戏地址：http://localhost:3001
echo.
echo 按任意键关闭此窗口
pause >nul
