@echo off
title Hulu Lands - Quick Start
color 0A

echo.
echo ========================================
echo     Hulu Lands - Quick Start
echo ========================================
echo.

REM Kill old processes
echo [1/4] Stopping old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo   OK: Processes stopped
echo.

REM Start server
echo [2/4] Starting server...
start "Hulu Lands Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 2 /nobreak >nul
echo   OK: Server starting
echo.

REM Start client
echo [3/4] Starting client...
start "Hulu Lands Client" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 2 /nobreak >nul
echo   OK: Client starting
echo.

REM Open browser
echo [4/4] Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3001
echo   OK: Browser opened
echo.

echo ========================================
echo        Start Complete!
echo ========================================
echo.
echo Game URL: http://localhost:3001
echo.
echo Test Account:
echo   Email: test1@example.com
echo   Password: password123
echo.
echo Controls:
echo   Right Click - Move/Attack
echo   WASD - Move
echo   QWERAS - Skills
echo   B - Backpack
echo   C - Equipment
echo   E - Pick up
echo   F10 - Shortcuts
echo   Escape - Close UI
echo.
echo Press any key to exit...
pause >nul
