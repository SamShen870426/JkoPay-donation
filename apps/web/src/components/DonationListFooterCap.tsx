/**
 * Figma「愛心沒有底線」：Hug 20px、文字與兩側線段 gap 9px；寬度隨父層（345 內容區）。
 */
export function DonationListFooterCap() {
  return (
    <div className="flex w-full min-h-[20px] items-center gap-[9px]" role="status">
      <div className="h-px min-h-px min-w-0 flex-1 bg-neutral-200" aria-hidden />
      <span className="shrink-0 text-[13px] leading-5 text-neutral-400">愛心沒有底線</span>
      <div className="h-px min-h-px min-w-0 flex-1 bg-neutral-200" aria-hidden />
    </div>
  );
}
