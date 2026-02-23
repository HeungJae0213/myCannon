# 대포뽑기 게임 미니앱 개발 가이드

토스 앱 내에서 동작하는 대포뽑기 게임 서비스입니다. 사용자가 원하는 번호 범위와 중복 여부를 설정하고, 광고 시청을 통해 추가 기회를 얻어 재미있는 랜덤 추첨 게임을 즐길 수 있습니다.

---

## 프로젝트 소개

### 서비스 목적
사용자가 커스텀 가능한 번호 범위와 중복 여부를 설정하여 랜덤하게 대포알을 뽑는 게임형 미니앱입니다. 광고 시청을 통해 추가 기회를 얻을 수 있으며, 결과를 이미지로 저장하여 공유할 수 있습니다.

### 기술 구성
- **프론트엔드**: React 18 + Vite 7 + TypeScript
- **플랫폼**: Apps in Toss (WebView 기반)
- **주요 라이브러리**: React Router, html2canvas, Apps in Toss Web Framework
- **광고 시스템**: Google AdMob (보상형/전면형)

---

## 핵심 기능

### 1. 번호 범위/중복 설정
- 최소/최대값 입력으로 번호 범위 지정
- 중복 허용 여부 선택
- 실시간 입력 검증 및 안내

### 2. 게임 플레이
- 대포알 발사 버튼으로 랜덤 번호 추첨
- 부드러운 애니메이션 효과 (대포알 발사)
- 결과 표시 및 저장 기능
- 발사 횟수 관리 시스템

### 3. 광고 연동
- 발사 횟수 부족 시 광고 모달 표시
- 사용자 선택 기반 광고 플로우 (다크패턴 방지)
  - 광고 보기: 5회 기회 획득
  - 1회 받기: 1회 기회 획득
- 보상형/전면형 광고 자동 전환
- 광고 로딩 실패 시 대체 처리

### 4. 결과 저장
- html2canvas를 활용한 결과 이미지 생성
- Apps in Toss 갤러리 저장 API 연동
- JPEG 포맷으로 메모리 최적화
- 브라우저 다운로드 fallback 지원

---

## 프로젝트 구조

```
myCannon/
├── src/
│   ├── pages/
│   │   ├── WelcomeScreen.tsx        # 환영 화면 (첫 진입)
│   │   ├── ModeSelectScreen.tsx     # 번호 범위/중복 설정 화면
│   │   └── ResultScreen.tsx         # 결과 화면 (메인)
│   ├── components/
│   │   ├── CannonBody.tsx           # 대포 본체 컴포넌트
│   │   ├── CannonBall.tsx           # 대포알 컴포넌트
│   │   ├── CannonBallSimple.tsx     # 간단 대포알 컴포넌트
│   │   └── WelcomeBall.tsx          # 웰컴/결과 공 컴포넌트
│   ├── assets/                      # CSS 및 이미지
│   ├── types/
│   │   └── toss-admob.d.ts          # 광고/갤러리 API 타입 선언
│   ├── App.tsx                      # 앱 루트
│   ├── AppRouter.tsx                # 라우팅 및 페이지 전환
│   ├── main.tsx                     # 앱 진입점
│   └── index.css                    # 전역 스타일
├── public/
│   └── myCannon.png                 # 앱 아이콘
├── granite.config.ts                # Apps in Toss 설정
├── vite.config.ts                   # Vite 빌드 설정
├── package.json                     # 의존성 관리
└── my-cannon.ait                    # 배포용 패키지
```

---

## 개발 환경 설정

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn
- 토스 개발자 계정 및 콘솔 접근 권한

### 초기 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (로컬 네트워크 접근 가능)
npm run dev

# 빌드 (배포용)
npm run build

# 배포 (토스 콘솔)
npm run deploy
```

### 환경 변수 설정

`.env` 파일을 생성하여 다음 변수들을 설정할 수 있습니다:

```env
# 앱 아이콘 경로 (선택사항)
VITE_CANNON_ICON=./public/myCannon.png

# 개발 서버 호스트 (로컬 네트워크 IP)
VITE_DEV_HOST=192.168.0.10

