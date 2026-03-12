# ========================================
# 呼噜大陆 - PowerShell 一键启动器
# ========================================
# 功能：
# 1. 从 GitHub 拉取最新代码
# 2. 检查和安装依赖
# 3. 创建配置文件
# 4. 启动服务端和客户端
# 5. 自动打开浏览器
# 6. 进程管理和日志
# ========================================

# 设置编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色配置
$ColorInfo = "Cyan"
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"

function Write-Color {
    param($Text, $Color)
    Write-Host $Text -ForegroundColor $Color
}

function Write-Step {
    param($Step, $Text)
    Write-Color "`n[$Step] $Text" $ColorInfo
}

function Write-Success {
    param($Text)
    Write-Color "  ✓ $Text" $ColorSuccess
}

function Write-Error-Custom {
    param($Text)
    Write-Color "  ✗ $Text" $ColorError
}

# 标题
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "       呼噜大陆 - 一键启动器" -ForegroundColor Cyan
Write-Host "       Hulu Lands Launcher" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 获取脚本所在目录
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptPath

# 检查 Git
Write-Step "0" "检查运行环境..."
try {
    $gitVersion = git --version 2>&1
    Write-Success "Git 已安装 ($gitVersion)"
} catch {
    Write-Error-Custom "未检测到 Git"
    Write-Host "  下载地址：https://git-scm.com/download/win" -ForegroundColor Yellow
    pause
    exit 1
}

# 检查 Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Success "Node.js 已安装 ($nodeVersion)"
} catch {
    Write-Error-Custom "未检测到 Node.js"
    Write-Host "  下载地址：https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

# 检查 npm
try {
    $npmVersion = npm --version 2>&1
    Write-Success "npm 已安装 (v$npmVersion)"
} catch {
    Write-Error-Custom "未检测到 npm"
    pause
    exit 1
}

# 检查项目是否存在
$ProjectPath = Join-Path $ScriptPath "albion-lands"
if (!(Test-Path $ProjectPath)) {
    Write-Step "1" "首次运行，正在克隆项目..."
    git clone https://github.com/CNMJH/albion-lands.git $ProjectPath
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "克隆项目失败"
        pause
        exit 1
    }
    Write-Success "项目克隆完成"
} else {
    Write-Step "1" "拉取最新代码..."
    Set-Location $ProjectPath
    git pull origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Color "  ⚠ Git 拉取失败，继续使用本地代码" $ColorWarning
    } else {
        Write-Success "代码已更新到最新版本"
    }
}

Set-Location $ProjectPath

# 创建日志目录
$LogsDir = Join-Path $ProjectPath "logs"
if (!(Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

# 检查服务端配置
Write-Step "2" "检查服务端配置..."
$ServerEnvPath = Join-Path $ProjectPath "server\.env"
if (!(Test-Path $ServerEnvPath)) {
    Copy-Item "server\.env.example" $ServerEnvPath
    Write-Success ".env 文件已创建"
} else {
    Write-Success ".env 文件已存在"
}

# 检查服务端依赖
Write-Step "3" "检查服务端依赖..."
$ServerNodeModules = Join-Path $ProjectPath "server\node_modules"
if (!(Test-Path $ServerNodeModules)) {
    Write-Host "  正在安装服务端依赖（首次运行可能需要几分钟）..." -ForegroundColor Gray
    Set-Location "server"
    npm install 2>&1 | Tee-Object -FilePath "..\logs\server-install.log"
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "服务端依赖安装失败"
        Set-Location $ProjectPath
        pause
        exit 1
    }
    Set-Location $ProjectPath
    Write-Success "服务端依赖安装完成"
} else {
    Write-Success "服务端依赖已安装"
}

# 检查客户端依赖
Write-Step "4" "检查客户端依赖..."
$ClientNodeModules = Join-Path $ProjectPath "client\node_modules"
if (!(Test-Path $ClientNodeModules)) {
    Write-Host "  正在安装客户端依赖（首次运行可能需要几分钟）..." -ForegroundColor Gray
    Set-Location "client"
    npm install 2>&1 | Tee-Object -FilePath "..\logs\client-install.log"
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "客户端依赖安装失败"
        Set-Location $ProjectPath
        pause
        exit 1
    }
    Set-Location $ProjectPath
    Write-Success "客户端依赖安装完成"
} else {
    Write-Success "客户端依赖已安装"
}

# 停止旧进程
Write-Step "5" "清理旧进程..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Success "已清理旧进程"

# 启动服务端
Write-Step "6" "启动游戏服务..."

Write-Host "`n  [服务端] 启动中..." -ForegroundColor Cyan
$ServerLogPath = Join-Path $LogsDir "server-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$ServerProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$ProjectPath\server'
    Write-Host '呼噜大陆服务端' -ForegroundColor Cyan
    Write-Host '===============' -ForegroundColor Cyan
    npm run dev
"@ -PassThru -WindowStyle Normal

# 等待服务端启动
Write-Host "  等待服务端启动（5 秒）..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# 启动客户端
Write-Host "`n  [客户端] 启动中..." -ForegroundColor Cyan
$ClientLogPath = Join-Path $LogsDir "client-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$ClientProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$ProjectPath\client'
    Write-Host '呼噜大陆客户端' -ForegroundColor Cyan
    Write-Host '===============' -ForegroundColor Cyan
    npm run dev
"@ -PassThru -WindowStyle Normal

# 等待客户端启动
Write-Host "  等待客户端启动（10 秒）..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# 打开浏览器
Write-Step "7" "打开游戏页面..."
Start-Process "http://localhost:3001"
Write-Success "浏览器已打开"

# 显示完成信息
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "       ✓ 启动完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "游戏地址：http://localhost:3001" -ForegroundColor Cyan
Write-Host "服务端控制台：呼噜大陆服务端 窗口" -ForegroundColor Gray
Write-Host "客户端控制台：呼噜大陆客户端 窗口" -ForegroundColor Gray
Write-Host "日志目录：$LogsDir" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "- 关闭游戏时，请关闭两个控制台窗口" -ForegroundColor Gray
Write-Host "- 下次运行会自动拉取最新代码" -ForegroundColor Gray
Write-Host "- 如遇问题，请查看日志目录" -ForegroundColor Gray
Write-Host "- 按任意键关闭此窗口" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Yellow

pause
