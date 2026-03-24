import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '../App.js';

describe('DonationListScreen — MSW integration', () => {
  it('掛載 App 後向 BFF 拉列表並渲染標題', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'MSW 預設列表第一筆' })).toBeInTheDocument();
    });
  });

  it('主題篩選：選「動物保護」後重新請求並顯示動保專用標題', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'MSW 預設列表第一筆' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '選擇類別' }));
    await user.click(screen.getByRole('button', { name: '動物保護' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'MSW 動保篩選命中' })).toBeInTheDocument();
    });
  });
});
