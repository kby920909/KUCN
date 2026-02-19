# naver-login-app 개발노트

> 작성일: 2025-02-19  
> 프로젝트: 네이버 스타일 로그인 데모 앱

---

## 1. 프로젝트 개요

- **목적**: 네이버 스타일 로그인 UI 데모 (실제 네이버 OAuth 미연동)
- **특징**: 아이디/비밀번호만 입력하면 데모용으로 항상 로그인 성공
- **실행 환경**: Node.js + Vite(프론트) + Express(API)

---

## 2. 로컬 개발 환경 세팅

### 2.1 사전 요구사항
- Node.js (v18 이상 권장)
- npm

### 2.2 의존성 설치

```cmd
# API
cd api
npm install

# 프론트엔드
cd ../frontend
npm install
```

### 2.3 실행 방법

**두 개의 CMD 창**이 필요합니다.

| 창 | 경로 | 명령 |
|----|------|------|
| API | `naver-login-app\api` | `npm run dev` |
| 프론트 | `naver-login-app` | `npm run dev:frontend` |

또는 루트에서:
- `npm run dev:api` (API)
- `npm run dev:frontend` (프론트)

### 2.4 접속 주소
- 로그인 페이지: http://localhost:5173
- API 헬스체크: http://localhost:3000/api/health

---

## 3. 트러블슈팅

### 3.1 PowerShell에서 npm 실행 불가
**증상**: "이 시스템에서 스크립트를 실행할 수 없으므로 npm.ps1 파일을 로드할 수 없습니다"

**해결**: CMD 사용 또는 PowerShell 실행 정책 변경
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3.2 'vite'은(는) 내부 또는 외부 명령이 아닙니다
**원인**: `npm install` 미실행

**해결**:
```cmd
cd frontend
npm install
npm run dev
```

### 3.3 로그인 실패 / 서버에 연결할 수 없습니다
**원인**: API 서버 미실행 또는 프록시 연결 실패

**해결**:
1. API 서버 실행 확인: http://localhost:3000/api/health 접속
2. API 폴더에 `npm install` 실행
3. Vite 프록시: `127.0.0.1:3000` 사용 (Windows localhost 이슈 대응)

### 3.4 App import 오류 (No matching export for "default")
**원인**: App.tsx가 named export(`export function App`)인데 main.tsx에서 default import 사용

**해결**: `import { App } from './App'` 로 수정

---

## 4. 다른 PC에서 접속

### 4.1 설정
- Vite: `host: true` (vite.config.ts)
- Express: `0.0.0.0` 바인딩

### 4.2 접속 방법
1. 현재 PC IP 확인: CMD에서 `ipconfig` → IPv4 주소
2. 다른 PC 브라우저: `http://<IP>:5173`
3. 방화벽에서 5173, 3000 포트 허용 필요할 수 있음

---

## 5. 주요 수정 이력

| 일자 | 내용 |
|------|------|
| - | main.tsx: App default import → named import 수정 |
| - | vite.config: 프록시 target localhost → 127.0.0.1 |
| - | vite.config: host: true 추가 (네트워크 노출) |
| - | api/index: 0.0.0.0 바인딩, getLocalIp() 추가 |

---

## 6. 참고 사항

- **실제 네이버 로그인 아님**: 데모용, 아이디/비밀번호 아무 값이나 입력 가능
- **Tomcat 미사용**: Node.js + Vite + Express 기반
- **API 프록시**: 프론트(5173) → /api 요청이 자동으로 API(3000)로 전달
