@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ========================================
:: Hulu Lands Launcher
:: ========================================

title Hulu Lands Launcher
color 0A

echo.
echo ========================================
echo          Hulu Lands Launcher
echo ========================================
echo.

:: Get script directory
cd /d "%~dp0"

:: Check Git
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git not found. Please install Git first.
    echo Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Checking environment...
echo   OK - Git installed
echo   OK - Node.js installed
echo.

:: Check if first run
if not exist "server" (
    echo [INFO] First run, cloning project...
    cd ..
    if not exist "albion-lands" (
        git clone https://github.com/CNMJH/albion-lands.git
        if errorlevel 1 (
            echo [ERROR] Clone failed
            pause
            exit /b 1
        )
    )
    cd albion-lands
    echo [INFO] Project cloned, pulling latest code...
) else (
    echo [INFO] Project exists, pulling latest code...
)

:: Pull latest code
echo.
echo [1/6] Pulling latest code from GitHub...
git pull origin main
if errorlevel 1 (
    echo [WARN] Git pull failed, continuing with local code
)

:: Check server config
echo.
echo [2/6] Checking server configuration...
if not exist "server\.env" (
    echo   Creating server .env file...
    copy server\.env.example server\.env >nul
    echo   OK - .env created
) else (
    echo   OK - .env exists
)

:: Check server dependencies
echo.
echo [3/6] Checking server dependencies...
if not exist "server\node_modules" (
    echo   Installing server dependencies (first run may take minutes)...
    cd server
    call npm install
    if errorlevel 1 (
        echo [ERROR] Server dependencies installation failed
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo   OK - Server dependencies installed
) else (
    echo   OK - Server dependencies installed
)

:: Check client dependencies
echo.
echo [4/6] Checking client dependencies...
if not exist "client\node_modules" (
    echo   Installing client dependencies (first run may take minutes)...
    cd client
    call npm install
    if errorlevel 1 (
        echo [ERROR] Client dependencies installation failed
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo   OK - Client dependencies installed
) else (
    echo   OK - Client dependencies installed
)

:: Kill old processes
echo.
echo [5/6] Cleaning old processes...
echo   Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>nul
timeout /t 3 /nobreak >nul
taskkill /F /IM node.exe >nul 2>nul
timeout /t 2 /nobreak >nul
echo   OK - Old processes cleaned

:: Start server
echo.
echo [6/6] Starting game services...
echo.
echo ========================================
echo Starting server...
echo ========================================
echo.

:: Generate unique log filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set logfile=logs\server-%datetime:~0,8%-%datetime:~8,6%.log

:: Create logs directory
if not exist "logs" mkdir logs

:: Start server in new window
start "Hulu Lands - Server" cmd /k "cd /d %cd%\server && echo Server starting... && npm run dev"

:: Wait for server
echo Waiting for server to start (5 seconds)...
timeout /t 5 /nobreak >nul

:: Start client
echo.
echo ========================================
echo Starting client...
echo ========================================
echo.

:: Start client in new window
start "Hulu Lands - Client" cmd /k "cd /d %cd%\client && echo Client starting... && npm run dev"

:: Wait for client
echo Waiting for client to start (10 seconds)...
timeout /t 10 /nobreak >nul

:: Open browser
echo.
echo ========================================
echo Opening game page...
echo ========================================
echo.

:: Open browser
start http://localhost:3001

echo.
echo ========================================
echo OK - Launch complete!
echo ========================================
echo.
echo Game opened in default browser
echo Address: http://localhost:3001
echo.
echo Server console: Hulu Lands - Server window
echo Client console: Hulu Lands - Client window
echo.
echo Log directory: logs\
echo.
echo ========================================
echo Tips:
echo - Close game by closing both console windows
echo - Next run will auto-update code
echo - Check logs folder for issues
echo ========================================
echo.

pause
