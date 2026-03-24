# Charity Donation — 架構說明

本機環境、Docker、Prisma、環境變數與 npm 指令：見 [SETUP.md](./SETUP.md)。

## Monorepo 邊界

| 套件 | 職責 |
|------|------|
| `packages/contracts` | Zod 契約與 `z.infer` 型別：列表 query／成功回應、`apiErrorBodySchema` |
| `apps/bff` | Fastify BFF、Prisma、分層：Controller → Service → Repository |
| `apps/web` | Vite + React：API client、hooks、畫面元件、CVA UI primitives |

BFF 與 Web 皆依賴 `@jkopay/contracts`；契約變更後需先建置 contracts（步驟見 SETUP）。

---

## 資料庫設計與「關聯」

目前 **沒有多表外鍵關聯**，採 **單一實體表** + **列舉欄位** 表達分類與主題。

### 實體

| Prisma model | 對應資料表 | 說明 |
|--------------|------------|------|
| `DonationItem` | `donation_items` | 一筆可於列表顯示的捐贈相關項目（團體／專案／商品等 demo 資料） |

### 欄位概念

- **`category`**：`DonationCategory` enum（`groups` | `projects` | `products`），對應前端 Tab。
- **`theme`**：`CharityTheme` enum（如 `animal_protection`、`elderly_care` 等），對應公益主題篩選；與 `contracts` 的 `CHARITY_THEME_VALUES` 對齊。
- **`titleZh` / `summaryZh` / `logoKey`**：列表顯示用中文標題、摘要、圖片路徑或 key。
- **`id`**：整數主鍵，亦作 keyset 分頁游標來源。

### 索引（查詢路徑）

- `(category, id)`：依分類 + id 遞增排序、無主題篩選時的分頁。
- `(category, theme, id)`：同上，但帶 `theme` 篩選時較有利。

### 若未來要「真正的關聯」

可再拆出 `Charity`、`Project`、`Product` 等表，以 `DonationItem` 指向對應 FK；目前 Phase 刻意維持扁平 schema 以降低複雜度。

---

## BFF — API 分層

```
HTTP
  → routes/donation.routes.ts     （註冊 GET /api/v1/donation-items）
  → modules/donation/donation.controller.ts
        · donationListQuerySchema.safeParse(request.query)
        · 呼叫 service.list，回應再以 donationListResponseSchema 驗證
  → modules/donation/donation.service.ts
        · 業務流程、游標解析、分頁裁剪（lib/pagination）
  → modules/donation/donation.repository.ts
        · Prisma `where`（category、可選 theme、關鍵字 OR、id > cursor）
  → MySQL（Prisma Client）

回傳給 HTTP 的 JSON：**不直接回 Prisma model**，經 donation.transformer 轉成契約中的 `DonationListItem`。
```

### 橫切關注點

- **DI**：`di/dependencies.ts` 的 `buildDependencies(overrides?)` 組裝 `PrismaClient`、`DonationRepository`、`DonationService`；測試可注入 mock。
- **錯誤**：`errors/app-error.ts` + `plugins/error-handler.ts`（全域 `setErrorHandler`）→ 與 contracts 一致的 `{ error, message, details? }`。

### 公開 API 摘要

| 方法 | 路徑 | Query（契約：`donationListQuerySchema`） |
|------|------|------------------------------------------|
| GET | `/api/v1/donation-items` | `category`（必填）、`q`、`cursor`、`limit`、`theme`（可選，slug） |

無獨立的「只給 filter」路由；主題篩選為同一 endpoint 的可選 query。

---

## Web — 前端分層

```
畫面與互動
  components/     DonationListScreen、TabBar、SearchBar、CharityThemeFilterSheet、列表卡片與骨架等
  hooks/            useDonationList（列表 + 無限滾動 + theme）、useDebouncedValue
  constants/        tabs、charity-themes、theme（設計 token）

對外 I/O
  api/donationClient.ts      buildDonationItemsListUrl、fetchDonationPage（Zod parse 成功回應）
  api/donation-api-error.ts  對應 BFF 錯誤 body

可重用 UI
  ui/               button、card、skeleton、search-field（CVA + Tailwind）

工具
  lib/cn.ts         className 合併
```

資料流：**Screen** 組合 state（分類、搜尋、主題）→ **useDonationList** → **fetchDonationPage**（`VITE_API_BASE` + `/api/v1/donation-items`）→ 成功則以契約驗證 JSON。

---

## 測試策略（單元／整合）

設計原則：**單元測試**隔離 I/O（mock Prisma、`fetch`、Service）；**整合測試**驗證「多層組合」——BFF 為 **HTTP → Prisma → MySQL**，Web 為 **畫面 → hooks → 真實 fetch 由 MSW 攔截**（不依賴本機是否啟 BFF）。

