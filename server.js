import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Valid option values for each DB — used to validate Claude's output before sending to Notion
const VALID_OPTIONS = {
  '시티다이버 콘텐츠 아이디어': {
    '결':    ['음식견문록', '밑층 구경', '무면허 가이드', '무자격 시공', '기타'],
    '포맷':  ['시리즈', '롱폼', '숏폼', '미정'],
    '플랫폼': ['유튜브', '인스타그램'],
  },
  '시 아이디어':         { '형식': ['자유시', '시조', '산문시', '기타'] },
  '소설 아이디어':       { '장르': ['SF', '문학', '스릴러', '퀴어', '기타'] },
  '미래 소설 설정':       { '레이어': ['세계관', '장치', '미정'] },
  '브런치 글 아이디어':   {
    '장르':   ['단편', '장편', '신규', '에세이', '시', '연재물', '산문', '기타'],
    '시리즈': ['자오나언', '음식견문록', '자유기고', '시간을 먹는 새'],
  },
  '팟캐스트 아이디어':   { '형식': ['솔로', '인터뷰', '대담', '기타'] },
  '비즈니스 아이디어':   { '영역': ['SaaS', '커뮤니티', '콘텐츠', '오프라인', '기타'] },
  '여행 아이디어':       { '지역': ['유럽', '영국', '아시아', '미주·남미', '국내', '기타'] },
  '단상/기타':           {},
  '바이브 코딩 아이디어': { '유형': ['웹앱', 'CLI', '자동화', 'API', '기타'] },
  '기타 컨텐츠 아이디어': { '프로젝트': ['breadcrumb', 'CROW', 'Diggin', '신규', '기타'] },
};

function validateTags(dbName, tags) {
  const valid = VALID_OPTIONS[dbName] || {};
  const result = {};
  for (const [key, allowed] of Object.entries(valid)) {
    const raw = tags?.[key];
    if (!raw) continue;
    if (Array.isArray(raw)) {
      const filtered = raw.filter(v => allowed.includes(v));
      if (filtered.length) result[key] = filtered;
    } else if (allowed.includes(raw)) {
      result[key] = raw;
    }
    // If value doesn't match any allowed option, silently drop it
  }
  return result;
}

const DB_IDS = {
  '시티다이버 콘텐츠 아이디어': 'd42add14-7108-4199-bd07-2deddd7731b7',
  '시 아이디어': '763b39b8-900c-4e03-9cd2-61c468479a6f',
  '소설 아이디어': 'b3d96646-df1e-49af-b8b8-ffabf41bc5c9',
  '팟캐스트 아이디어': 'aaface18-cd59-46f9-8f1c-b796427cd367',
  '단상/기타': '3e9b1e79-0c56-40b0-8387-2c172c9dcee4',
  '비즈니스 아이디어': '527e2645-6732-477b-b705-47323f2e2094',
  '여행 아이디어': '8fa59c99-c9f5-4532-af3a-ef49a25b9097',
  '바이브 코딩 아이디어': '37363abd-a825-8031-933a-c0b692c246a3',
  '기타 컨텐츠 아이디어': '37563abd-a825-802b-aa46-d3ba232b3526',
  '브런치 글 아이디어': '37e63abd-a825-806b-b366-e7db7096402a',
  '미래 소설 설정': '54fa9125-375a-450e-8a62-23461c63dbed',
};

const SYSTEM_PROMPT = `당신은 창작자의 아이디어를 분류하는 어시스턴트입니다.
입력된 텍스트를 분석해서 반드시 아래 JSON 형식으로만 응답하세요. 다른 말은 절대 하지 마세요.

{
  "db": "db 이름 (시티다이버 콘텐츠 아이디어 | 시 아이디어 | 소설 아이디어 | 미래 소설 설정 | 브런치 글 아이디어 | 팟캐스트 아이디어 | 단상/기타 | 비즈니스 아이디어 | 여행 아이디어 | 바이브 코딩 아이디어 | 기타 컨텐츠 아이디어)",
  "title": "아이디어를 한 줄로 요약한 제목 (20자 이내)",
  "tags": {}
}

분류 기준:
- 시티다이버 콘텐츠: City Diver 유튜브/인스타 영상 콘텐츠 아이디어. 도시, 음식, 커피, 여행, 영국 일상 등 영상화할 수 있는 것. 개인 서사, 사회 현상, 인간 심리에 대한 단상 중 릴스/토킹헤드로 찍을 수 있는 것도 포함.
- 시 아이디어: 시, 시조, 산문시 등 시적 표현의 씨앗이 될 단상이나 이미지.
- 소설 아이디어: 인물, 플롯, 서사 등 일반적인 문학 소설 소재.
- 미래 소설 설정: SF/미래 소설의 구체적인 세계관, 특수 장치, 미래 서비스 개념, 기술 설정.
- 브런치 글 아이디어: 브런치나 에세이 플랫폼에 기고할 에세이, 연재물, 산문, 자유 기고 아이디어.
- 팟캐스트 아이디어: 대화나 인터뷰, 음성 오디오로 풀어낼 수 있는 주제나 에피소드.
- 비즈니스 아이디어: 서비스, 제품, 사업 모델, 스타트업 아이디어.
- 여행 아이디어: 가고 싶은 곳, 여행 루트, 여행 방식에 대한 아이디어.
- 바이브 코딩 아이디어: AI 바이브 코딩으로 만들 웹앱, CLI, 자동화 스크립트, 개인 사이드 개발 프로젝트.
- 기타 컨텐츠 아이디어: 특정 프로젝트(breadcrumb, CROW, Diggin 등)에 종속된 컨텐츠나 기능 외 컨텐츠 아이디어.
- 단상/기타: 위 어디에도 명확히 속하지 않는 생각, 관찰, 넋두리, 메모.

tags 필드 규칙 (반드시 아래 선택지 중에서만 정확히 선택, 없거나 애매하면 "기타"):
- 시티다이버 콘텐츠: 
{
  "결": "음식견문록 또는 밑층 구경 또는 무면허 가이드 또는 무자격 시공 또는 기타 중 하나",
  "포맷": ["시리즈", "롱폼", "숏폼", "미정" 중 해당하는 것],
  "플랫폼": ["유튜브", "인스타그램" 중 해당하는 것]
}
- 시 아이디어: { "형식": "자유시 또는 시조 또는 산문시 또는 기타" }
- 소설 아이디어: { "장르": "SF 또는 문학 또는 스릴러 또는 퀴어 또는 기타" }
- 미래 소설 설정: { "레이어": ["세계관", "장치", "미정" 중 해당하는 것] }
- 브런치 글 아이디어: 
{
  "장르": "에세이 또는 단편 또는 장편 또는 산문 또는 시 또는 연재물 또는 신규 또는 기타",
  "시리즈": "자오나언 또는 음식견문록 또는 자유기고 또는 시간을 먹는 새 중 하나"
}
- 팟캐스트 아이디어: { "형식": "솔로 또는 인터뷰 또는 대담 또는 기타" }
- 비즈니스 아이디어: { "영역": "SaaS 또는 커뮤니티 또는 콘텐츠 또는 오프라인 또는 기타" }
- 여행 아이디어: { "지역": "유럽 또는 영국 또는 아시아 또는 미주·남미 또는 국내 또는 기타" }
- 바이브 코딩 아이디어: { "유형": "웹앱 또는 CLI 또는 자동화 또는 API 또는 기타" }
- 기타 컨텐츠 아이디어: { "프로젝트": "breadcrumb 또는 CROW 또는 Diggin 또는 신규 또는 기타" }
- 단상/기타: {}`;

