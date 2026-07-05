export const postsData = [
  {
    id: 3,
    title: '꿈틀 프로젝트 - 도서 검색 쿼리 성능 최적화 트러블슈팅',
    date: '2026-07-03',
    description: 'LOWER, DISTINCT, 다중 JOIN을 함께 사용한 복합 쿼리의 Full Table Scan 문제를 EXPLAIN ANALYZE로 분석하고, 인덱스 설계와 쿼리 개선을 통해 약 30% 성능을 향상시킨 과정',
    image: '/assets/ggumtle_query_optimization_thumbnail.png',
    tags: ['Java', 'Spring Boot', 'MySQL', 'JPA', 'Troubleshooting', 'Performance'],
    markdownPath: '/content/posts/ggumtle-query-optimization.md'
  },
  {
    id: 2,
    title: 'GitHub Pages 배포 시 public 폴더 경로(404) 문제 해결',
    date: '2026-06-30',
    description: 'GitHub Pages 배포 시 public 폴더 내 파일(이미지, 마크다운)이 404 에러로 로드되지 않는 문제의 원인과 해결 방법',
    image: '/assets/github_pages_deploy_thumbnail.png',
    tags: ['React', 'GitHub Pages', 'Deploy', 'Troubleshooting'],
    markdownPath: '/content/posts/github-pages-public-path.md'
  },
  {
    id: 1,
    title: 'React 다크모드 구현하기',
    date: '2026-06-25',
    description: 'Context API와 CSS Variables를 이용한 테마 시스템 구현기',
    image: '/assets/react_dark_mode_thumbnail.png',
    tags: ['React', 'CSS Variables', 'Context API'],
    markdownPath: '/content/posts/react-dark-mode.md'
  }
];
