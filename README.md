# ✈️ MIN-AH LOG (민아로그)

하늘 높이 날아오르는 비행기처럼, 끊임없이 배움을 도모하고 스스로의 가치를 확장해 나가는 개발자 임민아의 **개인 포트폴리오 겸 기술 블로그** 프로젝트입니다.

## 🎨 주요 특징 및 기능

1. **파스텔 웜 베이지 테마 & 다크 모드**
   - 포근하고 세련된 라이트 모드(웜 베이지 `#FAF8F5` 베이스)와 눈이 편안한 다크 모드(모카 블랙 베이스)를 탑재했습니다.
   - CSS variables와 React Context API를 결합하여 깜빡임 없는 테마 전환을 제공합니다.

2. **반응형 캐러셀 슬라이더 (Carousel Slider)**
   - [lucid-dream.net](https://www.lucid-dream.net/) 스타일에서 영감을 얻은 미니멀 카드 슬라이더를 장착했습니다.
   - 아이템 개수가 3개를 초과할 때만 가로 조절 `<` `>` 화살표 버튼이 동적으로 활성화되며, 3개 이하일 때는 고정 배치 그리드로 단정하게 반응합니다.

3. **동적 마크다운(.md) 렌더링 파이프라인**
   - 별도의 백엔드 데이터베이스를 구축하지 않고도 로컬의 `.md` 문서를 fetch하여 브라우저에서 HTML로 동적 컴파일 및 파싱을 수행합니다.
   - 코드 구문 강조, 인용 블록, 이미지 반응형 스케일 등 완성도 높은 문서 가독성을 보장합니다.

4. **문서 내 목차(TOC) 앵커 스크롤**
   - 마크다운 파싱 시 각 제목을 자동으로 분석해 한국어/영어 고유 Slug ID를 주입합니다.
   - 우측의 사이드바 목차(TOC) 클릭 시 해당 위치로 정밀하고 부드럽게 스크롤 이동합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Library & Framework**: React (v19), React Router Dom (v7)
- **Styling**: CSS Variables (Custom properties), CSS Grid & Flexbox
- **Markdown & Icons**: Marked JS, Lucide React
- **Build Tool**: Create React App (react-scripts)

---

## 📂 폴더 구조 (Directory Structure)

```text
minah-log-frontend/
├── public/
│   ├── assets/              # 이미지, 스크린샷, 프로필 아이콘 등 정적 리소스
│   └── content/             # 마크다운 본문 문서 폴더
│       ├── posts/           # 블로그 글 (.md)
│       └── projects/        # 프로젝트 상세 설명 (.md)
├── src/
│   ├── components/          # 공통 및 레이아웃 컴포넌트
│   │   ├── Layout/          # Header, Footer, Layout
│   │   ├── Projects/        # 메인/서브 프로젝트 컴포넌트
│   │   └── SocialLinks/     # 채널 바로가기 소셜 컴포넌트
│   ├── config/              # 사이트 메타데이터 설정 (프로젝트 및 블로그 목록)
│   ├── context/             # ThemeContext (다크모드 제어)
│   ├── pages/               # 라우팅 페이지 컴포넌트 (Home, About, Projects, Blog 등)
│   ├── styles/              # 전역 스타일시트 (theme.css)
│   ├── App.js               # 라우팅 및 루트 정의
│   └── index.js             # 애플리케이션 진입점
```

---

## 🚀 프로젝트 시작 방법 (Getting Started)

프로젝트 로컬 환경에서 실행하고 빌드하기 위한 명령어 가이드입니다.

### 1) 패키지 설치
프로젝트 루트 폴더에서 필요한 의존성 라이브러리를 설치합니다:
```bash
npm install
```

### 2) 개발 서버 실행
로컬 개발 환경에서 애플리케이션을 구동합니다:
```bash
npm start
```
* 실행 후 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속할 수 있습니다.

### 3) 프로덕션 빌드
서버 배포를 위해 고도로 최적화된 정적 리소스 파일들을 빌드합니다:
```bash
npm run build
```

---

## ✍️ 콘텐츠 관리 방법 (Content Management)

포트폴리오 정보나 블로그 스토리를 추가/수정하는 방법은 아래 두 단계로 이루어집니다.

### 1) 신규 프로젝트 등록
1. `public/content/projects/` 하위에 신규 마크다운 파일(예: `my-project.md`)을 작성합니다.
2. `src/config/projectsData.js` 파일의 배열에 메타데이터 객체를 추가합니다:
   ```javascript
   {
     id: 5,
     title: '신규 프로젝트명',
     description: '간단 요약 설명',
     image: '/assets/이미지경로.png',
     period: '작업 기간',
     members: '참여 인원',
     github: '깃허브 링크',
     teamName: '팀 이름',
     techStack: ['React', 'MySQL'],
     markdownPath: '/content/projects/my-project.md' // 작성한 마크다운 파일 경로 매핑
   }
   ```

### 2) 신규 블로그 포스트 등록
1. `public/content/posts/` 하위에 신규 마크다운 파일(예: `my-post.md`)을 작성합니다.
2. `src/config/postsData.js` 파일에 메타데이터를 추가합니다:
   ```javascript
   {
     id: 3,
     title: '블로그 새 글 제목',
     date: '2026-06-16',
     description: '글 요약 소개',
     image: '대표 썸네일 이미지 주소',
     tags: ['React', 'CSS'],
     markdownPath: '/content/posts/my-post.md' // 작성한 마크다운 파일 경로 매핑
   }
   ```
