# Git 명령어 가이드

## 현재 위치 확인

먼저 현재 위치를 확인하세요:

```powershell
pwd
# 또는
Get-Location
```

## 프로젝트 폴더로 이동

```powershell
cd d:\Cursor\naver-login-app
```

## 상태 확인

```powershell
# Git 저장소인지 확인
git status

# 원격 저장소 확인
git remote -v
```

## GitHub에 푸시

```powershell
# 1. 프로젝트 폴더로 이동
cd d:\Cursor\naver-login-app

# 2. 브랜치 이름 설정
git branch -M main

# 3. 푸시
git push -u origin main
```

## 전체 명령어 (한 번에)

```powershell
cd d:\Cursor\naver-login-app
git status
git branch -M main
git push -u origin main
```
