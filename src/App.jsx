import { useState, useRef, useCallback } from 'react';
import Capybara from './components/Capybara';
import PixelTitle from './components/PixelTitle';

const DB_EMOJI = {
  '시티다이버 콘텐츠 아이디어': '🎬',
  '시 아이디어': '✍️',
  '소설 아이디어': '📖',
  '미래 소설 설정': '🚀',
  '브런치 글 아이디어': '✍🏻',
  '팟캐스트 아이디어': '🎙️',
  '단상/기타': '💭',
  '비즈니스 아이디어': '💼',
  '여행 아이디어': '✈️',
  '바이브 코딩 아이디어': '👨🏻‍💻',
  '기타 컨텐츠 아이디어': '💡',
};

const DB_IDS = {
  '시티다이버 콘텐츠 아이디어': 'd42add1471084199bd072deddd7731b7',
  '시 아이디어':               '763b39b8900c4e039cd261c468479a6f',
  '소설 아이디어':             'b3d96646df1e49afb8b8ffabf41bc5c9',
  '미래 소설 설정':           '54fa9125375a450e8a6223461c63dbed',
  '브런치 글 아이디어':         '37e63abda825806bb366e7db7096402a',
  '팟캐스트 아이디어':         'aaface18cd5946f98f1cb796427cd367',
  '단상/기타':                 '3e9b1e790c5640b083872c172c9dcee4',
  '비즈니스 아이디어':         '527e26456732477bb70547323f2e2094',
  '여행 아이디어':             '8fa59c99c9f54532af3aef49a25b9097',
  '바이브 코딩 아이디어':      '37363abda8258031933ac0b692c246a3',
  '기타 컨텐츠 아이디어':      '37563abda825802baa46d3ba232b3526',
};

const HISTORY_KEY = 'breadcrumb_history';
const MAX_HISTORY = 10;

