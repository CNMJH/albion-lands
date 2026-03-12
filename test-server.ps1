# 测试服务端是否正常
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Hulu Lands Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: HTTP Health Check
Write-Host "[Test 1] Checking HTTP endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/health" -TimeoutSec 5
    Write-Host "  [OK] HTTP endpoint is working!" -ForegroundColor Green
    Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "  [ERROR] HTTP endpoint failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Check if port is listening
Write-Host "[Test 2] Checking port 3002..." -ForegroundColor Yellow
$port = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "  [OK] Port 3002 is listening" -ForegroundColor Green
    Write-Host "  State: $($port.State)" -ForegroundColor Gray
} else {
    Write-Host "  [ERROR] Port 3002 is NOT listening!" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check Node processes
Write-Host "[Test 3] Checking Node.js processes..." -ForegroundColor Yellow
$node = Get-Process node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "  [OK] Node.js is running ($($node.Count) processes)" -ForegroundColor Green
    $node | ForEach-Object {
        Write-Host "    - PID: $($_.Id), CPU: $($_.CPU)%" -ForegroundColor Gray
    }
} else {
    Write-Host "  [ERROR] No Node.js processes found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed, the server is working." -ForegroundColor White
Write-Host "Now check your browser console for WebSocket errors." -ForegroundColor White
Write-Host ""
pause
