import { DonationCardShell } from '../ui/card.js';
import { Skeleton } from '../ui/skeleton.js';

/** 無限滾動載入下一頁時，與卡片同寬高的單列骨架（首屏／搜尋請用 DonationListInitialLoading） */
export function DonationLoadMoreSkeleton() {
  return (
    <DonationCardShell className="items-center" aria-hidden>
      <Skeleton shape="rect" className="h-14 w-14 shrink-0 self-center" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 pr-1">
        <Skeleton shape="title" className="h-4 max-w-[75%]" />
        <Skeleton className="h-3 max-w-[60%]" />
      </div>
    </DonationCardShell>
  );
}
