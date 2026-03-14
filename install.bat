@echo off
title Hulu Lands - Installer
chcp 65001 >nul

echo.
echo ========================================
echo   Hulu Lands - Installer
echo ========================================
echo.

REM Check Node.js - Method 1
echo [1/6] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version 2^>^&1') do set NODE_VER=%%i
echo Found: %NODE_VER%
echo OK: Node.js is installed
echo.

REM Check npm
echo [2/6] Checking npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm not found
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version 2^>^&1') do set NPM_VER=%%i
echo Found: %NPM_VER%
echo OK: npm is installed
echo.

REM Check project directory
echo [3/6] Checking project directory...
if not exist "server" (
    echo ERROR: server folder not found!
    echo Please run this script in the game directory
    pause
    exit /b 1
)
if not exist "client" (
    echo ERROR: client folder not found!
    pause
    exit /b 1
)
echo OK: Project directory is correct
echo.

REM Install server dependencies
echo [4/6] Installing server dependencies...
echo This may take 3-5 minutes...
cd server
if exist "node_modules" (
    echo Dependencies already exist, skipping
) else (
    echo Installing...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Server install failed!
        pause
        exit /b 1
    )
)
cd ..
echo OK: Server ready
echo.

REM Install client dependencies
echo [5/6] Installing client dependencies...
echo This may take 3-5 minutes...
cd client
if exist "node_modules" (
    echo Dependencies already exist, skipping
) else (
    echo Installing...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Client install failed!
        pause
        exit /b 1
    )
)
cd ..
echo OK: Client ready
echo.

REM Initialize database
echo [6/6] Initializing database...
cd server
if exist "prisma\dev.db" (
    echo Database exists, skipping
) else (
    echo Creating database...
    call npx prisma db push
    if %errorlevel% neq 0 (
        echo ERROR: Database init failed!
        pause
        exit /b 1
    )
)
cd ..
echo OK: Database ready
echo.

echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: start.bat
echo 2. Or run: launcher.bat
echo.
echo Game URL: http://localhost:3001
echo.
pause
