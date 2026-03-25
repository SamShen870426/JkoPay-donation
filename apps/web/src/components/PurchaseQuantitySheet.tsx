import type { CharityProductDetail } from '@jkopay/contracts';
import { useEffect, useMemo, useState } from 'react';
import { formatCharityPriceLine } from '../lib/format-charity-price.js';
import { cn } from '../lib/cn.js';
import { THEME_PRIMARY } from '../constants/theme.js';
import { Button } from '../ui/button.js';

type Props = {
  open: boolean;
  onClose: () => void;
  detail: CharityProductDetail;
};

function fmt(n: number): string {
  return n.toLocaleString('zh-TW');
}

export function PurchaseQuantitySheet({ open, onClose, detail }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    setQuantities(Object.fromEntries(detail.options.map((o) => [o.id, 0])));
  }, [open, detail.options]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const frame = document.querySelector('[data-mobile-frame]') as HTMLElement | null;
    const prevBody = document.body.style.overflow;
    const prevFrame = frame?.style.overflow ?? '';
    document.body.style.overflow = 'hidden';
    if (frame) frame.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      if (frame) frame.style.overflow = prevFrame;
    };
  }, [open]);

  const linesTotal = useMemo(() => {
    let sum = 0;
    for (const o of detail.options) {
      const q = quantities[o.id] ?? 0;
      sum += q * o.unitPrice;
    }
    return sum;
  }, [detail.options, quantities]);

  const hasSelection = useMemo(
    () => detail.options.some((o) => (quantities[o.id] ?? 0) > 0),
    [detail.options, quantities],
  );

  const appliedShipping = hasSelection ? detail.shippingFeeAmount : 0;
  const grandTotal = linesTotal + appliedShipping;

  const setQty = (optionId: string, next: number) => {
    const opt = detail.options.find((o) => o.id === optionId);
    if (!opt) return;
    const clamped = Math.min(Math.max(0, next), opt.stockQuantity);
    setQuantities((prev) => ({ ...prev, [optionId]: clamped }));
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="purchase-qty-sheet-backdrop fixed inset-0 z-[60] bg-black/45"
        aria-label="關閉"
        onClick={onClose}
      />
      <div
        className="purchase-qty-sheet-panel fixed inset-x-0 bottom-0 z-[70] mx-auto flex max-h-[min(88vh,820px)] w-full max-w-[var(--layout-w)] flex-col rounded-t-[16px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-qty-title"
      >
        <div className="relative flex shrink-0 items-center justify-center border-b border-neutral-100 py-3">
          <h2 id="purchase-qty-title" className="text-[16px] font-semibold text-neutral-900">
            購買數量
          </h2>
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="absolute right-2 text-neutral-400"
            aria-label="關閉"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6 18 18M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3">
          <p className="mb-3 text-[15px] font-semibold text-neutral-900">商品選項</p>
          <ul className="divide-y divide-neutral-100">
            {detail.options.map((opt) => {
              const q = quantities[opt.id] ?? 0;
              const sub = q * opt.unitPrice;
              const atMax = q >= opt.stockQuantity && opt.stockQuantity >= 0;
              return (
                <li key={opt.id} className="py-3 first:pt-0">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium leading-snug text-neutral-900">{opt.label}</p>
                      <p className="mt-0.5 text-[12px] text-neutral-500">
                        {formatCharityPriceLine(detail.currency, opt.unitPrice, opt.unitPrice)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-lg text-neutral-600 disabled:opacity-35"
                        aria-label="減少數量"
                        disabled={q <= 0}
                        onClick={() => setQty(opt.id, q - 1)}
                      >
                        −
                      </button>
                      <span className="min-w-[22px] text-center text-[15px] font-medium tabular-nums">
                        {q}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-lg text-neutral-600 disabled:opacity-35"
                        aria-label="增加數量"
                        disabled={q >= opt.stockQuantity}
                        onClick={() => setQty(opt.id, q + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p className="w-[88px] shrink-0 text-right text-[14px] font-semibold tabular-nums text-neutral-900">
                      {detail.currency} {fmt(sub)}
                    </p>
                  </div>
                  {atMax && opt.stockQuantity > 0 ? (
                    <p className="mt-2 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[12px] leading-snug text-neutral-500">
                      庫存剩餘 {opt.stockQuantity} 個，無法再新增
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
            <div className="flex justify-between text-[14px] text-neutral-500">
              <span>運費</span>
              <span className="tabular-nums">
                {detail.currency} {fmt(appliedShipping)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold text-neutral-900">總計</span>
              <span
                className="text-[20px] font-bold tabular-nums"
                style={{ color: THEME_PRIMARY }}
              >
                {detail.currency} {fmt(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 pt-3">
          <button
            type="button"
            className={cn(
              'w-full rounded-xl py-3.5 text-[16px] font-semibold text-white',
              'active:opacity-95',
            )}
            style={{ backgroundColor: THEME_PRIMARY }}
            onClick={() => {}}
          >
            下一步
          </button>
        </div>
      </div>
    </>
  );
}
