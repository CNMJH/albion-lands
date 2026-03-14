# Hulu Lands - PowerShell Installer
# Run in PowerShell: .\install.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hulu Lands - PowerShell Installer"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Found: $nodeVersion" -ForegroundColor Green
    Write-Host "  OK: Node.js installed" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host ""

# Check npm
Write-Host "[2/6] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  Found: $npmVersion" -ForegroundColor Green
    Write-Host "  OK: npm installed" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: npm not found!" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# Check directories
Write-Host "[3/6] Checking project directory..." -ForegroundColor Yellow
if (-not (Test-Path "server")) {
    Write-Host "  ERROR: server folder not found!" -ForegroundColor Red
    pause
    exit 1
}
if (-not (Test-Path "client")) {
    Write-Host "  ERROR: client folder not found!" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "  OK: Project directory correct" -ForegroundColor Green
Write-Host ""

# Install server dependencies
Write-Host "[4/6] Installing server dependencies..." -ForegroundColor Yellow
Write-Host "  This may take 3-5 minutes..." -ForegroundColor Gray
Set-Location server
if (Test-Path "node_modules") {
    Write-Host "  Already installed, skipping" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Installation failed!" -ForegroundColor Red
        pause
        exit 1
    }
}
Set-Location ..
Write-Host "  OK: Server ready" -ForegroundColor Green
Write-Host ""

# Install client dependencies
Write-Host "[5/6] Installing client dependencies..." -ForegroundColor Yellow
Write-Host "  This may take 3-5 minutes..." -ForegroundColor Gray
Set-Location client
if (Test-Path "node_modules") {
    Write-Host "  Already installed, skipping" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Installation failed!" -ForegroundColor Red
        pause
        exit 1
    }
}
Set-Location ..
Write-Host "  OK: Client ready" -ForegroundColor Green
Write-Host ""

# Initialize database
Write-Host "[6/6] Initializing database..." -ForegroundColor Yellow
Set-Location server
if (Test-Path "prisma\dev.db") {
    Write-Host "  Database exists, skipping" -ForegroundColor Green
} else {
    Write-Host "  Creating database..." -ForegroundColor Yellow
    npx prisma db push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Database init failed!" -ForegroundColor Red
        pause
        exit 1
    }
}
Set-Location ..
Write-Host "  OK: Database ready" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: .\start.bat" -ForegroundColor White
Write-Host "  2. Or: .\launcher.bat" -ForegroundColor White
Write-Host ""
Write-Host "Game URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
pause
