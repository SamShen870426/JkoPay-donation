import type { CharityTheme, DonationListItem } from '@jkopay/contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DonationApiError } from '../api/donation-api-error.js';
import {
  fetchCharityOrganizationProfile,
  fetchCharityOrganizationProjectsPage,
} from '../api/donationClient.js';
import { CHARITY_THEME_LABELS } from '../constants/charity-themes.js';
import {
  CARD_LIST_MARGIN_X_PX,
  FILTER_CHIP_BG,
  LAYOUT_NAV_BAR_PX,
  SEARCH_FIELD_CARET_AND_LINK,
  THEME_PAGE_BG,
  THEME_PRIMARY,
} from '../constants/theme.js';
import { onDonationImageError } from '../lib/donation-image-fallback.js';
import { navigateToDonationListWithThemeFilter } from '../lib/navigate-donation-list.js';
import { Button } from '../ui/button.js';
import { CharitySaleProductCard } from './CharitySaleProductCard.js';
import { DonationLoadMoreSkeleton } from './DonationListSkeleton.js';
import { DonationProjectCard } from './DonationProjectCard.js';
import { MobileStatusBar } from './MobileStatusBar.js';

const DESCRIPTION_COLLAPSE_CHARS = 180;
const PROJECT_PAGE_LIMIT = 10;

/** 紅色頂區淡色心形底紋（與稿圖水印感一致） */
function HeroHeartWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.08]"
      aria-hidden
    >
      <svg
        className="absolute -right-8 -top-4 h-[220px] w-[220px] text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <svg
        className="absolute -bottom-16 left-1/2 h-[280px] w-[280px] -translate-x-1/2 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
}

function InfoLinkRow({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 border-b border-neutral-100 py-2.5 last:border-b-0">
      <span className="w-[96px] shrink-0 text-[14px] text-neutral-500">{label}</span>
      <a
        href={href}
        className="min-w-0 flex-1 break-all text-[14px] leading-snug"
        style={{ color: SEARCH_FIELD_CARET_AND_LINK }}
      >
        {children}
      </a>
    </div>
  );
}

function InfoTextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-3 border-b border-neutral-100 py-2.5 last:border-b-0">
      <span className="w-[96px] shrink-0 text-[14px] text-neutral-500">{label}</span>
      <span className="min-w-0 flex-1 text-[14px] leading-snug text-neutral-900">{value}</span>
    </div>
  );
}

