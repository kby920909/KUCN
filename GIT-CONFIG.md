# Git 사용자 정보 설정

## 빠른 설정 (전체 프로젝트에 적용)

다음 명령어를 실행하세요:

```powershell
git config --global user.name "kby920909"
git config --global user.email "your-email@example.com"
```

**이메일 주소는 GitHub에 등록된 이메일을 사용하세요.**

## 설정 확인

설정이 제대로 되었는지 확인:

```powershell
git config --global user.name
git config --global user.email
```

## 이 저장소에만 적용하고 싶다면

`--global` 없이 실행:

```powershell
git config user.name "kby920909"
git config user.email "your-email@example.com"
```

## 완료 후 다시 커밋

```powershell
git commit -m "Initial commit - 더미 로그인 버전"
```
