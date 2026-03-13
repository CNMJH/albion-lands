@echo off
title Hulu Lands - UI 互斥修复
color 0C

echo.
echo ========================================
echo     呼噜大陆 - UI 互斥修复
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
echo   ✅ 背包 UI 样式修复（添加 inventory-window）
echo   ✅ UI 互斥原则（打开 UI 时禁用游戏输入）
echo   ✅ 右键点击检查（UI 打开时阻止移动）
echo   ✅ 全局输入检查（UI 打开时阻止操作）
echo.
echo 验证步骤:
echo   1. 登录游戏
echo   2. 按 B 键打开背包
echo   3. 右键点击地面（应该无法移动）
echo   4. 关闭背包（点 X 或再按 B）
echo   5. 右键点击地面（应该可以移动）
echo.
echo 游戏地址：http://localhost:3001
echo.
echo 按任意键关闭此窗口
pause >nul
