# Vercel 배포 가이드

이 가이드는 KUCN 애플리케이션을 Vercel에 배포하는 방법을 설명합니다.

## 사전 준비

1. **Vercel 계정 생성**
   - https://vercel.com 에서 GitHub 계정으로 가입

2. **Vercel CLI 설치** (선택사항)
   ```bash
   npm install -g vercel
   ```

## 배포 방법

### 방법 1: 프론트엔드만 Vercel에 배포 (권장 - 가장 간단)

**이 방법을 권장합니다.** API는 별도 서버에 배포하는 것이 Oracle DB 연결 문제를 피할 수 있습니다.

1. **GitHub에 프로젝트 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Vercel 대시보드에서 프론트엔드 프로젝트 Import**
   - https://vercel.com/dashboard 접속
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build` (자동 감지됨)
     - **Output Directory**: `dist` (자동 감지됨)

3. **환경 변수 설정** (프론트엔드용)
   - 프로젝트 설정 → Environment Variables에서 추가:
   ```
   VITE_API_URL=https://your-api-server.com/api
   ```
   - 또는 `src/config/api.ts`에서 직접 설정

4. **배포 실행**
   - "Deploy" 버튼 클릭

### 방법 2: 전체 프로젝트 Vercel에 배포

⚠️ **주의**: Oracle DB 연결이 제한적일 수 있습니다.

1. **GitHub에 프로젝트 푸시** (위와 동일)

2. **Vercel 대시보드에서 프로젝트 Import**
   - Root Directory: 프로젝트 루트 (기본값)
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

3. **환경 변수 설정**
   - 프로젝트 설정 → Environment Variables에서 다음 변수 추가:

   **프론트엔드만 배포하는 경우:**
   ```
   VITE_API_URL=https://your-api-server.com/api
   ```

   **전체 배포하는 경우:**
   ```
   USE_LOCAL_DB=1
   DB_USER=pdsswin
   DB_PASSWORD=pdsswin
   DB_CONNECT_STRING=211.104.106.6:1521/unite
   DB_TABLE=pdsswin.pi_view
   DB_USER_ID_COL=kucn_id
   DB_PASSWORD_COL=kucn_pw
   SESSION_SECRET=your-secret-key-change-in-production
   PORT=3000
   ```

4. **배포 실행**
   - "Deploy" 버튼 클릭

### 방법 2: Vercel CLI 사용

1. **프로젝트 루트에서 로그인**
   ```bash
   vercel login
   ```

2. **배포**
   ```bash
   vercel
   ```

3. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

## 프로젝트 구조 설정

Vercel은 모노레포 구조를 지원하지만, 현재 프로젝트 구조에 맞게 설정이 필요합니다.

### 옵션 1: 프론트엔드만 Vercel에 배포 (권장)

프론트엔드만 Vercel에 배포하고, API는 별도 서버(Railway, Render 등)에 배포하는 방법:

1. **프론트엔드 배포**
   - Vercel에서 `frontend` 폴더를 루트로 설정
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **API 서버 별도 배포**
   - Railway, Render, 또는 다른 서버에 API 배포
   - 프론트엔드의 `src/config/api.ts`에서 `PROD_API_SERVER` 설정

### 옵션 2: Vercel Functions로 API 배포

Vercel Serverless Functions를 사용하여 API도 함께 배포:

1. **프로젝트 루트에 `vercel.json` 생성** (이미 생성됨)

2. **API를 Serverless Functions로 변환**
   - Vercel은 Express 앱을 자동으로 변환하지만, 세션 관리가 제한적일 수 있음
   - 세션 스토어를 Redis 등으로 변경하는 것을 권장

## 환경 변수 설정

Vercel 대시보드에서 환경 변수를 설정하거나, `vercel.json`에 포함할 수 있습니다:

### 필수 환경 변수

- `USE_LOCAL_DB`: 로컬 DB 사용 여부 (1 또는 0)
- `DB_USER`: Oracle DB 사용자명
- `DB_PASSWORD`: Oracle DB 비밀번호
- `DB_CONNECT_STRING`: Oracle DB 연결 문자열
- `DB_TABLE`: 테이블명
- `DB_USER_ID_COL`: 사용자 ID 컬럼명
- `DB_PASSWORD_COL`: 비밀번호 컬럼명
- `SESSION_SECRET`: 세션 암호화 키 (프로덕션에서는 강력한 랜덤 문자열 사용)

### 환경별 설정

- **Production**: 프로덕션 환경 변수
- **Preview**: PR/브랜치별 미리보기 환경 변수
- **Development**: 로컬 개발 환경 변수

## 주의사항

### 1. Oracle DB 연결

⚠️ **Vercel Serverless Functions는 Oracle DB 연결에 제한이 있을 수 있습니다**
- Oracle Instant Client가 Vercel 환경에서 작동하지 않을 수 있음
- 대안:
  - API를 별도 서버(Railway, Render)에 배포
  - 또는 PostgreSQL/MySQL로 마이그레이션

### 2. 세션 관리

⚠️ **Vercel Serverless Functions는 상태를 유지하지 않습니다**
- `express-session`의 메모리 스토어는 작동하지 않음
- Redis 또는 다른 외부 세션 스토어 사용 필요
- 또는 JWT 토큰 방식으로 변경

### 3. 파일 시스템

⚠️ **Vercel은 읽기 전용 파일 시스템을 사용합니다**
- SQLite 파일(`local.db`)을 사용하는 경우 문제가 될 수 있음
- 외부 데이터베이스 사용 권장

## 추천 배포 구조

### 옵션 A: 프론트엔드만 Vercel (가장 간단)

```
Frontend (Vercel)
  ↓ API 호출
API Server (Railway/Render/별도 서버)
  ↓ DB 연결
Oracle DB
```

**장점:**
- Vercel 설정이 간단함
- API 서버를 독립적으로 관리 가능
- Oracle DB 연결 문제 없음

**단점:**
- API 서버를 별도로 관리해야 함

### 옵션 B: 전체 Vercel 배포

```
Frontend + API (Vercel)
  ↓ (제한적)
Oracle DB
```

**장점:**
- 하나의 플랫폼에서 관리

**단점:**
- Oracle DB 연결 복잡
- 세션 관리 제한
- Serverless Functions 제약

## 배포 후 확인

1. **프론트엔드 확인**
   - 배포된 URL 접속
   - 로그인 페이지가 정상적으로 표시되는지 확인

2. **API 확인**
   - `https://your-domain.vercel.app/api/health` 접속
   - `{"status":"ok"}` 응답 확인

3. **로그인 테스트**
   - 실제 계정으로 로그인 시도
   - 네트워크 탭에서 API 호출 확인

## 문제 해결

### 문제: 빌드 실패

**해결:**
- `package.json`의 빌드 스크립트 확인
- 환경 변수가 올바르게 설정되었는지 확인
- Vercel 빌드 로그 확인

### 문제: API 호출 실패

**해결:**
- CORS 설정 확인
- API URL이 올바른지 확인 (`src/config/api.ts`)
- 환경 변수 확인

### 문제: 세션 유지 안 됨

**해결:**
- Redis 등 외부 세션 스토어 사용
- 또는 JWT 토큰 방식으로 변경

## 다음 단계

배포가 완료되면:
1. 안드로이드 앱의 `PROD_API_SERVER`를 Vercel URL로 설정
2. 안드로이드 앱 빌드 및 배포

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel Node.js 런타임](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
- [Vercel 환경 변수](https://vercel.com/docs/concepts/projects/environment-variables)
