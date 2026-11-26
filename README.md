# WebSec Portfolio

웹 보안과 클라우드 네이티브 역량을 소개하는 개인 포트폴리오입니다. 바다를 모티프로 한 인터랙티브 3D 고래와, 프로젝트·기술 스택·활동 타임라인·연락처로 구성합니다.

## 현재 구성

- Next.js 16 / React 19
- TypeScript와 MongoDB / Mongoose 기반 콘텐츠 모델 및 서버 전용 연결
- Auth.js GitHub OAuth 기반 관리자 로그인 및 GitHub 계정 ID 제한
- Three.js + React Three Fiber 기반 3D 고래 히어로
- 반응형 공개 포트폴리오 랜딩 페이지

현재 공개 화면은 예시 데이터를 사용합니다. 관리자 로그인은 OAuth 설정 후 사용할 수 있으며, 콘텐츠 편집과 GitHub 동기화는 다음 단계에서 구현합니다.

## 다음 단계

- MongoDB 기반 콘텐츠 관리
- 관리자 콘텐츠 편집 화면
- GitHub 레포지토리 동기화 및 프로젝트 상세 페이지
- 보안 헤더, 권한 검사, 입력 검증 적용

## 로컬 실행

Node.js 24가 필요합니다. 수업 환경과 배포 환경에서도 같은 메이저 버전을 사용합니다.

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

## 관리자 GitHub 로그인 설정

1. GitHub에서 **Settings → Developer settings → OAuth Apps → New OAuth App**을 선택합니다.
2. 로컬 개발용 앱의 Homepage URL은 `http://localhost:3000`, Authorization callback URL은 `http://localhost:3000/api/auth/callback/github`으로 설정합니다. 실제 개발 서버가 다른 포트를 사용한다면 주소를 맞춰야 합니다.
3. 앱을 등록하고 Client ID와 새로 생성한 Client Secret을 `.env.local`에 추가합니다. 기존 `MONGODB_URI`는 유지합니다.

   ```env
   AUTH_GITHUB_ID=여기에_Client_ID
   AUTH_GITHUB_SECRET=여기에_Client_Secret
   AUTH_SECRET=충분히_긴_무작위_문자열
   ADMIN_GITHUB_ID=관리자의_숫자_GitHub_ID
   ```

   `AUTH_SECRET`은 32바이트 이상의 무작위 값으로 생성합니다. `ADMIN_GITHUB_ID`는 사용자 이름이 아니라 변하지 않는 숫자 ID입니다. `gh api users/사용자이름 --jq .id`로 확인할 수 있습니다. 설정값을 바꾼 뒤 개발 서버를 재시작하고 `http://localhost:3000/admin`에서 로그인합니다. 설정 누락이나 ID 불일치 시 접근은 거부됩니다.
4. 배포 환경에는 실제 배포 주소에 맞는 OAuth 앱과 서버 전용 환경 변수를 별도로 설정합니다. 프로덕션 예시 콜백은 `https://web-sec-portfolio.vercel.app/api/auth/callback/github`입니다. Vercel에서 사용할 `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_ID`를 지정한 후 재배포하세요. MongoDB를 사용하는 기능을 배포할 때는 `MONGODB_URI`와 Atlas 네트워크 접근도 별도로 설정해야 합니다.

Client Secret, AUTH_SECRET 및 데이터베이스 주소는 공유하거나 저장소에 커밋하지 않습니다. 관리자 인증은 GitHub에서 검증한 고유 ID를 서버에서 확인하며, 콘텐츠 변경 기능을 추가할 때에도 각 변경 요청에서 다시 권한을 확인해야 합니다.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

콘텐츠 모델과 공개 범위의 세부 사항은 [데이터 모델 문서](docs/data-model.md)를 참고하세요.
