import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn.js';
import { onDonationImageError } from '../lib/donation-image-fallback.js';

type Props = {
  urls: string[];
  /** 初始對齊的索引（對應後端 primaryImageIndex） */
  initialIndex: number;
};

/**
 * 橫向捲動 + snap，底部圓點指示；與稿多圖輪播一致。
 */
export function ProductImageCarousel({ urls, initialIndex }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, urls.length - 1)),
  );

  const scrollToIndex = useCallback((i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: i * w, behavior: 'smooth' });
  }, []);

  const urlsKey = urls.join('|');

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || urls.length === 0) return;
    const idx = Math.min(Math.max(0, initialIndex), urls.length - 1);
    const w = el.clientWidth;
    if (w > 0) {
      el.scrollTo({ left: idx * w, behavior: 'auto' });
    }
    setActive(idx);
  }, [initialIndex, urls.length, urlsKey]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const i = Math.round(el.scrollLeft / w);
    setActive(Math.min(Math.max(0, i), urls.length - 1));
  };

  return (
    <div className="relative w-full bg-neutral-100">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className={cn(
          'flex snap-x snap-mandatory overflow-x-auto',
          '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {urls.map((url, i) => (
          <div key={`${url}-${i}`} className="w-full shrink-0 snap-center">
            <div className="aspect-square w-full">
              <img
                src={url}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover"
                onError={onDonationImageError}
              />
            </div>
          </div>
        ))}
      </div>
      {urls.length > 1 ? (
        <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center">
          <div
            className="pointer-events-auto flex gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5"
            role="tablist"
            aria-label="商品圖片"
          >
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  i === active ? 'bg-white' : 'bg-white/45 hover:bg-white/70',
                )}
                onClick={() => scrollToIndex(i)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
