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
        organizationCount,
      });
      setResultText(JSON.stringify(out, null, 2));
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
          「清空並重種」會再依團體數建立每團 <strong>1 團體列 + 2 專案 + 5 商品</strong>。
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
          團體數量（僅「清空並重種」使用，每團 8 筆列表列）
          <input
            type="number"
            min={1}
            max={5000}
            value={organizationCount}
            onChange={(e) => setOrganizationCount(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
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
            清空並依團體數重種
          </Button>
        </div>

        {errorText != null ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">{errorText}</p>
        ) : null}
        {resultText != null ? (
          <pre className="overflow-x-auto rounded-lg bg-white p-3 text-[12px] leading-relaxed text-neutral-800 ring-1 ring-black/10">
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
