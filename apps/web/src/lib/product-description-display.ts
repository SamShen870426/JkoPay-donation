/**
 * 後端 `descriptionZh` 常以 `-------\\n` 開頭；UI 已在「商品說明」內手動畫虛線時應先去掉，避免標題與內文之間留白。
 */
export function stripLeadingDashSeparator(text: string): string {
  return text.replace(/^(?:\s*-{3,}\s*\r?\n)+/, '').trimStart();
}
