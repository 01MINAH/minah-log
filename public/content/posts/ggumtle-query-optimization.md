# 쿼리 성능 개선기: EXPLAIN ANALYZE로 Full Scan 잡아내기

꿈틀 프로젝트에서 도서 검색 기능을 개발하던 중, 멘토링에서 "이 쿼리 Full Table Scan 나요"라는 피드백을 받았습니다.
당시에는 검색이 잘 되고 있었기에 전혀 몰랐는데, `EXPLAIN ANALYZE`로 실행 계획을 열어봤더니 임시 테이블까지 생기고 있었습니다.

이번 글에서는 그 원인을 찾고, 쿼리와 인덱스를 어떻게 개선했는지 정리해 봅니다.

## 1. 어떤 쿼리였나

도서 검색 기능은 제목, 저자, 장르, 주제어를 동시에 검색할 수 있어야 했습니다. 그래서 자연스럽게 아래와 같은 구조의 쿼리를 작성했습니다.

- `LOWER()` 를 사용해 대소문자 무시 검색
- `LIKE '%keyword%'` 로 부분 문자열 매칭
- 장르(Genre), 주제어(Topic) 테이블과 다중 `JOIN`
- `DISTINCT` 로 중복 결과 제거

```java
// Repository Query (핵심 부분)
@Query("""
    SELECT DISTINCT b FROM Book b
    LEFT JOIN b.genre g
    LEFT JOIN b.bookTopics bt
    LEFT JOIN bt.topic t
    WHERE LOWER(b.title) LIKE LOWER(:keyword)
       OR LOWER(b.author) LIKE LOWER(:keyword)
       OR LOWER(g.name) LIKE LOWER(:keyword)
       OR LOWER(t.name) LIKE LOWER(:keyword)
""")
Page<Book> findBookListByKeyword(@Param("keyword") String keyword, Pageable pageable);
```

기능 자체는 문제없이 동작했지만, 데이터가 많아질수록 느려질 수밖에 없는 구조였습니다.

## 2. 원인 파악: EXPLAIN ANALYZE 뜯어보기

`EXPLAIN ANALYZE`로 실행 계획을 확인해 보니 문제가 명확하게 드러났습니다.

```sql
EXPLAIN ANALYZE
SELECT DISTINCT b.* FROM book b
LEFT JOIN genre g ON b.genre_id = g.id
LEFT JOIN book_topic bt ON b.id = bt.book_id
LEFT JOIN topic t ON bt.topic_id = t.id
WHERE LOWER(b.title) LIKE LOWER('%검색어%')
   OR LOWER(b.author) LIKE LOWER('%검색어%')
   ...
```

실행 계획에서 확인된 문제들은 다음과 같았습니다.

- **LOWER() 함수** — 컬럼에 함수를 감싸면 인덱스가 있어도 사용하지 못합니다. 결국 모든 행을 읽어야 하는 Full Scan이 됩니다.
- **DISTINCT** — 중복 제거를 위해 임시 테이블(Temporary Table)을 만들고 정렬까지 수행합니다.
- **인덱스 부재** — 검색 대상 컬럼들에 인덱스가 전혀 없었습니다.
- **LIKE '%keyword%'** — 앞에 와일드카드(`%`)가 있으면 인덱스를 타지 않습니다.

이 네 가지가 겹치면서 쿼리 실행 시간이 **약 11.7ms** 까지 늘어난 상태였습니다.


## 3. 인덱스 추가

가장 먼저 검색 조건과 JOIN에 사용되는 컬럼들에 인덱스를 추가했습니다.

```sql
-- 제목, 저자 복합 인덱스
CREATE INDEX idx_books_title_author
ON book(title, author);

-- 장르 외래키 인덱스
CREATE INDEX idx_books_genre_id
ON book(genre_id);

-- 주제어 이름 인덱스
CREATE INDEX idx_topics_name
ON topic(name);

-- book_topic 복합 인덱스 (Covering Index 목적)
CREATE INDEX idx_book_topics_book_id_topic_id
ON book_topic(book_id, topic_id);

-- 장르 이름 인덱스
CREATE INDEX idx_genres_name
ON genre(name);
```

`book_topic` 테이블의 복합 인덱스는 JOIN 조건에서 추가 조회 없이 인덱스만으로 결과를 만들 수 있도록 Covering Index 형태로 설계했습니다.


## 4. 쿼리 개선

인덱스를 추가한 뒤, 인덱스를 실제로 활용할 수 있도록 쿼리도 함께 수정했습니다.

```java
// 개선 후 Repository Query
@Query("""
    SELECT b FROM Book b
    LEFT JOIN b.genre g
    LEFT JOIN b.bookTopics bt
    LEFT JOIN bt.topic t
    WHERE b.title LIKE :keyword
       OR b.author LIKE :keyword
       OR g.name LIKE :keyword
       OR t.name LIKE :keyword
""")
Page<Book> findBookListByKeyword(@Param("keyword") String keyword, Pageable pageable);
```

변경한 핵심은 두 가지입니다.

- **`LOWER()` 제거** — 함수 없이 직접 컬럼을 비교하면 인덱스를 사용할 수 있습니다. 대신 DB 설정에서 대소문자를 구분하지 않도록 Collation을 맞춰주었습니다.
- **`DISTINCT` 제거** — JOIN 구조를 정리해서 중복이 발생하지 않는 방향으로 재설계했습니다.

## 5. 결과 비교

| 항목 | 개선 전 | 개선 후 |
|------|---------|---------|
| 실행 시간 | 약 11.7ms | 약 8.1ms |
| LOWER 사용 | O | X |
| DISTINCT | O | X |
| 인덱스 사용 | 미사용 | Covering Index Scan |
| 실행 계획 | Temporary Table | Index Scan |

실행 시간이 **약 30% 감소**했고, 가장 큰 변화는 Temporary Table 생성이 사라진 것이었습니다.
데이터가 많아질수록 이 차이는 더 크게 벌어질 수 있습니다.


## 6. 느낀 점

이번 작업을 통해 성능 최적화는 직관보다 데이터가 중요하다는 걸 느꼈습니다.

"느린 것 같다"는 감이 아니라, `EXPLAIN ANALYZE` 결과를 직접 읽어보고 나서야 문제의 원인을 정확히 알 수 있었습니다. 특히 `LOWER()` 같은 작은 함수 하나가 인덱스를 완전히 무력화할 수 있다는 점이 인상 깊었습니다.

인덱스는 만능이 아닙니다. 어떤 방식으로 데이터를 조회하느냐에 따라 같은 인덱스도 사용될 수도, 무시될 수도 있습니다. 쿼리와 인덱스를 함께 설계해야 한다는 점을 이번에 제대로 배웠습니다.
