import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const API_ORIGIN = 'http://bff.test';

/** 整合測試用：依 query 回傳不同標題，驗證畫面與請求參數 */
export const defaultDonationListHandlers = [
  http.get(`${API_ORIGIN}/api/v1/donation-items`, ({ request }) => {
    const u = new URL(request.url);
    const theme = u.searchParams.get('theme');
    const title =
      theme === 'animal_protection' ? 'MSW 動保篩選命中' : 'MSW 預設列表第一筆';
    return HttpResponse.json({
      items: [
        {
          id: 'integration-1',
          category: 'groups',
          title,
          description: '整合測試用摘要',
          imageUrl: 'https://example.com/logo.png',
        },
      ],
      pageInfo: { nextCursor: null, hasMore: false },
    });
  }),
];

export const mswServer = setupServer(...defaultDonationListHandlers);
