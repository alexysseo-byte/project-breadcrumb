

## [2026-08-22] 마이그레이션 로그
- 프로젝트 디렉터리를 `~/project` 하위로 이동함 (Antigravity Agent).

## [2026-09-09] 노션 데이터베이스 및 아이디어 뱅크 연동 현황 조사
- Notion 로컬 데이터베이스(notion.db) 메타데이터 전수 검증 완료.
- '아이디어 뱅크' 페이지(ID: 37163abd-a825-817e-8544-f5a3471dccaf) 하위 블록 및 데이터베이스 구조 분석.
- 기존 앱 코드(server.js, api/classify.js, api/save.js, src/App.jsx)와 실제 노션 스키마 간 불일치(컬럼명, 옵션, 누락 DB 등) 식별 및 보고서 작성.

## [2026-09-09] [1단계 완료] 데이터베이스 11개 스키마 규격 확정 및 로컬 보안 환경 설정
- .gitignore 검증 완료 (.env 파일의 git 외부 유출 원천 차단 확인).
- 로컬 전용 .env 파일 생성 및 ~/.zprofile의 Anthropic API 키 안전 연동.
- 노션 실제 11개 데이터베이스(기존 8개 + 신규 3개)의 Title 속성명, Status 컬럼 유무, 세부 태그 옵션 및 Block/Collection ID 규격 최종 확정.

## [2026-09-09] [2단계 완료] AI 분류 프롬프트 및 DB_IDS 최신화
- api/classify.js 및 server.js의 SYSTEM_PROMPT를 11개 데이터베이스 분류 기준으로 전면 갱신.
- 시티다이버 콘텐츠의 변경된 결/포맷 옵션 및 신규 3개 DB(미래 소설, 브런치 글, 기타 컨텐츠)의 태그 규칙 반영.
- DB_IDS에 11개 데이터베이스 Block ID를 완벽하게 동기화.

## [2026-09-09] [3단계 완료] Notion 페이로드 빌더 및 유효성 검사 개편
- api/save.js 및 server.js의 buildNotionProperties 함수 전면 수정:
  1. Title 속성 분기 처리: 시티다이버('아이디어'), 미래 소설('아이디어 요약'), 그 외('제목').
  2. 상태(Status) 속성 분기 처리: 상태 컬럼이 없는 '미래 소설 설정' 제외 처리로 400 에러 원천 차단.
  3. 세부 태그 속성 매핑: 시티다이버의 '결' 단일 select화 및 신규 DB 3종 속성 매핑 완료.
- VALID_OPTIONS 및 DB_IDS 11개 데이터베이스 완전 동기화 완료.

## [2026-09-09] [4단계 완료] 프론트엔드 UI 확장
- src/App.jsx의 DB_EMOJI에 신규 3개 DB(미래 소설: 🚀, 브런치 글: ✍🏻, 기타 컨텐츠: 💡) 이모지 등록.
- DB_IDS에 11개 데이터베이스 ID 등록하여 하단 '저장 가능한 DB' 노션 딥링크(notion://) 완벽 연동.
- DB_TO_CAPY 상태 매핑에 신규 3종 DB 캐릭터 반응 연동.

## [2026-09-09] [5단계 완료] 정적 빌드 및 배포 무결성 검증
- npm run build 정상 실행 완료: PWA 아이콘 생성(192px, 512px) 및 Vite 프로덕션 번들링 성공 (753ms).
- git status 검증 완료: .env 파일의 외부 노출 차단 유지, 수정 대상 4개 파일(api/classify.js, api/save.js, server.js, src/App.jsx) 정상 반영 확인.






