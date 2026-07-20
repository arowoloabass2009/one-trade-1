@echo off
title One Trade — Dev Server
echo.
echo  ================================================
echo   ONE TRADE — Development Server
echo   Trade. Invest. Grow.
echo  ================================================
echo.

cd /d "%~dp0"

:: Check node_modules
if not exist "node_modules" (
  echo  [!] node_modules not found. Installing...
  npm install
  echo.
)

:: Compile TypeScript first
echo  [1/2] Compiling TypeScript...
node node_modules\typescript\bin\tsc --project tsconfig.json
if %errorlevel% neq 0 (
  echo  [ERROR] TypeScript compilation failed. Check js/app.ts for errors.
  pause
  exit /b 1
)
echo  [OK] TypeScript compiled successfully.
echo.

:: Start browser-sync
echo  [2/2] Starting dev server at http://localhost:3001
echo.
echo  Press Ctrl+C to stop the server.
echo.
node_modules\.bin\browser-sync start --config bs-config.json

pause
