@echo off
echo ========================================
echo Building APK directly (without Android Studio)
echo ========================================
echo.

cd /d "%~dp0"

if not exist "android" (
    echo Error: Android project not found!
    echo Please run build-android.bat first.
    pause
    exit /b 1
)

echo Building APK...
cd android

REM Gradle wrapper 실행
if exist "gradlew.bat" (
    call gradlew.bat assembleDebug
    if errorlevel 1 (
        echo.
        echo Error: APK build failed!
        echo.
        echo Please check:
        echo   1. Android SDK is installed
        echo   2. JAVA_HOME is set correctly
        echo   3. ANDROID_HOME is set correctly
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo ========================================
    echo APK built successfully!
    echo ========================================
    echo.
    echo APK location:
    echo   %CD%\app\build\outputs\apk\debug\app-debug.apk
    echo.
    
    REM APK 파일 위치 열기
    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        echo Opening APK folder...
        explorer "app\build\outputs\apk\debug"
    )
) else (
    echo Error: gradlew.bat not found!
    echo Please run build-android.bat first.
    pause
    exit /b 1
)

pause
