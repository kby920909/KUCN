# 새 PC 셋업 절차 (naver-login-app)

> 다른 PC에서 Cursor 폴더를 통째로 옮겨온 경우 이 문서를 따라 설정하세요.

---

## 1. Node.js 설치

### 1.1 확인

CMD 또는 PowerShell에서:

```cmd
node -v
npm -v
```

버전이 나오면 이미 설치된 것입니다. 없다면 아래 진행.

### 1.2 설치

1. [Node.js 공식 사이트](https://nodejs.org/) 접속
2. **LTS 버전** 다운로드 (권장: v20.x)
3. 설치 시 **"Add to PATH"** 체크
4. 설치 후 **CMD/PowerShell을 새로 열고** `node -v`, `npm -v` 확인

### 1.3 PowerShell 스크립트 실행 오류 시

```
이 시스템에서 스크립트를 실행할 수 없으므로 npm.ps1 파일을 로드할 수 없습니다
```

**해결:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

또는 **CMD**를 사용하세요.

---

## 2. node_modules 재설치 (필수)

다른 PC에서 가져온 `node_modules`는 **이 PC에서 그대로 쓰면 안 됩니다.**

- 플랫폼별 네이티브 모듈(oracledb 등)이 맞지 않을 수 있음
- 경로/환경이 달라 오류 발생 가능

### 2.1 삭제

다음 폴더를 **삭제**하세요:

- `d:\Cursor\naver-login-app\api\node_modules`
- `d:\Cursor\naver-login-app\frontend\node_modules`

### 2.2 자동 셋업 (권장)

프로젝트 루트에서 `setup.bat` 실행:

```cmd
cd d:\Cursor\naver-login-app
setup.bat
```

### 2.3 수동 설치

```cmd
cd d:\Cursor\naver-login-app\api
npm install

cd d:\Cursor\naver-login-app\frontend
npm install
```

---

## 3. .env 파일 설정

### 3.1 API .env 생성

`api/.env` 파일이 없으면 `.env.example`을 복사해 만듭니다:

```cmd
copy d:\Cursor\naver-login-app\api\.env.example d:\Cursor\naver-login-app\api\.env
```

### 3.2 내용 수정

`api/.env`를 열어 이 PC에서 사용할 값으로 수정:

```env
# Oracle DB (이 PC에서 접속 가능한 DB로 설정)
DB_USER=실제DB사용자
DB_PASSWORD=실제비밀번호
DB_CONNECT_STRING=호스트:포트/서비스명
```

**예시:**

- 로컬 Oracle: `DB_CONNECT_STRING=localhost:1521/ORCL`
- 원격 Oracle: `DB_CONNECT_STRING=192.168.1.100:1521/XE`

### 3.3 NJS-116 (10G 비밀번호) 오류 시

Thick 모드 사용을 위해 Oracle Instant Client 경로를 지정:

```env
ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient_21_13
```

이 PC에 설치된 Oracle Instant Client 경로로 바꾸세요.

---

## 4. Oracle Instant Client (선택)

- **Thin 모드**만 사용: 설치 불필요
- **NJS-116** 또는 Thick 모드 필요 시: [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html) 설치 후 `ORACLE_CLIENT_LIB_DIR` 설정

---

## 5. 실행 확인

### 5.1 API 서버

```cmd
cd d:\Cursor\naver-login-app\api
npm run dev
```

- 정상 시: `API 서버: http://localhost:3000` 출력
- 브라우저: http://localhost:3000/api/health 접속 → `{"status":"ok",...}` 확인

### 5.2 프론트엔드

새 터미널에서:

```cmd
cd d:\Cursor\naver-login-app\frontend
npm run dev
```

- 브라우저: http://localhost:5173 접속 → 로그인 화면 확인

### 5.3 한 번에 실행

```cmd
cd d:\Cursor\naver-login-app
start-dev.bat
```

---

## 6. 체크리스트

| 단계 | 내용 | 완료 |
|------|------|------|
| 1 | Node.js 설치 (`node -v`, `npm -v` 확인) | ☐ |
| 2 | `api/node_modules`, `frontend/node_modules` 삭제 | ☐ |
| 3 | `setup.bat` 실행 또는 `npm install` 수동 실행 | ☐ |
| 4 | `api/.env` 생성 및 DB 정보 입력 | ☐ |
| 5 | API `npm run dev` → 헬스체크 확인 | ☐ |
| 6 | Frontend `npm run dev` → 로그인 화면 확인 | ☐ |

---

## 7. 자주 나오는 오류

| 증상 | 원인 | 해결 |
|------|------|------|
| `'node'은(는) 내부 또는 외부 명령이 아닙니다` | Node.js 미설치 | 1장대로 Node.js 설치 |
| `'npm'은(는) 내부 또는 외부 명령이 아닙니다` | Node.js 미설치 또는 PATH 미등록 | 재설치 후 터미널 재시작 |
| `vite 은 내부 또는 외부 명령이 아닙니다` | `frontend/node_modules` 미설치 | `frontend`에서 `npm install` |
| `ORA-12154` | DB 접속 문자열 오류 | `DB_CONNECT_STRING` 확인 |
| `NJS-116` | 10G 비밀번호 방식 | Thick 모드 + `ORACLE_CLIENT_LIB_DIR` 설정 |
| 로그인 시 "서버 오류" | API 미실행 또는 DB 연결 실패 | API 로그 확인, `.env` 확인 |
