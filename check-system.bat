@echo off
title Hulu Lands - System Check
color 0A

echo.
echo ========================================
echo   Hulu Lands - System Check
echo ========================================
echo.

echo Checking system requirements...
echo.

REM Check Node.js
echo [1/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [FAILED] Node.js NOT found!
    echo.
    echo   Please install Node.js:
    echo   1. Visit https://nodejs.org/
    echo   2. Download LTS version (v18 or v20)
    echo   3. Double-click to install
    echo   4. Restart this script after installation
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo   [OK] Node.js %NODE_VERSION%
)

REM Check npm
echo [2/3] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [FAILED] npm NOT found!
    echo.
    echo   Please reinstall Node.js
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo   [OK] npm %NPM_VERSION%
)

REM Check Git
echo [3/3] Checking Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo   [WARNING] Git not found!
    echo   Git is optional (for updates)
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo   [OK] %GIT_VERSION%
)

echo.
echo ========================================
echo   System Check Complete!
echo ========================================
echo.
echo Your system is ready to install Hulu Lands!
echo.
echo Next step: Run install.bat
echo.
pause
