@echo off
chcp 65001 >nul

:: 创建桌面快捷方式
echo 正在创建桌面快捷方式...

:: 获取脚本所在目录
set SCRIPT_DIR=%~dp0

:: 创建批处理版本快捷方式
set SHORTCUT_PATH=%USERPROFILE%\Desktop\呼噜大陆启动器.lnk

:: 使用 PowerShell 创建快捷方式
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_DIR%launcher.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = 'shell32.dll,13'; $Shortcut.Description = '呼噜大陆 - 一键启动游戏'; $Shortcut.Save()"

if errorlevel 1 (
    echo 快捷方式创建失败，请手动创建
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ 桌面快捷方式已创建！
echo ========================================
echo.
echo 位置：%USERPROFILE%\Desktop\呼噜大陆启动器.lnk
echo.
echo 下次只需双击桌面上的快捷方式即可启动游戏
echo ========================================
echo.
pause
