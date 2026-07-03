# React 다크모드 구현하기

안녕하세요! 포트폴리오 사이트에서 사용자의 눈 피로도를 덜어주고 세련된 감성을 전하는 **라이트/다크 테마 전환 시스템**을 구축한 과정을 공유합니다.

블로그나 포트폴리오를 만들 때 다크 모드는 이제 선택이 아닌 필수 요소가 되었습니다. 이번 글에서는 React의 **Context API**와 **CSS Variables**를 조합하여 깜빡임(Flicker) 없이 부드럽고 가볍게 작동하는 테마 시스템을 만드는 방법을 살펴보겠습니다.

## 1. 왜 Context API와 CSS Variables 인가?

테마 상태를 관리할 때 주로 두 가지 접근 방식을 취할 수 있습니다:
1. CSS-in-JS (Styled Components, Emotion) 테마 프로바이더 사용
2. Vanilla CSS의 **CSS Custom Properties (Variables)** 제어

저희는 후자인 **CSS Variables** 방식을 채택했습니다. 그 이유는 다음과 같습니다:
- **렌더링 성능**: 테마 색상 변경 시 JavaScript 코드를 거치지 않고 브라우저가 직접 CSS 변수 값을 교체하므로 재렌더링 부하가 적습니다.
- **깜빡임 없는 테마 적용**: 로컬 스토리지에 저장된 이전 상태를 HTML 문서 루트(`:root` 혹은 `html`) 클래스에 직접 주입함으로써, React가 완전히 부팅(Hydration)되기 전에 스타일을 먼저 맞춰주어 깜빡임 현상을 효과적으로 방지합니다.

## 2. 뼈대 세우기: CSS 테마 변수 구성

먼저 `theme.css` 파일 최상단에 라이트 모드와 다크 모드(클래스 `.dark`)에 해당하는 CSS 변수들을 선언합니다.

```css
:root {
  --bg-color: #FAF8F5; /* 파스텔 베이지 */
  --text-color: #2E2B2A; /* 따뜻한 차콜 */
  --border-color: #E8E3DC;
  --card-bg: #FFFFFF;
}

.dark {
  --bg-color: #181615; /* 어두운 모카 */
  --text-color: #EAE5DF; /* 밝은 린넨 */
  --border-color: #383330;
  --card-bg: #221F1E;
}
```

이후 전역 컴포넌트들에서 색상이 쓰이는 곳마다 `var(--bg-color)`나 `var(--text-color)`와 같이 적용해 둡니다.

```css
body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```


## 3. React 상태 설계: ThemeContext 작성

전역 애플리케이션에서 테마 스위치 상태를 공유하고 토글 함수를 배포하기 위해 React Context를 작성합니다.

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 로컬 스토리지 또는 OS 기본 설정을 참고하여 초기 상태 판별
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## 4. 테마 상태 사용하기

작성한 프로바이더를 애플리케이션 루트(`index.js` 또는 `App.js`)에 씌운 다음, 헤더나 설정 컴포넌트에서 자유롭게 호출하여 토글 버튼을 만듭니다.

```javascript
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggler = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
```

## 5. 부드러운 전환 효과 (Micro-animation)

테마가 토글될 때 너무 급작스럽게 화면 색이 반전되면 사용자가 깜짝 놀랄 수 있으므로, `theme.css` 전역 요소에 적절한 **transition** 값을 주어 부드럽게 배경색과 테두리가 물들도록 연출해 줍니다:

```css
body, header, card, footer, button {
  transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease;
}
```

이렇게 하면 파스텔 베이지에서 은은한 다크 모카 톤으로 천천히 색상이 바뀌면서 사용자 인터랙션의 고급스러움을 크게 배가시킬 수 있습니다.

여러분들의 포트폴리오에도 지금 바로 도입해 보세요! 감사합니다 :)
