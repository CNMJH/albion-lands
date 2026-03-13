@echo off
title Hulu Lands - 强制清除缓存并重启
color 0C

echo.
echo ========================================
echo   呼噜大陆 - 强制清除缓存
echo ========================================
echo.

echo [1/5] 停止所有进程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo   ✅ 完成
echo.

echo [2/5] 删除 Vite 缓存...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
    echo   ✅ Vite 缓存已删除
)
if exist client\dist (
    rmdir /s /q client\dist
    echo   ✅ 构建目录已删除
)
echo.

echo [3/5] 删除服务端缓存...
if exist server\.tsx (
    rmdir /s /q server\.tsx
    echo   ✅ TSX 缓存已删除
)
echo.

echo [4/5] 重新构建...
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
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo        启动完成！
echo ========================================
echo.
echo ⚠️  重要：请按 Ctrl+F5 强制刷新浏览器！
echo.
echo 游戏地址：http://localhost:3001
echo.
echo 按任意键关闭此窗口
pause >nul
