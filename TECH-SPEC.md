# naver-login-app 개발기술 설명서

> 문서 버전: 1.0  
> 최종 수정: 2025-02-19

---

## 1. 기술 스택

### 1.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  프론트엔드 (Vite Dev Server)  Port: 5173                    │
│  - React 18 + TypeScript                                      │
│  - /api/* → 프록시 → API 서버                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  API (Express)  Port: 3000                                   │
│  - Node.js + Express + TypeScript                            │
│  - /api/auth/login, /api/health                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 기술 구성

| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프론트엔드 | React | ^18.2.0 | UI 라이브러리 |
| 프론트엔드 | TypeScript | ^5.3.0 | 타입 안정성 |
| 프론트엔드 | Vite | ^5.0.0 | 빌드 도구 및 개발 서버 |
| 프론트엔드 | @vitejs/plugin-react | ^4.2.0 | React HMR 지원 |
| 백엔드 | Node.js | 20+ | 런타임 |
| 백엔드 | Express | ^4.18.2 | HTTP API 서버 |
| 백엔드 | TypeScript | ^5.3.0 | 타입 안정성 |
| 백엔드 | tsx | ^4.7.0 | TS 개발 실행 (watch) |
| 공통 | cors | ^2.8.5 | CORS 처리 |

---

## 2. 프로젝트 구조

```
naver-login-app/
├── api/                    # Express API 서버
│   ├── src/
│   │   ├── index.ts        # 진입점, Express 앱 설정
│   │   └── routes/
│   │       └── auth.ts     # 로그인 API 라우트
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/               # React SPA
│   ├── src/
│   │   ├── main.tsx        # React 진입점
│   │   ├── App.tsx         # 루트 컴포넌트
│   │   ├── api/
│   │   │   └── auth.ts     # 로그인 API 클라이언트
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.css
│   │   │   └── LoginSuccess.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── nginx.conf          # Docker 프로덕션용
│   └── Dockerfile
├── docker-compose.yml      # 프로덕션 Docker
├── docker-compose.dev.yml  # 개발용 (API만 Docker)
├── package.json            # 루트 스크립트
├── DEV-NOTES.md            # 개발노트
└── TECH-SPEC.md            # 본 기술 설명서
```

---

## 3. API 명세

### 3.1 헬스체크

| 항목 | 내용 |
|------|------|
| Method | GET |
| Path | /api/health |
| Response | `{ status: "ok", timestamp: string }` |

### 3.2 로그인

| 항목 | 내용 |
|------|------|
| Method | POST |
| Path | /api/auth/login |
| Content-Type | application/json |
| Request Body | `{ userId: string, password: string }` |
| 성공 (200) | `{ success: true, userId: string }` |
| 실패 (400) | `{ success: false, message: string }` |

**비고**: 데모용으로 아이디·비밀번호가 비어있지 않으면 항상 성공. 실제 네이버 인증 미연동.

---

## 4. 프론트엔드 구조

### 4.1 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| App | 인증 상태 관리, LoginForm / LoginSuccess 분기 |
| LoginForm | 아이디·비밀번호 입력 폼, 제출 시 `onSubmit(id, pw)` 호출 |
| LoginSuccess | 로그인 성공 화면, 로그아웃 링크 |

### 4.2 인증 상태 (AuthState)

- `idle`: 초기/로그아웃 상태
- `loading`: 로그인 요청 중
- `success`: 로그인 성공
- `error`: 로그인 실패

### 4.3 API 연동

- `frontend/src/api/auth.ts`에서 `login(userId, password)` 정의
- `fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ userId, password }) })`
- Vite 프록시: `/api` → `http://127.0.0.1:3000`

---

## 5. 개발 서버 설정

### 5.1 Vite (vite.config.ts)

- **포트**: 5173
- **host**: true (네트워크 접근 허용)
- **프록시**: `/api` → `http://127.0.0.1:3000`
- **경로 별칭**: `@` → `./src`

### 5.2 Express (api/src/index.ts)

- **포트**: 3000 (환경변수 PORT로 변경 가능)
- **바인딩**: 0.0.0.0 (외부 접근 허용)
- **미들웨어**: cors, express.json
- **라우트**: /api/auth, /api/health

---

## 6. Docker

### 6.1 프로덕션 (docker-compose.yml)

| 서비스 | 이미지 | 포트 | 설명 |
|--------|--------|------|------|
| api | Node 20 Alpine | 3000 | Express API |
| frontend | Nginx Alpine | 80 | 정적 빌드 + API 프록시 |

### 6.2 개발용 (docker-compose.dev.yml)

- API만 Docker로 실행, 프론트는 로컬 Vite 사용
- API: `tsx watch`로 소스 변경 시 자동 재시작

### 6.3 실행

```cmd
docker compose up -d --build   # 프로덕션
docker compose -f docker-compose.dev.yml up -d   # 개발용 API만
```

---

## 7. 빌드 및 배포

### 7.1 빌드

```cmd
npm run build:api       # api/dist 생성
npm run build:frontend  # frontend/dist 생성
```

### 7.2 프로덕션 실행

```cmd
# API
cd api && npm start     # node dist/index.js

# 프론트 (Nginx 또는 정적 호스팅)
# frontend/dist 를 웹 서버 루트에 배치
# /api 는 API 서버로 프록시 필요
```

---

## 8. 환경 요구사항

- Node.js 18+
- npm 9+
- (Docker 사용 시) Docker, Docker Compose

---

## 9. 향후 확장 방향

- 네이버 로그인 OAuth 2.0 연동
- JWT 기반 세션/토큰 관리
- AWS 배포 (EC2, S3, API Gateway 등)
