/**
 * Figma：22×22 放射狀指示器 — 8 根輻條、45° 均分、圓角端點、中央留白；
 * 色 theme/text-muted（黑 30%）。整體旋轉動畫。
 */
const SIZE = 22;
const CX = SIZE / 2;
const CY = SIZE / 2;
const SPOKES = 8;
/** 外緣到中心距離（viewBox 座標） */
const R_OUT = 8.25;
const R_IN = 4.25;
const STROKE = 1;

export function DonationListInitialLoading() {
  return (
    <div
      className="flex min-h-[min(280px,50vh)] flex-col items-center justify-center py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="載入中"
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="text-black/30"
        aria-hidden
      >
        <g
          className="animate-spin"
          style={{
            transformOrigin: `${CX}px ${CY}px`,
          }}
        >
          {Array.from({ length: SPOKES }, (_, i) => {
            const rad = ((i * 360) / SPOKES - 90) * (Math.PI / 180);
            const x1 = CX + R_IN * Math.cos(rad);
            const y1 = CY + R_IN * Math.sin(rad);
            const x2 = CX + R_OUT * Math.cos(rad);
            const y2 = CY + R_OUT * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={STROKE}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
