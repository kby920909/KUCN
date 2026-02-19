@echo off
title naver-login-app

cd /d "%~dp0"

REM Add Oracle Instant Client to PATH (DPI-1047 fix - update path if different)
set "ORACLE_IC=C:\oracle\instantclient_21_20"
if exist "%ORACLE_IC%\oci.dll" set "PATH=%ORACLE_IC%;%PATH%"

echo Starting API Server...
start "API" cmd /k "cd /d %~dp0api && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo API:      http://localhost:3000
echo Frontend: http://localhost:5173
echo.
pause
