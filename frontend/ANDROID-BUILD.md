# Android APK 빌드 가이드

이 가이드는 KUCN 웹 애플리케이션을 Android APK로 빌드하는 방법을 설명합니다.

## 사전 요구사항

### 1. Node.js 설치
- Node.js 18 이상 필요
- 이미 설치되어 있다면 확인: `node --version`

### 2. Android Studio 설치
1. [Android Studio 다운로드](https://developer.android.com/studio)
2. 설치 후 Android Studio 실행
3. **SDK Manager** 열기 (Tools > SDK Manager)
4. 다음 항목 설치:
   - Android SDK Platform 33 이상
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android Emulator (선택사항)

### 3. Java JDK 설치
- JDK 17 이상 필요
- Android Studio와 함께 설치되거나 별도 설치 가능
- 확인: `java -version`

### 4. 환경 변수 설정
Windows에서 다음 환경 변수를 설정하세요:

```
ANDROID_HOME=C:\Users\<사용자명>\AppData\Local\Android\Sdk
PATH에 추가:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

## 설치 및 설정

### 1단계: Capacitor 패키지 설치

```bash
cd d:\Cursor\naver-login-app\frontend
npm install
```

### 2단계: Capacitor 초기화 및 Android 플랫폼 추가

```bash
# Capacitor 초기화 (처음 한 번만)
npx cap init

# Android 플랫폼 추가
npx cap add android

# 웹 빌드 후 Android 프로젝트 동기화
npm run build
npx cap sync android
```

### 3단계: Android Studio에서 프로젝트 열기

```bash
npx cap open android
```

또는 수동으로:
- Android Studio 실행
- `File > Open`
- `d:\Cursor\naver-login-app\frontend\android` 폴더 선택

## APK 빌드 방법

### 방법 1: Android Studio에서 빌드 (권장)

1. Android Studio에서 프로젝트 열기
2. 상단 메뉴: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. 빌드 완료 후 팝업에서 **locate** 클릭
4. APK 파일 위치: `android\app\build\outputs\apk\debug\app-debug.apk`

### 방법 2: 명령줄에서 빌드

```bash
cd d:\Cursor\naver-login-app\frontend\android
.\gradlew assembleDebug
```

APK 파일 위치: `android\app\build\outputs\apk\debug\app-debug.apk`

### 방법 3: 릴리즈 APK 빌드 (서명 필요)

1. **키스토어 생성** (처음 한 번만):
```bash
keytool -genkey -v -keystore kucn-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias kucn
```

2. **키스토어 정보를 capacitor.config.ts에 추가**:
```typescript
android: {
  buildOptions: {
    keystorePath: 'kucn-release-key.jks',
    keystorePassword: 'your-password',
    keystoreAlias: 'kucn',
    keystoreAliasPassword: 'your-password',
  },
}
```

3. **릴리즈 빌드**:
```bash
cd android
.\gradlew assembleRelease
```

APK 파일 위치: `android\app\build\outputs\apk\release\app-release.apk`

## API 서버 연결 설정

### 개발 환경 (로컬 네트워크)

1. `capacitor.config.ts`에서 `server.url` 주석 해제:
```typescript
server: {
  androidScheme: 'https',
  url: 'http://192.168.5.49:5173', // 실제 IP 주소로 변경
  cleartext: true
},
```

2. API 서버가 같은 네트워크에 있어야 함
3. 방화벽에서 포트 3000, 5173 허용 확인

### 프로덕션 환경

1. 실제 서버 URL로 변경:
```typescript
server: {
  androidScheme: 'https',
  url: 'https://your-domain.com',
},
```

2. HTTPS 인증서 필요

## 자주 사용하는 명령어

```bash
# 웹 빌드 후 Android 동기화
npm run android:sync

# Android Studio 열기
npm run android:build

# 또는 개별 명령어
npm run build
npx cap sync android
npx cap open android
```

## 문제 해결

### 1. "SDK location not found" 오류
- `ANDROID_HOME` 환경 변수 확인
- `local.properties` 파일 생성:
  ```
  sdk.dir=C\:\\Users\\<사용자명>\\AppData\\Local\\Android\\Sdk
  ```

### 2. Gradle 빌드 오류
- Android Studio에서 **File > Sync Project with Gradle Files**
- **File > Invalidate Caches / Restart**

### 3. 네트워크 연결 오류
- `capacitor.config.ts`의 `server.url` 확인
- API 서버가 실행 중인지 확인
- 같은 네트워크에 있는지 확인

### 4. 권한 오류
- `android/app/src/main/AndroidManifest.xml`에서 인터넷 권한 확인:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## APK 설치 방법

1. APK 파일을 안드로이드 기기로 전송
2. 기기에서 **설정 > 보안 > 알 수 없는 소스** 허용
3. APK 파일 실행하여 설치

## 참고사항

- 디버그 APK는 개발/테스트용입니다
- 프로덕션 배포 시에는 서명된 릴리즈 APK를 사용하세요
- Google Play Store 배포 시 추가 설정이 필요합니다
