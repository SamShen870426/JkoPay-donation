import type { CharityTheme, DonationProjectDetail } from '@jkopay/contracts';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DonationApiError } from '../api/donation-api-error.js';
import { fetchDonationProjectDetail } from '../api/donationClient.js';
import { CHARITY_THEME_LABELS } from '../constants/charity-themes.js';
import {
  CARD_LIST_MARGIN_X_PX,
  LAYOUT_NAV_BAR_PX,
  THEME_PAGE_BG,
  THEME_PRIMARY,
} from '../constants/theme.js';
import { patchDonationListUi } from '../lib/donation-list-ui-storage.js';
import { Button } from '../ui/button.js';
import { DonationSettingsSheet } from './DonationSettingsSheet.js';
import { MobileStatusBar } from './MobileStatusBar.js';
import { ProductImageCarousel } from './ProductImageCarousel.js';

const PROJECT_DETAIL_COLLAPSE_CHARS = 220;

function BentoProjectIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function DonationProjectDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<DonationProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);

  useEffect(() => {
    patchDonationListUi({ category: 'projects' });
  }, []);

  useEffect(() => {
    if (id == null || id === '') {
      setLoading(false);
      setError('無效的專案編號');
      return;
    }
    const ac = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetailExpanded(false);

    void fetchDonationProjectDetail({ id, signal: ac.signal })
      .then((d) => {
        if (!cancelled) {
          setDetail(d);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === 'AbortError') return;
        if (!cancelled) {
          if (e instanceof DonationApiError && e.errorCode === 'NOT_FOUND') {
            setError('找不到此捐款專案');
          } else {
            setError('無法載入專案，請稍後再試');
          }
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [id]);

  const gutter = { marginLeft: CARD_LIST_MARGIN_X_PX, marginRight: CARD_LIST_MARGIN_X_PX };
  const projectBody = detail?.projectDetail ?? '';
  const showDetailToggle = projectBody.length > PROJECT_DETAIL_COLLAPSE_CHARS;

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ backgroundColor: THEME_PAGE_BG }}>
      <header
        className="sticky top-0 z-30 shrink-0 text-white"
        style={{
          backgroundColor: THEME_PRIMARY,
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <MobileStatusBar />
        <div
          className="relative flex w-full shrink-0 items-center justify-center px-2"
          style={{ height: LAYOUT_NAV_BAR_PX }}
        >
          <Button
            variant="icon-ghost"
            size="iconLg"
            className="absolute left-2"
            aria-label="返回"
            type="button"
            onClick={() => navigate(-1)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 6 9 12l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <h1 className="text-[17px] font-semibold tracking-wide">捐款專案介紹</h1>
          <Button
            variant="icon-ghost"
            size="iconLg"
            className="absolute right-2"
            aria-label="分享"
            type="button"
            onClick={() => {}}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3v10m0 0 4-4m-4 4-4-4M5 19h14a2 2 0 0 0 2-2v-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-neutral-500">
          載入中…
        </div>
      ) : null}

      {!loading && error != null ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
          <p className="text-center text-[15px] text-neutral-600">{error}</p>
          <button
            type="button"
            className="rounded-lg bg-white px-4 py-2.5 text-[15px] font-medium text-[#2E7DD9] shadow-sm ring-1 ring-black/10 active:opacity-90"
            onClick={() => navigate('/', { replace: true })}
          >
            返回列表
          </button>
        </div>
      ) : null}

      {!loading && error == null && detail != null ? (
        <>
          <main className="min-h-0 flex-1 overflow-y-auto pb-[calc(88px+env(safe-area-inset-bottom,0px))]">
            <ProductImageCarousel
              urls={detail.heroImageUrls}
              initialIndex={detail.primaryHeroImageIndex}
            />

            <div className="space-y-3 px-0 pb-6 pt-1">
              <section
                className="relative z-[1] -mt-4 rounded-[12px] bg-white px-4 py-4 shadow-sm ring-1 ring-black/5"
                style={gutter}
              >
                <div className="flex min-w-0 gap-2">
                  <BentoProjectIcon className="mt-0.5 shrink-0 text-neutral-700" />
                  <h2 className="min-w-0 flex-1 text-[17px] font-semibold leading-snug text-neutral-900 line-clamp-2">
                    {detail.title}
                  </h2>
                </div>
                {detail.fundraisingLicense != null ? (
                  <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">
                    勸募立案核准字號 {detail.fundraisingLicense}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-3 rounded-xl bg-[#F4F4F6] p-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-black/5">
                    <img
                      src={detail.organizationLogoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-[14px] font-medium leading-snug text-neutral-900">
                      {detail.organizationName}
                    </p>
                    {detail.organizationId != null ? (
                      <Link
                        to={`/organizations/${detail.organizationId}`}
                        className="mt-1 inline-block text-[14px] text-[#2E7DD9] outline-none focus-visible:underline active:opacity-80"
                      >
                        查看團體 &gt;
                      </Link>
                    ) : null}
                  </div>
                </div>

                {detail.themes.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {detail.themes.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] text-neutral-700"
                      >
                        {CHARITY_THEME_LABELS[t as CharityTheme]}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>

              <section
                className="rounded-[12px] bg-white px-4 py-4 shadow-sm ring-1 ring-black/5"
                style={gutter}
              >
                <h3 className="text-[16px] font-semibold text-neutral-900">專案內容</h3>
                <div className="mt-3 flex min-w-0 gap-2 border-b border-neutral-100 pb-3">
                  <BentoProjectIcon className="mt-0.5 shrink-0 text-neutral-500" />
                  <p className="min-w-0 flex-1 text-[15px] font-medium leading-snug text-neutral-900 line-clamp-2">
                    {detail.title}
                  </p>
                </div>
                <div
                  className={
                    !detailExpanded && showDetailToggle
                      ? 'mt-3 line-clamp-6 whitespace-pre-line text-[14px] leading-relaxed text-neutral-800'
                      : 'mt-3 whitespace-pre-line text-[14px] leading-relaxed text-neutral-800'
                  }
                >
                  {projectBody}
                </div>
                {showDetailToggle ? (
                  <button
                    type="button"
                    className="mt-2 text-[14px] font-medium text-neutral-500"
                    onClick={() => setDetailExpanded((v) => !v)}
                  >
                    {detailExpanded ? '顯示較少' : '更多'}
                  </button>
                ) : null}
                {detail.disclaimer != null && detail.disclaimer.trim() !== '' ? (
                  <p className="mt-5 text-[12px] leading-relaxed text-neutral-500">{detail.disclaimer}</p>
                ) : null}
              </section>
            </div>
          </main>

          <div
            className="fixed bottom-0 left-1/2 z-40 w-full max-w-[var(--layout-w)] -translate-x-1/2 border-t border-black/5 bg-white px-4 pt-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
            style={{
              paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
            }}
          >
            <button
              type="button"
              className="w-full rounded-xl py-3.5 text-[16px] font-semibold text-white active:opacity-95"
              style={{ backgroundColor: THEME_PRIMARY }}
              onClick={() => setSheetOpen(true)}
            >
              立即捐款
            </button>
          </div>

          <DonationSettingsSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            detail={detail}
          />
        </>
      ) : null}
    </div>
  );
}
