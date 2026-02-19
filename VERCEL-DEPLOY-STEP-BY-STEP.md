# Vercel 배포 단계별 가이드

## ✅ 현재 상태
- GitHub에 코드 업로드 완료 ✓
- 다음 단계: Vercel에 배포

## 🚀 Vercel 배포 단계

### 1단계: Vercel 계정 생성/로그인

1. **Vercel 웹사이트 접속**
   - https://vercel.com 접속

2. **GitHub로 로그인**
   - "Sign Up" 또는 "Log In" 클릭
   - "Continue with GitHub" 클릭
   - GitHub 계정으로 로그인

### 2단계: 프로젝트 Import

1. **대시보드에서 새 프로젝트 추가**
   - Vercel 대시보드 접속: https://vercel.com/dashboard
   - "Add New..." 버튼 클릭
   - "Project" 선택

2. **GitHub 저장소 선택**
   - GitHub 저장소 목록에서 `kby920909/KUCN` 선택
   - "Import" 클릭

### 3단계: 프로젝트 설정 (중요!)

⚠️ **이 단계가 가장 중요합니다!**

다음 설정을 정확히 입력하세요:

1. **Framework Preset**
   - 자동으로 `Vite`로 감지될 수 있음
   - 없으면 `Vite` 선택

2. **Root Directory** ⬅️ **매우 중요!**
   - "Edit" 클릭
   - `frontend` 입력
   - "Continue" 클릭

3. **Build and Output Settings**
   - Build Command: `npm run build` (자동 감지됨)
   - Output Directory: `dist` (자동 감지됨)
   - Install Command: `npm install` (자동 감지됨)

4. **Environment Variables** (선택사항)
   - 이 버전은 더미 로그인이므로 환경 변수 불필요
   - 그냥 넘어가도 됩니다

### 4단계: 배포 실행

1. **"Deploy" 버튼 클릭**
   - 빌드가 시작됩니다 (약 1-2분 소요)

2. **빌드 진행 상황 확인**
   - 빌드 로그를 실시간으로 확인 가능
   - 오류가 있으면 로그에서 확인

### 5단계: 배포 완료 확인

1. **배포 완료 대기**
   - 빌드가 완료되면 "Ready" 상태로 변경
   - 자동으로 배포 URL 생성됨
   - 예: `https://kucn-xxxxx.vercel.app`

2. **사이트 접속 테스트**
   - 생성된 URL 클릭하여 접속
   - 로그인 페이지가 정상적으로 표시되는지 확인

3. **로그인 테스트**
   - 아이디와 비밀번호 아무거나 입력
   - "로그인" 버튼 클릭
   - 대시보드가 정상적으로 표시되는지 확인

## 📸 설정 스크린샷 가이드

### Root Directory 설정
```
┌─────────────────────────────────────┐
│ Root Directory                      │
│ [frontend                    ] [Edit]│
└─────────────────────────────────────┘
```

### Build Settings
```
┌─────────────────────────────────────┐
│ Build Command: npm run build       │
│ Output Directory: dist             │
│ Install Command: npm install       │
└─────────────────────────────────────┘
```

## ✅ 배포 성공 확인

배포가 성공하면:
- ✅ Vercel 대시보드에 "Ready" 상태 표시
- ✅ 배포된 URL로 접속 가능
- ✅ 로그인 페이지 정상 작동
- ✅ 더미 로그인 정상 작동

## 🔧 문제 해결

### 문제 1: 빌드 실패

**증상**: 빌드가 실패하고 에러 메시지 표시

**해결 방법**:
1. Vercel 대시보드에서 빌드 로그 확인
2. "Root Directory"가 `frontend`로 설정되어 있는지 확인
3. 로컬에서 빌드 테스트:
   ```powershell
   cd d:\Cursor\naver-login-app\frontend
   npm install
   npm run build
   ```

### 문제 2: 404 에러

**증상**: 배포된 사이트에서 404 에러 발생

**해결 방법**:
1. "Output Directory"가 `dist`로 설정되어 있는지 확인
2. `frontend/dist` 폴더가 생성되는지 확인

### 문제 3: Root Directory 설정이 안 보임

**해결 방법**:
1. "Import" 후 "Configure Project" 단계에서
2. "Root Directory" 옵션 찾기
3. 없으면 "Show more options" 또는 "Advanced" 클릭
4. `frontend` 입력

## 🎯 배포 후 할 일

1. **배포 URL 확인**
   - Vercel 대시보드 → 프로젝트 → "Domains" 탭
   - 배포된 URL 확인 (예: `https://kucn-xxxxx.vercel.app`)

2. **URL 공유**
   - 팀원들과 배포된 URL 공유
   - 모바일에서도 접속 테스트

3. **자동 배포 확인**
   - GitHub에 코드를 푸시하면 자동으로 재배포됨
   - `git push`만 하면 자동 배포

## 📝 다음 단계 (선택사항)

### 커스텀 도메인 설정
1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 설정

### 환경 변수 추가 (나중에 필요시)
- 프로젝트 → Settings → Environment Variables
- 필요시 환경 변수 추가

---

**배포 성공을 기원합니다! 🎉**
