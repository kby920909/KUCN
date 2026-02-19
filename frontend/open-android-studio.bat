@echo off
echo ========================================
echo Opening Android Studio
echo ========================================
echo.

cd /d "%~dp0"

if not exist "android" (
    echo Error: Android project not found!
    echo Please run build-android.bat first.
    pause
    exit /b 1
)

echo Opening Android Studio...
call npx cap open android

if errorlevel 1 (
    echo.
    echo Failed to open Android Studio automatically.
    echo.
    echo Please open Android Studio manually:
    echo   1. Open Android Studio
    echo   2. File ^> Open
    echo   3. Navigate to: %CD%\android
    echo   4. Click OK
    echo.
    pause
)
