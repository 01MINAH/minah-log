# GitHub Pages 배포 시 public 폴더 경로(404) 문제 해결하기

안녕하세요! 이번 글에서는 React 프로젝트를 **GitHub Pages**에 배포할 때 자주 마주치는 **public 폴더 내 리소스(이미지, 마크다운 파일 등)의 404 경로 에러** 현상과 이를 우아하게 해결하는 방법에 대해 공유하고자 합니다.


## 1. 문제의 발단: 로컬에선 잘 되는데 배포만 하면 404?

로컬 환경(`localhost:3000`)에서 작업할 때, `public/assets/image.png`나 `public/content/post.md` 같은 정적 파일들을 다음과 같이 absolute path로 호출하곤 합니다.

```javascript
// 로컬 환경에서는 정상 작동
fetch('/content/posts/my-post.md')
```

하지만 이 상태 그대로 GitHub Pages에 배포하면 높은 확률로 파일들을 찾지 못해 **404 Not Found** 에러가 발생합니다.

### 원인은 무엇일까요?
GitHub Pages는 사용자/단체 도메인이 아니라면 보통 저장소 이름을 하위 경로로 사용합니다.
- **도메인 구조**: `https://<유저명>.github.io/<저장소명>/`
- **실제 배포 주소**: `https://01MINAH.github.io/minah-log-frontend/`

이 상황에서 `/content/posts/my-post.md` 경로로 fetch 요청을 보내면, 브라우저는 도메인의 루트를 기준으로 경로를 해석하여 `https://01MINAH.github.io/content/posts/my-post.md`로 요청을 보냅니다. 즉, 중간의 **하위 경로인 `/minah-log-frontend`가 누락**되어 404 에러가 발생하는 것입니다.


## 2. 해결 방법 1: `PUBLIC_URL` 환경 변수 활용

React(Create React App)는 빌드 프로세스 중에 `process.env.PUBLIC_URL` 환경 변수를 제공합니다. 이 값은 `package.json`의 `homepage` 필드에 적힌 URL 경로를 바탕으로 자동으로 채워집니다.

### package.json 설정
```json
{
  "name": "minah-log-frontend",
  "homepage": "https://01MINAH.github.io/minah-log-frontend",
  ...
}
```

이렇게 지정하면 빌드 시 `process.env.PUBLIC_URL`은 `'/minah-log-frontend'`로 채워지며, 로컬 개발 환경(`npm start`) 시에는 빈 문자열(`''`)이 됩니다.

이제 컴포넌트 내에서 정적 자원을 불러올 때 이 변수를 접두사(Prefix)로 붙여줍니다.

```javascript
const postPath = `${process.env.PUBLIC_URL}/content/posts/my-post.md`;
```


## 3. 해결 방법 2: 중복 방지를 위한 안전한 URL 유틸 함수 작성

매번 `${process.env.PUBLIC_URL}`을 코드 곳곳에 직접 붙이다 보면, 실수로 슬래시(`/`)가 중복되거나 누락되어 경로가 깨질 수 있습니다. 또한, 이미 `PUBLIC_URL`이 붙은 경로에 또 붙여서 이중 경로가 되는 불상사가 일어날 수도 있습니다.

이를 방지하기 위해 경로를 안전하게 가공해 주는 **전역 URL 유틸 함수**를 작성해 사용합니다.

### `src/utils/url.js`
```javascript
export const getPublicUrl = (path) => {
  if (!path) return '';
  
  // 외부 링크나 data URI는 변환 없이 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  const publicUrl = process.env.PUBLIC_URL || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // 이미 PUBLIC_URL이 포함되어 있다면 중복 방지
  if (publicUrl && cleanPath.startsWith(publicUrl)) {
    return cleanPath;
  }
  
  return `${publicUrl}${cleanPath}`;
};
```

### 컴포넌트에서의 사용법
```javascript
import { getPublicUrl } from '../utils/url';

// 이미지 태그
<img src={getPublicUrl('/assets/minahlog_logo.png')} alt="Logo" />

// 마크다운 fetch
fetch(getPublicUrl('/content/posts/my-post.md'))
```

이 방식을 채택하면 개발 환경과 GitHub Pages 배포 환경 모두에서 별도의 코드 수정 없이 파일이 유연하고 정확하게 매핑됩니다.


## 4. 요약 및 느낀 점

- GitHub Pages와 같이 **서브디렉토리 경로**를 갖는 환경에 배포할 때는 반드시 정적 자원 주소에 기준이 되는 서브디렉토리를 덧붙여야 합니다.
- React에서는 `package.json`의 `homepage` 설정과 `process.env.PUBLIC_URL`을 사용해 이를 손쉽게 해결할 수 있습니다.
- 유틸 함수(`getPublicUrl`)를 구성하여 코드의 복잡성을 낮추고, 중복 경로 실수를 예방하는 것이 프로젝트 안정성에 큰 도움이 되었습니다.
