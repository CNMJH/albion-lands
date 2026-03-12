@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ========================================
:: Hulu Lands Launcher - DEBUG VERSION
:: ========================================
:: Use this to diagnose issues
:: ========================================

title Hulu Lands Launcher - DEBUG
color 0C

echo.
echo ========================================
echo    DEBUG MODE - Detailed Output
echo ========================================
echo.

:: Get script directory
cd /d "%~dp0"
set "SCRIPT_DIR=%CD%"

echo [DEBUG] Script directory: %SCRIPT_DIR%
echo.

:: Test 1: Check Git
echo [TEST 1] Checking Git...
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git NOT FOUND!
    echo.
    echo Please install Git from:
    echo https://git-scm.com/download/win
    pause
    exit /b 1
)
echo [OK] Git found in PATH
echo.

:: Test 2: Get Git version
echo [TEST 2] Getting Git version...
set "GIT_VER=unknown"
for /f "delims=" %%i in ('git --version 2^>^&1') do (
    echo [DEBUG] Git output: %%i
    if not defined GIT_VER set "GIT_VER=%%i"
)
echo [OK] Git version: !GIT_VER!
echo.

:: Test 3: Check Node.js
echo [TEST 3] Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js NOT FOUND!
    echo.
    echo Please install Node.js from:
    echo https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found in PATH
echo.

:: Test 4: Get Node.js version
echo [TEST 4] Getting Node.js version...
set "NODE_VER=unknown"
for /f "delims=" %%i in ('node --version 2^>^&1') do (
    echo [DEBUG] Node output: %%i
    if not defined NODE_VER set "NODE_VER=%%i"
)
echo [OK] Node.js version: !NODE_VER!
echo.

:: Test 5: Check npm
echo [TEST 5] Checking npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm NOT FOUND!
    echo.
    echo Please reinstall Node.js
    pause
    exit /b 1
)
echo [OK] npm found in PATH
echo.

:: Test 6: Get npm version
echo [TEST 6] Getting npm version...
set "NPM_VER=unknown"
for /f "delims=" %%i in ('npm --version 2^>^&1') do (
    echo [DEBUG] npm output: %%i
    if not defined NPM_VER set "NPM_VER=%%i"
)
echo [OK] npm version: !NPM_VER!
echo.

:: Test 7: Check project structure
echo [TEST 7] Checking project structure...
if exist "server\package.json" (
    echo [OK] server\package.json exists
) else (
    echo [WARN] server\package.json NOT found
)

if exist "client\package.json" (
    echo [OK] client\package.json exists
) else (
    echo [WARN] client\package.json NOT found
)

if exist "server\.env.example" (
    echo [OK] server\.env.example exists
) else (
    echo [WARN] server\.env.example NOT found
)
echo.

:: Test 8: Check admin rights
echo [TEST 8] Checking administrator rights...
net session >nul 2>&1
if errorlevel 1 (
    echo [WARN] NOT running as administrator
    echo [INFO] Some features may not work
) else (
    echo [OK] Running as administrator
)
echo.

:: Test 9: Check for running Node processes
echo [TEST 9] Checking for running Node processes...
tasklist /FI "IMAGENAME eq node.exe" | findstr "node" >nul
if errorlevel 1 (
    echo [OK] No Node.js processes running
) else (
    echo [WARN] Node.js processes detected
    tasklist /FI "IMAGENAME eq node.exe" | findstr "node"
)
echo.

:: Test 10: Check ports
echo [TEST 10] Checking ports...
netstat -ano | findstr ":3001" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [OK] Port 3001 is FREE
) else (
    echo [WARN] Port 3001 is IN USE
)

netstat -ano | findstr ":3002" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [OK] Port 3002 is FREE
) else (
    echo [WARN] Port 3002 is IN USE
)
echo.

:: Summary
echo ========================================
echo          DEBUG SUMMARY
echo ========================================
echo.
echo Git:      !GIT_VER!
echo Node.js:  !NODE_VER!
echo npm:      !NPM_VER!
echo.

if exist "server\package.json" if exist "client\package.json" (
    echo Project: FOUND
    echo.
    echo [INFO] All checks passed!
    echo [INFO] You can run launcher.bat now
) else (
    echo Project: NOT FOUND
    echo.
    echo [WARN] Project files missing
    echo [INFO] Run launcher.bat to clone from GitHub
)

echo.
echo ========================================
echo.
pause
