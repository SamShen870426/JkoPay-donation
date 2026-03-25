import type { CharityTheme, DonationListItem } from '@jkopay/contracts';
import { Link } from 'react-router-dom';
import { CHARITY_THEME_LABELS } from '../constants/charity-themes.js';
import { THEME_PRIMARY } from '../constants/theme.js';

type Props = { item: DonationListItem };

function TagRowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6a2 2 0 0 1 2-2h6.172a2 2 0 0 1 1.414.586l5.828 5.828a2 2 0 0 1 0 2.828l-6 6a2 2 0 0 1-2.828 0l-6-6A2 2 0 0 1 4 12.172V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="1.25" fill="currentColor" />
    </svg>
  );
}

/** 捐款專案：大圖、紅字團體、標題、底部類別列（與篩選 sheet 同一套主題） */
export function DonationProjectCard({ item }: Props) {
  const hero = item.heroImageUrl ?? item.imageUrl;
  const labels =
    item.themes?.map((slug) => CHARITY_THEME_LABELS[slug as CharityTheme]) ?? [];

  const card = (
    <article className="w-full shrink-0 overflow-hidden rounded-[12px] bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        <img
          src={hero}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 overflow-hidden px-3 pb-3 pt-2">
        {item.organizationName ? (
          <p
            className="mb-1 truncate text-[13px] font-medium leading-5"
            style={{ color: THEME_PRIMARY }}
          >
            {item.organizationName}
          </p>
        ) : null}
        <h2 className="truncate text-[16px] font-semibold leading-5 text-neutral-900">
          {item.title}
        </h2>
        {labels.length > 0 ? (
          <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[12px] leading-5 text-neutral-500">
            <TagRowIcon className="shrink-0 text-neutral-400" />
            <p className="min-w-0 truncate">
              {labels.map((label, i) => (
                <span key={`${label}-${i}`}>
                  {i > 0 ? <span className="text-neutral-300"> · </span> : null}
                  {label}
                </span>
              ))}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );

  if (item.category === 'projects') {
    return (
      <Link
        to={`/projects/${item.id}`}
        className="block w-full min-w-0 rounded-[12px] outline-none ring-inset focus-visible:ring-2 focus-visible:ring-[#C9191D]/40"
      >
        {card}
      </Link>
    );
  }

  return card;
}
