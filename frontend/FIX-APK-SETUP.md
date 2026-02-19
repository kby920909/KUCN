# APK 설정 문제 해결

## 문제점
1. 명령어가 한 줄로 붙어서 실행됨
2. frontend 폴더에서 git add 실행 (루트에서 실행해야 함)
3. APK 파일 복사 확인 필요

## 해결 방법

### 1단계: APK 파일 복사 확인 및 재실행

```powershell
cd d:\Cursor\naver-login-app\frontend

# public 폴더 확인
Test-Path "public"

# APK 파일이 있는지 확인
Test-Path "android\app\build\outputs\apk\debug\app-debug.apk"

# public 폴더 생성 (없는 경우)
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public"
}

# APK 파일 복사 (명령어를 분리해서 실행)
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "public\app-debug.apk" -Force

# 복사 확인
Test-Path "public\app-debug.apk"
```

### 2단계: 루트 폴더로 이동하여 Git 작업

```powershell
# 루트 폴더로 이동
cd d:\Cursor\naver-login-app

# 변경사항 확인
git status

# 모든 변경사항 추가
git add .

# 커밋
git commit -m "Add APK download button and APK file"

# 푸시
git push origin main
```

## 전체 명령어 (한 줄씩 실행)

```powershell
# 1. frontend 폴더로 이동
cd d:\Cursor\naver-login-app\frontend

# 2. public 폴더 생성
if (-not (Test-Path "public")) { New-Item -ItemType Directory -Path "public" }

# 3. APK 파일 복사
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "public\app-debug.apk" -Force

# 4. 루트 폴더로 이동
cd d:\Cursor\naver-login-app

# 5. 변경사항 확인
git status

# 6. 모든 변경사항 추가
git add .

# 7. 커밋
git commit -m "Add APK download functionality"

# 8. 푸시
git push origin main
```
