import { test, expect } from '@playwright/test';

const url = 'http://localhost:4173/api/copilot';

test('copilot endpoint returns stub', async ({ request }) => {
  const res = await request.post(url, { data: { prompt: 'hi' } });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.en).toContain('hi');
  expect(json.es).toContain('hi');
});
