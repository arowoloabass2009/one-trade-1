# ================================================
#  ONE TRADE — Development Server (PowerShell)
#  Trade. Invest. Grow.
# ================================================

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

Write-Host ""
Write-Host " ================================================" -ForegroundColor Cyan
Write-Host "  ONE TRADE — Development Server" -ForegroundColor Yellow
Write-Host "  Trade. Invest. Grow." -ForegroundColor Yellow
Write-Host " ================================================" -ForegroundColor Cyan
Write-Host ""

# Install deps if missing
if (-not (Test-Path "node_modules")) {
    Write-Host " [!] node_modules not found. Installing..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Compile TypeScript
Write-Host " [1/2] Compiling TypeScript..." -ForegroundColor Cyan
$tscResult = & node node_modules\typescript\bin\tsc --project tsconfig.json 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host " [ERROR] TypeScript failed:" -ForegroundColor Red
    Write-Host $tscResult -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host " [OK] TypeScript compiled successfully." -ForegroundColor Green
Write-Host ""

# Start browser-sync
Write-Host " [2/2] Starting dev server..." -ForegroundColor Cyan
Write-Host " Local: http://localhost:3001/index.html" -ForegroundColor Green
Write-Host ""
Write-Host " Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

& node_modules\.bin\browser-sync start --config bs-config.json
