# 內部資料工具（C + D 已實作）

面試或 Demo 部署時，可透過**手動輸入網址**進入工具頁，並以**環境變數密鑰**操作 BFF，**清空**本應用 MySQL 內所有公益資料，或**清空後依團體數重種**（每團體 **1 筆團體列 + 2 捐款專案 + 5 義賣商品**，關聯與專案 checkout 欄位齊全）。

---

## 啟用條件

1. **BFF** 設定環境變數 **`DEV_DATA_TOOLS_SECRET`**（建議長隨機字串；未設定時**不註冊** API，避免被掃到）。
2. **Web** 不需額外開關；隱藏路由永遠存在，但沒有密鑰時呼叫 API 會得到「未啟用」錯誤。

---

## 隱藏入口（前端）

在瀏覽器網址列手動進入：

```text
https://你的網域/internal/data-tools
```

主流程與 Tab **沒有連結**至此頁。

---

## API（BFF）

- **方法／路徑**：`POST /api/v1/internal/data-tools`
- **Header**：`Content-Type: application/json`
- **Body**（契約見 `@jkopay/contracts` 的 `internalDataToolsRequestSchema`）：

```json
{
  "secret": "與 DEV_DATA_TOOLS_SECRET 相同",
  "mode": "wipe",
  "organizationCount": 30
}
```

- **`mode`**
  - `wipe`：僅清空（`donation_items` 全刪 → `charity_organizations` 全刪）。
  - `wipe_and_bulk_seed`：同上後再種資料；此時 **`organizationCount`** 有效（預設 30，上限 **5000**；過大會拉長寫入時間與佔用磁碟，請視本機／容器資源調整）。  
    每個團體會建立 **8 筆** `donation_items`（1 groups + 2 projects + 5 products）+ **1** 筆 `charity_organizations`。  
    例：`organizationCount: 30` → 30 團體、**240 筆**列表列（+ 30 主檔）。

密鑰比對使用 SHA-256 後 `timingSafeEqual`，不直接比對明文長度。

---

## 部署給面試官的建議流程

1. 在 BFF 執行環境設定 `DEV_DATA_TOOLS_SECRET`（與 Docker MySQL 同一套 compose／平台皆可）。
2. 確認 Web 的 **`VITE_API_BASE`** 指向該 BFF（與平常列表 API 相同）。
3. 口頭或文件提供：**網址** `/internal/data-tools` + **密鑰**（勿提交到 Git）。

---

## 安全提醒

- 此工具會**刪除整庫業務資料**（目前 schema 範圍內之公益團體與捐款項目）；**勿在正式環境**啟用 `DEV_DATA_TOOLS_SECRET`。
- 若 BFF 對外暴露，密鑰務必夠強；未設定密鑰時路由不存在（404），降低被試探的機率。

---

## 本機快速驗證

```bash
# .env 已設 DEV_DATA_TOOLS_SECRET=your-secret 後
curl -s -X POST http://127.0.0.1:4000/api/v1/internal/data-tools \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"your-secret\",\"mode\":\"wipe_and_bulk_seed\",\"organizationCount\":5}"
```

---

## 相關程式位置

| 項目 | 路徑 |
|------|------|
| 契約 | `packages/contracts/src/internal-data-tools.ts` |
| 清空／大量種子 | `apps/bff/src/dev-seed/bulk-charity-seed.ts` |
| BFF 處理 | `apps/bff/src/modules/dev-data-tools/dev-data-tools.service.ts` |
| 路由註冊 | `apps/bff/src/routes/dev-data-tools.routes.ts` |
| 隱藏頁 | `apps/web/src/components/DevDataToolsScreen.tsx`（路由 `/internal/data-tools`） |
