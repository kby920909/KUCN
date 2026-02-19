# Vercel 배포 URL을 사용한 APK 빌드 가이드

## 📋 사전 준비

1. ✅ Vercel에 배포 완료
2. ✅ Vercel 배포 URL 확인 (예: `https://kucn.vercel.app`)

## 🔧 설정 변경

### 1단계: Vercel 배포 URL 확인

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 클릭
3. "Domains" 탭에서 배포된 URL 확인
   - 예: `https://kucn-xxxxx.vercel.app` 또는 `https://kucn.vercel.app`

### 2단계: API 설정 파일 수정

`frontend/src/config/api.ts` 파일을 열고:

```typescript
// 프로덕션 서버 URL (Vercel 배포 URL)
const PROD_API_SERVER = 'https://your-vercel-url.vercel.app'; 
// ↑ 여기를 실제 Vercel URL로 변경
```

**예시:**
```typescript
const PROD_API_SERVER = 'https://kucn-abc123.vercel.app';
```

### 3단계: 프로덕션 모드로 빌드

⚠️ **중요**: 안드로이드 앱은 프로덕션 모드로 빌드해야 Vercel URL을 사용합니다.

```powershell
cd d:\Cursor\naver-login-app\frontend

# 프로덕션 빌드 (개발 모드가 아님)
npm run build
```

## 📱 APK 빌드 방법

### 방법 1: 배치 파일 사용 (간단)

```powershell
cd d:\Cursor\naver-login-app\frontend
.\build-android.bat
```

### 방법 2: 수동 빌드

```powershell
cd d:\Cursor\naver-login-app\frontend

# 1. 의존성 설치
npm install

# 2. 프로덕션 빌드
npm run build

# 3. Android 프로젝트 동기화
npx cap sync android

# 4. Android Studio 열기
npx cap open android
```

### 방법 3: 명령줄에서 직접 APK 빌드

```powershell
cd d:\Cursor\naver-login-app\frontend

# 빌드 및 동기화
npm run build
npx cap sync android

# APK 빌드
cd android
.\gradlew assembleRelease
```

APK 위치: `android\app\build\outputs\apk\release\app-release.apk`

## ⚙️ 환경 변수 사용 (선택사항)

환경 변수를 사용하여 Vercel URL을 설정할 수도 있습니다:

### 1. `.env.production` 파일 생성

`frontend/.env.production` 파일 생성:

```
VITE_API_URL=https://your-vercel-url.vercel.app/api
```

### 2. 빌드 시 자동 적용

```powershell
npm run build
```

이렇게 하면 `api.ts`에서 자동으로 환경 변수를 읽어옵니다.

## 🔍 확인 사항

### 빌드 전 확인

1. ✅ `frontend/src/config/api.ts`에서 `PROD_API_SERVER`가 Vercel URL로 설정되어 있는지 확인
2. ✅ Vercel 배포 URL이 정확한지 확인
3. ✅ 프로덕션 모드로 빌드하는지 확인 (`npm run build`)

### 빌드 후 확인

1. ✅ APK 파일이 생성되었는지 확인
2. ✅ 안드로이드 기기에 설치하여 테스트
3. ✅ 로그인 기능이 정상 작동하는지 확인

## 📝 현재 상태

**현재 버전은 더미 로그인 버전입니다:**
- ✅ API 서버 없이 작동
- ✅ 입력만 하면 로그인 성공
- ✅ localStorage에 세션 저장

**Vercel URL 설정의 의미:**
- 현재는 더미 로그인이므로 실제로 API 호출을 하지 않습니다
- 하지만 나중에 실제 API를 추가할 때를 대비하여 설정해두는 것이 좋습니다

## 🚀 전체 프로세스 요약

```powershell
# 1. 프로젝트 폴더로 이동
cd d:\Cursor\naver-login-app\frontend

# 2. API 설정 파일에서 Vercel URL 확인/수정
# frontend/src/config/api.ts 파일 열어서 PROD_API_SERVER 수정

# 3. 프로덕션 빌드
npm run build

# 4. Android 동기화 및 빌드
npx cap sync android
npx cap open android

# 5. Android Studio에서 APK 빌드
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

## ⚠️ 주의사항

1. **프로덕션 빌드 필수**
   - 개발 모드(`npm run dev`)가 아닌 프로덕션 빌드(`npm run build`)를 사용해야 합니다
   - 프로덕션 빌드에서만 `PROD_API_SERVER`가 사용됩니다

2. **Vercel URL 형식**
   - `https://`로 시작해야 합니다
   - `/api`는 자동으로 추가되므로 URL 끝에 붙이지 마세요

3. **CORS 설정**
   - Vercel에 배포된 앱은 CORS 문제가 없어야 합니다
   - 문제가 있으면 Vercel 설정에서 CORS 허용 확인

## 🎯 다음 단계

APK 빌드 완료 후:
1. 안드로이드 기기에 설치하여 테스트
2. 로그인 기능 확인
3. 필요시 Vercel URL 업데이트 후 재빌드

---

**APK 빌드 성공을 기원합니다! 🎉**
