
const { test, expect } = require('@playwright/test');

const SITE = 'https://runner-fb.github.io/beauregard-vehicules/';

test('@smoke page publique charge sans erreur HTTP', async ({ page }) => {
  const response = await page.goto(SITE, {
    waitUntil: 'domcontentloaded'
  });

  console.log('URL testée :', page.url());
  console.log('Statut HTTP :', response?.status());

  expect(response, 'Aucune réponse HTTP').toBeTruthy();
  expect(response.status()).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
});

test('@smoke interface non vide et titre présent', async ({ page }) => {
  await page.goto(SITE);
  await expect(page.locator('body')).not.toBeEmpty();
  expect((await page.title()).trim().length).toBeGreaterThan(0);
});

test('@smoke absence de débordement horizontal majeur', async ({ page }) => {
  await page.goto(SITE);
  await page.waitForLoadState('load');

  const sizes = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));

  expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport + 2);
});

test('@smoke absence de ressources locales HTTP en échec', async ({ page }) => {
  const failures = [];

  page.on('response', response => {
    if (
      response.url().startsWith(new URL(SITE).origin) &&
      response.status() >= 400
    ) {
      failures.push(response.status() + ' ' + response.url());
    }
  });

  await page.goto(SITE, { waitUntil: 'networkidle' });
  expect(failures).toEqual([]);
});

test('@smoke aucun crash JavaScript non intercepté au chargement', async ({ page }) => {
  const errors = [];

  page.on('pageerror', error => errors.push(error.message));

  await page.goto(SITE, { waitUntil: 'networkidle' });
  expect(errors).toEqual([]);
});
