@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ========================================
:: 呼噜大陆 - 一键启动器
:: ========================================
:: 功能：
:: 1. 从 GitHub 拉取最新代码
:: 2. 检查和安装依赖
:: 3. 创建配置文件
:: 4. 启动服务端和客户端
:: 5. 自动打开浏览器
:: ========================================

title 呼噜大陆 - 一键启动器
color 0A

echo.
echo ========================================
echo          呼噜大陆 - 一键启动器
echo          Hulu Lands Launcher
echo ========================================
echo.

:: 获取脚本所在目录
cd /d "%~dp0"

:: 检查 Git 是否安装
where git >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Git，请先安装 Git
    echo 下载地址：https://git-scm.com/download/win
    pause
    exit /b 1
)

:: 检查 Node.js 是否安装
where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] 检查运行环境...
echo   ✓ Git 已安装
echo   ✓ Node.js 已安装
echo.

:: 检查是否是第一次运行（从根目录运行）
if not exist "server" (
    echo [信息] 首次运行，正在克隆项目...
    cd ..
    if not exist "albion-lands" (
        git clone https://github.com/CNMJH/albion-lands.git
        if errorlevel 1 (
            echo [错误] 克隆项目失败
            pause
            exit /b 1
        )
    )
    cd albion-lands
    echo [信息] 项目已克隆，正在拉取最新代码...
) else (
    echo [信息] 项目已存在，正在拉取最新代码...
)

:: 拉取最新代码
echo.
echo [1/6] 从 GitHub 拉取最新代码...
git pull origin main
if errorlevel 1 (
    echo [警告] Git 拉取失败，继续使用本地代码
)

:: 检查服务端配置
echo.
echo [2/6] 检查服务端配置...
if not exist "server\.env" (
    echo   创建服务端 .env 文件...
    copy server\.env.example server\.env >nul
    echo   ✓ .env 文件已创建
) else (
    echo   ✓ .env 文件已存在
)

:: 检查服务端依赖
echo.
echo [3/6] 检查服务端依赖...
if not exist "server\node_modules" (
    echo   正在安装服务端依赖（首次运行可能需要几分钟）...
    cd server
    call npm install
    if errorlevel 1 (
        echo [错误] 服务端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo   ✓ 服务端依赖安装完成
) else (
    echo   ✓ 服务端依赖已安装
)

:: 检查客户端依赖
echo.
echo [4/6] 检查客户端依赖...
if not exist "client\node_modules" (
    echo   正在安装客户端依赖（首次运行可能需要几分钟）...
    cd client
    call npm install
    if errorlevel 1 (
        echo [错误] 客户端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo   ✓ 客户端依赖安装完成
) else (
    echo   ✓ 客户端依赖已安装
)

:: 停止之前的进程
echo.
echo [5/6] 清理旧进程...
echo   正在停止 Node.js 进程...
taskkill /F /IM node.exe >nul 2>nul
timeout /t 3 /nobreak >nul
:: 再次检查确保清理完成
taskkill /F /IM node.exe >nul 2>nul
timeout /t 2 /nobreak >nul
echo   ✓ 已清理旧进程

:: 启动服务端
echo.
echo [6/6] 启动游戏服务...
echo.
echo ========================================
echo 正在启动服务端...
echo ========================================
echo.

:: 创建启动日志
echo 呼噜大陆启动日志 > startup.log
echo 启动时间：%date% %time% >> startup.log
echo. >> startup.log

:: 在后台启动服务端
start "呼噜大陆 - 服务端" cmd /k "cd /d %cd%\server && echo 服务端启动中... && npm run dev >> ..\startup.log 2>&1"

:: 等待服务端启动
echo 等待服务端启动（5 秒）...
timeout /t 5 /nobreak >nul

:: 启动客户端
echo.
echo ========================================
echo 正在启动客户端...
echo ========================================
echo.

:: 在后台启动客户端
start "呼噜大陆 - 客户端" cmd /k "cd /d %cd%\client && echo 客户端启动中... && npm run dev >> ..\startup.log 2>&1"

:: 等待客户端启动
echo 等待客户端启动（10 秒）...
timeout /t 10 /nobreak >nul

:: 打开浏览器
echo.
echo ========================================
echo 打开游戏页面...
echo ========================================
echo.

:: 使用默认浏览器打开
start http://localhost:3001

echo.
echo ========================================
echo ✓ 启动完成！
echo ========================================
echo.
echo 游戏已在默认浏览器中打开
echo 地址：http://localhost:3001
echo.
echo 服务端控制台：呼噜大陆 - 服务端 窗口
echo 客户端控制台：呼噜大陆 - 客户端 窗口
echo.
echo 日志文件：startup.log
echo.
echo ========================================
echo 提示：
echo - 关闭游戏时，请关闭两个控制台窗口
echo - 下次运行会自动拉取最新代码
echo - 如遇问题，请查看 startup.log
echo ========================================
echo.

:: 写入日志
echo 启动完成 >> startup.log

:: 保持窗口打开
pause
