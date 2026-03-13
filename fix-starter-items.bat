@echo off
title Hulu Lands - 新手装备 + UI 修复
color 0C

echo.
echo ========================================
echo   呼噜大陆 - 新手装备 + UI 修复
echo ========================================
echo.

echo [1/4] 停止旧进程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo   ✅ 完成
echo.

echo [2/4] 发放新手装备...
cd /d %~dp0server
node scripts/give-starter-items.js
cd ..
echo.

echo [3/4] 清理缓存...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
    echo   ✅ Vite 缓存已清理
)
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
echo   ✅ 角色创建时自动发放新手装备
echo   ✅ 新手装备脚本 (已有角色)
echo   ✅ UI 层级修复 (任务面板不遮挡按钮)
echo.
echo 新手装备列表:
echo   ⚔️  新手剑 (主手)
echo   🛡️  新手盾 (副手)
echo   👕 新手胸甲
echo   👖 新手护腿
echo   👢 新手靴子
echo   📿 新手项链
echo   🧪 治疗药水 x5
echo   💙 法力药水 x5
echo.
echo 验证步骤:
echo   1. 创建新角色 或 使用现有角色
echo   2. 按 B 键打开背包
echo   3. 应该看到 8 件新手装备
echo   4. 右侧按钮应该清晰可见
echo.
echo 游戏地址：http://localhost:3001
echo.
echo 按任意键关闭此窗口
pause >nul
