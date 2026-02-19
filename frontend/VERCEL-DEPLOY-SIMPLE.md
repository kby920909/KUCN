# Vercel 배포 가이드 (더미 로그인 버전)

이 가이드는 **프론트엔드만** Vercel에 배포하는 방법을 설명합니다. API 서버 없이 작동하는 더미 로그인 버전입니다.

## 📋 사전 준비

1. **Vercel 계정 생성**
   - https://vercel.com 접속
   - GitHub 계정으로 가입 (무료)

2. **GitHub 저장소 준비**
   - GitHub에 프로젝트를 업로드할 저장소 필요

## 🚀 배포 단계

### 1단계: GitHub에 프로젝트 업로드

#### 방법 A: GitHub 웹에서 직접 생성

1. GitHub에 로그인
2. 우측 상단 "+" 버튼 → "New repository" 클릭
3. 저장소 이름 입력 (예: `kucn-app`)
4. "Public" 또는 "Private" 선택
5. "Create repository" 클릭

#### 방법 B: Git 명령어 사용

```bash
# 프로젝트 루트로 이동
cd d:\Cursor\naver-login-app

# Git 초기화 (이미 되어있다면 생략)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit - 더미 로그인 버전"

# GitHub 저장소 연결 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# GitHub에 푸시
git branch -M main
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 Import

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - GitHub로 로그인

2. **새 프로젝트 추가**
   - "Add New..." 버튼 클릭
   - "Project" 선택

3. **GitHub 저장소 선택**
   - GitHub 저장소 목록에서 방금 만든 저장소 선택
   - "Import" 클릭

4. **프로젝트 설정**
   
   ⚠️ **중요**: 다음 설정을 정확히 입력하세요!
   
   - **Framework Preset**: `Vite` (자동 감지될 수 있음)
   - **Root Directory**: `frontend` ⬅️ **이것이 중요합니다!**
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: `dist` (자동 감지됨)
   - **Install Command**: `npm install` (자동 감지됨)

   📸 설정 예시:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

5. **환경 변수 설정** (선택사항)
   - 이 버전은 API 서버가 없으므로 환경 변수 불필요
   - 그냥 넘어가도 됩니다

6. **배포 실행**
   - "Deploy" 버튼 클릭
   - 빌드 진행 상황 확인 (약 1-2분 소요)

### 3단계: 배포 확인

1. **배포 완료 대기**
   - 빌드가 완료되면 "Ready" 상태로 변경됨
   - 자동으로 배포 URL이 생성됨 (예: `https://your-project.vercel.app`)

2. **사이트 접속 테스트**
   - 생성된 URL 클릭하여 접속
   - 로그인 페이지가 정상적으로 표시되는지 확인

3. **로그인 테스트**
   - 아이디와 비밀번호 아무거나 입력
   - "로그인" 버튼 클릭
   - 대시보드가 정상적으로 표시되는지 확인

## ✅ 배포 완료 후

### 배포 URL 확인
- Vercel 대시보드에서 프로젝트 클릭
- "Domains" 탭에서 배포된 URL 확인
- 예: `https://kucn-app.vercel.app`

### 자동 배포 설정
- GitHub에 코드를 푸시하면 자동으로 재배포됨
- `git push`만 하면 자동으로 배포 시작

### 커스텀 도메인 설정 (선택사항)
1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 설정

## 🔧 문제 해결

### 문제 1: 빌드 실패

**증상**: 빌드가 실패하고 에러 메시지 표시

**해결 방법**:
1. Vercel 대시보드에서 빌드 로그 확인
2. "Root Directory"가 `frontend`로 설정되어 있는지 확인
3. 로컬에서 빌드 테스트:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### 문제 2: 404 에러

**증상**: 배포된 사이트에서 404 에러 발생

**해결 방법**:
1. "Output Directory"가 `dist`로 설정되어 있는지 확인
2. `frontend/dist` 폴더가 생성되는지 확인

### 문제 3: 로그인 후 화면이 안 나옴

**증상**: 로그인 버튼 클릭 후 아무 반응 없음

**해결 방법**:
1. 브라우저 개발자 도구(F12) 열기
2. Console 탭에서 에러 확인
3. Network 탭에서 요청 확인

### 문제 4: Root Directory 설정이 안 보임

**해결 방법**:
1. "Import" 후 "Configure Project" 단계에서
2. "Root Directory" 옵션을 찾아서 `frontend` 입력
3. 없으면 "Advanced" 또는 "Show more" 클릭

## 📝 주요 변경 사항

이 버전은 다음과 같이 변경되었습니다:

✅ **API 서버 제거**: 백엔드 API 호출 없음
✅ **더미 로그인**: 입력만 하면 로그인 성공
✅ **localStorage 세션**: 브라우저 로컬 스토리지에 세션 저장
✅ **30분 세션**: 30분 후 자동 로그아웃
✅ **세션 연장**: "30분 연장" 버튼으로 세션 연장 가능

## 🎯 다음 단계

배포가 완료되면:
1. 배포된 URL을 팀원들과 공유
2. 모바일에서도 접속 테스트
3. 필요시 안드로이드 앱 빌드 (실서버 URL 설정 후)

## 📞 도움말

- Vercel 공식 문서: https://vercel.com/docs
- Vite 배포 가이드: https://vitejs.dev/guide/static-deploy.html#vercel

---

**배포 성공을 기원합니다! 🎉**
