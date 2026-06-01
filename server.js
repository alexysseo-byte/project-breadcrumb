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

const DB_IDS = {
  '시티다이버 콘텐츠 아이디어': '3a43ef90-447d-4a1c-b237-40c473e9844b',
  '시 아이디어': '763b39b8-900c-4e03-9cd2-61c468479a6f',
  '소설 아이디어': 'b3d96646-df1e-49af-b8b8-ffabf41bc5c9',
  '팟캐스트 아이디어': 'aaface18-cd59-46f9-8f1c-b796427cd367',
  '단상/기타': '3e9b1e79-0c56-40b0-8387-2c172c9dcee4',
  '비즈니스 아이디어': '527e2645-6732-477b-b705-47323f2e2094',
  '여행 아이디어': '8fa59c99-c9f5-4532-af3a-ef49a25b9097',
};

const SYSTEM_PROMPT = `당신은 창작자의 아이디어를 분류하는 어시스턴트입니다.
입력된 텍스트를 분석해서 반드시 아래 JSON 형식으로만 응답하세요. 다른 말은 절대 하지 마세요.

{
  "db": "db 이름 (시티다이버 콘텐츠 아이디어 | 시 아이디어 | 소설 아이디어 | 팟캐스트 아이디어 | 단상/기타 | 비즈니스 아이디어 | 여행 아이디어)",
  "title": "아이디어를 한 줄로 요약한 제목 (20자 이내)",
  "tags": {}
}

분류 기준:
- 시티다이버 콘텐츠: City Diver 유튜브 채널 영상 아이디어. 도시, 음식, 커피, 여행, 영국 일상 등 영상 콘텐츠로 만들 수 있는 것.
- 시 아이디어: 시, 시조, 산문시 등 시적 표현의 씨앗이 될 단상이나 이미지.
- 소설 아이디어: 인물, 플롯, 세계관, 장면 등 소설의 소재가 될 것.
- 팟캐스트 아이디어: 대화나 인터뷰로 풀어낼 수 있는 주제나 에피소드.
- 비즈니스 아이디어: 서비스, 제품, 사업 아이디어.
- 여행 아이디어: 가고 싶은 곳, 여행 루트, 여행 방식에 대한 아이디어.
- 단상/기타: 위 어디에도 속하지 않는 생각, 관찰, 메모.

tags 필드 규칙 (해당 DB의 옵션 중 가장 가까운 것 하나, 애매하면 "기타"):
- 시티다이버 콘텐츠: { "결": ["음식·인문|커피|개인서사|영국·여행|포맷실험|장기프로젝트 중 하나 이상"], "포맷": ["롱폼|쇼츠|토킹헤드|미정 중 하나 이상"] }
- 시 아이디어: { "형식": "자유시|시조|산문시|기타 중 하나" }
- 소설 아이디어: { "장르": "SF|문학|스릴러|퀴어|기타 중 하나" }
- 팟캐스트 아이디어: { "형식": "솔로|인터뷰|대담|기타 중 하나" }
- 비즈니스 아이디어: { "영역": "SaaS|커뮤니티|콘텐츠|오프라인|기타 중 하나" }
- 여행 아이디어: { "지역": "유럽|영국|아시아|미주·남미|국내|기타 중 하나" }
- 단상/기타: {}`;

function buildNotionProperties(classified) {
  const props = {
    '제목': { title: [{ text: { content: classified.title } }] },
    '상태': { select: { name: '🌱 씨앗' } },
  };

  const tags = classified.tags || {};

  switch (classified.db) {
    case '시티다이버 콘텐츠 아이디어':
      if (tags['결']?.length) props['결'] = { multi_select: tags['결'].map(v => ({ name: v })) };
      if (tags['포맷']?.length) props['포맷'] = { multi_select: tags['포맷'].map(v => ({ name: v })) };
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
