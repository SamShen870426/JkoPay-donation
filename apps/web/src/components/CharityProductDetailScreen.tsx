import type { CharityProductDetail, CharityTheme } from '@jkopay/contracts';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DonationApiError } from '../api/donation-api-error.js';
import { fetchCharityProductDetail } from '../api/donationClient.js';
import { CHARITY_THEME_LABELS } from '../constants/charity-themes.js';
import { LAYOUT_NAV_BAR_PX, THEME_PAGE_BG, THEME_PRIMARY } from '../constants/theme.js';
import { onDonationImageError } from '../lib/donation-image-fallback.js';
import { formatCharityPriceLine } from '../lib/format-charity-price.js';
import { patchDonationListUi } from '../lib/donation-list-ui-storage.js';
import { stripLeadingDashSeparator } from '../lib/product-description-display.js';
import { Button } from '../ui/button.js';
import { MobileStatusBar } from './MobileStatusBar.js';
import { ProductImageCarousel } from './ProductImageCarousel.js';
import { PurchaseQuantitySheet } from './PurchaseQuantitySheet.js';

export function CharityProductDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<CharityProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  /** 深連結進詳情時確保返回列表會落在義賣分頁；其餘 UI 狀態由列表頁 sessionStorage 保留 */
  useEffect(() => {
    patchDonationListUi({ category: 'products' });
  }, []);

  useEffect(() => {
    if (id == null || id === '') {
      setLoading(false);
      setError('無效的商品編號');
      return;
    }
    const ac = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchCharityProductDetail({ id, signal: ac.signal })
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
            setError('找不到此義賣商品');
          } else {
            setError('無法載入商品，請稍後再試');
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

  const priceLine =
    detail != null ? formatCharityPriceLine(detail.currency, detail.priceMin, detail.priceMax) : '';

  const descriptionIntro =
    detail != null ? (detail.subtitle.trim() !== '' ? detail.subtitle.trim() : detail.title) : '';
  const descriptionBody =
    detail != null ? stripLeadingDashSeparator(detail.description) : '';

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
          <h1 className="text-[17px] font-semibold tracking-wide">義賣商品</h1>
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
                d="M12 3v10m0 0 4-4m-4 4-4-4M5 19h14"
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
              urls={detail.imageUrls}
              initialIndex={detail.primaryImageIndex}
            />
            <div className="space-y-3 px-3 pb-4 pt-3">
              <section className="rounded-[12px] bg-white px-3 py-3 shadow-sm ring-1 ring-black/5">
                <h2 className="text-[17px] font-semibold leading-snug text-neutral-900">
                  {detail.title}
                </h2>
                <p
                  className="mt-2 text-[18px] font-semibold tabular-nums"
                  style={{ color: THEME_PRIMARY }}
                >
                  {priceLine}
                </p>

                <div className="mt-3 flex gap-3 rounded-xl bg-[#F4F4F6] p-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/5">
                    <img
                      src={detail.organizationLogoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={onDonationImageError}
                    />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-[14px] font-medium leading-5 text-neutral-900">
                      {detail.organizationName}
                    </p>
                    <Link
                      to={`/organizations/${detail.organizationId}`}
                      className="mt-1 block text-left text-[14px] text-[#2E7DD9] outline-none active:opacity-80 focus-visible:underline"
                    >
                      查看團體 &gt;
                    </Link>
                  </div>
                </div>

                {detail.themes.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detail.themes.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#EDEDF1] px-2.5 py-1 text-[12px] text-neutral-700"
                      >
                        {CHARITY_THEME_LABELS[t as CharityTheme]}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="rounded-[12px] bg-white px-3 py-3 shadow-sm ring-1 ring-black/5">
                <h3 className="text-[16px] font-semibold text-neutral-900">商品說明</h3>
                <p className="mt-2 text-[14px] font-medium leading-snug text-neutral-900">
                  {descriptionIntro}
                </p>
                <div
                  className="my-3 border-t border-dashed border-neutral-300"
                  role="separator"
                  aria-hidden
                />
                <div className="whitespace-pre-line text-[14px] leading-relaxed text-neutral-600">
                  {descriptionBody}
                </div>
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

          <PurchaseQuantitySheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            detail={detail}
          />
        </>
      ) : null}
    </div>
  );
}
