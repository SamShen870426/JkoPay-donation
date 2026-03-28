import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postInternalDataTools } from '../api/donationClient.js';
import { THEME_PAGE_BG, THEME_PRIMARY } from '../constants/theme.js';
import { Button } from '../ui/button.js';

/**
 * 隱藏入口：手動網址 `/internal/data-tools`（主導覽不連結）。
 * 需 BFF 設定 `DEV_DATA_TOOLS_SECRET`，並在下方輸入相同密鑰。
 */
export function DevDataToolsScreen() {
  const [secret, setSecret] = useState('');
  const [organizationCount, setOrganizationCount] = useState(30);
  const [batchSize, setBatchSize] = useState(80);
  const [wipeBeforeBatch, setWipeBeforeBatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  async function run(mode: 'wipe' | 'wipe_and_bulk_seed') {
    setErrorText(null);
    setResultText(null);
    const s = secret.trim();
    if (s.length === 0) {
      setErrorText('請輸入密鑰（與 BFF 環境變數 DEV_DATA_TOOLS_SECRET 相同）。');
      return;
    }
    setLoading(true);
    try {
      const out = await postInternalDataTools({
        secret: s,
        mode,
        ...(mode === 'wipe_and_bulk_seed' ? { organizationCount } : {}),
      });
      setResultText(JSON.stringify(out, null, 2));
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function runBatchedSeed() {
    setErrorText(null);
    setResultText(null);
    const s = secret.trim();
    if (s.length === 0) {
      setErrorText('請輸入密鑰（與 BFF 環境變數 DEV_DATA_TOOLS_SECRET 相同）。');
      return;
    }
    const total = organizationCount;
    const size = Math.min(200, Math.max(1, Math.floor(batchSize)));
    setLoading(true);
    const lines: string[] = [];
    try {
      let batchIndex = 0;
      for (;;) {
        lines.push(
          `— 批次 ${batchIndex}（每批最多 ${size} 團）請求中… ${new Date().toLocaleTimeString()}`,
        );
        setResultText(lines.join('\n'));

        const out = await postInternalDataTools({
          secret: s,
          mode: 'bulk_seed_batch',
          totalOrganizationCount: total,
          batchIndex,
          batchSize: size,
          wipeFirst: wipeBeforeBatch && batchIndex === 0,
        });

        lines.pop();
        lines.push(JSON.stringify(out, null, 2));
        setResultText(lines.join('\n\n'));

        if (out.batchDone) break;
        batchIndex = out.nextBatchIndex ?? batchIndex + 1;
      }
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[var(--layout-min-h)] px-4 py-6" style={{ backgroundColor: THEME_PAGE_BG }}>
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-950">
          <strong>內部資料工具</strong>
          ：會<strong>清空</strong>本應用所有公益團體／捐款項目資料（MySQL）。
          「清空並重種」為<strong>單次請求</strong>，量大易逾時；大量建議用下方<strong>「分批重種」</strong>（每批一個 HTTP，可顯示進度）。
          每團仍為 <strong>1 團體列 + 2 專案 + 5 商品</strong>。後端已改為每團單一 transaction + 少量並行，較舊版快。
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
          團體總數（重種／分批皆用此數字，上限 5000）
          <input
            type="number"
            min={1}
            max={5000}
            value={organizationCount}
            onChange={(e) => setOrganizationCount(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </label>

        <label className="block text-[14px] font-medium text-neutral-800">
          每批團體數（僅分批；1–200，預設 80）
          <input
            type="number"
            min={1}
            max={200}
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value) || 80)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </label>

        <label className="flex items-center gap-2 text-[14px] text-neutral-800">
          <input
            type="checkbox"
            checked={wipeBeforeBatch}
            onChange={(e) => setWipeBeforeBatch(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          分批時第 0 批前先清空資料庫（與舊版「清空並重種」一致）
        </label>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            disabled={loading}
            className="w-full rounded-xl py-3 text-[15px] font-semibold text-white"
            style={{ backgroundColor: THEME_PRIMARY }}
            onClick={() => void run('wipe')}
          >
            {loading ? '處理中…' : '僅清空資料庫'}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full rounded-xl border-2 border-neutral-900 bg-white py-3 text-[15px] font-semibold text-neutral-900 active:bg-neutral-50"
            onClick={() => void run('wipe_and_bulk_seed')}
          >
            清空並單次重種（易逾時）
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="w-full rounded-xl border-2 border-amber-800 bg-amber-100 py-3 text-[15px] font-semibold text-amber-950 active:bg-amber-200"
            onClick={() => void runBatchedSeed()}
          >
            {loading ? '分批處理中…' : '分批重種（建議 500+ 團）'}
          </Button>
        </div>

        {errorText != null ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">{errorText}</p>
        ) : null}
        {resultText != null ? (
          <pre className="max-h-[min(50vh,420px)] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-[12px] leading-relaxed text-neutral-800 ring-1 ring-black/10">
            {resultText}
          </pre>
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
