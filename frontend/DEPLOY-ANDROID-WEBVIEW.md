# WebView 방식 배포 절차

## 개요
APK는 Vercel URL을 로드하는 WebView 앱입니다.  
Vercel에 배포하면 앱 내용이 자동 반영됩니다. (APK 재빌드 불필요)

---

## 1. Vercel 배포 절차

### 1-1. 소스 변경 후 커밋 및 푸시

```powershell
cd d:\Cursor\naver-login-app

git add .
git commit -m "변경 내용 설명"
git push origin main
```

### 1-2. 자동 배포
- GitHub 푸시 후 Vercel이 자동 배포 (약 1~2분)
- 배포 URL: https://kucn-app.vercel.app

---

## 2. Android APK 빌드 절차

**처음 한 번만** 또는 **앱 설정/패키지명 등이 바뀔 때만** 수행합니다.

### 2-1. Capacitor 동기화

```powershell
cd d:\Cursor\naver-login-app\frontend

# Android 프로젝트 동기화
npx cap sync android
```

### 2-2. Android Studio에서 APK 빌드

1. Android Studio 실행
   ```powershell
   npx cap open android
   ```
2. Gradle 동기화 완료 대기
3. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. 빌드 완료 후 APK 위치:
   - `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### 2-3. 빌드 스크립트 사용 (선택)

```powershell
cd d:\Cursor\naver-login-app\frontend
.\build-android.bat
```

이후 Android Studio에서 APK 빌드 진행

---

## 3. 배포 흐름 요약

| 작업 | 빈도 | 절차 |
|------|------|------|
| **소스/UI 수정** | 필요할 때마다 | `git push` → Vercel 자동 배포 |
| **APK 빌드** | 처음 1회 또는 설정 변경 시 | `npx cap sync android` → Android Studio에서 APK 빌드 |

---

## 4. 확인 사항

- Vercel URL 변경 시: `capacitor.config.ts`의 `server.url` 수정 후 `npx cap sync android` 실행
- 오프라인: 인터넷 없이는 앱 실행 불가 (원격 URL 로드 방식)
