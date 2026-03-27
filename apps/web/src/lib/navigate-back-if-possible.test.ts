import { describe, expect, it, vi } from 'vitest';
import { canPopInAppHistory, tryNavigateBack } from './navigate-back-if-possible.js';

describe('canPopInAppHistory', () => {
  it('idx > 0 時為 true', () => {
    vi.stubGlobal('window', {
      history: { state: { idx: 1 } },
    });
    expect(canPopInAppHistory()).toBe(true);
    vi.unstubAllGlobals();
  });

  it('idx === 0 或缺省時為 false', () => {
    vi.stubGlobal('window', {
      history: { state: { idx: 0 } },
    });
    expect(canPopInAppHistory()).toBe(false);

    vi.stubGlobal('window', {
      history: { state: {} },
    });
    expect(canPopInAppHistory()).toBe(false);

    vi.unstubAllGlobals();
  });
});

describe('tryNavigateBack', () => {
  it('可返回時呼叫 navigate(-1)', () => {
    vi.stubGlobal('window', {
      history: { state: { idx: 2 } },
    });
    const navigate = vi.fn();
    tryNavigateBack(navigate);
    expect(navigate).toHaveBeenCalledWith(-1);
    vi.unstubAllGlobals();
  });

  it('不可返回時不呼叫 navigate', () => {
    vi.stubGlobal('window', {
      history: { state: { idx: 0 } },
    });
    const navigate = vi.fn();
    tryNavigateBack(navigate);
    expect(navigate).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
