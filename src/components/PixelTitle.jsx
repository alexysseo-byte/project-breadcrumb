// Pixel font "Breadcrumb" — 5-row bitmap, 3px per pixel

const SCALE = 3;

const FONT = {
  B: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
  r: [[0,0,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
  e: [[0,0,0],[0,1,1],[1,1,0],[1,0,0],[0,1,1]],
  a: [[0,0,0],[0,1,1],[1,0,1],[1,1,1],[1,0,1]],
  d: [[0,0,1],[0,0,1],[0,1,1],[1,0,1],[0,1,1]],
  c: [[0,0,0],[0,1,1],[1,0,0],[1,0,0],[0,1,1]],
  u: [[0,0,0],[1,0,1],[1,0,1],[1,0,1],[0,1,1]],
  m: [[0,0,0,0,0],[1,0,1,1,0],[1,1,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  b: [[1,0,0],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
};

const WORD = 'Breadcrumb';

export default function PixelTitle({ color = '#A07040' }) {
  const rects = [];
  let cursorX = 0;

  for (const ch of WORD) {
    const bitmap = FONT[ch];
    if (!bitmap) { cursorX += (3 + 1) * SCALE; continue; }
    const charW = bitmap[0].length;

    bitmap.forEach((row, ry) => {
      row.forEach((on, cx) => {
        if (!on) return;
        rects.push(
          <rect
            key={`${ch}-${cursorX}-${ry}-${cx}`}
            x={cursorX + cx * SCALE}
            y={ry * SCALE}
            width={SCALE}
            height={SCALE}
            fill={color}
          />
        );
      });
    });

    cursorX += (charW + 1) * SCALE;
  }

  const totalW = cursorX - SCALE; // trim trailing gap
  const totalH = 5 * SCALE;

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
    >
      {rects}
    </svg>
  );
}
