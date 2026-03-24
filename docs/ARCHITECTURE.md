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
  api/donationClient.ts      buildUrl、fetchDonationPage（Zod parse 成功回應）
  api/donation-api-error.ts  對應 BFF 錯誤 body

可重用 UI
  ui/               button、card、skeleton、search-field（CVA + Tailwind）

工具
  lib/cn.ts         className 合併
```

資料流：**Screen** 組合 state（分類、搜尋、主題）→ **useDonationList** → **fetchDonationPage**（`VITE_API_BASE` + `/api/v1/donation-items`）→ 成功則以契約驗證 JSON。

---

## 單元測試與整合測試 — 適性與現況

### 整體評估

分層清楚、**純函式與可注入依賴** 已具備，**適合**補齊單元測試；整合測試需額外接上 **Fastify inject** 或真實 HTTP，以及 **測試用 DB**（或 Docker 中的 MySQL）。

### BFF（`@jkopay/bff`）

| 類型 | 適性 | 現況與建議 |
|------|------|------------|
| 單元 | 高 | 已有 `src/lib/pagination.test.ts`（Vitest）。可擴充：`DonationService` 注入 mock `DonationRepository`；Repository 可對 `PrismaClient` 做 mock／test double；契約 Zod 可對邊界值做 parse 測試。 |
| 整合 | 中高 | `createApp` + `buildDependencies({ donationService: mock })` 用 `app.inject({ url: '...' })` 可測路由與錯誤格式而不碰 DB。若要測 Prisma，建議獨立 `DATABASE_URL`、migrate + seed 或 transaction rollback 策略；本機 DB 啟動見 SETUP。 |

根目錄 `npm test` 目前僅轉發到 BFF 的 `vitest run`。

### Web（`@jkopay/web`）

| 類型 | 適性 | 現況與建議 |
|------|------|------------|
| 單元 | 中高 | 尚未在 `package.json` 掛測試指令；`fetchDonationPage` 可 mock `fetch`；`useDonationList` 可用 Vitest + `@testing-library/react` + 假 timer 測 debounce／abort。 |
| 整合／E2E | 中 | 可選 MSW 模擬 API，或 Playwright／Cypress 對 dev server 做端對端；需設定 `VITE_API_BASE` 指向 mock 或測試 BFF。 |

### Contracts（`@jkopay/contracts`）

- Zod schema 與型別推導適合 **小範圍單元測試**（合法／非法 query、錯誤 body 形狀），可選擇在 contracts 或 BFF 內一併測試以避免重複建置負擔。

---

## WebView 與外觀

- `html.webview-native-chrome`：隱藏模擬狀態列（見 `apps/web/src/index.css`）。
