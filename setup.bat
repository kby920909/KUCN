@echo off
title naver-login-app Setup

cd /d "%~dp0"

echo ========================================
echo   naver-login-app Setup
echo ========================================
echo.

REM 1. Check Node.js
echo [1/4] Checking Node.js...
where node > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed.
    echo Install from https://nodejs.org/
    pause
    exit /b 1
)

node -v
npm -v
echo   OK
echo.

REM 2. Remove node_modules
echo [2/4] Removing node_modules...
if exist "api\node_modules" (
    rmdir /s /q "api\node_modules"
    echo   api\node_modules removed
) else (
    echo   api\node_modules not found - skip
)

if exist "frontend\node_modules" (
    rmdir /s /q "frontend\node_modules"
    echo   frontend\node_modules removed
) else (
    echo   frontend\node_modules not found - skip
)
echo.

REM 3. npm install
echo [3/4] Installing api...
cd api
call npm install
if errorlevel 1 (
    echo [ERROR] api npm install failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Installing frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] frontend npm install failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   Setup Complete
echo ========================================
echo.
echo Next: Create api\.env and run start-dev.bat
echo See SETUP-NEW-PC.md for details.
echo.
pause
