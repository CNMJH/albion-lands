@echo off
title Hulu Lands Launcher
color 0B

echo.
echo ========================================
echo       Hulu Lands Launcher
echo ========================================
echo.

:: Step 1: Check directory
echo Step 1: Checking directory...
cd /d "%~dp0"
echo Current directory: %CD%
pause

:: Step 2: Check project files
echo.
echo Step 2: Checking project files...
if exist "server\package.json" (
    echo [OK] server\package.json found
) else (
    echo [ERROR] server\package.json NOT found!
    pause
    exit /b 1
)

if exist "client\package.json" (
    echo [OK] client\package.json found
) else (
    echo [ERROR] client\package.json NOT found!
    pause
    exit /b 1
)
pause

:: Step 3: Check Git
echo.
echo Step 3: Checking Git...
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git not found!
    echo Please install from https://git-scm.com/download/win
    pause
    exit /b 1
)
echo [OK] Git found
pause

:: Step 4: Check Node.js
echo.
echo Step 4: Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found
pause

:: Step 5: Check npm
echo.
echo Step 5: Checking npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
echo [OK] npm found
pause

:: Step 6: Create .env if needed
echo.
echo Step 6: Checking .env file...
if not exist "server\.env" (
    echo Creating .env...
    copy server\.env.example server\.env
) else (
    echo [OK] .env exists
)
pause

:: Step 7: Kill old processes
echo.
echo Step 7: Stopping old processes...
taskkill /F /IM node.exe >nul 2>nul
echo Done
pause

:: Step 8: Git pull
echo.
echo Step 8: Updating code (git pull)...
git pull origin main
echo Done
pause

:: Step 9: Install server deps
echo.
echo Step 9: Checking server dependencies...
if not exist "server\node_modules" (
    echo Installing... (this may take minutes)
    cd server
    call npm install
    cd ..
) else (
    echo [OK] Already installed
)
pause

:: Step 10: Install client deps
echo.
echo Step 10: Checking client dependencies...
if not exist "client\node_modules" (
    echo Installing... (this may take minutes)
    cd client
    call npm install
    cd ..
) else (
    echo [OK] Already installed
)
pause

:: Step 11: Start server
echo.
echo ========================================
echo Step 11: Starting Server...
echo ========================================
start "Hulu Lands - Server" cmd /k "cd /d %CD%\server && npm run dev"
echo Server starting...
pause

:: Step 12: Start client
echo.
echo ========================================
echo Step 12: Starting Client...
echo ========================================
start "Hulu Lands - Client" cmd /k "cd /d %CD%\client && npm run dev"
echo Client starting...
pause

:: Step 13: Open browser
echo.
echo Step 13: Opening browser...
start http://localhost:3001

:: Done
echo.
echo ========================================
echo          Launch Complete!
echo ========================================
echo.
echo Game URL: http://localhost:3001
echo.
echo To stop the game, close the two console windows
echo.
pause
echo.
echo Goodbye!
pause
