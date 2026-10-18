const { test, expect } = require('@playwright/test');

test('@smoke page publique charge sans erreur HTTP', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response, 'Aucune réponse HTTP').toBeTruthy();
  expect(response.status()).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
});

test('@smoke interface non vide et titre présent', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).not.toBeEmpty();
  expect((await page.title()).trim().length).toBeGreaterThan(0);
});

test('@smoke absence de débordement horizontal majeur', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('load');
  const sizes = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport + 2);
});

test('@smoke absence de ressources locales HTTP en échec', async ({ page }) => {
  const failures = [];
  page.on('response', r => {
    if (r.url().startsWith(new URL(page.url()).origin) && r.status() >= 400)
      failures.push(r.status() + ' ' + r.url());
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(failures).toEqual([]);
});

test('@smoke aucun crash JavaScript non intercepté au chargement', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(errors).toEqual([]);
});
