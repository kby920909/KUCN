# AWS 배포 가이드 (Docker + Express)

톰캣 대신 **Express API 서버**와 **React 프론트(nginx)** 를 Docker로 띄우고, AWS에서 운영하는 방법입니다.

## 전제

- AWS CLI 설정 완료 (`aws configure`)
- Docker 설치 및 로컬에서 `docker compose up` 동작 확인

---

## 1. Amazon ECR에 이미지 올리기

### ECR 저장소 생성

```bash
aws ecr create-repository --repository-name naver-login-api --region ap-northeast-2
aws ecr create-repository --repository-name naver-login-frontend --region ap-northeast-2
```

### 로그인 및 이미지 푸시

```bash
# 로그인 (리전에 맞게 수정)
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 빌드 및 태깅 (ACCOUNT_ID, 리전은 본인 값으로)
export ECR=<ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

docker build -t naver-login-api ./api
docker tag naver-login-api:latest $ECR/naver-login-api:latest
docker push $ECR/naver-login-api:latest

docker build -t naver-login-frontend ./frontend
docker tag naver-login-frontend:latest $ECR/naver-login-frontend:latest
docker push $ECR/naver-login-frontend:latest
```

---

## 2. 배포 방식 선택

### A. AWS ECS (Fargate) 권장

1. **클러스터 생성**  
   ECS 콘솔에서 Fargate 클러스터 생성.

2. **태스크 정의**
   - **api**: ECR `naver-login-api` 이미지, 포트 3000, 메모리/CPU 적절히 설정.
   - **frontend**: ECR `naver-login-frontend` 이미지, 포트 80.
   - 같은 태스크 정의에서 두 컨테이너를 넣거나, 서비스별로 나눠도 됨.

3. **서비스/ALB**
   - ALB 생성 후 80/443 리스너 연결.
   - 대상 그룹을 frontend(80) 컨테이너로 연결.
   - API만 외부에 노출하려면 두 번째 대상 그룹(3000)을 ALB 라우팅에 추가 (예: `/api` → api:3000).

4. **실제로는**  
   보통 frontend(nginx) 하나만 ALB에 붙이고, nginx가 `/api`를 api 컨테이너로 프록시하는 구조로 두면, **기존 docker-compose와 동일한 구성**을 ECS에서 재현할 수 있습니다.

### B. EC2 + Docker Compose

1. **EC2**  
   Amazon Linux 2 등에 Docker, Docker Compose 설치.

2. **프로젝트 복사 후**
   ```bash
   docker compose up -d --build
   ```
3. **보안 그룹**  
   인스턴스에 80(또는 443) 오픈.

4. **도메인/HTTPS**  
   Route 53 + ALB 또는 Nginx 리버스 프록시로 HTTPS 적용 가능.

---

## 3. 환경 변수 (선택)

- API 서버: `PORT`, DB 등 필요 시 ECS 태스크 정의 또는 EC2 `.env`에 설정.
- 프론트: 빌드 시 `VITE_API_BASE` 같은 값을 넣어 API 주소를 바꿀 수 있음 (현재는 `/api` 상대 경로라 동일 호스트면 추가 설정 불필요).

---

## 4. 요약

| 구분       | 내용                          |
|------------|-------------------------------|
| 웹 서버    | 톰캣 대신 **nginx**(프론트) + **Express**(API) |
| 배포       | **Docker** 이미지로 통일       |
| AWS        | **ECR** 이미지 저장, **ECS** 또는 **EC2**에서 실행 |

세부 단계는 AWS 콘솔/CLI 버전에 따라 조금 다를 수 있으니, 공식 문서(ECS, Fargate, ECR)를 함께 참고하면 됩니다.