export function CharityOrganizationProfileScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [phone, setPhone] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [themes, setThemes] = useState<CharityTheme[]>([]);
  const [products, setProducts] = useState<DonationListItem[]>([]);
  const [projectItems, setProjectItems] = useState<DonationListItem[]>([]);
  const [projectsCursor, setProjectsCursor] = useState<string | null>(null);
  const [projectsHasMore, setProjectsHasMore] = useState(false);
  const [projectsLoadingMore, setProjectsLoadingMore] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const orgIdRef = useRef<string | null>(null);

  const loadMoreProjects = useCallback(async () => {
    const oid = orgIdRef.current;
    if (oid == null || !projectsHasMore || projectsLoadingMore || projectsCursor == null) return;
    setProjectsLoadingMore(true);
    try {
      const page = await fetchCharityOrganizationProjectsPage({
        organizationId: oid,
        cursor: projectsCursor,
        limit: PROJECT_PAGE_LIMIT,
      });
      setProjectItems((prev) => [...prev, ...page.items]);
      setProjectsCursor(page.pageInfo.nextCursor);
      setProjectsHasMore(page.pageInfo.hasMore);
    } catch {
      /* 無限捲動失敗時略過，使用者可再捲觸發 */
    } finally {
      setProjectsLoadingMore(false);
    }
  }, [projectsCursor, projectsHasMore, projectsLoadingMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void loadMoreProjects();
        }
      },
      { root: null, rootMargin: '100px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMoreProjects]);

  useEffect(() => {
    if (id == null || id === '') {
      setLoading(false);
      setError('無效的團體編號');
      orgIdRef.current = null;
      return;
    }
    orgIdRef.current = id;
    const ac = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDescExpanded(false);

    void fetchCharityOrganizationProfile({ organizationId: id, signal: ac.signal })
      .then((data) => {
        if (cancelled) return;
        const o = data.organization;
        setOrgName(o.name);
        setLogoUrl(o.logoUrl);
        setBannerUrl(o.bannerUrl);
        setPhone(o.phone);
        setEmail(o.email);
        setWebsiteUrl(o.websiteUrl);
        setRegistrationNumber(o.registrationNumber);
        setDescription(o.description);
        setThemes(o.themes);
        setProducts(data.products);
        setProjectItems(data.projects.items);
        setProjectsCursor(data.projects.pageInfo.nextCursor);
        setProjectsHasMore(data.projects.pageInfo.hasMore);
        setError(null);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === 'AbortError') return;
        if (!cancelled) {
          if (e instanceof DonationApiError && e.errorCode === 'NOT_FOUND') {
            setError('找不到此公益團體');
          } else {
            setError('無法載入資料，請稍後再試');
          }
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

  const showDescToggle = description.length > DESCRIPTION_COLLAPSE_CHARS;
  const gutter = { paddingLeft: CARD_LIST_MARGIN_X_PX, paddingRight: CARD_LIST_MARGIN_X_PX };
  const showProjectsSection = projectItems.length > 0 || projectsLoadingMore;

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
          <h1 className="text-[17px] font-semibold tracking-wide">公益團體介紹</h1>
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

      <main className="min-h-0 flex-1 overflow-y-auto pb-10">
        {loading ? (
          <p className="py-16 text-center text-sm text-neutral-500">載入中…</p>
        ) : null}

        {!loading && error ? (
          <p className="py-16 text-center text-sm text-red-600" style={gutter}>
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <>
            {/* 紅色頂區：自訂 banner 或純色 + 心形底紋；logo 白底圓角方塊、團名白字 */}
            <div
              className="relative w-full shrink-0 overflow-hidden pb-10 pt-1"
              style={{ backgroundColor: THEME_PRIMARY }}
            >
              {bannerUrl !== '' ? (
                <>
                  <img
                    src={bannerUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                    decoding="async"
                    onError={onDonationImageError}
                  />
                  <div className="absolute inset-0 bg-[#C9191D]/55" aria-hidden />
                </>
              ) : (
                <HeroHeartWatermark />
              )}
              <div className="relative z-[1] flex flex-col items-center px-5">
                <div className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-md ring-1 ring-black/5">
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    decoding="async"
                    onError={onDonationImageError}
                  />
                </div>
                <h2 className="mt-4 max-w-full text-center text-[18px] font-bold leading-snug text-white drop-shadow-sm">
                  {orgName}
                </h2>
              </div>
            </div>

            {/* 單一白卡：基本資料、介紹、標籤、捐款（與稿圖重疊紅區） */}
            <div
              className="relative z-[2] mx-auto -mt-9 max-w-full rounded-[12px] bg-white px-4 py-4 shadow-sm ring-1 ring-black/5"
              style={{ marginLeft: CARD_LIST_MARGIN_X_PX, marginRight: CARD_LIST_MARGIN_X_PX }}
            >
              <p className="border-b border-neutral-100 pb-3 text-[15px] font-semibold text-neutral-900">
                基本資料
              </p>
              <div className="pt-0.5">
                {phone != null && phone.length > 0 ? (
                  <InfoLinkRow label="聯絡電話" href={`tel:${phone.replace(/\s/g, '')}`}>
                    {phone}
                  </InfoLinkRow>
                ) : null}
                {email != null && email.length > 0 ? (
                  <InfoLinkRow label="聯絡信箱" href={`mailto:${email}`}>
                    {email}
                  </InfoLinkRow>
                ) : null}
                {websiteUrl != null && websiteUrl.length > 0 ? (
                  <InfoLinkRow label="官方網站" href={websiteUrl}>
                    {websiteUrl}
                  </InfoLinkRow>
                ) : null}
                {registrationNumber != null && registrationNumber.length > 0 ? (
                  <InfoTextRow label="核准字號" value={registrationNumber} />
                ) : null}
                {phone == null &&
                (email == null || email.length === 0) &&
                (websiteUrl == null || websiteUrl.length === 0) &&
                (registrationNumber == null || registrationNumber.length === 0) ? (
                  <p className="py-4 text-[14px] text-neutral-500">尚無公開聯絡資訊</p>
                ) : null}
              </div>

              <div className="my-4 border-t border-neutral-200" role="separator" aria-hidden />

              <div className="min-w-0">
                <div
                  className={
                    !descExpanded && showDescToggle
                      ? 'line-clamp-4 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800'
                      : 'whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800'
                  }
                >
                  {description}
                </div>
                {showDescToggle ? (
                  <button
                    type="button"
                    className="mt-1.5 text-[14px] font-medium text-neutral-500"
                    onClick={() => setDescExpanded((v) => !v)}
                  >
                    {descExpanded ? '顯示較少' : '更多'}
                  </button>
                ) : null}
              </div>

              {themes.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {themes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="rounded-full px-3 py-1.5 text-left text-[12px] font-medium text-neutral-700 outline-none transition-opacity active:opacity-80 focus-visible:ring-2 focus-visible:ring-[#C9191D]/40"
                      style={{ backgroundColor: FILTER_CHIP_BG }}
                      onClick={() =>
                        navigateToDonationListWithThemeFilter(navigate, 'groups', t as CharityTheme)
                      }
                      aria-label={`以「${CHARITY_THEME_LABELS[t]}」篩選公益團體列表`}
                    >
                      {CHARITY_THEME_LABELS[t]}
                    </button>
                  ))}
                </div>
              ) : null}

              <Button
                type="button"
                className="mt-6 h-12 w-full rounded-[12px] text-[16px] font-semibold text-white shadow-sm"
                style={{ backgroundColor: THEME_PRIMARY }}
                onClick={() => {}}
              >
                直接捐款給團體
              </Button>
            </div>

            {products.length > 0 ? (
              <section className="mt-10">
                <h3 className="mb-3 text-[16px] font-semibold text-neutral-900" style={gutter}>
                  義賣商品
                </h3>
                <div
                  className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  style={{
                    paddingLeft: CARD_LIST_MARGIN_X_PX,
                    paddingRight: CARD_LIST_MARGIN_X_PX,
                  }}
                >
                  {products.map((item) => (
                    <div key={item.id} className="w-[min(168px,45vw)] shrink-0">
                      <CharitySaleProductCard item={item} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {showProjectsSection ? (
              <section className="mt-10 pb-4">
                <h3 className="mb-3 text-[16px] font-semibold text-neutral-900" style={gutter}>
                  捐款專案
                </h3>
                <div
                  className="flex flex-col gap-3"
                  style={{
                    paddingLeft: CARD_LIST_MARGIN_X_PX,
                    paddingRight: CARD_LIST_MARGIN_X_PX,
                  }}
                >
                  {projectItems.map((item) => (
                    <DonationProjectCard key={item.id} item={item} />
                  ))}
                  {projectsLoadingMore ? <DonationLoadMoreSkeleton /> : null}
                </div>
                <div ref={sentinelRef} className="h-2 w-full" aria-hidden />
              </section>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
