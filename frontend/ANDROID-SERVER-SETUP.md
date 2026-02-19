# 안드로이드 앱 서버 연결 설정 가이드

## 문제점

안드로이드 앱은 웹 브라우저와 달리 `localhost`나 `127.0.0.1`을 사용할 수 없습니다. 안드로이드 앱에서 PC의 로컬 서버에 접근하려면 **실제 IP 주소**를 사용해야 합니다.

## 해결 방법

### 1. PC의 로컬 IP 주소 확인

Windows에서 IP 주소 확인:
```bash
ipconfig
```

출력 예시:
```
무선 LAN 어댑터 Wi-Fi:
   IPv4 주소 . . . . . . . . . : 192.168.5.49
```

여기서 `192.168.5.49`가 PC의 로컬 IP 주소입니다.

### 2. API 서버 설정 변경

`frontend/src/config/api.ts` 파일을 열고 `DEV_API_SERVER` 값을 PC의 IP 주소로 변경:

```typescript
const DEV_API_SERVER = 'http://192.168.5.49:3000'; // 여기를 PC IP로 변경
```

### 3. 네트워크 요구사항

✅ **PC와 안드로이드 기기가 같은 Wi-Fi 네트워크에 연결되어 있어야 합니다**
- 같은 라우터에 연결되어 있어야 함
- 모바일 데이터로는 접근 불가

### 4. 방화벽 설정

Windows 방화벽에서 포트 3000을 허용해야 할 수 있습니다:

1. Windows 보안 → 방화벽 및 네트워크 보호
2. 고급 설정
3. 인바운드 규칙 → 새 규칙
4. 포트 선택 → TCP → 특정 로컬 포트: 3000
5. 연결 허용 → 모든 프로필 선택

### 5. API 서버 실행 확인

안드로이드 앱을 실행하기 전에 API 서버가 실행 중인지 확인:

```bash
# API 서버 시작
cd d:\Cursor\naver-login-app\api
npm start

# 또는 전체 서버 시작
cd d:\Cursor\naver-login-app
start-dev.bat
```

서버가 `http://192.168.5.49:3000`에서 실행 중이어야 합니다.

## 사용 시나리오

### 시나리오 1: 로컬 개발 (PC와 안드로이드 기기 같은 Wi-Fi)

1. PC에서 API 서버 실행 (`npm start` 또는 `start-dev.bat`)
2. `frontend/src/config/api.ts`에서 `DEV_API_SERVER`를 PC IP로 설정
3. 안드로이드 앱 빌드 및 실행
4. 앱이 PC의 API 서버에 연결됨

### 시나리오 2: 프로덕션 배포 (실제 서버 사용)

1. 실제 서버에 API 배포
2. `frontend/src/config/api.ts`에서 `PROD_API_SERVER`를 실제 서버 URL로 설정
3. 프로덕션 모드로 빌드 (`npm run build`)
4. 안드로이드 앱 빌드 및 배포

## 테스트 방법

### 웹 브라우저에서 테스트

안드로이드 앱을 빌드하기 전에 웹 브라우저에서 먼저 테스트:

1. `frontend/src/config/api.ts`에서 `DEV_API_SERVER`를 PC IP로 설정
2. 웹 브라우저에서 `http://192.168.5.49:5173` 접속
3. API 호출이 정상 작동하는지 확인

### 안드로이드 앱에서 테스트

1. 안드로이드 기기를 PC와 같은 Wi-Fi에 연결
2. 안드로이드 앱 실행
3. 로그인 시도
4. 네트워크 오류가 발생하면:
   - PC IP 주소가 올바른지 확인
   - 방화벽 설정 확인
   - API 서버가 실행 중인지 확인

## 문제 해결

### 문제: "Network request failed" 오류

**원인:**
- PC IP 주소가 잘못됨
- PC와 안드로이드 기기가 다른 Wi-Fi에 연결됨
- 방화벽이 포트를 차단함
- API 서버가 실행되지 않음

**해결:**
1. `ipconfig`로 PC IP 확인
2. 같은 Wi-Fi 네트워크 확인
3. 방화벽 설정 확인
4. API 서버 실행 확인

### 문제: CORS 오류

**원인:**
- API 서버에서 CORS 설정이 안 됨

**해결:**
`api/src/index.ts`에서 CORS 설정 확인:
```typescript
app.use(cors({
  origin: true, // 모든 origin 허용 (개발용)
  credentials: true
}));
```

## 현재 설정 확인

현재 설정된 IP 주소를 확인하려면:
- `frontend/src/config/api.ts` 파일의 `DEV_API_SERVER` 값 확인

## 주의사항

⚠️ **개발용 IP 주소는 Wi-Fi 네트워크가 변경되면 바뀔 수 있습니다**
- IP 주소가 변경되면 `api.ts` 파일도 업데이트해야 함
- 고정 IP를 사용하거나 DHCP 예약을 설정하는 것을 권장

⚠️ **프로덕션 배포 시에는 실제 서버 URL을 사용해야 합니다**
- 로컬 IP 주소는 인터넷에서 접근 불가
- 실제 도메인과 HTTPS를 사용해야 함
