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
    echo ERROR: Node.js not found!
    echo.
    echo Please install Node.js first:
    echo 1. Visit https://nodejs.org/
    echo 2. Download LTS version (v18 or v20)
    echo 3. Double click to install
    echo.
    pause
    exit /b 1
)
echo OK: Node.js is installed

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
