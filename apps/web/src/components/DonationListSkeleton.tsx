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

/** 義賣雙欄網格：單格骨架（一次請渲染兩格以填滿一列） */
export function DonationProductLoadMoreSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col overflow-hidden rounded-[12px] bg-white shadow-sm ring-1 ring-black/5"
      aria-hidden
    >
      <Skeleton shape="rect" className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-2 pb-3">
        <Skeleton shape="title" className="h-3.5 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="mt-1 h-3.5 w-1/2" />
      </div>
    </div>
  );
}
