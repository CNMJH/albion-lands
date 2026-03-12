@echo off
chcp 65001 >nul

:: Create desktop shortcut
echo Creating desktop shortcut...

:: Get script directory
set SCRIPT_DIR=%~dp0

:: Create shortcut path
set SHORTCUT_PATH=%USERPROFILE%\Desktop\HuluLands.lnk

:: Use PowerShell to create shortcut
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_DIR%launcher.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = 'shell32.dll,13'; $Shortcut.Description = 'Hulu Lands Smart Launcher v2.0'; $Shortcut.Save()"

if errorlevel 1 (
    echo [ERROR] Shortcut creation failed
    echo.
    echo Manual creation steps:
    echo   1. Right-click on desktop
    echo   2. New ^> Shortcut
    echo   3. Browse to: %SCRIPT_DIR%launcher.bat
    echo   4. Name it: Hulu Lands
    pause
    exit /b 1
)

echo.
echo ========================================
echo [OK] Desktop shortcut created!
echo ========================================
echo.
echo Location: %USERPROFILE%\Desktop\HuluLands.lnk
echo.
echo Double-click the shortcut to start the game
echo ========================================
echo.

pause
