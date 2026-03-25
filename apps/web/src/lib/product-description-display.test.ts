import { describe, expect, it } from 'vitest';
import { stripLeadingDashSeparator } from './product-description-display.js';

describe('stripLeadingDashSeparator', () => {
  it('去掉開頭 ------- 與換行', () => {
    expect(stripLeadingDashSeparator('-------\n內文')).toBe('內文');
  });

  it('可處理多行虛線前綴', () => {
    expect(stripLeadingDashSeparator('---\n-------\n\n段落')).toBe('段落');
  });
});
