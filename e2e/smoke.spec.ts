import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
});

test.describe('家书鸽 烟测', () => {
  test('应用启动后跳到 onboarding（真 onboarding 模式）', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/#\/onboarding$/);
    await expect(page).toHaveTitle(/家书鸽/);
    await expect(page.getByText('慢慢通信')).toBeVisible();
  });

  test('完成 onboarding 后进入 yard', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder(/小明|奶奶/);
    await input.click();
    await input.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, 'E2E User');
    // 触发 blur 让 v-model 提交
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: '开始使用' }).click();
    await expect(page).toHaveURL(/#\/yard$/);
  });

  test('manifest 存在且含 name/short_name/icons', async ({ request }) => {
    const r = await request.get('/manifest.webmanifest');
    expect(r.status()).toBe(200);
    const m = await r.json();
    expect(m.name).toContain('家书鸽');
    expect(m.short_name).toBeTruthy();
    expect(Array.isArray(m.icons)).toBe(true);
    expect(m.icons.length).toBeGreaterThanOrEqual(2);
  });

  test('icon 文件可访问', async ({ request }) => {
    for (const p of ['/icon-192.png', '/icon-512.png', '/icon-512-maskable.png', '/favicon.svg']) {
      const r = await request.get(p);
      expect(r.status(), p).toBe(200);
    }
  });

  test('完成 onboarding 后再访问未知路由命中 404', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder(/小明|奶奶/);
    await input.click();
    await input.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, 'E2E User');
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: '开始使用' }).click();
    await expect(page).toHaveURL(/#\/yard$/);
    await page.evaluate(() => { location.hash = '#/no-such-page'; });
    await page.waitForTimeout(300);
    await expect(page.getByText('迷路了')).toBeVisible();
  });
});

