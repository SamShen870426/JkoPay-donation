import type { SyntheticEvent } from 'react';

/** 與 `public/donation-demo-logo.png` 對應（遠端圖 404／被擋時改顯示此圖） */
export const DONATION_IMAGE_FALLBACK_SRC = '/donation-demo-logo.png';

/**
 * 掛在 `<img onError={...}>`：載入失敗時改為預設圖，並避免預設圖再失敗造成無限觸發。
 */
export function onDonationImageError(e: SyntheticEvent<HTMLImageElement>): void {
  const el = e.currentTarget;
  if (el.dataset.donationImgFallback === '1') return;
  el.dataset.donationImgFallback = '1';
  el.src = DONATION_IMAGE_FALLBACK_SRC;
}
