/**
 * Pixel capybara — FRONT VIEW, 16 cols × 18 rows, 6px per cell (96 × 108px).
 * Distinctive features: wide dark muzzle block, two round ears on top,
 * dot eyes, cream belly, two visible front legs.
 */

const PX = 6;
const _ = null;

const T = '#C89050'; // warm tan body
const M = '#8B5A2B'; // muzzle block (darker warm brown)
const D = '#6B3810'; // darkest (ears, legs)
const C = '#ECCA80'; // cream belly
const E = '#100808'; // eye / nostril
const H = '#DCAA60'; // highlight (lighter top)

// col: 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15

const IDLE = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_], // 0
  [_,_,_,_,D,D,_,_,_,_,D,D,_,_,_,_], // 1  ears — above head outline
  [_,_,_,_,D,D,_,_,_,_,D,D,_,_,_,_], // 2  ear base
  [_,_,_,T,T,T,T,T,T,T,T,T,T,_,_,_], // 3  head top (10 wide)
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_], // 4  head (12 wide)
  [_,_,T,T,T,E,T,T,T,T,E,T,T,T,_,_], // 5  eyes (E surrounded by T)
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_], // 6  mid face
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_], // 7  muzzle top (wide dark block)
  [_,_,T,T,M,M,E,M,M,M,E,M,T,T,_,_], // 8  nostrils (E inside M, no gap)
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_], // 9  muzzle bottom
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_], // 10 chin
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_], // 11 body (14 wide — wider than head)
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_], // 12 belly
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_], // 13 belly
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_], // 14 belly
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_], // 15 body bottom
  [_,_,_,D,D,_,_,_,_,_,_,D,D,_,_,_], // 16 front legs
  [_,_,_,D,D,_,_,_,_,_,_,D,D,_,_,_], // 17 feet
];

// LISTENING — ears perk up taller
const LISTENING = [
  [_,_,D,D,_,_,_,_,_,_,_,_,D,D,_,_], // 0  ears now at row 0 (raised)
  [_,_,D,D,_,_,_,_,_,_,_,_,D,D,_,_], // 1
  [_,_,D,D,_,_,_,_,_,_,_,_,D,D,_,_], // 2  extra ear row = taller
  [_,_,_,T,T,T,T,T,T,T,T,T,T,_,_,_], // 3
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_], // 4
  [_,_,T,T,T,E,T,T,T,T,E,T,T,T,_,_], // 5  eyes in tan
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_], // 6
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_], // 7
  [_,_,T,T,M,M,E,M,M,M,E,M,T,T,_,_], // 8  nostrils in muzzle
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_], // 9
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_], // 10
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_], // 11
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_], // 12
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_], // 13
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_], // 14
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_], // 15
  [_,_,_,D,D,_,_,_,_,_,_,D,D,_,_,_], // 16
  [_,_,_,D,D,_,_,_,_,_,_,D,D,_,_,_], // 17
];

// SAD — eyes droop (lower + inner)
const SAD = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,D,D,_,_,_,_,_,_,_,_,D,D,_,_],
  [_,_,D,D,_,_,_,_,_,_,_,_,D,D,_,_],
  [_,_,_,T,T,T,T,T,T,T,T,T,T,_,_,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,_,T,T,T,_,E,_,_,E,_,T,T,T,_,_], // eyes moved inward, row same
  [_,_,T,T,_,E,T,T,T,T,E,_,T,T,_,_], // droopy eye corners
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_],
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_], // flat sad muzzle (no nostrils visible)
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_],
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_],
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_],
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_],
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_],
  [_,_,_,D,D,_,_,_,_,_,_,D,D,_,_,_],
  [_,_,_,D,D,_,_,_,_,_,_,D,D,_,_,_],
];

// HAPPY (saved) — bright eyes, legs tucked (jump pose)
const HAPPY = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,D,D,_,_,_,_,_,_,_,_,D,D,_,_],
  [_,_,D,D,_,_,_,_,_,_,_,_,D,D,_,_],
  [_,_,_,T,T,T,T,T,T,T,T,T,T,_,_,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,_,T,T,T,E,_,_,_,_,E,T,T,T,_,_], // eyes brighter (moved outward = happy)
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_],
  [_,_,T,T,M,M,E,_,_,E,M,M,T,T,_,_],
  [_,_,T,T,M,M,M,M,M,M,M,M,T,T,_,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_],
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_],
  [_,T,T,C,C,C,C,C,C,C,C,C,C,T,T,_],
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_], // body narrows (jump)
  [_,_,_,_,D,D,_,_,_,_,D,D,_,_,_,_], // legs tucked in mid-air
  [_,_,_,_,D,D,_,_,_,_,D,D,_,_,_,_],
];

