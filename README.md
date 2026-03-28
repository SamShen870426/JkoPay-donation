# 公益捐款項目 — 前端作業（Charity Donation）

本專案為 **全端 TypeScript monorepo**：以 **React + Vite** 實作近似街口 App「公益捐款項目」體驗的 **列表、搜尋、無限滾動**，並以 **Fastify + Prisma + MySQL** 提供實際 API 與資料庫（非純 Mock JSON）。適合作為面試作品展示 **現代 Web 技術棧、API 設計、ORM 與基礎測試**。

---

## Demo 與原始碼

| 項目 | 連結 |
|------|------|
| **線上 Demo** | https://jko-pay-donation-web.vercel.app/ |

> 部署說明可參考團隊內部文件 `docs/SETUP.md`；前端與 BFF／資料庫分拆部署時，請在 Vercel 設定 `VITE_API_BASE` 指向 BFF 的公開 origin。

---

## 作業需求對照（題目摘要）

以下對應徵件中 **開發限制** 與 **功能需求**：

| 題目要求 | 本專案作法 |
|----------|------------|
| 前端 React / Next.js | **React 19**（**Vite 6** 建置，非 Next.js） |
| 後端 Node.js（Express 或 **Fastify**） | **Fastify 5**（`apps/bff`） |
| **TypeScript** 全端 | `contracts`、`bff`、`web` 皆為 TS |
| 捐款項目 **列表版型** | Tab 區分公益團體／捐款專案／義賣商品，卡片佈局與紅色主視覺 |
| **無限滾動** | 游標分頁（cursor）+ Intersection Observer 載入下一頁 |
| **關鍵字搜尋** | 搜尋列 + debounce 後打 API；支援依 **CharityTheme** 篩選 |
| 後端 **API 規格** + 列表／分頁 | 共用 **`@jkopay/contracts`（Zod）** 定義 request/response，BFF 實作並與前端 parse 對齊 |
| Mock 資料可接受 | 以 **Prisma seed** 寫入 MySQL，利於展示真實查詢與關聯 |

**加分項對照：** Tailwind CSS 4、**Prisma**、**Vitest** 單元測試（BFF + Web）、**MySQL** 與 migration／seed、額外頁面（詳情、捐款設定 sheet、內部資料工具等，見下文）。

---

## 給審閱者的重點（TL;DR）

| 面向 | 說明 |
|------|------|
| **架構** | Monorepo；**React + Vite** 與 **Fastify** 分層；對外契約集中於 **`@jkopay/contracts`（Zod）**，request／response 與 BFF、前端 parse 對齊 |
| **資料** | **Prisma + MySQL**；migration 記錄 schema 演進；**seed** 建立示範資料與關聯，列表搜尋／分頁／主題篩選皆為實際查詢 |
| **列表與互動** | Cursor 分頁 + **Intersection Observer** 無限滾動；關鍵字搜尋 **debounce** 後請求 API |
| **體驗** | 載入／空狀態；主欄 **RWD**（`min(100%, 480px)` 置中）；詳情與列表以 **sessionStorage** 延續分類與 **CharityTheme** 篩選，並配合瀏覽器返回堆疊 |
| **品質** | **Vitest** 單元測試（BFF + Web）；部署與環境變數見 **`docs/SETUP.md`** |

> 若時間有限：可先跑 **`npm run dev`** 走列表／搜尋／詳情流程，再對照上表與上文「作業需求對照」。

---


## 技術架構

```
charity-donation/
├── apps/web/          # React + Vite + Tailwind（捐款列表與各詳情頁）
├── apps/bff/          # Fastify + Prisma（MySQL）
├── packages/contracts/# 共用 Zod schema / TypeScript 型別
└── docs/              # SETUP、內部工具說明等
```

- **前端** 透過 `VITE_API_BASE` 呼叫 BFF（開發時可用 Vite proxy `/api`）。
- **BFF** 主要路由前綴：`/api/v1/donation-items`、`/api/v1/charity-organizations/...` 等。

---

## 本機快速啟動

需 **Node.js ≥ 20**、**Docker**（MySQL）。詳見 **`docs/SETUP.md`**。

```bash
# 安裝依賴（於 repo 根目錄）
npm install

# 啟動 MySQL
npm run db:up

# Prisma generate + migrate + seed
npm run prisma:setup

# 同時啟動 contracts watch、BFF、Vite
npm run dev
```

- 前端預設：<http://localhost:5173>  
- BFF 預設：<http://127.0.0.1:4000>  

若 web 未設 `VITE_API_BASE`，請確認 dev 時 proxy 或同源策略與 BFF 一致（見 `apps/web/vite.config.ts`）。

---

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發模式（contracts + bff + web） |
| `npm run build` | 建置 contracts → bff → web |
| `npm test` | BFF + Web **單元測試**（Vitest） |
| `npm run test:integration` | 整合測試（需額外環境，見各 app 說明） |
| `npm run prisma:seed` | 重跑種子資料 |

---

## 功能亮點（超出基礎列表者，可於面試口述）

- 捐款 **專案詳情**、**義賣商品詳情**、**公益團體個人頁**（含關聯列表分頁）。
- **CharityTheme** 多對多、篩選 bottom sheet；詳情頁主題標籤可導回列表並帶入篩選。
- 捐款專案 **捐款設定** bottom sheet（類型／扣款日／金額，與後端 checkout 設定對齊）。
- 圖片 **缺圖 fallback**（BFF 預設路徑 + 前端 `onError`）。
- 選用 **`DEV_DATA_TOOLS_SECRET`** 時可啟用 **內部資料工具**（清空／大量種子）：`docs/DEV_DATA_TOOLS.md`、路由 `/internal/data-tools`（不放在主導覽）。

---

## 聲明

本專案為 **作業／作品集用途**，資料與文案多為示範，不代表真實勸募或商業行為。部署至公開環境時，請勿長期開啟具資料破壞風險的 dev 工具或弱密鑰。

---

若 Demo 網址或架構後續有更新，可直接改寫本 README 表格與小節，或補上 `ARCHITECTURE.md` 連結。
