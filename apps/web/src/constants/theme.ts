/** Figma theme / bg-primary */
export const THEME_PRIMARY = '#C9191D';
export const THEME_PAGE_BG = '#F4F4F6';
export const THEME_CARD_BG = '#FFFFFF';
/** Filter?Œå…¨?¨ã€â€?palette/gray/100 */
export const FILTER_CHIP_BG = '#EDEDF1';
/**
 * é»žæ? magnifier å¾Œå??‹ç??Œç™½åº•å?å¡Šã€ï??«æ?å°‹å? + Tabï¼Œç”±ä¸Šå?ä¸‹é•·?ºï???
 * å¤šæ•¸ç¨¿ï?å¤–å±¤?½å?ï¼›æ?å°‹å???Tab ?‚ç›´ gap 6ï¼›é¢?¿é??¨å…§è·?Layout è¡¨å¸¸??15ï¼ˆè? box ??8 ä¸¦å??‚ä»¥ Layout 15 ?ºæ?ï¼‰ã€?
 */
export const SEARCH_EXPANDED_PANEL_PADDING_TOP_PX = 15;
export const SEARCH_EXPANDED_PANEL_PADDING_X_PX = 15;
export const SEARCH_EXPANDED_PANEL_STACK_GAP_PX = 6;
/**
 * å±•é? Search fieldï¼ˆFigmaï¼‰ï?Hug 40?radius 20?palette/black/5?padding 9/12?icon?”å? gap 9ï¼?
 * å­?14/22?caret #007AFF?‚å?å±?search bar ??345?40 = Fill field + 44 cancel??
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
/** iOS ç³»çµ±?ï?æ¸¸æ??‡ã€Œå?æ¶ˆã€?*/
export const SEARCH_FIELD_CARET_AND_LINK = '#007AFF';

/** å¤–æ?å¯¬ï?å·¦å³??15px margin + 345 ?§å®¹ ??375ï¼ˆè? Figma å°é?ï¼?*/
export const LAYOUT_FRAME_WIDTH_PX = 375;
/** ?¡å?è¡¨è?ç¯©é¸?—æ°´å¹?inset */
export const CARD_LIST_MARGIN_X_PX = 15;
export const LAYOUT_MIN_HEIGHT_PX = 960;

/** Figma iPhone Xï¼šç??²é??€ = ?€?‹å? 44 + å°Žèˆª??44 = 88ï¼›Tab ?—é? 44ï¼ˆTop 88 èµ·ç?ï¼?*/
export const LAYOUT_STATUS_BAR_PX = 44;
export const LAYOUT_NAV_BAR_PX = 44;
export const LAYOUT_HEADER_RED_TOTAL_PX = LAYOUT_STATUS_BAR_PX + LAYOUT_NAV_BAR_PX;
export const LAYOUT_TAB_BAR_PX = 44;

/**
 * Figmaï¼šList å®¹å™¨è·èž¢å¹•é? ???¶å?ç¯©é¸?—æ? **190**ï¼›é? magnifier å±•é??œå?å¾?**208**??
 * ?¶å?ï¼?90 ??88 ??44 = 58 ??ç¯©é¸?—é???
 */
export const LAYOUT_LIST_TOP_FROM_FRAME_PX = 190;
export const LAYOUT_LIST_TOP_EXPANDED_SEARCH_PX = 208;
export const LAYOUT_FILTER_ROW_PX =
  LAYOUT_LIST_TOP_FROM_FRAME_PX - LAYOUT_HEADER_RED_TOTAL_PX - LAYOUT_TAB_BAR_PX;

/**
 * å±•é??‹ï?ç´…é ­ä¸‹ç·£?°ç°åº•å?è¡¨é? = 208 ??88ï¼›æ‰£?‰æ?å°‹å?+Tab ?§å®¹å¾Œï???**margin**ï¼ˆé? paddingï¼‰ç??½ï?
 * ç¸«é??æ??å‡ºåº•ä? `THEME_PAGE_BG`ï¼Œè??—è¡¨?€?Œè‰²??
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
 * ?—è¡¨å®¹å™¨?‚éƒ¨?§è??‚å??æ›¾ä¾æ???Figma?ŒList ??box?ç¤º?è¨­ 8pxï¼Œè‹¥?‡ä??®å?ç¨¿ä?ç¬¦è?ç¶­æ? 0ï¼?
 * ?¡ç??‡ç¯©?¸å?ä¹‹é??„å??´ç?å¥ä¸»è¦ç”± `gap-3`ï¼?2pxï¼‰è? List Top=190 å°é???
 */
export const LAYOUT_LIST_INNER_PADDING_TOP_PX = 0;

/** ?œå??¡ç??œï??¥ç„¡?¸é?è³‡æ?ï¼‰â€?Figmaï¼šå?å¡Šå¯¬ 319?å…§è·?16/8?å? 144?å??‡æ?æ¡?gap 18?æ?é¡Œè??¯æ? gap 6 */
export const EMPTY_SEARCH_BLOCK_WIDTH_PX = 319;
export const EMPTY_SEARCH_PADDING_Y_PX = 16;
export const EMPTY_SEARCH_PADDING_X_PX = 8;
export const EMPTY_SEARCH_ICON_PX = 144;
export const EMPTY_SEARCH_ICON_TEXT_GAP_PX = 18;
export const EMPTY_SEARCH_TITLE_SUBTITLE_GAP_PX = 6;
