import type { CSSProperties } from 'react';
import { DonationListScreen } from './components/DonationListScreen.js';
import { LAYOUT_FRAME_WIDTH_PX, LAYOUT_MIN_HEIGHT_PX, THEME_PAGE_BG } from './constants/theme.js';

export function App() {
  const frameStyle = {
    '--layout-w': `${LAYOUT_FRAME_WIDTH_PX}px`,
    '--layout-min-h': `${LAYOUT_MIN_HEIGHT_PX}px`,
    backgroundColor: THEME_PAGE_BG,
  } as CSSProperties;

  return (
    <div
      className="mx-auto flex h-full min-h-[var(--layout-min-h)] w-full max-w-[var(--layout-w)] flex-col shadow-sm"
      style={frameStyle}
    >
      <DonationListScreen />
    </div>
  );
}
