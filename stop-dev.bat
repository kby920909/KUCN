@echo off
title Stop naver-login-app

cd /d "%~dp0"

echo Stopping servers...

for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul

powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"name='cmd.exe'\" | Where-Object { ($_.CommandLine -match 'naver-login-app' -or $_.CommandLine -match 'start-dev') -and $_.CommandLine -notmatch 'stop-dev' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo.
echo Servers stopped.
pause