### 指令（根目錄）

| 指令 | 說明 |
|------|------|
| `npm test` | 僅 **單元**：BFF + Web 一般 `vitest.config`（排除 `*.integration.*`）。 |
| `npm run test:integration` | **整合**：先跑 BFF `vitest.integration.config.ts`，再跑 Web 整合設定。 |

本機與 CI 前置條件見 [SETUP.md](./SETUP.md)「整合測試」一節。

---

### BFF（`apps/bff`）

#### 設定檔

| 檔案 | 用途 |
|------|------|
| `vitest.config.ts` | 單元：`environment: node`，`exclude` `**/*.integration.test.ts`。 |
| `vitest.integration.config.ts` | 整合：`include` 僅 `**/*.integration.test.ts`、`setupFiles` 載入 `src/test/integration-setup.ts`（`dotenv` → `apps/bff/.env`）、關閉檔案並行、拉長 timeout。 |

#### 單元測試（檔案與焦點）

| 檔案 | 焦點 |
|------|------|
| `src/lib/pagination.test.ts` | keyset 多取一筆、`nextCursor`。 |
| `src/modules/donation/donation.service.test.ts` | mock `DonationRepository`：參數傳遞、分頁、`PrismaClientKnownRequestError` → `AppError`。 |
| `src/modules/donation/donation.repository.test.ts` | mock `donationItem.findMany`：`where`（theme、OR 搜尋、游標）。 |
| `src/modules/donation/donation.transformer.test.ts` | DTO、`ASSET_CDN_BASE`／`logoKey` 分支。 |
| `src/modules/donation/donation.routes.test.ts` | mock `DonationService` + `app.inject`：驗證錯誤、成功 body、回應 Zod 不符 → 500。 |
| `src/contracts/donation-list-query.test.ts` | 共用契約 `donationListQuerySchema`（coerce、`theme` 邊界）。 |

#### 整合測試（真實 DB）

| 檔案 | 焦點 |
|------|------|
| `src/modules/donation/donation-api.integration.test.ts` | `RUN_INTEGRATION=1` 時執行；`buildDependencies` 真實 `PrismaClient` + `createApp` + `inject`。以 Prisma `count` 對照 API 筆數、`theme` 篩選、關鍵字搜尋命中 seed、keyset 第二頁 id 不重疊、缺 `category` 仍 400。 |

未設 `RUN_INTEGRATION=1` 時，此檔整組 **`describe.skipIf`**，僅跑整合設定會顯示 skipped（方便 CI 分 job）。

---

### Web（`apps/web`）

#### 設定檔

| 檔案 | 用途 |
|------|------|
| `vitest.config.ts` | 單元：jsdom、`define` 固定 `VITE_API_BASE`，`exclude` `**/*.integration.test.*`。 |
| `vitest.integration.config.ts` | 整合：僅 `**/*.integration.test.*`、`setupFiles`：`integration-msw-setup.ts`（`jest-dom`、`IntersectionObserver` stub、**MSW `listen`／`resetHandlers`／`close`**、`@testing-library/react` **`cleanup`**）。 |

#### 單元測試

| 檔案 | 焦點 |
|------|------|
| `src/api/donationClient.test.ts` | `buildDonationItemsListUrl`、`fetch` mock、非 JSON。 |
| `src/api/donation-api-error.test.ts` | 契約錯誤 body vs `HTTP_ERROR`。 |
| `src/hooks/useDebouncedValue.test.tsx` | 假時間 debounce。 |
| `src/hooks/useDonationList.test.tsx` | mock `fetch`：第一頁帶 `theme`、錯誤狀態。 |

#### 整合測試（MSW + 畫面）

| 檔案 | 焦點 |
|------|------|
| `src/test/msw-server.ts` | `setupServer`；`GET …/donation-items` 依 `theme` query 回不同標題（驗證前端帶參與重查）。 |
| `src/components/DonationListScreen.integration.test.tsx` | `render(<App />)`：`user-event` 開啟主題 sheet、選「動物保護」，斷言卡片標題變更。 |

---

### Contracts（`@jkopay/contracts`）

- 列表 query 等 schema 的單元測試放在 **BFF** `src/contracts/`，與已建置的 `@jkopay/contracts` 一致，避免在 contracts 套件再掛 Vitest。

### 後續可擴充（未實作）

- **E2E**：Playwright／Cypress 對 `vite preview` + 真實 BFF 或完整 docker-compose。
- **BFF 整合與 CI**：獨立 job 啟 MySQL service、`prisma migrate deploy` + `db seed` 後執行 `npm run test:integration -w @jkopay/bff`。

---

## WebView 與外觀

- `html.webview-native-chrome`：隱藏模擬狀態列（見 `apps/web/src/index.css`）。
