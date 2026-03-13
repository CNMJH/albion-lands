@echo off
title Hulu Lands - 地面网格修复
color 0A

echo.
echo ========================================
echo     呼噜大陆 - 地面网格修复
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
echo   ✅ 地面网格高对比度（亮白色边框）
echo   ✅ 图层 zIndex 排序（地面在最底层）
echo   ✅ 中心红点 + 四角白点（辅助定位）
echo   ✅ 坐标文字显示（64px 标记）
echo.
echo 验证步骤:
echo   1. 登录游戏
echo   2. 查看地面（应该看到清晰的网格）
echo   3. 按 F12 查看控制台日志
echo   4. 查找"地面创建完成"日志
echo.
echo 游戏地址：http://localhost:3001
echo.
echo 按任意键关闭此窗口
pause >nul
