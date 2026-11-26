# WebSec Portfolio

웹 보안과 클라우드 네이티브 역량을 소개하는 개인 포트폴리오입니다. 바다를 모티프로 한 인터랙티브 3D 고래와, 프로젝트·기술 스택·활동 타임라인·연락처로 구성합니다.

## 현재 구성

- Next.js 16 / React 19
- TypeScript와 MongoDB / Mongoose 기반 콘텐츠 모델 및 서버 전용 연결
- Three.js + React Three Fiber 기반 3D 고래 히어로
- 반응형 공개 포트폴리오 랜딩 페이지

현재 공개 화면은 예시 데이터를 사용합니다. 데이터베이스를 연결해도 관리자 화면이나 GitHub 동기화가 자동으로 생기지는 않으며, 해당 기능은 다음 단계에서 구현합니다.

## 다음 단계

- MongoDB 기반 콘텐츠 관리
- GitHub 로그인 기반 개인 관리자 화면
- GitHub 레포지토리 동기화 및 프로젝트 상세 페이지
- 보안 헤더, 권한 검사, 입력 검증 적용

## 로컬 실행

Node.js 20.19 이상이 필요합니다. 이 프로젝트는 Node.js 24에서 개발·검증했습니다.

```powershell
npm.cmd install
npm.cmd run dev
```

터미널에 출력되는 localhost 주소를 브라우저에서 엽니다.

## 데이터베이스 설정

데이터베이스를 사용하지 않고도 현재 공개 화면을 실행하고 빌드할 수 있습니다. MongoDB 연결을 시험하려면:

1. MongoDB Atlas 데이터베이스 또는 로컬 MongoDB 서버를 준비합니다.
2. `.env.example`을 `.env.local`로 복사하고 `MONGODB_URI`에 연결 문자열을 입력합니다. 예: 로컬 MongoDB는 `mongodb://127.0.0.1:27017/websec_portfolio`.
3. `npm.cmd run db:check`로 연결과 ping을 확인합니다. 이 명령은 콘텐츠를 쓰지 않습니다.

`.env.local`과 실제 연결 문자열은 Git에 올리지 않습니다. Atlas의 네트워크 접근 설정 및 데이터베이스 사용자 권한도 확인하세요. 나중에 Vercel에서 데이터베이스를 사용할 때는 Vercel 프로젝트의 서버 전용 환경 변수에도 `MONGODB_URI`를 설정해야 합니다. 문자열에 `$`가 포함된다면 Next.js 환경 변수 확장 규칙에 맞게 `\$`로 이스케이프하세요.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

콘텐츠 모델과 공개 범위의 세부 사항은 [데이터 모델 문서](docs/data-model.md)를 참고하세요.
