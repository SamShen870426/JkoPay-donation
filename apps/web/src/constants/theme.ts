/** Figma theme / bg-primary */
export const THEME_PRIMARY = '#C9191D';
export const THEME_PAGE_BG = '#F4F4F6';
export const THEME_CARD_BG = '#FFFFFF';
/** 篩選列「全部」chip 底色 — palette/gray/100 */
export const FILTER_CHIP_BG = '#EDEDF1';
/**
 * 點 magnifier 後展開的白底區塊（搜尋列 + Tab，由上往下入場）。
 * 多數稿：外層白底；搜尋列與 Tab 垂直 gap 6；面板頂部內距 Layout 常為 15（與 box 圖 8 並存時以 Layout 15 為準）。
 */
export const SEARCH_EXPANDED_PANEL_PADDING_TOP_PX = 15;
export const SEARCH_EXPANDED_PANEL_PADDING_X_PX = 15;
export const SEARCH_EXPANDED_PANEL_STACK_GAP_PX = 6;
/**
 * 展開態 Search field（Figma）：高 40、radius 20、palette/black/5、padding 9/12、圖示與輸入 gap 9；
 * 字 14/22、caret 與連結色見 SEARCH_FIELD_CARET_AND_LINK；search bar 列 345×40 ≈ Fill field + 44 cancel。
 */
export const SEARCH_FIELD_HEIGHT_PX = 40;
export const SEARCH_FIELD_RADIUS_PX = 20;
export const SEARCH_FIELD_PADDING_Y_PX = 9;
export const SEARCH_FIELD_PADDING_X_PX = 12;
export const SEARCH_FIELD_INNER_GAP_PX = 9;
export const SEARCH_FIELD_ICON_PX = 18;
export const SEARCH_FIELD_CANCEL_MIN_WIDTH_PX = 44;
export const SEARCH_FIELD_CANCEL_MIN_HEIGHT_PX = 36;
export const SEARCH_FIELD_PLACEHOLDER = '#B2B2B2';
/** 游標與「取消」等連結色 — iOS 系統藍 #2e7dd9 */
export const SEARCH_FIELD_CARET_AND_LINK = '#2E7DD9';

/** 畫面寬：左右各 15px gutter + 345 內容 ≈ 375（對齊 Figma frame） */
export const LAYOUT_FRAME_WIDTH_PX = 375;
/** 卡片列表與篩選列的水平 inset */
export const CARD_LIST_MARGIN_X_PX = 15;
export const LAYOUT_MIN_HEIGHT_PX = 960;

/** Figma iPhone X：紅色頂區 = 狀態列 44 + 導航列 44 = 88；Tab 列高 44（列表自 Top 88 起算） */
export const LAYOUT_STATUS_BAR_PX = 44;
export const LAYOUT_NAV_BAR_PX = 44;
export const LAYOUT_HEADER_RED_TOTAL_PX = LAYOUT_STATUS_BAR_PX + LAYOUT_NAV_BAR_PX;
export const LAYOUT_TAB_BAR_PX = 44;

/**
 * Figma：List 容器距螢幕頂 — 收合篩選列時 190；展開搜尋後 208。
 * 收合：190 − 88 − 44 = 58 → 篩選列高度。
 */
export const LAYOUT_LIST_TOP_FROM_FRAME_PX = 190;
export const LAYOUT_LIST_TOP_EXPANDED_SEARCH_PX = 208;
export const LAYOUT_FILTER_ROW_PX =
  LAYOUT_LIST_TOP_FROM_FRAME_PX - LAYOUT_HEADER_RED_TOTAL_PX - LAYOUT_TAB_BAR_PX;

/**
 * 展開態：紅頭下緣到灰底列表頂 = 208 − 88；扣掉搜尋區 + Tab 內容高度後，其餘用 margin（非 padding）留白，
 * 縫隙透出底下 THEME_PAGE_BG，與列表區同色。
 */
const SEARCH_EXPANDED_CHROME_CONTENT_PX =
  SEARCH_EXPANDED_PANEL_PADDING_TOP_PX +
  SEARCH_FIELD_HEIGHT_PX +
  SEARCH_EXPANDED_PANEL_STACK_GAP_PX +
  LAYOUT_TAB_BAR_PX;
export const SEARCH_EXPANDED_PANEL_MARGIN_BOTTOM_PX = Math.max(
  0,
  LAYOUT_LIST_TOP_EXPANDED_SEARCH_PX -
    LAYOUT_HEADER_RED_TOTAL_PX -
    SEARCH_EXPANDED_CHROME_CONTENT_PX,
);

/**
 * 列表容器頂部內距。若與稿不符可維持 0；卡片與篩選列節奏主要由 gap-3（12px）與 List Top=190 對齊。
 */
export const LAYOUT_LIST_INNER_PADDING_TOP_PX = 0;

/** 搜尋無結果區（查無相關資料）：寬 319、內距 16/8、圖 144、圖與文案 gap 18、標題與副標 gap 6 */
export const EMPTY_SEARCH_BLOCK_WIDTH_PX = 319;
export const EMPTY_SEARCH_PADDING_Y_PX = 16;
export const EMPTY_SEARCH_PADDING_X_PX = 8;
export const EMPTY_SEARCH_ICON_PX = 144;
export const EMPTY_SEARCH_ICON_TEXT_GAP_PX = 18;
export const EMPTY_SEARCH_TITLE_SUBTITLE_GAP_PX = 6;
