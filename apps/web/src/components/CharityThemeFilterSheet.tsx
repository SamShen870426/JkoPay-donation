import { useEffect } from 'react';
import type { CharityTheme } from '@jkopay/contracts';
import { THEME_PRIMARY } from '../constants/theme.js';
import { CHARITY_THEME_LABELS, listCharityThemeOptions } from '../constants/charity-themes.js';
import { Button } from '../ui/button.js';

type Props = {
  open: boolean;
  onClose: () => void;
  selected: CharityTheme | null;
  onSelect: (theme: CharityTheme | null) => void;
};

export function CharityThemeFilterSheet({ open, onClose, selected, onSelect }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const frame = document.querySelector('[data-mobile-frame]') as HTMLElement | null;
    const prevBody = document.body.style.overflow;
    const prevFrame = frame?.style.overflow ?? '';
    document.body.style.overflow = 'hidden';
    if (frame) frame.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      if (frame) frame.style.overflow = prevFrame;
    };
  }, [open]);

  if (!open) return null;

  const options = listCharityThemeOptions();

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end overflow-hidden"
      role="presentation"
    >
      <button
        type="button"
        className="charity-theme-sheet-backdrop absolute inset-0 bg-black/40"
        aria-label="關閉"
        onClick={onClose}
      />
      <div
        className="charity-theme-sheet-panel relative mt-auto max-h-[min(78vh,640px)] w-full overflow-hidden rounded-t-2xl bg-white shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="charity-theme-sheet-title"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-[minmax(2.5rem,1fr)_auto_minmax(2.5rem,1fr)] items-center border-b border-neutral-200 px-2 py-3">
          <span className="min-w-0" aria-hidden />
          <h2
            id="charity-theme-sheet-title"
            className="text-center text-[17px] font-semibold text-neutral-900"
          >
            選擇類別
          </h2>
          <div className="flex min-w-0 justify-end pr-1">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-neutral-500"
              aria-label="關閉"
              type="button"
              onClick={onClose}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6 18 18M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Button>
          </div>
        </div>
        <div className="max-h-[min(62vh,520px)] overflow-y-auto px-4 pb-6 pt-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className={`rounded-lg border-2 px-2 py-3 text-center text-[14px] font-medium leading-tight transition-colors ${
                selected === null ? 'bg-white' : 'bg-[#F4F4F6] text-neutral-900'
              }`}
              style={{
                borderColor: selected === null ? THEME_PRIMARY : 'transparent',
                ...(selected === null ? { color: THEME_PRIMARY } : {}),
              }}
            >
              全部
            </button>
            {options.map(({ value, label }) => {
              const isOn = selected === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    onSelect(value);
                    onClose();
                  }}
                  className={`rounded-lg border-2 px-2 py-3 text-center text-[14px] font-medium leading-tight transition-colors ${
                    isOn ? 'bg-white' : 'bg-[#F4F4F6] text-neutral-900'
                  }`}
                  style={{
                    borderColor: isOn ? THEME_PRIMARY : 'transparent',
                    ...(isOn ? { color: THEME_PRIMARY } : {}),
                  }}
                  title={CHARITY_THEME_LABELS[value]}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
