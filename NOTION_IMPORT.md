# 🌊 WebSec Portfolio — 개발 기록

> 마지막 업데이트: 2026-11-23  
> 대상 저장소: <https://github.com/hamzgi/WebSec-Portfolio>

## 프로젝트 개요

웹 보안과 Cloud Native 역량을 소개하는 **관리형 개인 포트폴리오**입니다. 라이트 테마의 바다 그래픽과 인터랙티브 3D 고래를 중심 경험으로 사용합니다.

## 현재 상태

**1단계 완료: MongoDB Atlas 로컬 연결 확인 · 2단계 진행: 관리자 인증 구현, GitHub OAuth 앱 설정 대기**

**Vercel 프로덕션 배포 완료**  
<https://web-sec-portfolio.vercel.app>

### 완료된 기준점 — 2026-11-23

- GitHub 저장소 `main` 브랜치 초기화 및 첫 커밋 반영
- 커밋: `9161893 feat: add interactive ocean portfolio prototype`
- Next.js 16 / React 19 기반 공개 포트폴리오 구성
- Three.js + React Three Fiber 기반의 커서 추적형 3D 고래 구현
- Projects · About · Timeline · Contact 섹션 및 반응형 레이아웃 구현
- 프로덕션 빌드 정상 통과

## 제품 목표

방문자는 프로젝트와 기술적 사고 과정을 빠르게 탐색하고, 관리자는 코드 수정 없이 포트폴리오 콘텐츠를 직접 수정·공개할 수 있어야 합니다.

## 공개 포트폴리오 범위

- 3D 고래 히어로
- GitHub 레포 기반 프로젝트 목록 및 프로젝트 상세 페이지
- 자기소개, 기술 스택, 자격증, 활동 타임라인
- 이메일 · GitHub · LinkedIn 연락처

## 개인 관리자 CMS 범위

- GitHub 로그인 기반의 본인 전용 `/admin` 접근
- 프로젝트, 프로필, 기술 스택, 자격증, 타임라인, 연락처 편집
- 임시저장 / 공개 상태 및 노출 순서 관리
- GitHub 레포 동기화 후 포트폴리오용 설명을 별도로 보강

## 기술 구조

| 영역 | 선택안 |
| --- | --- |
| 프레임워크 | Next.js App Router + TypeScript |
| 공개 화면 | 현재 CSS 기반 디자인과 Three.js / React Three Fiber 유지 |
| 데이터 | MongoDB Atlas + Mongoose |
| 인증 | Auth.js GitHub OAuth + 관리자 GitHub 계정 allowlist |
| 관리자 UI | Tailwind CSS v4 + shadcn/ui |
| 배포 | Vercel |

## 보안 원칙

- 방문자 계정과 회원가입은 만들지 않음
- 모든 관리자 변경 요청에서 서버 측 권한을 재검증
- MongoDB URI, Auth 시크릿, GitHub 토큰은 환경 변수로만 관리
- GitHub 외부 데이터를 안전하게 렌더링하고 임의 HTML은 삽입하지 않음
- 문의 폼 추가 시 rate limit 적용
- 보안 헤더와 클릭재킹 방지 적용

## 구현 로드맵

1. **기반 정리** — TypeScript 전환, 데이터 모델, 환경 변수, MongoDB 연결
2. **관리자 인증** — Auth.js GitHub 로그인과 `/admin` 권한 제한
3. **콘텐츠 CRUD** — 프로필 · 기술 스택 · 자격증 · 타임라인 관리
4. **GitHub 동기화** — 레포 가져오기, 대표 프로젝트 선정, 프로젝트 상세 페이지
5. **공개 화면 연동** — DB 콘텐츠를 현재 3D 포트폴리오에 연결
6. **보안 · 검증 · 배포** — 입력 검증, 보안 헤더, rate limit, Vercel 배포

## 다음 구현 단계

### Phase 1 — 데이터 계층과 관리자 기반 준비

- TypeScript 기반으로 전환
- `Profile`, `Project`, `Timeline`, `Credential`, `Skill`, `SiteSettings` 데이터 모델 설계
- MongoDB 연결 및 환경 변수 구성
- 이후 Auth.js 기반 GitHub 로그인과 관리자 권한 구조를 추가

## 변경 로그

### 2026-11-26 — 관리자 인증

- MongoDB Atlas에 로컬에서 연결하고 ping에 성공했습니다.
- Auth.js와 GitHub OAuth를 사용해 `/admin` 로그인 및 로그아웃 화면을 추가했습니다.
- GitHub의 숫자 계정 ID로 관리자만 허용하고 세션을 읽을 때도 서버에서 권한을 재확인합니다.
- 인증되지 않은 사용자와 다른 계정의 접근 차단, 허용 계정의 접근을 테스트했습니다.
- GitHub OAuth 앱 생성 및 Client ID/Secret 설정 후 실제 GitHub 로그인을 검증해야 합니다. 콘텐츠 편집 기능은 다음 단계입니다.

### 2026-11-26 — 포트폴리오 기능 1단계

- 기존 공개 화면과 3D 고래 코드를 TypeScript로 전환했습니다.
- 프로필, 프로젝트, 기술 스택, 자격증, 타임라인, 사이트 설정의 Mongoose 모델을 추가했습니다.
- 서버 전용 MongoDB 연결, 환경 변수 예제, 연결 점검 명령과 모델 검증 테스트를 추가했습니다.
- 기존 공개 화면은 예시 콘텐츠를 유지합니다. 이후 MongoDB Atlas 연결을 확인했으며, 콘텐츠 관리 화면은 아직 구현 전입니다.

### 2026-11-26

- 정면에서도 알아볼 수 있도록 고래 양옆 지느러미를 다시 제작하고 기존 볼 아래에 튀어나오던 조각을 정리했습니다.
- 고래가 기본적으로 정면을 향하고 페이지의 마우스 커서를 따라 부드럽게 고개를 움직이도록 조정했습니다.
- 고래의 푸른 재질을 매트하게 조정하고 몸통과 흰 배의 경계, 얼굴 표정과 은은한 볼터치를 다듬었습니다.
- Blender에서 편집 가능한 고래 원본과 본·웨이트·유영 애니메이션이 포함된 GLB 모델을 제작했습니다.
- 포트폴리오에 GLB를 연결하고 마우스 추적 동작을 유지했습니다. 고래 얼굴의 눈과 입은 몸통 옆면이 아닌 머리 앞쪽으로 배치했습니다.

### 2026-11-23

- 3D 바다 테마 포트폴리오 프로토타입을 GitHub `main` 브랜치에 등록했습니다.
- 귀여운 고래 형태의 인터랙티브 3D 모델을 중심 요소로 구현했습니다.
- 고래를 기본 타원 도형 조합에서 단일 곡면 몸통, 조형 지느러미·꼬리, 양쪽 눈·미소·볼터치·배 주름을 갖춘 캐릭터형 모델로 개선했습니다.
- 코드 수정 없이 관리할 수 있는 CMS 전환 계획을 확정했습니다.
- Vercel Hobby 프로젝트 `web-sec-portfolio`를 프로덕션으로 배포했습니다: <https://web-sec-portfolio.vercel.app>