function buildNotionProperties(classified) {
  const tags = validateTags(classified.db, classified.tags || {});
  const props = {};

  // 1. Title 속성 분기 (DB별 Title 컬럼명이 다름)
  if (classified.db === '시티다이버 콘텐츠 아이디어') {
    props['아이디어'] = { title: [{ text: { content: classified.title } }] };
  } else if (classified.db === '미래 소설 설정') {
    props['아이디어 요약'] = { title: [{ text: { content: classified.title } }] };
  } else {
    props['제목'] = { title: [{ text: { content: classified.title } }] };
  }

  // 2. 상태(Status) 속성 분기 ('미래 소설 설정'은 노션에 상태 컬럼 없음)
  if (classified.db !== '미래 소설 설정') {
    props['상태'] = { select: { name: '🌱 씨앗' } };
  }

  // 3. DB별 세부 태그 속성 매핑
  switch (classified.db) {
    case '시티다이버 콘텐츠 아이디어':
      if (tags['결']) props['결'] = { select: { name: tags['결'] } };
      if (tags['포맷']?.length) props['포맷'] = { multi_select: tags['포맷'].map(v => ({ name: v })) };
      if (tags['플랫폼']?.length) props['플랫폼'] = { multi_select: tags['플랫폼'].map(v => ({ name: v })) };
      break;
    case '시 아이디어':
      if (tags['형식']) props['형식'] = { select: { name: tags['형식'] } };
      break;
    case '소설 아이디어':
      if (tags['장르']) props['장르'] = { select: { name: tags['장르'] } };
      break;
    case '미래 소설 설정':
      if (tags['레이어']?.length) props['레이어'] = { multi_select: tags['레이어'].map(v => ({ name: v })) };
      break;
    case '브런치 글 아이디어':
      if (tags['장르']) props['장르'] = { select: { name: tags['장르'] } };
      if (tags['시리즈']) props['시리즈'] = { select: { name: tags['시리즈'] } };
      break;
    case '팟캐스트 아이디어':
      if (tags['형식']) props['형식'] = { select: { name: tags['형식'] } };
      break;
    case '비즈니스 아이디어':
      if (tags['영역']) props['영역'] = { select: { name: tags['영역'] } };
      break;
    case '여행 아이디어':
      if (tags['지역']) props['지역'] = { select: { name: tags['지역'] } };
      break;
    case '바이브 코딩 아이디어':
      if (tags['유형']) props['유형'] = { select: { name: tags['유형'] } };
      break;
    case '기타 컨텐츠 아이디어':
      if (tags['프로젝트']) props['프로젝트'] = { select: { name: tags['프로젝트'] } };
      break;
  }

  return props;
}

app.post('/api/classify', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: '텍스트가 없어요' });

    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Anthropic API 키가 설정되지 않았어요' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Claude API 오류');

    const rawText = data.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Claude 응답을 파싱할 수 없어요');

    const classified = JSON.parse(jsonMatch[0]);
    if (!DB_IDS[classified.db]) throw new Error(`알 수 없는 DB: ${classified.db}`);

    res.json(classified);
  } catch (err) {
    console.error('[classify]', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save', async (req, res) => {
  try {
    const { classified, originalText } = req.body;

    const notionKey = process.env.VITE_NOTION_API_KEY;
    if (!notionKey) return res.status(500).json({ error: 'Notion API 키가 설정되지 않았어요' });

    const dbId = DB_IDS[classified.db];
    if (!dbId) return res.status(400).json({ error: `DB를 찾을 수 없어요: ${classified.db}` });

    const properties = buildNotionProperties(classified);

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notionKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties,
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: originalText } }],
            },
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Notion API 오류');

    res.json({ ok: true, id: data.id });
  } catch (err) {
    console.error('[save]', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve built frontend in production
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')));
}

app.listen(PORT, () => console.log(`Breadcrumb server running on :${PORT}`));
