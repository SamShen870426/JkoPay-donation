import type { CSSProperties } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CharityOrganizationProfileScreen } from './components/CharityOrganizationProfileScreen.js';
import { CharityProductDetailScreen } from './components/CharityProductDetailScreen.js';
import { DevDataToolsScreen } from './components/DevDataToolsScreen.js';
import { DonationListScreen } from './components/DonationListScreen.js';
import { DonationProjectDetailScreen } from './components/DonationProjectDetailScreen.js';
import { LAYOUT_FRAME_WIDTH_PX, LAYOUT_MIN_HEIGHT_PX, THEME_PAGE_BG } from './constants/theme.js';

export function App() {
  const frameStyle = {
    '--layout-w': `${LAYOUT_FRAME_WIDTH_PX}px`,
    '--layout-min-h': `${LAYOUT_MIN_HEIGHT_PX}px`,
    backgroundColor: THEME_PAGE_BG,
  } as CSSProperties;

  return (
    <div
      data-mobile-frame
      className="relative mx-auto flex h-full min-h-[var(--layout-min-h)] w-full max-w-[var(--layout-w)] flex-col overflow-x-hidden shadow-sm"
      style={frameStyle}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DonationListScreen />} />
          <Route path="/organizations/:id" element={<CharityOrganizationProfileScreen />} />
          <Route path="/products/:id" element={<CharityProductDetailScreen />} />
          <Route path="/projects/:id" element={<DonationProjectDetailScreen />} />
          <Route path="/internal/data-tools" element={<DevDataToolsScreen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
