import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postInternalDataTools } from '../api/donationClient.js';
import { THEME_PAGE_BG, THEME_PRIMARY } from '../constants/theme.js';
import { Button } from '../ui/button.js';

/** 固定每批團體數（與 BFF `bulk_seed_batch` 上限一致） */
const BATCH_SIZE = 200;

type RunPhase = 'idle' | 'running' | 'success' | 'error';

/**
 * 隱藏入口：手動網址 `/internal/data-tools`（主導覽不連結）。
 * 需 BFF 設定 `DEV_DATA_TOOLS_SECRET`，並在下方輸入相同密鑰。
 */
export function DevDataToolsScreen() {
  const [secret, setSecret] = useState('');
  const [organizationCount, setOrganizationCount] = useState(30);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<RunPhase>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  async function runBatchedSeed() {
    setErrorText(null);
    setStatusLine(null);
    setPhase('running');
    setProgressPercent(0);

    const s = secret.trim();
    if (s.length === 0) {
      setErrorText('請輸入密鑰（與 BFF 環境變數 DEV_DATA_TOOLS_SECRET 相同）。');
      setPhase('error');
      return;
    }

    const total = Math.min(5000, Math.max(1, Math.floor(organizationCount)));
    setLoading(true);

    try {
      let batchIndex = 0;
      for (;;) {
        const batchLabel = batchIndex + 1;
        const approxBatches = Math.max(1, Math.ceil(total / BATCH_SIZE));
        setStatusLine(`正在送出第 ${batchLabel} / 約 ${approxBatches} 批（每批 ${BATCH_SIZE} 團）…`);

        const out = await postInternalDataTools({
          secret: s,
          mode: 'bulk_seed_batch',
          totalOrganizationCount: total,
          batchIndex,
          batchSize: BATCH_SIZE,
          wipeFirst: batchIndex === 0,
        });

        const rangeEnd = out.rangeEnd ?? 0;
        const pct =
          total > 0 ? Math.min(100, Math.round((rangeEnd / total) * 100)) : out.batchDone ? 100 : 0;
        setProgressPercent(pct);
        setStatusLine(
          out.batchDone
            ? `已寫入第 1–${rangeEnd} 團（共 ${total} 團）`
            : `已寫入第 1–${rangeEnd} 團 / ${total} 團（${pct}%）`,
        );

        if (out.batchDone) {
          setPhase('success');
          setProgressPercent(100);
          setStatusLine(`完成：共 ${total} 團體已重種。`);
          break;
        }
        batchIndex = out.nextBatchIndex ?? batchIndex + 1;
      }
    } catch (e) {
      setPhase('error');
      setErrorText(e instanceof Error ? e.message : String(e));
      setStatusLine(null);
    } finally {
      setLoading(false);
    }
  }

  const showProgress = phase === 'running' || phase === 'success' || (phase === 'error' && progressPercent > 0);

  return (
    <div className="min-h-[var(--layout-min-h)] px-4 py-6" style={{ backgroundColor: THEME_PAGE_BG }}>
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-950">
          <strong>內部資料工具</strong>
          ：按下後會先<strong>清空</strong>公益資料，再依團體總數<strong>分批重種</strong>（每批{' '}
          <strong>{BATCH_SIZE}</strong> 團、多個請求，附進度條）。每團為{' '}
          <strong>1 團體列 + 2 專案 + 5 義賣</strong>。
        </div>

        <label className="block text-[14px] font-medium text-neutral-800">
          密鑰
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            placeholder="DEV_DATA_TOOLS_SECRET"
          />
        </label>

        <label className="block text-[14px] font-medium text-neutral-800">
          團體總數（上限 5000）
          <input
            type="number"
            min={1}
            max={5000}
            value={organizationCount}
            onChange={(e) => setOrganizationCount(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </label>

        <Button
          type="button"
          disabled={loading}
          className="w-full rounded-xl border-2 border-amber-800 bg-amber-100 py-3 text-[15px] font-semibold text-amber-950 active:bg-amber-200"
          onClick={() => void runBatchedSeed()}
        >
          {loading ? '重種進行中…' : '清空並分批重種'}
        </Button>

        {showProgress ? (
          <div className="space-y-2 rounded-xl bg-white p-3 ring-1 ring-black/10">
            <div className="flex items-center justify-between text-[13px] font-medium text-neutral-800">
              <span>進度</span>
              <span>{progressPercent}%</span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-neutral-200"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: phase === 'success' ? '#16a34a' : THEME_PRIMARY,
                }}
              />
            </div>
            {statusLine != null ? (
              <p className="text-[12px] leading-relaxed text-neutral-600">{statusLine}</p>
            ) : null}
            {phase === 'success' ? (
              <p className="text-[13px] font-semibold text-green-700">全部完成</p>
            ) : null}
          </div>
        ) : null}

        {errorText != null ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">{errorText}</p>
        ) : null}

        <p className="text-center text-[13px] text-neutral-500">
          <Link to="/" className="underline underline-offset-2">
            回首頁列表
          </Link>
        </p>
      </div>
    </div>
  );
}