# 광고 ID (테스트용)
VITE_REWARDED_AD_ID=ait-ad-test-rewarded-id
VITE_INTERSTITIAL_AD_ID=ait-ad-test-interstitial-id
```

---

## 페이지별 상세 설명

### WelcomeScreen
**역할**: 사용자 첫 진입 화면

**주요 기능**:
- 대포뽑기 게임 소개 및 환영 메시지
- "확인했어요" 버튼으로 다음 단계 이동
- Android 환경에서 뒤로가기 시 앱 종료 처리 (`closeView` API 사용)

**기술적 특징**:
- sessionStorage를 활용한 첫 방문 추적
- Apps in Toss `closeView` API 연동으로 앱 종료 처리

### ModeSelectScreen
**역할**: 번호 범위/중복 설정 화면

**주요 기능**:
- 최소/최대값 입력 (+/- 버튼 또는 직접 입력)
- 중복 허용 여부 선택
- 실시간 입력 검증 및 안내
- "시작하기" 버튼으로 결과 페이지로 이동

**상태 관리**:
- 설정 저장 기능으로 이전 설정 복원

### ResultScreen
**역할**: 대포뽑기 게임 메인 화면

**주요 기능**:
1. **대포알 발사 및 결과 표시**
   - 랜덤 번호 추첨
   - 대포알 발사 애니메이션
   - 발사 횟수 관리 (남은 횟수 표시)
   - 결과 표시 (공 이미지 포함)

2. **광고 연동**
   - 발사 횟수 부족 시 선택 모달 표시
   - 사용자 선택에 따른 광고 로딩
   - 광고 시청 완료 후 보상 지급

3. **결과 저장**
   - html2canvas로 결과 이미지 생성
   - Apps in Toss 갤러리 저장 API 호출
   - 메모리 최적화 (JPEG 포맷, scale 조정)

4. **뒤로가기 처리**
   - 이전 페이지(ModeSelectScreen)로 이동
   - Android 환경별 처리

---

## 광고 시스템 상세

### 광고 플로우

1. **발사 버튼 클릭** → 발사 횟수 확인
2. **발사 횟수 부족 시** → 선택 모달 표시
   - "광고 보기" 버튼: 광고 로딩 시작 → 시청 완료 시 5회 지급
   - "1회 받기" 버튼: 광고 없이 1회 지급
   - X 버튼: 광고 없이 1회 지급
3. **광고 로딩** → 보상형 우선 시도, 실패 시 전면형 전환
4. **광고 시청 완료** → 보상 지급 및 다음 광고 로드

### 다크패턴 방지 준수사항

- ✅ 발사 버튼 클릭 시 바로 광고 표시하지 않음
- ✅ 사용자가 명시적으로 "광고 보기" 버튼을 클릭했을 때만 광고 표시
- ✅ 모달에서 나갈 수 있는 선택지 제공 (X 버튼, "1회 받기" 버튼)
- ✅ 예상치 못한 순간에 광고가 뜨지 않도록 처리

### 광고 설정 파일

`src/types/toss-admob.d.ts`에서 광고 관련 타입을 관리합니다:
- 테스트용 광고 ID 설정
- 보상 지급 횟수 설정
- 환경별 광고 지원 여부 감지
- 재시도 로직 설정

---

## 메모리 및 성능 최적화 전략

토스앱 환경에서 안정적인 실행을 위해 다음과 같은 최적화를 적용했습니다:

### 이미지 처리 최적화
- html2canvas scale: 2.0 → 1.5로 감소 (메모리 44% 감소)
- PNG → JPEG 90% 품질로 변경 (파일 크기 및 메모리 감소)
- Canvas 사용 후 즉시 메모리 정리 (`width = 0, height = 0`)

### 애니메이션 최적화
- 대포알/공 애니메이션 요소 개수 최소화
- CSS 애니메이션 사용으로 GPU 가속 활용

### 리소스 관리
- 모든 타이머를 ref로 관리하여 정리 가능
- 컴포넌트 언마운트 시 모든 리소스 정리
- URL.createObjectURL 사용 후 revokeObjectURL 호출

---

## 네비게이션 및 뒤로가기 처리

### Android 환경 특별 처리

각 페이지에서 뒤로가기 버튼 동작을 다음과 같이 구현했습니다:

1. **WelcomeScreen (첫 페이지)**
   - 뒤로가기 → Apps in Toss `closeView()` API 호출 → 앱 종료
   - 다른 페이지 방문 후 복귀 시에도 동일하게 처리

2. **ModeSelectScreen**
   - 뒤로가기 → WelcomeScreen으로 이동
   - sessionStorage에 방문 플래그 설정

3. **ResultScreen**
   - 뒤로가기 → ModeSelectScreen으로 이동 (또는 `onBack` 콜백 호출)

### 구현 세부사항

- `popstate` 이벤트 리스너로 뒤로가기 감지
- 히스토리 가드(`pushState`)를 통한 중복 처리 방지
- 연타 방지를 위한 처리 중 플래그 사용
- sessionStorage를 활용한 첫 방문 추적

---

## 배포 프로세스

### 1. 빌드
```bash
npm run build
```

빌드 결과물:
- `dist/` 폴더에 최적화된 파일 생성
- `my-cannon.ait` 파일 생성 (토스 콘솔 업로드용)

### 2. 토스 콘솔 업로드

1. 토스 개발자 콘솔 접속
2. "앱 업로드" 메뉴 선택
3. `my-cannon.ait` 파일 업로드
4. 광고 ID를 실환경 값으로 변경 (테스트 ID → 실환경 ID)
5. 검수 신청 및 배포

### 3. 배포 전 체크리스트

주요 확인 사항:
- ✅ 메모리 최적화 완료
- ✅ CORS 설정 확인
- ✅ HTTPS 통신 확인
- ✅ 서드파티 쿠키 사용 없음
- ✅ 다크패턴 방지 정책 준수

---

## 환경 변수 및 설정

### 프론트엔드 설정

**granite.config.ts**
- `appName`: 토스 콘솔에 등록된 앱 이름
- `brand.displayName`: 앱 한글 이름
- `brand.primaryColor`: 앱 기본 색상
- `web.host`: 개발 서버 호스트 (로컬 네트워크 IP)

**vite.config.ts**
- CORS 설정: 실제 서비스 환경 도메인 허용
- 개발 서버 포트: 5173

### 광고 설정

**src/types/toss-admob.d.ts**
- `adUnitId`: 광고 ID
- `adType`: 광고 타입 (보상형/전면형)
- `REWARD_SPINS`: 광고 시청 시 지급할 발사 횟수 (기본: 5회)

---

## 주요 의존성

### 프로덕션 의존성
- `react`: UI 프레임워크
- `react-dom`: React DOM 렌더링
- `react-router-dom`: 페이지 라우팅
- `@apps-in-toss/web-framework`: 토스 인앱 SDK
- `html2canvas`: 이미지 캡처 라이브러리

### 개발 의존성
- `vite`: 빌드 도구
- `@vitejs/plugin-react`: React 플러그인
- `eslint`: 코드 품질 검사

---

## 문제 해결 가이드

### 빌드 오류
- **"Some chunks are larger than 500 kB"**: 경고 메시지일 뿐 배포에는 영향 없음
- **의존성 충돌**: `package-lock.json` 삭제 후 `npm install` 재실행

### 런타임 오류

**메모리 부족으로 인한 흰 화면**
- 이미지 저장 시 JPEG 포맷 사용 확인
- html2canvas scale 값 확인 (1.5 권장)

**광고가 표시되지 않음**
- 광고 ID가 올바른지 확인
- 토스 앱 환경에서만 광고가 정상 작동함 (로컬 개발 환경에서는 시뮬레이션)
- 콘솔 로그에서 광고 로딩 상태 확인

**뒤로가기가 작동하지 않음**
- Android 환경에서만 발생하는 문제인지 확인
- `closeView` API가 올바르게 import되었는지 확인
- sessionStorage 값 확인

### 성능 이슈

**대포알 발사가 느림**
- 번호 범위가 너무 넓지 않은지 확인 (권장: 100개 이하)
- 브라우저 개발자 도구에서 성능 프로파일링 실행

**이미지 저장이 실패함**
- Apps in Toss 갤러리 저장 API 권한 확인
- 브라우저 다운로드 fallback 동작 확인

---

## 개발 팁

### 로컬 개발 시 주의사항
- 토스 앱 기능(광고, 갤러리 저장)은 실제 토스 앱 환경에서만 정상 작동
- 로컬 개발 시에는 시뮬레이션 모드로 동작
- 모바일 디바이스에서 테스트하려면 PC의 로컬 IP 주소 사용

### 디버깅
- 브라우저 개발자 도구 콘솔에서 상세 로그 확인 가능
- 광고 관련 로그는 `[보상형]`, `[전면형]` 태그로 구분
- React DevTools로 컴포넌트 상태 확인

### 성능 모니터링
- Chrome DevTools Performance 탭 활용
- 메모리 프로파일링으로 메모리 누수 확인
- 실제 토스 앱 환경에서 테스트 권장

---

## 라이선스 및 기타

이 프로젝트는 Apps in Toss 플랫폼에서 동작하는 미니앱입니다. 토스 개발자 정책 및 가이드라인을 준수하여 개발되었습니다.

추가 질문이나 개선 제안은 프로젝트 이슈를 통해 공유해주세요.
