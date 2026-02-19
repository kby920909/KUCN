# APK 다운로드 기능 설정 가이드

## 📋 목표
Vercel에 배포된 웹사이트(https://kucn-app.vercel.app)에서 APK 파일을 다운로드할 수 있도록 설정

## 🔧 설정 단계

### 1단계: APK 파일을 public 폴더로 복사

**방법 1: 파일 탐색기 사용**
1. 파일 탐색기 열기
2. 다음 경로로 이동:
   ```
   D:\Cursor\naver-login-app\frontend\android\app\build\outputs\apk\debug\app-debug.apk
   ```
3. 파일 복사 (Ctrl+C)
4. 다음 경로로 이동:
   ```
   D:\Cursor\naver-login-app\frontend\public\
   ```
5. 파일 붙여넣기 (Ctrl+V)
6. 파일명 확인: `app-debug.apk`

**방법 2: PowerShell 사용**
```powershell
cd d:\Cursor\naver-login-app\frontend

# public 폴더가 없으면 생성
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public"
}

# APK 파일 복사
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "public\app-debug.apk"
```

### 2단계: 변경사항 확인

다음 파일들이 수정되었습니다:
- ✅ `frontend/src/components/LoginForm.tsx` - 다운로드 버튼 추가됨
- ✅ `frontend/src/components/LoginForm.css` - 버튼 스타일 추가됨
- ✅ `frontend/public/app-debug.apk` - APK 파일 복사 필요

### 3단계: 로컬에서 테스트 (선택사항)

```powershell
cd d:\Cursor\naver-login-app\frontend
npm run build
npm run preview
```

브라우저에서 `http://localhost:4173` 접속하여 다운로드 버튼이 표시되는지 확인

### 4단계: GitHub에 푸시 및 Vercel 자동 배포

```powershell
cd d:\Cursor\naver-login-app

# 변경사항 추가
git add .

# 커밋
git commit -m "Add APK download button to login page"

# GitHub에 푸시
git push origin main
```

**자동 배포:**
- GitHub에 푸시하면 Vercel이 자동으로 재배포합니다
- 약 1-2분 후 https://kucn-app.vercel.app 에서 확인 가능

## ✅ 확인 사항

배포 완료 후:
1. https://kucn-app.vercel.app 접속
2. 로그인 페이지에 "📱 Android 앱 다운로드" 버튼이 표시되는지 확인
3. 버튼 클릭하여 APK 다운로드 테스트

## 🔄 APK 파일 업데이트 방법

APK 파일을 새로 빌드한 후 업데이트하려면:

1. **새 APK 빌드**
   ```powershell
   cd d:\Cursor\naver-login-app\frontend
   npm run build
   npx cap sync android
   # Android Studio에서 새 APK 빌드
   ```

2. **public 폴더의 APK 파일 교체**
   ```powershell
   Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "public\app-debug.apk" -Force
   ```

3. **GitHub에 푸시**
   ```powershell
   git add public/app-debug.apk
   git commit -m "Update APK file"
   git push origin main
   ```

## 📱 다운로드 버튼 위치

다운로드 버튼은:
- 첫 번째 로그인 폼(네이버 스타일) 아래에 표시됩니다
- 두 번째 로그인 폼(토스 스타일) 위에 표시됩니다
- 모바일과 PC 모두에서 잘 보이도록 반응형 디자인 적용됨

## 🎨 버튼 스타일

- 그라데이션 배경 (보라색 계열)
- 호버 효과 (마우스 올리면 살짝 올라감)
- 그림자 효과
- 이모지 아이콘 (📱)

## ⚠️ 주의사항

1. **파일 크기**
   - APK 파일은 보통 10-50MB 정도입니다
   - Vercel의 무료 플랜에서는 파일 크기 제한이 있을 수 있습니다
   - 문제가 있으면 GitHub Releases를 사용하는 것을 고려하세요

2. **보안**
   - APK 파일은 바이너리 파일이므로 Git에 추가할 때 주의하세요
   - `.gitignore`에 APK 파일이 포함되어 있지 않은지 확인하세요

3. **업데이트**
   - APK 파일을 업데이트할 때마다 GitHub에 푸시해야 합니다
   - Vercel이 자동으로 재배포합니다

## 🚀 빠른 설정 (한 번에)

```powershell
# 1. 프로젝트 폴더로 이동
cd d:\Cursor\naver-login-app\frontend

# 2. public 폴더 생성 (없는 경우)
if (-not (Test-Path "public")) { New-Item -ItemType Directory -Path "public" }

# 3. APK 파일 복사
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "public\app-debug.apk" -Force

# 4. 루트로 이동
cd ..

# 5. Git에 추가 및 푸시
git add .
git commit -m "Add APK download functionality"
git push origin main
```

---

**설정 완료 후 Vercel에서 자동 배포를 기다리세요! 🎉**
