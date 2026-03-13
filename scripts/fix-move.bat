@echo off
REM ============================================
REM 角色移动问题快速修复脚本
REM ============================================

echo.
echo ============================================
echo   呼噜大陆 - 角色移动问题修复工具
echo ============================================
echo.

echo [1/3] 清理缓存...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
    echo   - 已清理 Vite 缓存
) else (
    echo   - 无需清理
)
echo.

echo [2/3] 重新安装依赖...
cd client
call npm install
echo.

echo [3/3] 重建项目...
call npm run build
echo.

echo ============================================
echo   修复完成！
echo ============================================
echo.
echo 请按以下步骤测试:
echo.
echo 1. 启动游戏:
echo    cd ..
echo    .\launcher.bat
echo.
echo 2. 打开浏览器访问：http://localhost:3001
echo.
echo 3. 按 F12 打开控制台
echo.
echo 4. 观察日志:
echo    - 看到 "玩家操作系统初始化完成" ?
echo    - 看到 "Canvas 已 focus" ?
echo    - 右键点击有 "右键点击" 日志 ?
echo.
echo 5. 如果还是不行，访问诊断页面:
echo    http://localhost:3001/diagnose.html
echo.
echo ============================================
pause
