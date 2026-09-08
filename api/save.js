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
  const allowed = VALID_OPTIONS[dbName] || {};
  const result = {};
  for (const [key, validValues] of Object.entries(allowed)) {
    const raw = tags?.[key];
    if (!raw) continue;
    if (Array.isArray(raw)) {
      const filtered = raw.filter(v => validValues.includes(v));
      if (filtered.length) result[key] = filtered;
    } else if (validValues.includes(raw)) {
      result[key] = raw;
    }
  }
  return result;
}

function chunkText(text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += 2000) {
    chunks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: text.slice(i, i + 2000) } }] },
    });
  }
  return chunks;
}

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { classified, originalText } = req.body;
    if (!classified?.db || !classified?.title) {
      return res.status(400).json({ error: '분류 데이터가 없어요' });
    }

    const dbId = DB_IDS[classified.db];
    if (!dbId) return res.status(400).json({ error: `알 수 없는 db: ${classified.db}` });

    const notionKey = process.env.VITE_NOTION_API_KEY;
    if (!notionKey) return res.status(500).json({ error: 'Notion API 키가 설정되지 않았어요' });

    const properties = buildNotionProperties(classified);

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties,
        children: originalText ? chunkText(originalText) : [],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Notion API 오류');

    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[save]', err);
    res.status(500).json({ error: err.message });
  }
}
