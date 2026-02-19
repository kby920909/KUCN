# Git 설정 및 GitHub 업로드 가이드

## 단계별 명령어

PowerShell에서 다음 명령어를 **하나씩** 실행하세요:

### 1단계: 프로젝트 폴더로 이동
```powershell
cd d:\Cursor\naver-login-app
```

### 2단계: Git 초기화 (처음 한 번만)
```powershell
git init
```

### 3단계: 모든 파일 추가
```powershell
git add .
```

### 4단계: 첫 커밋
```powershell
git commit -m "Initial commit - 더미 로그인 버전"
```

### 5단계: GitHub 저장소 연결
```powershell
git remote add origin https://github.com/kby920909/KUCN.git
```

**만약 이미 연결되어 있다면:**
```powershell
git remote set-url origin https://github.com/kby920909/KUCN.git
```

### 6단계: 브랜치 이름 설정 및 푸시
```powershell
git branch -M main
git push -u origin main
```

## 문제 해결

### 문제 1: "remote origin already exists" 오류

**해결 방법:**
```powershell
git remote remove origin
git remote add origin https://github.com/kby920909/KUCN.git
```

### 문제 2: "Authentication failed" 오류

**해결 방법:**

**옵션 A: Personal Access Token 사용 (권장)**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택: `repo` 체크
4. 토큰 생성 후 복사
5. 푸시 시 비밀번호 대신 토큰 입력

**옵션 B: GitHub Desktop 사용**
- GitHub Desktop 앱 설치하여 사용

**옵션 C: SSH 키 사용**
```powershell
git remote set-url origin git@github.com:kby920909/KUCN.git
```

### 문제 3: "fatal: not a git repository" 오류

**해결 방법:**
```powershell
cd d:\Cursor\naver-login-app
git init
```

### 문제 4: "nothing to commit" 메시지

**해결 방법:**
- 이미 커밋이 되어있는 상태입니다
- 바로 푸시하면 됩니다:
```powershell
git push -u origin main
```

### 문제 5: "failed to push some refs" 오류

**해결 방법:**
GitHub 저장소에 이미 파일이 있는 경우:
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## 전체 명령어 (한 번에 복사)

```powershell
cd d:\Cursor\naver-login-app
git init
git add .
git commit -m "Initial commit - 더미 로그인 버전"
git remote add origin https://github.com/kby920909/KUCN.git
git branch -M main
git push -u origin main
```

## 확인 방법

업로드가 성공했는지 확인:
1. https://github.com/kby920909/KUCN 접속
2. 파일들이 업로드되어 있는지 확인
