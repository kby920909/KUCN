# Oracle DB 연동 설정

---

## 0. DPI-1047 / ORA-01031 해결 (64비트 Oracle Client 필수)

**Node.js 64비트**는 **Oracle Client 64비트**만 사용할 수 있습니다.  
Oracle 11g Client(32비트)나 Toad 32비트는 사용할 수 없습니다.

| 오류 | 원인 | 해결 |
|------|------|------|
| DPI-1047 | 32비트 Oracle Client 또는 미설치 | Oracle Instant Client 64비트 설치 |
| ORA-01031 (chakra policy) | DB 정책이 Thin 모드 차단 | Thick 모드 필수 → 64비트 Instant Client |

### Oracle Instant Client 64비트 설치 절차

1. [Oracle Instant Client 다운로드](https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html)
2. **Basic** 또는 **Basic Light** 패키지 다운로드 (로그인 필요할 수 있음)
3. zip 압축 해제 (예: `C:\oracle\instantclient_21_13` 또는 `D:\oracle\instantclient_21_13`)
4. `.env` 수정:
   ```
   ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient_21_13
   ```
   (압축 해제한 폴더 경로로 설정. 해당 폴더 안에 oci.dll이 있어야 함)
5. (선택) [Visual C++ Redistributable x64](https://learn.microsoft.com/ko-kr/cpp/windows/latest-supported-vc-redist) 설치

---

## 1. 패키지 설치

```cmd
cd api
npm install
```

## 2. .env 파일 생성

`api/.env.example`을 복사하여 `api/.env` 파일을 만들고, 실제 Oracle 접속 정보를 입력하세요.

```
DB_USER=실제DB사용자
DB_PASSWORD=실제비밀번호
DB_CONNECT_STRING=호스트:포트/서비스명
```

### DB_CONNECT_STRING 형식

- `localhost:1521/ORCL` - 로컬 Oracle, 서비스명 ORCL
- `192.168.1.100:1521/XE` - 원격 Oracle, 서비스명 XE
- `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=호스트)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=서비스명)))` - TNS 형식

## 3. Oracle 테이블 구조

기본으로 다음 테이블/컬럼을 사용합니다.

| 테이블 | 컬럼 | 설명 |
|--------|------|------|
| USERS | USER_ID | 사용자 아이디 (PK) |
| USERS | PASSWORD | 비밀번호 (평문 저장) |

### 테이블/컬럼명이 다른 경우

`.env`에 다음 환경 변수로 지정할 수 있습니다.

```
DB_TABLE=실제테이블명
DB_USER_ID_COL=아이디컬럼명
DB_PASSWORD_COL=비밀번호컬럼명
```

### 테이블 생성 예시 (Oracle SQL)

```sql
CREATE TABLE USERS (
  USER_ID   VARCHAR2(50) PRIMARY KEY,
  PASSWORD  VARCHAR2(100) NOT NULL,
  NAME      VARCHAR2(50),
  CREATED_AT DATE DEFAULT SYSDATE
);

INSERT INTO USERS (USER_ID, PASSWORD, NAME) VALUES ('admin', 'password123', '관리자');
INSERT INTO USERS (USER_ID, PASSWORD, NAME) VALUES ('test', 'test1234', '테스트');
```

## 4. 비밀번호 보안 (권장)

현재는 평문 비교입니다. 운영 환경에서는 **bcrypt** 등으로 해시 저장 후 비교하는 것을 권장합니다.

## 5. 서버 실행

```cmd
cd api
npm run dev
```

로그인 시 DB에서 해당 USER_ID로 SELECT 후 비밀번호를 비교합니다.

---

## 6. NJS-116 오류 (password verifier 0x939 미지원)

Oracle DB가 10G 구형 비밀번호 방식을 쓰면 Thin 모드에서 연결이 안 됩니다.

**해결: Thick 모드 사용** (Oracle Instant Client 필요)

### 6.1 Oracle Instant Client 설치

1. [Oracle Instant Client 다운로드](https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html) (Basic 패키지)
2. zip 압축 해제 (예: `C:\oracle\instantclient_21_13`)
3. `.env`에 경로 설정:
   ```
   ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient_21_13
   ```

### 6.2 Oracle Client 경로 (64비트만 지원)

Node.js 64비트는 **64비트 Oracle Client**만 사용 가능합니다.

| 클라이언트 | 비트 | 사용 가능 |
|-----------|------|----------|
| Oracle Instant Client 64비트 | 64 | ✅ |
| Oracle 11g Client | 32 | ❌ DPI-1047 |
| Toad for Oracle 32비트 | 32 | ❌ DPI-1047 |

**권장: Oracle Instant Client 64비트** (위 섹션 0 참고)
