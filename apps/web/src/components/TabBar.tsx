import type { DonationCategory } from '@jkopay/contracts';
import { DONATION_TABS } from '../constants/tabs.js';
import { THEME_PRIMARY } from '../constants/theme.js';

type Props = {
  active: DonationCategory;
  onChange: (category: DonationCategory) => void;
};

export function TabBar({ active, onChange }: Props) {
  return (
    <div className="flex h-[44px] shrink-0 border-b border-neutral-200 bg-white px-1">
      {DONATION_TABS.map((tab) => {
        const isOn = tab.category === active;
        return (
          <button
            key={tab.category}
            type="button"
            onClick={() => onChange(tab.category)}
            className={`relative flex h-full min-h-0 flex-1 items-center justify-center text-center text-[15px] transition-colors ${
              isOn ? 'font-semibold text-neutral-900' : 'font-normal text-neutral-500'
            }`}
          >
            {tab.label}
            {isOn ? (
              <span
                className="absolute bottom-0 left-1/2 h-[3px] w-[60%] -translate-x-1/2 rounded-t"
                style={{ backgroundColor: THEME_PRIMARY }}
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
