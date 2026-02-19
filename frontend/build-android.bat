@echo off
echo ========================================
echo KUCN Android APK Build Script
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/4] Building web application...
call npm run build
if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo [3/4] Checking Capacitor...
if not exist "node_modules\@capacitor\cli" (
    echo Capacitor not found. Installing...
    call npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar
)

echo.
echo [4/4] Syncing Android platform...
if not exist "android" (
    echo Adding Android platform...
    call npx cap add android
)

call npx cap sync android
if errorlevel 1 (
    echo Error: Capacitor sync failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.

REM Android Studio 자동 실행 시도
echo [5/5] Opening Android Studio...
call npx cap open android
if errorlevel 1 (
    echo.
    echo Warning: Failed to open Android Studio automatically.
    echo.
    echo Please open Android Studio manually:
    echo   1. Open Android Studio
    echo   2. File ^> Open
    echo   3. Navigate to: %CD%\android
    echo   4. Click OK
    echo.
    echo Or run manually:
    echo   cd android
    echo   npx cap open android
    echo.
) else (
    echo.
    echo Android Studio opened successfully!
    echo.
    echo Next steps in Android Studio:
    echo   1. Wait for Gradle sync to complete
    echo   2. Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
    echo   3. APK will be generated in: android\app\build\outputs\apk\debug\
    echo.
)

echo.
echo Alternative: Build APK from command line:
echo   cd android
echo   .\gradlew assembleDebug
echo.
pause
