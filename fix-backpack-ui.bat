@echo off
title Hulu Lands - 背包 UI 修复
color 0B

echo.
echo ========================================
echo     呼噜大陆 - 背包 UI 修复
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
echo 修复内容:
echo   ✅ inventory-window 添加尺寸限制
echo   ✅ inventory-panel 最大宽度 800px
echo   ✅ 修复组件嵌套结构
echo   ✅ 添加 inventory-section 样式
echo.
echo 验证步骤:
echo   1. 登录游戏
echo   2. 按 B 键打开背包
echo   3. 背包应该居中，不占满屏幕
echo   4. 大小适中 (600-800px 宽)
echo.
echo 游戏地址：http://localhost:3001
echo.
echo 按任意键关闭此窗口
pause >nul
