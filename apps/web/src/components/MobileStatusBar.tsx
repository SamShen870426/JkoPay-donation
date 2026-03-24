/**
 * 預留與 iOS 狀態列相同高度（44px），讓下方導航列對齊 Figma「紅區總高 88px」。
 * 若原生 App WebView 已含系統狀態列，可對 `[data-status-bar-sim]` 設 `display: none` 或 `height: 0`。
 */
export function MobileStatusBar() {
  return (
    <div
      data-status-bar-sim
      className="flex h-[44px] w-full shrink-0 items-center px-4 text-[15px] font-semibold leading-none text-white/90"
      aria-hidden
    >
      <span className="pl-0.5">9:41</span>
    </div>
  );
}