function notionDeepLink(id) {
  return `notion://www.notion.so/${id.replace(/-/g, '')}`;
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function saveHistory(entry) {
  const history = loadHistory();
  const next = [entry, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

const DB_TO_CAPY = {
  '시티다이버 콘텐츠 아이디어': 'saved_citydiver',
  '시 아이디어':                'saved_poem',
  '소설 아이디어':              'saved_novel',
  '미래 소설 설정':            'saved_novel',
  '브런치 글 아이디어':          'saved_poem',
  '팟캐스트 아이디어':          'saved_podcast',
  '단상/기타':                  'saved_misc',
  '비즈니스 아이디어':          'saved_business',
  '여행 아이디어':              'saved_travel',
  '바이브 코딩 아이디어':       'saved_business',
  '기타 컨텐츠 아이디어':       'saved_misc',
};

export default function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const recognitionRef   = useRef(null);
  const committedTextRef = useRef('');

  // ─── Voice input ──────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('이 브라우저는 음성 인식을 지원하지 않아요. Safari 또는 Chrome을 사용해주세요.');
      return;
    }

    const rec = new SR();
    rec.lang = 'ko-KR';
    rec.interimResults = true;
    rec.continuous = true;

    rec.onstart = () => { setIsRecording(true); setStatus('listening'); };

    rec.onresult = (e) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalChunk += t;
        else interimChunk += t;
      }
      if (finalChunk) committedTextRef.current += finalChunk;
      setText(committedTextRef.current + interimChunk);
    };

    rec.onend = () => { setIsRecording(false); setStatus('idle'); };

    rec.onerror = (e) => {
      setIsRecording(false);
      setStatus('idle');
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setErrorMsg(`음성 인식 오류: ${e.error}`);
        setStatus('error');
      }
    };

    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopListening();
    } else {
      committedTextRef.current = text;
      startListening();
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setStatus('thinking');
    setResult(null);
    setErrorMsg('');

    try {
      const classifyRes = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      const classified = await classifyRes.json();
      if (!classifyRes.ok) throw new Error(classified.error || '분류 실패');

      const saveRes = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classified, originalText: trimmed }),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || '저장 실패');

      setResult(classified);
      setStatus('saved');
      setText('');
      committedTextRef.current = '';

      const newEntry = {
        title: classified.title,
        db: classified.db,
        pageId: saved.id,
        savedAt: Date.now(),
        text: trimmed,
      };
      setHistory(saveHistory(newEntry));

      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setErrorMsg(err.message || '알 수 없는 오류가 발생했어요');
      setStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const resetError = () => { setStatus('idle'); setErrorMsg(''); };

  // ─── Derived values ───────────────────────────────────────────────────────
  const capyState = status === 'saved' && result
    ? (DB_TO_CAPY[result.db] || 'saved_misc')
    : status;

  const statusLabel = {
    idle:      null,
    listening: '🎤 듣고 있어요...',
    thinking:  '카피바라가 생각 중이에요...',
    saved:     result
      ? `${DB_EMOJI[result.db] || '✅'} ${result.db}에 저장됐어요 — ${result.title}`
      : '저장 완료!',
    error: `😢 ${errorMsg}`,
  }[status];

  // PixelTitle color adapts to dark mode
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const titleColor = prefersDark ? '#D4A870' : '#A07040';

  return (
    <div className="min-h-screen flex flex-col items-center px-5 pt-10 pb-8
                    bg-capy-50 dark:bg-[#1a1208]
                    text-capy-900 dark:text-capy-100
                    transition-colors">

      {/* ── Header ── */}
      <header className="flex flex-col items-center gap-4 mb-8 w-full max-w-sm">
        <div className="relative flex items-center justify-center">
          <Capybara state={capyState} />
          {status === 'listening' && (
            <span className="absolute inset-0 rounded-full border-2 border-capy-400
                             animate-[pulse-ring_1s_ease-out_infinite]" />
          )}
        </div>

        {/* Pixel title */}
        <PixelTitle color={titleColor} />
      </header>

      {/* ── Status banner ── */}
      {statusLabel && (
        <div
          key={status}
          className={`fade-up w-full max-w-sm rounded-2xl px-4 py-3 mb-5
                      text-sm font-bold text-center cursor-pointer
                      ${status === 'saved'    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : ''}
                      ${status === 'error'    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : ''}
                      ${status === 'thinking' ? 'bg-capy-100 dark:bg-capy-800/40 text-capy-700 dark:text-capy-300' : ''}
                      ${status === 'listening'? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : ''}
                    `}
          onClick={status === 'error' ? resetError : undefined}
        >
          {statusLabel}
          {status === 'error' && (
            <span className="block text-xs mt-1 opacity-60">탭해서 닫기</span>
          )}
        </div>
      )}

      {/* ── Main card ── */}
      <main className="w-full max-w-sm flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="지금 머릿속에 뭐가 있어요?"
            rows={6}
            disabled={status === 'thinking'}
            className="w-full rounded-3xl px-5 py-4 pr-14 resize-none text-base font-semibold
                       bg-white dark:bg-capy-900/60
                       border-2 border-capy-200 dark:border-capy-700
                       text-capy-900 dark:text-capy-100
                       placeholder-capy-300 dark:placeholder-capy-600
                       focus:outline-none focus:border-capy-400 dark:focus:border-capy-500
                       shadow-sm transition-all disabled:opacity-50"
          />
          <button
            onClick={toggleRecording}
            disabled={status === 'thinking'}
            aria-label={isRecording ? '녹음 중지' : '음성 입력 시작'}
            className={`absolute right-3 bottom-3 w-10 h-10 rounded-2xl
                        flex items-center justify-center text-lg
                        transition-all shadow-sm disabled:opacity-40
                        ${isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-capy-100 dark:bg-capy-800 text-capy-600 dark:text-capy-300 hover:bg-capy-200 dark:hover:bg-capy-700'
                        }`}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || status === 'thinking' || status === 'listening'}
          className="w-full rounded-3xl py-4 text-lg font-black
                     bg-capy-500 hover:bg-capy-600 active:bg-capy-700 text-white
                     shadow-md hover:shadow-lg transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none select-none"
        >
          {status === 'thinking' ? '🔄 생각하는 중...' : '던지기 🌱'}
        </button>

        <p className="text-center text-xs text-capy-400 dark:text-capy-600 font-semibold">
          ⌘ + Enter로도 던질 수 있어요
        </p>
      </main>

      {/* ── DB reference ── */}
      <section className="mt-10 w-full max-w-sm">
        <p className="text-xs font-bold text-capy-400 dark:text-capy-600 uppercase tracking-wider mb-3 text-center">
          저장 가능한 DB
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(DB_EMOJI).map(([name, emoji]) => (
            <a
              key={name}
              href={notionDeepLink(DB_IDS[name])}
              className="rounded-2xl px-3 py-2.5 text-xs font-bold
                         bg-white dark:bg-capy-900/40
                         border border-capy-100 dark:border-capy-800
                         text-capy-600 dark:text-capy-400
                         flex items-center gap-1.5
                         hover:border-capy-300 dark:hover:border-capy-600
                         hover:bg-capy-50 dark:hover:bg-capy-800/40
                         transition-colors active:scale-95"
            >
              <span>{emoji}</span>
              <span className="truncate">{name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── History ── */}
      <section className="mt-8 w-full max-w-sm">
        <p className="text-xs font-bold text-capy-400 dark:text-capy-600 uppercase tracking-wider mb-3 text-center">
          최근 저장한 아이디어
        </p>
        {history.length === 0 ? (
          <p className="text-center text-xs text-capy-300 dark:text-capy-700 py-4">
            아직 저장한 아이디어가 없어요 🌱
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((entry) => (
              <div
                key={`${entry.pageId}-${entry.savedAt}`}
                className="rounded-2xl px-4 py-3
                           bg-white dark:bg-capy-900/40
                           border border-capy-100 dark:border-capy-800
                           flex items-start gap-2.5"
              >
                <span className="text-base shrink-0 mt-0.5">{DB_EMOJI[entry.db] || '📝'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-capy-800 dark:text-capy-200 truncate">{entry.title}</p>
                  <p className="text-[10px] text-capy-400 dark:text-capy-600 mt-0.5">{entry.db}</p>
                  {entry.text && (
                    <p className="text-[11px] text-capy-600 dark:text-capy-400 mt-1 line-clamp-2 whitespace-pre-wrap break-words">
                      {entry.text}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-capy-300 dark:text-capy-700 shrink-0 mt-0.5">
                  {new Date(entry.savedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-8 text-xs text-capy-300 dark:text-capy-700 font-semibold">
        🍞 Breadcrumb — 작은 아이디어를 놓치지 않게
      </footer>
    </div>
  );
}
