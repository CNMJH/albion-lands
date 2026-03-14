@echo off
title Hulu Lands - Quick Install
chcp 65001 >nul
color 0A

echo.
echo ========================================
echo   Hulu Lands - Quick Install
echo ========================================
echo.

echo Checking requirements...
echo.

REM Simple check
node --version >nul 2>&1
if %errorlevel% neq 0 goto :no_node

npm --version >nul 2>&1
if %errorlevel% neq 0 goto :no_npm

echo [OK] Node.js installed
echo [OK] npm installed
echo.

echo Checking folders...
if not exist "server" goto :no_server
if not exist "client" goto :no_client

echo [OK] Project folders found
echo.

echo Installing dependencies...
echo.

echo [1/2] Server...
cd server
if not exist "node_modules" (
    call npm install
) else (
    echo Already installed
)
cd ..

echo [2/2] Client...
cd client
if not exist "node_modules" (
    call npm install
) else (
    echo Already installed
)
cd ..

echo.
echo Initializing database...
cd server
if not exist "prisma\dev.db" (
    call npx prisma db push
) else (
    echo Database exists
)
cd ..

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Run: start.bat
echo.
pause
exit /b 0

:no_node
echo [ERROR] Node.js not found!
echo Install from: https://nodejs.org/
pause
exit /b 1

:no_npm
echo [ERROR] npm not found!
echo Reinstall Node.js
pause
exit /b 1

:no_server
echo [ERROR] server folder not found!
echo Run this in the game directory
pause
exit /b 1

:no_client
echo [ERROR] client folder not found!
pause
exit /b 1
