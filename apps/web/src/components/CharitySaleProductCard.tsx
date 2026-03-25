import type { DonationListItem } from '@jkopay/contracts';
import { Link } from 'react-router-dom';
import { formatCharityPriceLine } from '../lib/format-charity-price.js';
import { THEME_PRIMARY } from '../constants/theme.js';

type Props = { item: DonationListItem };

/** 列表價格：單價或區間（與稿 TWD 1,050 / TWD 250 - 450） */
export function formatSaleListPrice(item: DonationListItem): string | null {
  const min = item.productPriceMin;
  const max = item.productPriceMax;
  const cur = item.productCurrency ?? 'TWD';
  if (min == null || max == null) return null;
  return formatCharityPriceLine(cur, min, max);
}

/** 義賣商品：固定比例卡片、首圖、粗體標題、灰字團體 truncate、底價 */
export function CharitySaleProductCard({ item }: Props) {
  const cover = item.productCoverImageUrl ?? item.imageUrl;
  const org = item.productOrganizationName ?? '';
  const priceLine = formatSaleListPrice(item);

  return (
    <Link
      to={`/products/${item.id}`}
      className="min-w-0 rounded-[12px] outline-none ring-inset focus-visible:ring-2 focus-visible:ring-[#C9191D]/40"
    >
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[12px] bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-neutral-100">
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-h-[92px] min-w-0 flex-1 flex-col px-2 pb-2.5 pt-2">
        <h2 className="truncate text-[14px] font-semibold leading-5 text-neutral-900">
          {item.title}
        </h2>
        <p className="mt-1 truncate text-[12px] leading-5 text-neutral-500">{org}</p>
        {priceLine != null ? (
          <p
            className="mt-auto pt-1 text-[14px] font-semibold tabular-nums leading-none"
            style={{ color: THEME_PRIMARY }}
          >
            {priceLine}
          </p>
        ) : null}
      </div>
    </article>
    </Link>
  );
}
