@echo off
title Hulu Lands - Force Restart
color 0C

echo.
echo ========================================
echo   Hulu Lands - Force Restart
echo ========================================
echo.

echo [1/5] Stopping all processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo   OK: Processes stopped
echo.

echo [2/5] Deleting Vite cache...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
    echo   OK: Vite cache deleted
)
if exist client\dist (
    rmdir /s /q client\dist
    echo   OK: Build directory deleted
)
echo.

echo [3/5] Deleting server cache...
if exist server\.tsx (
    rmdir /s /q server\.tsx
    echo   OK: TSX cache deleted
)
echo.

echo [4/5] Rebuilding...
cd client
call npm run build >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Build failed!
    pause
    exit /b 1
)
echo   OK: Build complete
cd ..
echo.

echo [5/5] Starting game...
start "Hulu Lands Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 2 /nobreak >nul
start "Hulu Lands Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo   Game Starting...
echo ========================================
echo.
echo Server: http://localhost:3002
echo Client: http://localhost:3001
echo.
echo Press any key to exit this window...
pause >nul
