# GitHub에 푸시하기

## 현재 상태 확인

먼저 원격 저장소가 제대로 연결되었는지 확인:

```powershell
git remote -v
```

다음과 같이 표시되어야 합니다:
```
origin  https://github.com/kby920909/KUCN.git (fetch)
origin  https://github.com/kby920909/KUCN.git (push)
```

## GitHub에 푸시

다음 명령어를 실행하세요:

```powershell
git branch -M main
git push -u origin main
```

## 문제 해결

### 문제 1: "remote origin already exists" 오류

원격 저장소가 이미 설정되어 있지만 URL이 다른 경우:

```powershell
git remote remove origin
git remote add origin https://github.com/kby920909/KUCN.git
git push -u origin main
```

### 문제 2: 인증 오류 (Authentication failed)

**해결 방법 A: Personal Access Token 사용 (권장)**

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. Note: "KUCN Project" 입력
4. Expiration: 원하는 기간 선택
5. 권한 선택: `repo` 체크박스 선택
6. "Generate token" 클릭
7. 생성된 토큰 복사 (한 번만 보여줌!)
8. 푸시 시:
   - Username: `kby920909`
   - Password: 복사한 토큰 붙여넣기

**해결 방법 B: GitHub Desktop 사용**

GitHub Desktop 앱을 설치하여 사용하면 인증이 자동으로 처리됩니다.

**해결 방법 C: SSH 키 사용**

```powershell
git remote set-url origin git@github.com:kby920909/KUCN.git
git push -u origin main
```

### 문제 3: "failed to push some refs" 오류

GitHub 저장소에 이미 파일이 있는 경우:

```powershell
git pull origin main --allow-unrelated-histories
# 충돌이 있으면 해결 후
git push -u origin main
```

또는 강제 푸시 (주의: 기존 파일 덮어씀):

```powershell
git push -u origin main --force
```

## 전체 명령어 순서

```powershell
# 1. 원격 저장소 확인
git remote -v

# 2. 원격 저장소 설정 (없는 경우)
git remote add origin https://github.com/kby920909/KUCN.git

# 3. 브랜치 이름 설정
git branch -M main

# 4. 푸시
git push -u origin main
```

## 성공 확인

푸시가 성공하면:
1. https://github.com/kby920909/KUCN 접속
2. 파일들이 업로드되어 있는지 확인
