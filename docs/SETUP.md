# Charity Donation — 本機設定與常用指令

## 需求

- **Node.js**：≥ 20（專案以 Volta 鎖 `20.18.1`）
- **npm**：與 Node 一併安裝即可（workspace 用 npm workspaces）
- **Docker Desktop**（或相容的 Docker 引擎）：用來跑本機 MySQL；若你已有對外的 MySQL，可改 `DATABASE_URL` 指向該實例

---

## 第一次啟動（建議順序）

1. **複製 BFF 環境檔**  
   若尚無 `apps/bff/.env`，執行根目錄任一會觸發 `preprisma:*` 的指令時，腳本 `scripts/ensure-bff-env.mjs` 會自動從 `apps/bff/.env.example` 建立 `.env`。也可手動複製：

   ```bash
   cp apps/bff/.env.example apps/bff/.env
   ```

2. **啟動資料庫（Docker）**

   ```bash
   npm run db:up
   ```

   `docker-compose.yml` 會啟動 **MySQL 8.4**，容器名 `jko-charity-mysql`，對外 **3306**，資料庫名 **`jko_charity`**，root 密碼與 `.env.example` 內 `DATABASE_URL` 一致（`root` / `root`）。

3. **Prisma：generate、migrate、seed**

   ```bash
   npm run prisma:setup
   ```

   等同依序：`prisma:generate` → `prisma:migrate`（`prisma migrate deploy`）→ `prisma:seed`。  
   Migration 目錄：`apps/bff/prisma/migrations/`（含主題欄位：`20250324120000_add_charity_theme`）。

4. **建置契約與應用（可選，正式建置前建議跑）**

   ```bash
   npm run build
   ```

5. **開發模式（contracts watch + BFF + Web）**

   ```bash
   npm run dev
   ```

---

## 環境變數

### BFF（`apps/bff/.env`）

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | Prisma 連線字串；本機 Docker 預設見 `.env.example` |
| `PORT` | BFF 監聽埠，預設 `4000` |
| `ASSET_CDN_BASE` | 選填；`logo_key` 為相對路徑時組圖片 URL 的前綴 |

### Web（Vite）

| 變數 | 說明 |
|------|------|
| `VITE_API_BASE` | 選填；BFF 的 origin（例如 `http://127.0.0.1:4000`）。未設時為空字串，請求會打向目前頁面的 origin（需自行用 proxy 或同源部署對齊 BFF） |

可在 `apps/web` 建立 `.env` / `.env.local`（勿提交密鑰）：

```env
VITE_API_BASE=http://127.0.0.1:4000
```

---

## 根目錄 npm scripts 對照

| 指令 | 用途 |
|------|------|
| `npm run build` | 建置 `contracts` → `bff` → `web` |
| `npm run dev` | 同時跑 contracts dev（watch）、BFF、Vite |
| `npm run db:up` / `db:down` | 啟動／停止 docker-compose MySQL |
| `npm run prisma:generate` | `prisma generate`（BFF） |
| `npm run prisma:migrate` | `prisma migrate deploy`（BFF） |
| `npm run prisma:seed` | 執行 `apps/bff/prisma/seed.ts` |
| `npm run prisma:setup` | generate + migrate + seed |
| `npm test` | 執行 BFF 的 Vitest（`vitest run`） |
| `npm run check-env` | Windows：執行 `scripts/check-env.ps1` |

BFF 專用（`apps/bff`）：`db:migrate`（`migrate dev`）、`db:push` 等見該目錄 `package.json`。

---

## 疑難排解（精簡）

- **契約改過但型別／執行怪**：先 `npm run build -w @jkopay/contracts` 或根目錄 `npm run build`。  
- **列表主題篩選無效**：確認已跑 migration 與 seed，且 Web 請求 URL 是否帶上 `theme=`；BFF 有重啟。  
- **MySQL 連不上**：確認容器健康、`DATABASE_URL` 主機埠與 docker 對外映射一致。

---

## 與架構文件的關係

- 模組邊界、API／前端分層、資料模型設計：見 [ARCHITECTURE.md](./ARCHITECTURE.md)。