const GRIDS = {
  idle:            IDLE,
  listening:       LISTENING,
  thinking:        IDLE,
  error:           SAD,
  saved_citydiver: HAPPY,
  saved_poem:      HAPPY,
  saved_novel:     HAPPY,
  saved_podcast:   HAPPY,
  saved_misc:      HAPPY,
  saved_business:  HAPPY,
  saved_travel:    HAPPY,
};

// ── Props ────────────────────────────────────────────────────────────────────
const W  = '#F5EFE0';
const SP = '#2050A0';
const GR = '#888888';
const DG = '#444444';
const MK = '#A0A0A0';
const BB = '#DDDDF8';
const BF = '#9090C8';
const LB = '#3070B0';
const SC = '#B8DCF0';
const PU = '#7030A0';
const LP = '#B060D0';
const WH = '#202020';
const GD = '#C0980C';

const PROPS = {
  saved_novel: {
    grid: [
      [SP,W, W, W ],
      [SP,W, W, W ],
      [SP,W, W, W ],
      [SP,'#A0B040',W,W],
      [SP,W, W, W ],
      [SP,W, W, W ],
      [SP,W, W, W ],
      [SP,SP,SP,SP],
    ],
    ox: 1, oy: 5,
  },
  saved_citydiver: {
    grid: [
      [_,  DG, DG, _,  _ ],
      [DG, GR, GR, GR, DG],
      [DG, MK, MK, MK, DG],
      [DG, MK,'#E0E0E0',MK,DG],
      [DG, MK, MK, MK, DG],
      [DG, GR, GR, GR, DG],
    ],
    ox: 1, oy: 5,
  },
  saved_poem: {
    grid: [
      [_,  _,  GD ],
      [_,  GD, GD ],
      [GD,'#A07808',_ ],
      [GD,'#A07808',_ ],
      [_,  GD, _  ],
      [_,  GD, _  ],
      [_,'#886000',_ ],
    ],
    ox: 1, oy: 4,
  },
  saved_podcast: {
    grid: [
      [_,  MK, _ ],
      [MK,'#D0D0D0',MK],
      [MK,'#D0D0D0',MK],
      [MK,'#D0D0D0',MK],
      [_,  MK, _ ],
      [_,  MK, _ ],
      ['#606060','#606060','#606060'],
    ],
    ox: 1, oy: 5,
  },
  saved_misc: {
    grid: [
      [_,  BF, BF, BF, _ ],
      [BF, BB, BB, BB, BF],
      [BF, BB,'#7070DD',BB,BF],
      [BF, BB, BB, BB, BF],
      [_,  BF, BF, BF, _ ],
      [_,  _,  BF, _,  _ ],
    ],
    ox: 1, oy: 1,
  },
  saved_business: {
    grid: [
      [LB, LB, LB, LB, LB],
      [LB, SC, SC, SC, LB],
      [LB, SC, SC, SC, LB],
      [LB, LB, LB, LB, LB],
      ['#555','#555','#555','#555','#555'],
    ],
    ox: 1, oy: 9,
  },
  saved_travel: {
    grid: [
      [_,  PU, PU, _ ],
      [PU, PU, PU, PU],
      [PU, LP, LP, PU],
      [PU,'#C060E0','#C060E0',PU],
      [PU, LP, LP, PU],
      [PU, PU, PU, PU],
      [_,  WH, _,  WH],
    ],
    ox: 1, oy: 8,
  },
};

const WRAP_CLASS = {
  idle:      'capy-breathe',
  listening: 'capy-listen',
  thinking:  'capy-waddle capy-thinking',
  error:     '',
};

export default function Capybara({ state = 'idle' }) {
  const grid = GRIDS[state] || GRIDS.idle;
  const prop = PROPS[state] || null;

  const ROWS = grid.length;
  const COLS = grid[0].length;
  const propW  = prop ? prop.ox + (prop.grid[0]?.length || 0) : 0;
  const svgW   = (COLS + propW) * PX;
  const svgH   = ROWS * PX;

  const isSaved   = state.startsWith('saved_');
  const wrapClass = isSaved ? 'capy-jump' : (WRAP_CLASS[state] || '');

  return (
    <div className={`inline-block ${wrapClass}`} style={{ lineHeight: 0 }}>
      <svg
        width={svgW} height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated' }}
      >
        {grid.map((row, ry) =>
          row.map((color, cx) => {
            if (!color) return null;
            const isEar = state === 'listening' && ry <= 2 && (cx === 2 || cx === 12);
            return (
              <rect
                key={`${ry}-${cx}`}
                x={cx * PX} y={ry * PX}
                width={PX} height={PX}
                fill={color}
                className={isEar ? 'capy-ear' : undefined}
              />
            );
          })
        )}

        {prop && prop.grid.map((row, ry) =>
          row.map((color, cx) => {
            if (!color) return null;
            return (
              <rect
                key={`p-${ry}-${cx}`}
                x={(COLS + prop.ox + cx) * PX}
                y={(prop.oy + ry) * PX}
                width={PX} height={PX}
                fill={color}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
