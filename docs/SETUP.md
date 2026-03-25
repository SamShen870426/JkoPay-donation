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
   Migration 目錄：`apps/bff/prisma/migrations/`（例：`20250324120000_add_charity_theme`、`20250325120000_donation_tags_project_card`、`20250326103000_charity_theme_m2m_remove_tags` 將標籤改為 `CharityTheme` 多對多）。

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
| `ASSET_CDN_BASE` | 選填；當 `logo_key` / `hero_image_key` / 商品圖 `image_key` **不是** `http(s)://` 且**不是**以 `/` 開頭時，BFF 會以此為前綴組出圖片 URL；未設時預設走 picsum placeholder（部分網路環境可能無法載入） |
| `DONATION_FALLBACK_IMAGE_URL` | 選填；欄位為空或僅空白時使用的預設圖 URL，預設為 `/donation-demo-logo.png`（與 Web `public` 靜態檔對應） |

### Web（Vite）

| 變數 | 說明 |
|------|------|
| `VITE_API_BASE` | 選填；BFF 的 origin（例如 `http://127.0.0.1:4000`）。未設時為空字串，請求會打向目前頁面的 origin（需自行用 proxy 或同源部署對齊 BFF） |

可在 `apps/web` 建立 `.env` / `.env.local`（勿提交密鑰）：

```env
VITE_API_BASE=http://127.0.0.1:4000
```

---

## 捐款／義賣圖片要怎麼「上傳」？

資料庫**不存圖檔二進位**，`DonationItem.hero_image_key`、`DonationProjectHeroImage.image_key`、`CharityOrganization.logo_key` 等欄位存的是**字串**，由 BFF `resolveImageUrl` / `resolveHeroImageUrl` 轉成前端 `<img src>` 可用的 URL。你可以擇一使用：

1. **完整網址**（建議上線與正式素材）  
   將圖放在公司 CDN、S3、Azure Blob 等，在 DB 寫 `https://…/project-123/hero.jpg`。BFF 會原樣回傳，無需再設 `ASSET_CDN_BASE`。

2. **與 Web 同源靜態檔**（本機／簡報 demo）  
   把檔案放在 `apps/web/public/`（例如 `apps/web/public/charity/heroes/fridge.jpg`），在 DB 寫 **`/charity/heroes/fridge.jpg`**（以 `/` 開頭）。瀏覽器會向目前網站網域請求該路徑。

3. **僅存「素材代碼」**（與物件儲存約定 key）  
   存例如 `heroes/fridge-2025`，並設定 `ASSET_CDN_BASE=https://你的-bucket-或-cdn`，由 BFF 拼出最終 URL（實際規則見 `apps/bff/src/modules/donation/donation.transformer.ts`）。

本機提供 `apps/web/public/donation-demo-logo.png` 作為 seed 預設 logo；BFF 在 `logo_key`／`hero_image_key`／商品圖等**空值**時也會退回同一張（路徑 `/donation-demo-logo.png`，可選環境變數 `DONATION_FALLBACK_IMAGE_URL` 覆寫）。若你有一批正式圖檔，可把**檔案路徑或公開 URL 清單**交給協助開發者寫入欄位即可，無須把圖 binary 存進 MySQL。

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
| `npm test` | 依序執行 BFF、Web 的 **單元**測試（`vitest run`，不含 `*.integration.*`） |
| `npm run test:integration` | **整合**測試：BFF（真 DB，見下文）+ Web（MSW，不需啟 BFF） |
| `npm run check-env` | Windows：執行 `scripts/check-env.ps1` |

BFF 專用（`apps/bff`）：`db:migrate`（`migrate dev`）、`db:push`、`test:integration` 等見該目錄 `package.json`。

---

## 整合測試

### Web（MSW）

- **不需** Docker 或本機 BFF；`npm run test:integration -w @jkopay/web` 會用獨立 `vitest.integration.config.ts` 啟 MSW、渲染 `App`／`DonationListScreen`。
- 詳見 [ARCHITECTURE.md](./ARCHITECTURE.md)「測試策略」Web 一節。

### BFF（MySQL + Prisma）

前置：**MySQL 可連線**（例如 `npm run db:up`）、已執行 **`npm run prisma:setup`**（或至少 `migrate deploy` + `seed`），`apps/bff/.env` 內 `DATABASE_URL` 正確。

```bash
npm run test:integration -w @jkopay/bff
```

此指令會設 **`RUN_INTEGRATION=1`** 並跑 `vitest.integration.config.ts`，測試會 **真的查詢資料庫**；與 seed 內容一致（例如關鍵字 `兒童福利`、groups 分類筆數、主題 `animal_protection`）。

若未設 `RUN_INTEGRATION=1` 而直接執行 `vitest --config vitest.integration.config.ts`，檔內 `describe.skipIf` 會 **略過** 所有 DB 案例（適合只驗證設定檔可載入）。

### 根目錄一次跑兩邊

```bash
npm run test:integration
```

順序：BFF → Web。若本機未開資料庫，BFF 整合會失敗；可只跑 Web：`npm run test:integration -w @jkopay/web`。

---

## 疑難排解（精簡）

- **契約改過但型別／執行怪**：先 `npm run build -w @jkopay/contracts` 或根目錄 `npm run build`。  
- **列表主題篩選無效**：確認已跑 migration 與 seed，且 Web 請求 URL 是否帶上 `theme=`；BFF 有重啟。  
- **MySQL 連不上**：確認容器健康、`DATABASE_URL` 主機埠與 docker 對外映射一致。  
- **整合測試部分 400、其餘 200**：多半是 query 不符合契約（例如 `limit` 上限為 **50**，超過會驗證失敗，與 DB 是否 setup 無關）。可看回應 body 是否為 `VALIDATION_ERROR`。

---

## 與架構文件的關係

- 模組邊界、API／前端分層、資料模型設計：見 [ARCHITECTURE.md](./ARCHITECTURE.md)。
