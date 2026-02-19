# 네이버 스타일 로그인 앱 (React + TypeScript + Node.js)

기존 `server.js`(Express 단일 서버)를 **React + TypeScript 프론트엔드**와 **Express + TypeScript API 서버**로 분리하고, **Docker** 및 **AWS** 배포를 지원하는 구조입니다. (톰캣 대신 Express + Docker 사용)

## 구조

```
naver-login-app/
├── frontend/          # React 18 + TypeScript + Vite
├── api/               # Express + TypeScript API 서버
├── docker-compose.yml # 프로덕션 Docker (frontend + api)
├── docker-compose.dev.yml
└── docs/
    └── AWS-DEPLOY.md # AWS 배포 가이드
```

- **프론트**: `localhost:5173` (Vite), API는 `/api`로 프록시
- **API**: `localhost:3000`, `/api/auth/login` 등 제공
- **Docker**: 프론트(nginx) + API 컨테이너, 한 번에 실행 가능

---

## 로컬 개발 (Docker 없이)

1. **API 서버**
   ```bash
   cd api
   npm install
   npm run dev
   ```
   → http://localhost:3000

2. **프론트엔드**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   → http://localhost:5173 (브라우저에서 접속)

프론트에서 로그인 시 `/api` 요청이 Vite 프록시를 통해 API 서버(3000)로 전달됩니다.

---

## Docker로 실행 (프로덕션 형태)

```bash
# 프로젝트 루트에서
docker compose up -d --build
```

- 프론트(nginx): http://localhost:80
- API: 내부 전용 (프론트 nginx가 `/api`를 API 컨테이너로 프록시)

종료: `docker compose down`

---

## AWS 배포

- **ECS/Fargate** 또는 **EC2 + Docker** 로 배포하는 방법을 `docs/AWS-DEPLOY.md`에 정리해 두었습니다.
- 이미지 저장소: **Amazon ECR**
- 필요 시 **ALB**로 80/443 부하 분산 및 HTTPS 설정 가능

자세한 단계는 [docs/AWS-DEPLOY.md](docs/AWS-DEPLOY.md) 참고.
