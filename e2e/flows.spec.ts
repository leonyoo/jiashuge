import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      if (localStorage.getItem('__e2e_keep__') !== '1') {
        localStorage.clear();
      }
    } catch {}
  });
});

async function completeOnboarding(page: Page, name = 'E2E User') {
  await page.goto('/');
  await page.getByTestId('onboarding-name').fill(name);
  await page.getByTestId('onboarding-start').click();
  await expect(page).toHaveURL(/#\/yard$/);
}

test.describe('家书鸽 主要流程', () => {
  test('Yard 完成后显示空鸽舍并提供入口', async ({ page }) => {
    await completeOnboarding(page);
    await expect(page.getByText('家书鸽舍', { exact: true })).toBeVisible();
    await expect(page.getByText(/还没有信鸽/)).toBeVisible();
    await expect(page.getByRole('link', { name: /去学习/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /写信/ }).first()).toBeVisible();
  });

  test('底部 Tab 可以在主页之间切换', async ({ page }) => {
    await completeOnboarding(page);
    await page.getByTestId('tab-learn').click();
    await expect(page).toHaveURL(/#\/learn$/);
    await expect(page.getByText('学习塔', { exact: true })).toBeVisible();

    await page.getByTestId('tab-mailbox').click();
    await expect(page).toHaveURL(/#\/mailbox$/);

    await page.getByTestId('tab-me').click();
    await expect(page).toHaveURL(/#\/me$/);

    await page.getByTestId('tab-yard').click();
    await expect(page).toHaveURL(/#\/yard$/);
  });

  test('Learn 视图显示三种学习模块', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/#/learn');
    await expect(page.getByText('学习塔', { exact: true })).toBeVisible();
    await expect(page.getByText('成语', { exact: true })).toBeVisible();
    await expect(page.getByText('单词', { exact: true })).toBeVisible();
    await expect(page.getByText('谜语', { exact: true })).toBeVisible();
  });

  test('Compose 在没有好友时显示提示', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/#/compose');
    await expect(page.getByText(/还没有好友/)).toBeVisible();
  });

  test('Me 视图显示用户名与金币', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/#/me');
    await expect(page.getByText('E2E User').first()).toBeVisible();
    await expect(page.getByText('金币')).toBeVisible();
    await expect(page.getByText('连签')).toBeVisible();
  });

  test('Shop 可从 Me 进入', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/#/me');
    await page.getByRole('link', { name: /商店/ }).first().click();
    await expect(page).toHaveURL(/#\/shop$/);
  });

  test('写信：选择鸽子、寄出后进入飞行视图', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await completeOnboarding(page);
    await page.goto('/#/me');
    await page.getByTestId('me-reset').click();
    await page.waitForTimeout(300);

    // 把第一只鸽子的 luck 提到 100 避免暴风雨中丢信
    await page.evaluate(() => {
      const raw = localStorage.getItem('jiasuge:state');
      if (!raw) return;
      const state = JSON.parse(raw);
      const pigeon = Object.values(state.pigeons)[0];
      if (pigeon) {
        pigeon.stats.luck = 100;
        localStorage.setItem('jiasuge:state', JSON.stringify(state));
      }
    });
    await page.waitForTimeout(300);

    await page.goto('/#/compose');
    await page.getByTestId('compose-text').fill('你好，测试信一封');
    await page.getByTestId('compose-send').click();

    await expect(page).toHaveURL(/#\/flying\/.+/);
    await expect(page.getByTestId('flying-from')).toHaveText('北京');
    await expect(page.getByTestId('flying-to')).toHaveText('广州');
  });

  test('寄出后发件箱显示该信件', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await completeOnboarding(page);
    await page.goto('/#/me');
    await page.getByTestId('me-reset').click();
    await page.waitForTimeout(300);

    await page.goto('/#/compose');
    await page.getByTestId('compose-text').fill('outbox 验证专用');
    await page.getByTestId('compose-send').click();
    await expect(page).toHaveURL(/#\/flying\/.+/);

    await page.goto('/#/mailbox');
    await page.getByRole('button', { name: /发件箱/ }).click();
    await expect(page.getByText('outbox 验证专用')).toBeVisible();
    await expect(page.getByText(/飞行中|已送达|已读/)).toBeVisible();
  });

  test('Cognitive 可从 Me 进入', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/#/me');
    await page.getByRole('link', { name: /益智/ }).first().click();
    await expect(page).toHaveURL(/#\/cognitive$/);
  });

  test('Shop 购买食物后顶栏金币减少', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await completeOnboarding(page);
    await page.goto('/#/me');
    await page.getByTestId('me-reset').click();
    await page.waitForTimeout(300);

    await page.goto('/#/shop');
    const coinsBefore = await page.getByTestId('topbar-coins').textContent();
    const buyBtn = page.getByTestId('shop-buy-food-grain');
    await expect(buyBtn).toBeEnabled();
    await buyBtn.click();
    await page.waitForTimeout(200);
    const coinsAfter = await page.getByTestId('topbar-coins').textContent();
    expect(Number(coinsAfter)).toBeLessThan(Number(coinsBefore));
  });

  test('Learn 答题：成语简单答对金币增加', async ({ page }) => {
    await completeOnboarding(page);
    const coinsBefore = Number(await page.getByTestId('topbar-coins').textContent());
    await page.goto('/#/learn');
    await page.getByTestId('learn-start-idioms-easy').click();
    await expect(page.getByTestId('learn-option-0')).toBeVisible();
    await expect(page.getByTestId('learn-option-3')).toBeVisible();
    await page.getByTestId('learn-option-0').click();
    await expect(page.getByText(/答对了/)).toBeVisible();
    const coinsAfter = Number(await page.getByTestId('topbar-coins').textContent());
    expect(coinsAfter).toBe(coinsBefore + 5);
  });

  test('来信：写信给奶奶后奶奶能收到并进入阅读视图', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await completeOnboarding(page);
    await page.goto('/#/me');
    await page.getByTestId('me-reset').click();
    await page.waitForTimeout(300);

    // 把第一只鸽子的 luck 提到 100 避免暴风雨中丢信
    await page.evaluate(() => {
      const raw = localStorage.getItem('jiasuge:state');
      if (!raw) return;
      const state = JSON.parse(raw);
      const pigeon = Object.values(state.pigeons)[0];
      if (pigeon) { pigeon.stats.luck = 100; localStorage.setItem('jiasuge:state', JSON.stringify(state)); }
    });

    // 发信给奶奶（demo 好友，默认选中第一位）
    await page.goto('/#/compose');
    await page.getByTestId('compose-text').fill('来信收件测试');
    await page.getByTestId('compose-send').click();
    await expect(page).toHaveURL(/#\/flying\/.+/);
    const letterId = page.url().split('/flying/')[1].split('?')[0];
    await page.waitForTimeout(300);

    // 把 etaAt 改成过去，触发 bootstrap 自动送达
    await page.evaluate((id) => {
      const raw = localStorage.getItem('jiasuge:state');
      if (!raw) return;
      const state = JSON.parse(raw);
      const letter = state.letters[id];
      if (letter && letter.flight) {
        letter.flight.etaAt = Date.now() - 1000;
        localStorage.setItem('jiasuge:state', JSON.stringify(state));
        localStorage.setItem('__e2e_keep__', '1');
      }
    }, letterId);
    await page.reload();
    await page.waitForTimeout(500);

    // 切到奶奶账号（accessible name 直接定位，避开随机 user id）
    await page.goto('/#/me');
    await page.getByRole('button', { name: '奶奶 广州' }).click();
    // 清掉 keep 哨兵，让后续测试保持默认行为
    await page.evaluate(() => localStorage.removeItem('__e2e_keep__'));

    // 进 mailbox（默认 inbox）验证奶奶能看到来信
    await page.goto('/#/mailbox');
    await expect(page.getByText('来信收件测试')).toBeVisible();
    // 点开
    await page.getByText('来信收件测试').click();
    await expect(page).toHaveURL(/#\/reading\//);
  });
  test('Cognitive 选择翻牌记忆游戏可进入第 1 关', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/#/cognitive');
    await page.getByTestId('cognitive-game-memory-cards').click();
    await expect(page.getByTestId('cognitive-start')).toBeVisible();
    await page.getByTestId('cognitive-start').click();
    await expect(page.getByText(/第 1 \/ \d+ 关/)).toBeVisible();
  });
});