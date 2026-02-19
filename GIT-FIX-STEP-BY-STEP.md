# Git 푸시 문제 해결 - 단계별 가이드

## 문제 확인
- 원격 저장소 URL이 잘못 설정됨 (`YOUR_USERNAME/YOUR_REPO_NAME`)
- 추적되지 않은 파일들이 있음

## 해결 방법

### 1단계: 현재 원격 저장소 확인
```powershell
git remote -v
```

### 2단계: 잘못된 원격 저장소 제거
```powershell
git remote remove origin
```

### 3단계: 올바른 원격 저장소 추가
```powershell
git remote add origin https://github.com/kby920909/KUCN.git
```

### 4단계: 원격 저장소 확인
```powershell
git remote -v
```
다음과 같이 표시되어야 합니다:
```
origin  https://github.com/kby920909/KUCN.git (fetch)
origin  https://github.com/kby920909/KUCN.git (push)
```

### 5단계: 추적되지 않은 파일 추가
```powershell
git add .
```

### 6단계: 변경사항 커밋 (필요한 경우)
```powershell
git commit -m "Update files"
```

### 7단계: 브랜치 이름 확인 및 설정
```powershell
git branch
git branch -M main
```

### 8단계: GitHub에 푸시
```powershell
git push -u origin main
```

인증 요청 시:
- Username: `kby920909`
- Password: GitHub Personal Access Token

## 전체 명령어 (순서대로 실행)

```powershell
# 프로젝트 폴더로 이동
cd d:\Cursor\naver-login-app

# 원격 저장소 확인
git remote -v

# 잘못된 원격 저장소 제거
git remote remove origin

# 올바른 원격 저장소 추가
git remote add origin https://github.com/kby920909/KUCN.git

# 원격 저장소 확인
git remote -v

# 모든 파일 추가
git add .

# 커밋 (변경사항이 있는 경우)
git commit -m "Update files"

# 브랜치 이름 설정
git branch -M main

# 푸시
git push -u origin main
```
