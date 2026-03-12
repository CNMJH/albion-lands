@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ========================================
:: Hulu Lands Smart Launcher v2.0
:: ========================================

title Hulu Lands Smart Launcher
color 0B

:: Configuration
set "SERVER_PORT=3002"
set "CLIENT_PORT=3001"
set "MAX_RETRIES=3"

:: Get script directory
cd /d "%~dp0"
set "SCRIPT_DIR=%CD%"

:: Generate log filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "LOGFILE=logs\launcher-%datetime:~0,8%-%datetime:~8,6%.log"
if not exist "logs" mkdir logs

:: Start logging
echo ======================================== > "%LOGFILE%"
echo Hulu Lands Launcher Log >> "%LOGFILE%"
echo Started: %date% %time% >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo. >> "%LOGFILE%"

goto :check_context

:: ========================================
:: Helper Functions
:: ========================================

:log
echo %~1
echo %~1 >> "%LOGFILE%"
goto :eof

:log_error
echo [ERROR] %~1
echo [ERROR] %~1 >> "%LOGFILE%"
goto :eof

:log_success
echo [OK] %~1
echo [OK] %~1 >> "%LOGFILE%"
goto :eof

:log_warn
echo [WARN] %~1
echo [WARN] %~1 >> "%LOGFILE%"
goto :eof

:wait
timeout /t %~1 /nobreak >nul
goto :eof

:: ========================================
:: Context Detection
:: ========================================

:check_context
echo.
echo ========================================
echo       Hulu Lands Smart Launcher
echo              v2.0
echo ========================================
echo.

call :log "Detecting run context..."

:: Check if running from project root
if exist "server\package.json" if exist "client\package.json" (
    call :log "Context: Project root directory"
    set "PROJECT_DIR=%CD%"
    goto :check_admin
)

:: Check if running from albion-lands subdirectory
if exist "albion-lands\server\package.json" (
    call :log "Context: Parent directory, entering albion-lands"
    cd albion-lands
    set "PROJECT_DIR=%CD%"
    goto :check_admin
)

:: Check if running from subdirectory within project
if exist "..\server\package.json" (
    call :log "Context: Project subdirectory, going to root"
    cd ..
    set "PROJECT_DIR=%CD%"
    goto :check_admin
)

:: No project found - offer to clone
call :log "Context: Project not found"
echo [INFO] Project not found in current directory
echo.
echo What would you like to do?
echo   1) Clone project from GitHub
echo   2) Browse to project directory
echo   3) Exit
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto :clone_project
if "%choice%"=="2" (
    explorer "%USERPROFILE%"
    exit /b
)
exit /b

:clone_project
call :log "Cloning project from GitHub..."
echo.
echo Cloning repository...
git clone https://github.com/CNMJH/albion-lands.git
if errorlevel 1 (
    call :log_error "Failed to clone repository"
    echo [ERROR] Clone failed. Check your internet connection.
    pause
    exit /b 1
)
cd albion-lands
set "PROJECT_DIR=%CD%"
call :log_success "Project cloned successfully"
goto :check_admin

:: ========================================
:: Permission Check
:: ========================================

:check_admin
echo.
call :log "Checking administrator privileges..."
net session >nul 2>&1
if %errorlevel% equ 0 (
    call :log_success "Running as administrator"
    goto :check_requirements
)

call :log_warn "Not running as administrator"
echo [WARN] Not running as administrator
echo.
echo Some features may not work without admin rights:
echo   - Stopping all Node processes
echo   - Binding to ports
echo.
echo Would you like to restart as administrator?
set /p restart_admin="Restart now? (Y/N): "

if /i "%restart_admin%"=="Y" (
    echo Restarting as administrator...
    powershell -Command "Start-Process cmd -ArgumentList '/c', 'cd /d \"%SCRIPT_DIR%\" ^&^& \"%~f0\"' -Verb RunAs"
    exit /b
)

call :log_warn "Continuing without admin rights"
goto :check_requirements

:: ========================================
:: System Requirements Check
:: ========================================

:check_requirements
echo.
call :log "Checking system requirements..."

