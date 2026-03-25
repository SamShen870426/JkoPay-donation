import type { DonationListItem } from '@jkopay/contracts';
import { CharitySaleProductCard } from './CharitySaleProductCard.js';
import { DonationCardShell } from '../ui/card.js';
import { DonationProjectCard } from './DonationProjectCard.js';

type Props = { item: DonationListItem };

function isCharitySaleProductGridCard(item: DonationListItem): boolean {
  if (item.category !== 'products') return false;
  return (
    item.productCoverImageUrl != null &&
    item.productOrganizationName != null &&
    item.productPriceMin != null &&
    item.productPriceMax != null &&
    item.productCurrency != null
  );
}

function isProjectCardLayout(item: DonationListItem): boolean {
  if (item.category !== 'projects') return false;
  return (
    item.heroImageUrl != null ||
    item.organizationName != null ||
    (item.themes != null && item.themes.length > 0)
  );
}

/** 公益團體／舊式商品列：橫式小圖 + 標題摘要；專案：大圖卡；義賣（有擴充資料）：雙欄商品卡 */
export function DonationCard({ item }: Props) {
  if (isCharitySaleProductGridCard(item)) {
    return <CharitySaleProductCard item={item} />;
  }
  if (isProjectCardLayout(item)) {
    return <DonationProjectCard item={item} />;
  }

  return (
    <DonationCardShell>
      <div className="relative h-[56px] w-[56px] shrink-0 self-center overflow-hidden rounded-lg bg-neutral-100">
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5"
          aria-hidden
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
        <h2 className="line-clamp-2 text-[16px] font-semibold leading-snug text-neutral-900">
          {item.title}
        </h2>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-500">
          {item.description}
        </p>
      </div>
    </DonationCardShell>
  );
}
