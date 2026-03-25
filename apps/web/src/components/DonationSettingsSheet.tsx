import type { DonationProjectDetail, ProjectDonationPaymentKind } from '@jkopay/contracts';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '../lib/cn.js';
import { Button } from '../ui/button.js';

const PAYMENT_LABELS: Record<ProjectDonationPaymentKind, string> = {
  recurring_monthly: '每月定期捐款',
  one_time: '單次捐款',
};

type Props = {
  open: boolean;
  onClose: () => void;
  detail: DonationProjectDetail;
};

function parsePositiveInt(raw: string): number | null {
  const t = raw.trim().replace(/,/g, '');
  if (t === '') return null;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

export function DonationSettingsSheet({ open, onClose, detail }: Props) {
  const kinds = detail.checkout.paymentKinds;
  const [kind, setKind] = useState<ProjectDonationPaymentKind>(kinds[0] ?? 'one_time');
  const [billingDay, setBillingDay] = useState<number | null>(null);
  const [presetAmount, setPresetAmount] = useState<number | null>(null);
  const [customRaw, setCustomRaw] = useState('');

  useEffect(() => {
    if (!open) return;
    setKind(detail.checkout.paymentKinds[0] ?? 'one_time');
    setBillingDay(null);
    setPresetAmount(null);
    setCustomRaw('');
  }, [open, detail.donationItemId, detail.checkout.paymentKinds]);

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

  const customAmount = useMemo(() => parsePositiveInt(customRaw), [customRaw]);
  const resolvedAmount = detail.checkout.allowCustomAmount
    ? customAmount
    : (presetAmount ?? customAmount);

  const showBilling = kind === 'recurring_monthly' && detail.checkout.billingDays.length > 0;

  const nextEnabled = useMemo(() => {
    if (resolvedAmount == null) return false;
    if (kind === 'recurring_monthly' && showBilling && billingDay == null) return false;
    return true;
  }, [billingDay, kind, resolvedAmount, showBilling]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="donation-settings-sheet-backdrop fixed inset-0 z-[60] bg-black/45"
        aria-label="關閉"
        onClick={onClose}
      />
      <div
        className="donation-settings-sheet-panel fixed inset-x-0 bottom-0 z-[70] mx-auto flex max-h-[min(90vh,840px)] w-full max-w-[var(--layout-w)] flex-col rounded-t-[16px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-settings-title"
      >
        <div className="relative flex shrink-0 items-center justify-center border-b border-neutral-100 py-3">
          <h2 id="donation-settings-title" className="text-[16px] font-semibold text-neutral-900">
            捐款設定
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
          <p className="text-[15px] font-semibold text-neutral-900">捐款類型</p>
          <div
            className={cn('mt-2 grid gap-2', kinds.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}
          >
            {kinds.map((k) => {
              const selected = kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn(
                    'relative rounded-xl border-2 px-3 py-3 text-left text-[14px] font-medium leading-snug transition-colors',
                    selected
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-neutral-200 text-neutral-600',
                  )}
                >
                  {PAYMENT_LABELS[k]}
                  {selected ? (
                    <span
                      className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white"
                      aria-hidden
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {showBilling ? (
            <>
              <p className="mt-6 text-[15px] font-semibold text-neutral-900">扣款日期</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {detail.checkout.billingDays.map((d) => {
                  const selected = billingDay === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBillingDay(d)}
                      className={cn(
                        'rounded-xl border-2 px-3 py-2.5 text-[14px] font-medium',
                        selected
                          ? 'border-neutral-900 text-neutral-900'
                          : 'border-neutral-200 text-neutral-600',
                      )}
                    >
                      每月 {d} 日
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          <p className="mt-6 text-[15px] font-semibold text-neutral-900">扣款金額</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {detail.checkout.amountPresets.map((p, i) => {
              const selected = presetAmount === p.amount;
              return (
                <button
                  key={`${p.amount}-${i}`}
                  type="button"
                  onClick={() => {
                    setPresetAmount(p.amount);
                    if (detail.checkout.allowCustomAmount) {
                      setCustomRaw(String(p.amount));
                    }
                  }}
                  className={cn(
                    'rounded-xl border-2 px-3 py-2.5 text-[14px] font-medium tabular-nums',
                    selected
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-neutral-200 text-neutral-600',
                  )}
                >
                  {p.currency} {p.amount.toLocaleString('zh-TW')}
                </button>
              );
            })}
          </div>

          {detail.checkout.allowCustomAmount ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl border-2 border-neutral-200 px-3 py-2.5">
              <span className="shrink-0 text-[14px] font-medium text-neutral-500">TWD</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="請輸入金額"
                value={customRaw}
                onChange={(e) => {
                  const next = e.target.value.replace(/[^\d]/g, '');
                  setCustomRaw(next);
                  const n = parsePositiveInt(next);
                  const match =
                    n != null
                      ? detail.checkout.amountPresets.find((ap) => ap.amount === n)
                      : undefined;
                  setPresetAmount(match != null ? match.amount : null);
                }}
                className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-neutral-100 px-4 pt-3">
          <button
            type="button"
            disabled={!nextEnabled}
            className={cn(
              'w-full rounded-xl py-3.5 text-[16px] font-semibold text-white transition-opacity',
              nextEnabled ? 'bg-neutral-900 active:opacity-95' : 'cursor-not-allowed bg-neutral-300',
            )}
            onClick={() => {
              if (!nextEnabled) return;
              onClose();
            }}
          >
            下一步
          </button>
        </div>
      </div>
    </>
  );
}
