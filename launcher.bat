@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

title Hulu Lands Launcher
color 0B

echo.
echo ========================================
echo       Hulu Lands Launcher
echo              v2.2
echo ========================================
echo.

:: Get script directory
cd /d "%~dp0"
set "SCRIPT_DIR=%CD%"

:: Simple log filename (no wmic)
set "LOGFILE=logs\launcher.log"
if not exist "logs" mkdir logs

echo Started: %date% %time% > "%LOGFILE%"

:: Check context
echo Checking project...
if exist "server\package.json" if exist "client\package.json" (
    echo [OK] Project found
    set "PROJECT_DIR=%CD%"
) else (
    echo [ERROR] Project not found!
    echo.
    echo Please run this from the albion-lands directory
    echo.
    pause
    exit /b 1
)

:: Check Git
echo.
echo Checking Git...
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git not found!
    echo Please install from https://git-scm.com/download/win
    pause
    exit /b 1
)
echo [OK] Git found

:: Check Node.js
echo.
echo Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Check npm
echo.
echo Checking npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
echo [OK] npm found

:: Check .env
echo.
echo Checking configuration...
if not exist "server\.env" (
    echo [INFO] Creating .env file...
    if exist "server\.env.example" (
        copy server\.env.example server\.env >nul
        echo [OK] .env created
    )
) else (
    echo [OK] .env exists
)

:: Kill old processes
echo.
echo Stopping old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Processes stopped

:: Git pull
echo.
echo Updating code...
git pull origin main
if errorlevel 1 (
    echo [WARN] Git pull failed, continuing with local code
) else (
    echo [OK] Code updated
)

:: Install server deps
echo.
echo Checking server dependencies...
if not exist "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    call npm install --prefer-offline
    if errorlevel 1 (
        echo [ERROR] Server install failed!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Server dependencies installed
) else (
    echo [OK] Server dependencies OK
)

:: Install client deps
echo.
echo Checking client dependencies...
if not exist "client\node_modules" (
    echo [INFO] Installing client dependencies...
    cd client
    call npm install --prefer-offline
    if errorlevel 1 (
        echo [ERROR] Client install failed!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Client dependencies installed
) else (
    echo [OK] Client dependencies OK
)

:: Start server
echo.
echo ========================================
echo Starting Server...
echo ========================================
start "Hulu Lands - Server" cmd /k "cd /d %PROJECT_DIR%\server && echo Server starting... && npm run dev"
echo Waiting for server...
timeout /t 5 /nobreak >nul

:: Start client
echo.
echo ========================================
echo Starting Client...
echo ========================================
start "Hulu Lands - Client" cmd /k "cd /d %PROJECT_DIR%\client && echo Client starting... && npm run dev"
echo Waiting for client...
timeout /t 10 /nobreak >nul

:: Open browser
echo.
echo Opening browser...
start http://localhost:3001

echo.
echo ========================================
echo          Launch Complete!
echo ========================================
echo.
echo Game URL: http://localhost:3001
echo.
echo Close the two console windows to stop the game
echo.
pause