:: Check Git
call :log "Checking Git..."
where git >nul 2>nul
if errorlevel 1 (
    call :log_error "Git not found"
    echo [ERROR] Git is not installed or not in PATH
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
call :log_success "Git found: !GIT_VERSION!"

:: Check Node.js
call :log "Checking Node.js..."
where node >nul 2>nul
if errorlevel 1 (
    call :log_error "Node.js not found"
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js (v18+) from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
call :log_success "Node.js found: !NODE_VERSION!"

:: Check npm
call :log "Checking npm..."
where npm >nul 2>nul
if errorlevel 1 (
    call :log_error "npm not found"
    echo [ERROR] npm is not installed
    echo.
    echo Please reinstall Node.js
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
call :log_success "npm found: !NPM_VERSION!"

goto :check_config

:: ========================================
:: Configuration Check
:: ========================================

:check_config
echo.
call :log "Checking configuration files..."

:: Check .env file
if not exist "server\.env" (
    call :log_warn "server\.env not found, creating from example"
    echo [WARN] server\.env not found
    if exist "server\.env.example" (
        copy server\.env.example server\.env >nul
        call :log_success "Created server\.env from example"
    ) else (
        call :log_error "server\.env.example not found"
        echo [ERROR] Cannot find server\.env.example
        pause
        exit /b 1
    )
) else (
    call :log_success "server\.env exists"
)

goto :check_ports

:: ========================================
:: Port Check
:: ========================================

:check_ports
echo.
call :log "Checking port availability..."

:: Check server port
netstat -ano | findstr ":%SERVER_PORT%" | findstr "LISTENING" >nul
if not errorlevel 1 (
    call :log_warn "Port %SERVER_PORT% is in use"
    echo [WARN] Port %SERVER_PORT% is already in use
    echo.
    echo Options:
    echo   1) Kill process using port %SERVER_PORT%
    echo   2) Exit
    echo.
    set /p port_choice="Enter choice (1-2): "
    
    if "!port_choice!"=="1" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%SERVER_PORT%" ^| findstr "LISTENING"') do (
            set "PID=%%a"
        )
        echo Killing process !PID!...
        taskkill /F /PID !PID! >nul 2>&1
        if errorlevel 1 (
            call :log_error "Failed to kill process !PID!"
            echo [ERROR] Failed to kill process. Run as administrator.
            pause
            exit /b 1
        )
        call :log_success "Killed process !PID!"
    )
    if "!port_choice!"=="2" exit /b
)

:: Check client port
netstat -ano | findstr ":%CLIENT_PORT%" | findstr "LISTENING" >nul
if not errorlevel 1 (
    call :log_warn "Port %CLIENT_PORT% is in use"
    echo [WARN] Port %CLIENT_PORT% is already in use
    echo.
    set /p kill_client="Kill process using port %CLIENT_PORT%? (Y/N): "
    if /i "!kill_client!"=="Y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%CLIENT_PORT%" ^| findstr "LISTENING"') do (
            set "PID=%%a"
        )
        taskkill /F /PID !PID! >nul 2>&1
        call :log_success "Killed process !PID!"
    )
)

call :log_success "Ports available"
goto :cleanup_processes

:: ========================================
:: Process Cleanup
:: ========================================

:cleanup_processes
echo.
call :log "Cleaning up old processes..."

:: Method 1: taskkill by image name
call :log "Stopping node.exe processes (method 1)..."
taskkill /F /IM node.exe >nul 2>&1
if not errorlevel 1 (
    call :log_success "Killed node.exe processes"
)

:: Wait and check again
call :wait 2

:: Method 2: Kill by process info
call :log "Stopping node.exe processes (method 2)..."
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV ^| findstr "node"') do (
    set "NODE_PID=%%a"
    set "NODE_PID=!NODE_PID:"=!"
    taskkill /F /PID !NODE_PID! >nul 2>&1
)

:: Wait for ports to be released
call :log "Waiting for ports to be released..."
call :wait 3

call :log_success "All processes cleaned up"
goto :git_pull

:: ========================================
:: Git Pull
:: ========================================

:git_pull
echo.
call :log "Pulling latest code from GitHub..."

:: Check if git repository
if not exist ".git" (
    call :log_error "Not a git repository"
    echo [ERROR] Not a git repository
    goto :install_deps
)

:: Try to pull with retry
set "RETRY=0"
:pull_retry
git pull origin main
if errorlevel 1 (
    set /a RETRY+=1
    if !RETRY! LSS %MAX_RETRIES% (
        call :log_warn "Git pull failed (attempt !RETRY!/%MAX_RETRIES%)"
        echo [WARN] Git pull failed, retrying (!RETRY!/%MAX_RETRIES%)...
        call :wait 2
        goto :pull_retry
    ) else (
        call :log_error "Git pull failed after %MAX_RETRIES% attempts"
        echo [ERROR] Git pull failed after %MAX_RETRIES% attempts
        echo [WARN] Continuing with local code
    )
) else (
    call :log_success "Code updated successfully"
)

goto :install_deps

:: ========================================
:: Dependency Installation
:: ========================================

:install_deps
echo.
call :log "Checking dependencies..."

