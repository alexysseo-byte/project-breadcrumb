const DB_IDS = {
  '시티다이버 콘텐츠 아이디어': 'd42add14-7108-4199-bd07-2deddd7731b7',
  '시 아이디어': '763b39b8-900c-4e03-9cd2-61c468479a6f',
  '소설 아이디어': 'b3d96646-df1e-49af-b8b8-ffabf41bc5c9',
  '팟캐스트 아이디어': 'aaface18-cd59-46f9-8f1c-b796427cd367',
  '단상/기타': '3e9b1e79-0c56-40b0-8387-2c172c9dcee4',
  '비즈니스 아이디어': '527e2645-6732-477b-b705-47323f2e2094',
  '여행 아이디어': '8fa59c99-c9f5-4532-af3a-ef49a25b9097',
  '바이브 코딩 아이디어': '37363abd-a825-8031-933a-c0b692c246a3',
};

const VALID_OPTIONS = {
  '시티다이버 콘텐츠 아이디어': {
    '결':    ['음식·인문', '커피', '개인서사', '영국·여행', '포맷실험', '장기프로젝트'],
    '포맷':  ['롱폼', '쇼츠', '토킹헤드', '미정'],
    '플랫폼': ['유튜브', '인스타', '미정'],
  },
  '시 아이디어':         { '형식': ['자유시', '시조', '산문시', '기타'] },
  '소설 아이디어':       { '장르': ['SF', '문학', '스릴러', '퀴어', '기타'] },
  '팟캐스트 아이디어':   { '형식': ['솔로', '인터뷰', '대담', '기타'] },
  '비즈니스 아이디어':   { '영역': ['SaaS', '커뮤니티', '콘텐츠', '오프라인', '기타'] },
  '여행 아이디어':       { '지역': ['유럽', '영국', '아시아', '미주·남미', '국내', '기타'] },
  '단상/기타':           {},
  '바이브 코딩 아이디어': { '유형': ['웹앱', 'CLI', '자동화', 'API', '기타'] },
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

function buildNotionProperties(classified) {
  const tags = validateTags(classified.db, classified.tags || {});
  const props = {
    '제목': { title: [{ text: { content: classified.title } }] },
    '상태': { select: { name: '🌱 씨앗' } },
  };
  switch (classified.db) {
    case '시티다이버 콘텐츠 아이디어':
      if (tags['결']?.length)    props['결']    = { multi_select: tags['결'].map(v => ({ name: v })) };
      if (tags['포맷']?.length)  props['포맷']  = { multi_select: tags['포맷'].map(v => ({ name: v })) };
      if (tags['플랫폼']?.length) props['플랫폼'] = { multi_select: tags['플랫폼'].map(v => ({ name: v })) };
      break;
    case '시 아이디어':
      if (tags['형식']) props['형식'] = { select: { name: tags['형식'] } };
      break;
    case '소설 아이디어':
      if (tags['장르']) props['장르'] = { select: { name: tags['장르'] } };
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
    const { classified } = req.body;
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
