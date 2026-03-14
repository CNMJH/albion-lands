@echo off
REM ==========================================
REM Hulu Lands - Windows Installer
REM Version: v1.0
REM Last Update: 2026-03-14
REM ==========================================

echo.
echo ==========================================
echo   Hulu Lands - One Click Installer
echo ==========================================
echo.

REM Check Node.js
echo [1/6] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   ERROR: Node.js NOT found!
    echo ========================================
    echo.
    echo   Node.js is required to run this game.
    echo.
    echo   Installation steps:
    echo   1. Open browser
    echo   2. Go to https://nodejs.org/
    echo   3. Click "Download LTS" (green button)
    echo   4. Run the installer (node-vXX.XX.X-x64.msi)
    echo   5. Click Next - Next - Next - Install
    echo   6. After installation, run this script again
    echo.
    echo   IMPORTANT: After installing Node.js,
    echo   close this window and open a NEW CMD window!
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   Found: %NODE_VERSION%
echo   OK: Node.js is installed

REM Check npm
echo [2/6] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    echo.
    echo Please reinstall Node.js
    pause
    exit /b 1
)
echo OK: npm is installed

REM Check project directory
echo [3/6] Checking project directory...
if not exist "server" (
    echo ERROR: server folder not found!
    echo.
    echo Please run this script in the correct directory
    pause
    exit /b 1
)
if not exist "client" (
    echo ERROR: client folder not found!
    echo.
    echo Please run this script in the correct directory
    pause
    exit /b 1
)
echo OK: Project directory is correct

REM Install server dependencies
echo [4/6] Installing server dependencies...
echo This may take 3-5 minutes...
cd server
if exist "node_modules" (
    echo Dependencies already exist, skipping install
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Server dependencies install failed!
        pause
        exit /b 1
    )
)
cd ..
echo OK: Server dependencies installed

REM Install client dependencies
echo [5/6] Installing client dependencies...
echo This may take 3-5 minutes...
cd client
if exist "node_modules" (
    echo Dependencies already exist, skipping install
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Client dependencies install failed!
        pause
        exit /b 1
    )
)
cd ..
echo OK: Client dependencies installed

REM Initialize database
echo [6/6] Initializing database...
cd server
if exist "prisma\dev.db" (
    echo Database already exists, skipping initialization
) else (
    echo Creating database...
    call npx prisma db push
    if %errorlevel% neq 0 (
        echo ERROR: Database initialization failed!
        pause
        exit /b 1
    )
)
cd ..
echo OK: Database initialized

echo.
echo ==========================================
echo   Installation Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Run launcher.bat to start the game
echo 2. Or run force-restart.bat to restart all services
echo.
echo Game URL: http://localhost:3001
echo Server URL: http://localhost:3002
echo.
pause