:: Server dependencies
if not exist "server\node_modules" (
    call :log "Installing server dependencies..."
    echo [INFO] Installing server dependencies (first run may take minutes)...
    cd server
    set "RETRY=0"
    :server_install_retry
    call npm install --prefer-offline
    if errorlevel 1 (
        set /a RETRY+=1
        if !RETRY! LSS %MAX_RETRIES% (
            call :log_warn "Server npm install failed (attempt !RETRY!)"
            echo [WARN] Retrying... (!RETRY!/%MAX_RETRIES%)
            call :wait 2
            goto :server_install_retry
        )
        call :log_error "Server dependencies installation failed"
        echo [ERROR] Failed to install server dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    call :log_success "Server dependencies installed"
) else (
    call :log_success "Server dependencies already installed"
)

:: Client dependencies
if not exist "client\node_modules" (
    call :log "Installing client dependencies..."
    echo [INFO] Installing client dependencies (first run may take minutes)...
    cd client
    set "RETRY=0"
    :client_install_retry
    call npm install --prefer-offline
    if errorlevel 1 (
        set /a RETRY+=1
        if !RETRY! LSS %MAX_RETRIES% (
            call :log_warn "Client npm install failed (attempt !RETRY!)"
            echo [WARN] Retrying... (!RETRY!/%MAX_RETRIES%)
            call :wait 2
            goto :client_install_retry
        )
        call :log_error "Client dependencies installation failed"
        echo [ERROR] Failed to install client dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    call :log_success "Client dependencies installed"
) else (
    call :log_success "Client dependencies already installed"
)

goto :start_services

:: ========================================
:: Start Services
:: ========================================

:start_services
echo.
call :log "Starting game services..."

:: Start server
echo ========================================
echo Starting Server...
echo ========================================
call :log "Starting server on port %SERVER_PORT%..."

start "Hulu Lands - Server" cmd /k "cd /d %PROJECT_DIR%\server && title Hulu Lands Server && color 0A && echo Server starting... && echo Port: %SERVER_PORT% && echo. && npm run dev"

:: Wait for server to start
call :log "Waiting for server to initialize..."
echo Waiting for server (5 seconds)...
call :wait 5

:: Check if server started
netstat -ano | findstr ":%SERVER_PORT%" | findstr "LISTENING" >nul
if errorlevel 1 (
    call :log_warn "Server may not have started properly"
    echo [WARN] Server may not have started on port %SERVER_PORT%
    echo [WARN] Check server window for errors
) else (
    call :log_success "Server started on port %SERVER_PORT%"
)

:: Start client
echo.
echo ========================================
echo Starting Client...
echo ========================================
call :log "Starting client on port %CLIENT_PORT%..."

start "Hulu Lands - Client" cmd /k "cd /d %PROJECT_DIR%\client && title Hulu Lands Client && color 0B && echo Client starting... && echo Port: %CLIENT_PORT% && echo. && npm run dev"

:: Wait for client to start
call :log "Waiting for client to initialize..."
echo Waiting for client (10 seconds)...
call :wait 10

:: Check if client started
netstat -ano | findstr ":%CLIENT_PORT%" | findstr "LISTENING" >nul
if errorlevel 1 (
    call :log_warn "Client may not have started properly"
    echo [WARN] Client may not have started on port %CLIENT_PORT%
    echo [WARN] Check client window for errors
) else (
    call :log_success "Client started on port %CLIENT_PORT%"
)

goto :open_browser

:: ========================================
:: Open Browser
:: ========================================

:open_browser
echo.
call :log "Opening browser..."

:: Try to open default browser
start http://localhost:%CLIENT_PORT%
if errorlevel 1 (
    call :log_warn "Failed to open browser automatically"
    echo [WARN] Failed to open browser
    echo [INFO] Please open manually: http://localhost:%CLIENT_PORT%
) else (
    call :log_success "Browser opened"
)

goto :show_summary

:: ========================================
:: Show Summary
:: ========================================

:show_summary
echo.
echo ========================================
echo          Launch Complete!
echo ========================================
echo.
call :log "Launch completed successfully"

echo Game Information:
echo   Client URL: http://localhost:%CLIENT_PORT%
echo   Server Port: %SERVER_PORT%
echo.
echo Windows:
echo   - Server: "Hulu Lands - Server"
echo   - Client: "Hulu Lands - Client"
echo.
echo Logs:
echo   - %LOGFILE%
echo   - logs\server-*.log
echo   - logs\client-*.log
echo.
echo ========================================
echo Tips:
echo   - Close game by closing both windows
echo   - Next run will auto-update code
echo   - Check logs folder for issues
echo ========================================
echo.

:: Write summary to log
echo. >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo Launch Completed >> "%LOGFILE%"
echo Client URL: http://localhost:%CLIENT_PORT% >> "%LOGFILE%"
echo Server Port: %SERVER_PORT% >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"

:: Offer to create desktop shortcut
if not exist "%USERPROFILE%\Desktop\HuluLands.lnk" (
    set /p create_shortcut="Create desktop shortcut? (Y/N): "
    if /i "!create_shortcut!"=="Y" (
        goto :create_shortcut
    )
)

goto :end

:: ========================================
:: Create Desktop Shortcut
:: ========================================

:create_shortcut
echo.
call :log "Creating desktop shortcut..."

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\HuluLands.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%\launcher.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = 'shell32.dll,13'; $Shortcut.Description = 'Hulu Lands Smart Launcher'; $Shortcut.Save()"

if errorlevel 1 (
    call :log_warn "Failed to create desktop shortcut"
    echo [WARN] Failed to create shortcut
) else (
    call :log_success "Desktop shortcut created"
    echo [OK] Desktop shortcut created: %USERPROFILE%\Desktop\HuluLands.lnk
)

goto :end

:: ========================================
:: End
:: ========================================

:end
echo.
echo Log file: %LOGFILE%
echo.
pause
exit /b 0
