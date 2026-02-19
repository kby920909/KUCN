# Git 인증 문제 해결

## 문제 상황
`git push` 실행 시 브라우저가 열리면서 localhost로 리다이렉트되는 문제

## 해결 방법

### 방법 1: Personal Access Token 사용 (가장 간단)

1. **GitHub에서 토큰 생성**
   - https://github.com/settings/tokens 접속
   - "Generate new token (classic)" 클릭
   - Note: "KUCN Project" 입력
   - Expiration: 원하는 기간 선택 (예: 90 days)
   - 권한 선택: `repo` 체크박스 선택
   - "Generate token" 클릭
   - **토큰 복사** (한 번만 보여줌!)

2. **Git Credential Manager 설정 변경**
   ```powershell
   git config --global credential.helper manager-core
   ```

3. **다시 푸시 시도**
   ```powershell
   git push -u origin main
   ```
   - Username: `kby920909` 입력
   - Password: 복사한 토큰 붙여넣기

### 방법 2: URL에 토큰 포함 (임시 해결)

```powershell
# 원격 저장소 URL 변경 (토큰 포함)
git remote set-url origin https://YOUR_TOKEN@github.com/kby920909/KUCN.git

# 푸시
git push -u origin main
```

⚠️ **주의**: 이 방법은 보안상 권장하지 않습니다. 토큰이 Git 설정에 저장됩니다.

### 방법 3: SSH 키 사용 (권장)

1. **SSH 키 생성** (이미 있다면 생략)
   ```powershell
   ssh-keygen -t ed25519 -C "pios997@naver.com"
   # 엔터를 계속 눌러서 기본값 사용
   ```

2. **SSH 키 복사**
   ```powershell
   cat ~/.ssh/id_ed25519.pub
   ```
   출력된 내용 전체 복사

3. **GitHub에 SSH 키 추가**
   - https://github.com/settings/keys 접속
   - "New SSH key" 클릭
   - Title: "My PC" 입력
   - Key: 복사한 SSH 키 붙여넣기
   - "Add SSH key" 클릭

4. **원격 저장소 URL을 SSH로 변경**
   ```powershell
   git remote set-url origin git@github.com:kby920909/KUCN.git
   ```

5. **푸시**
   ```powershell
   git push -u origin main
   ```

### 방법 4: Git Credential Manager 비활성화

브라우저 인증을 사용하지 않으려면:

```powershell
# Credential helper 제거
git config --global --unset credential.helper

# 또는 Windows Credential Manager 사용
git config --global credential.helper wincred
```

그 후 다시 푸시:
```powershell
git push -u origin main
```

## 빠른 해결 (권장)

**가장 빠른 방법은 Personal Access Token을 사용하는 것입니다:**

1. https://github.com/settings/tokens 에서 토큰 생성
2. 토큰 복사
3. 푸시 시:
   ```powershell
   git push -u origin main
   ```
   - Username: `kby920909`
   - Password: 복사한 토큰

## 확인

푸시가 성공하면:
- https://github.com/kby920909/KUCN 접속
- 파일들이 업로드되어 있는지 확인
