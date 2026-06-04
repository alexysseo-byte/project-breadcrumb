const SYSTEM_PROMPT = `당신은 창작자의 아이디어를 분류하는 어시스턴트입니다.
입력된 텍스트를 분석해서 반드시 아래 JSON 형식으로만 응답하세요. 다른 말은 절대 하지 마세요.
{
  "db": "db 이름 (시티다이버 콘텐츠 아이디어 | 시 아이디어 | 소설 아이디어 | 팟캐스트 아이디어 | 단상/기타 | 비즈니스 아이디어 | 여행 아이디어 | 바이브 코딩 아이디어)",
  "title": "아이디어를 한 줄로 요약한 제목 (20자 이내)",
  "tags": {}
}
분류 기준:
- 시티다이버 콘텐츠: City Diver 유튜브 채널 영상 아이디어. 도시, 음식, 커피, 여행, 영국 일상 등 영상 콘텐츠로 만들 수 있는 것. 유튜브: 시티다이버 본편/쇼츠/토킹헤드. 인스타 릴스: 개인 서사나 단상 중 짧게 혼자 찍어서 올릴 수 있는 것. 개인 서사, 사회 현상, 인간 심리에 대한 단상도 인스타 릴스나 토킹헤드 형식의 시티다이버 콘텐츠로 분류한다.
- 시 아이디어: 시, 시조, 산문시 등 시적 표현의 씨앗이 될 단상이나 이미지.
- 소설 아이디어: 인물, 플롯, 세계관, 장면 등 소설의 소재가 될 것.
- 팟캐스트 아이디어: 대화나 인터뷰로 풀어낼 수 있는 주제나 에피소드.
- 비즈니스 아이디어: 서비스, 제품, 사업 아이디어.
- 여행 아이디어: 가고 싶은 곳, 여행 루트, 여행 방식에 대한 아이디어.
- 바이브 코딩 아이디어: AI 바이브 코딩으로 만들 수 있는 앱, 툴, 자동화, 사이드 프로젝트 아이디어.
- 단상/기타: 위 어디에도 속하지 않는 생각, 관찰, 메모.
tags 필드 규칙 (반드시 아래 선택지 중에서만 정확히 선택):
- 시티다이버 콘텐츠: 
{
  "결": ["음식·인문", "커피", "개인서사", "영국·여행", "포맷실험", "장기프로젝트" 중 해당하는 것], "포맷": ["롱폼", "쇼츠", "토킹헤드", "미정" 중 해당하는 것], "플랫폼": ["유튜브", "인스타", "미정" 중 해당하는 것]
}
- 시 아이디어: { "형식": "자유시 또는 시조 또는 산문시 또는 기타" }
- 소설 아이디어: { "장르": "SF 또는 문학 또는 스릴러 또는 퀴어 또는 기타" }
- 팟캐스트 아이디어: { "형식": "솔로 또는 인터뷰 또는 대담 또는 기타" }
- 비즈니스 아이디어: { "영역": "SaaS 또는 커뮤니티 또는 콘텐츠 또는 오프라인 또는 기타" }
- 여행 아이디어: { "지역": "유럽 또는 영국 또는 아시아 또는 미주·남미 또는 국내 또는 기타" }
- 바이브 코딩 아이디어: { "유형": "웹앱 또는 CLI 또는 자동화 또는 API 또는 기타" }
- 단상/기타: {}`;

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

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
    if (!DB_IDS[classified.db]) throw new Error(`알 수 없는 db: ${classified.db}`);

    res.json(classified);
  } catch (err) {
    console.error('[classify]', err);
    res.status(500).json({ error: err.message });
  }
}
