import {
  EMPTY_SEARCH_BLOCK_WIDTH_PX,
  EMPTY_SEARCH_ICON_PX,
  EMPTY_SEARCH_ICON_TEXT_GAP_PX,
  EMPTY_SEARCH_PADDING_X_PX,
  EMPTY_SEARCH_PADDING_Y_PX,
  EMPTY_SEARCH_TITLE_SUBTITLE_GAP_PX,
} from '../constants/theme.js';

type Props = {
  variant: 'search' | 'browse';
};

const EMPTY_SEARCH_IMG = '/empty-search-nodata.png';

const EMPTY_SEARCH_FONT_FAMILY =
  "'PingFang TC', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export function DonationEmptyState({ variant }: Props) {
  const isSearch = variant === 'search';

  if (isSearch) {
    return (
      <div className="flex justify-center py-10">
        <div
          className="flex flex-col items-center text-center"
          style={{
            width: '100%',
            maxWidth: EMPTY_SEARCH_BLOCK_WIDTH_PX,
            paddingTop: EMPTY_SEARCH_PADDING_Y_PX,
            paddingBottom: EMPTY_SEARCH_PADDING_Y_PX,
            paddingLeft: EMPTY_SEARCH_PADDING_X_PX,
            paddingRight: EMPTY_SEARCH_PADDING_X_PX,
            gap: EMPTY_SEARCH_ICON_TEXT_GAP_PX,
          }}
        >
          <img
            src={EMPTY_SEARCH_IMG}
            alt=""
            width={EMPTY_SEARCH_ICON_PX}
            height={EMPTY_SEARCH_ICON_PX}
            className="shrink-0 object-contain"
            decoding="async"
          />
          <div
            className="flex w-full flex-col items-center text-center"
            style={{
              gap: EMPTY_SEARCH_TITLE_SUBTITLE_GAP_PX,
              fontFamily: EMPTY_SEARCH_FONT_FAMILY,
            }}
          >
            <p className="min-h-[28px] text-[20px] font-medium leading-[28px] text-black/90">
              查無相關資料
            </p>
            <p className="box-border w-full px-[10px] text-[14px] font-normal leading-[22px] text-black/50">
              請調整關鍵字再重新搜尋
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div className="mb-4 text-neutral-300" aria-hidden>
        <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z" />
        </svg>
      </div>
      <p className="text-[17px] font-semibold text-neutral-900">查無相關資料</p>
      <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-neutral-500">
        此分類目前沒有項目，請切換其他分類看看。
      </p>
    </div>
  );
}
