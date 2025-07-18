# Elevate Growth System - 성장 관리 시스템

## 프로젝트 개요
Elevate Growth System은 직원의 성장과 평가를 체계적으로 관리하는 웹 애플리케이션입니다.

## 주요 기능
- **평가 관리**: 직원 평가, 과업 관리, 점수 부여
- **AI 피드백 시스템**: OpenAI API를 활용한 피드백 생성 및 검증
- **대시보드**: 역할별 맞춤형 대시보드 (HR, 평가자, 피평가자)
- **알림 시스템**: 실시간 알림 및 알림 관리
- **데이터 분석**: 차트, 간트 차트, 성과 분석

## 기술 스택
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API
- **State Management**: React Context API, React Query
- **Routing**: React Router DOM

## 프로젝트 구조
```
src/
├── components/          # UI 컴포넌트
│   ├── Dashboard/      # 대시보드 관련 컴포넌트
│   ├── Evaluation/     # 평가 관련 컴포넌트
│   ├── Layout/         # 레이아웃 컴포넌트
│   ├── Notification/   # 알림 관련 컴포넌트
│   ├── Settings/       # 설정 관련 컴포넌트
│   └── ui/            # 기본 UI 컴포넌트 (shadcn/ui)
├── contexts/          # React Context
├── hooks/             # 커스텀 훅
├── lib/               # 라이브러리 및 유틸리티
│   ├── services/      # 데이터베이스 서비스
│   └── utils/         # 유틸리티 함수
├── pages/             # 페이지 컴포넌트
├── types/             # TypeScript 타입 정의
└── utils/             # 유틸리티 함수
```

## 설치 및 실행
1. 저장소 클론
```bash
git clone <repository-url>
cd elevate-growth-system
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
# .env 파일 생성
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. 개발 서버 실행
```bash
npm run dev
```

## AI 기능 설정
AI 피드백 기능을 사용하려면 OpenAI API 키가 필요합니다.
자세한 설정 방법은 `AI_SETUP.md` 파일을 참조하세요.

## 주요 개선사항 (리팩토링)

### 1. 타입 시스템 통합
- 모든 타입 정의를 `src/types/index.ts`로 통합
- 상수 정의 및 유틸리티 타입 추가
- 타입 안정성 향상

### 2. 서비스 레이어 모듈화
- 데이터베이스 서비스를 도메인별로 분리
- 일관된 에러 처리 시스템 구축
- 코드 재사용성 향상

### 3. 유틸리티 함수 통합
- 검증 로직을 `src/utils/validation.ts`로 통합
- 에러 처리를 `src/utils/errorHandler.ts`로 통합
- 중복 코드 제거

### 4. 커스텀 훅 개선
- 인증 관련 로직을 `useAuth` 훅으로 분리
- 평가 데이터 훅을 통합하여 `useEvaluationDataUnified` 생성
- 로직 재사용성 향상

### 5. 에러 처리 표준화
- `AppError` 클래스로 일관된 에러 처리
- 에러 타입별 분류 및 사용자 친화적 메시지
- 로깅 시스템 개선

## 개발 가이드라인

### 코드 스타일
- TypeScript strict 모드 사용
- 함수형 컴포넌트 및 훅 사용
- 일관된 네이밍 컨벤션 적용

### 상태 관리
- 로컬 상태는 `useState` 사용
- 전역 상태는 Context API 사용
- 서버 상태는 React Query 사용

### 에러 처리
- 모든 API 호출에 적절한 에러 처리
- 사용자 친화적 에러 메시지 표시
- 에러 로깅 및 모니터링

### 성능 최적화
- React.memo 및 useMemo 적절히 사용
- 코드 스플리팅 및 지연 로딩
- 불필요한 리렌더링 방지

## 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.
