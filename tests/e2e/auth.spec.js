const { test, expect } = require('@playwright/test');
const SITE = 'https://runner-fb.github.io/beauregard-vehicules/';

async function openLogin(page, admin = false) {
  await page.goto(SITE);
  await expect(page.locator('#app')).toBeVisible();
  if (admin) {
    await page.locator('[data-action="admin"]').click();
  } else {
    await page.locator('#account').click();
  }
  await expect(page.locator('form#login input[name="code"]')).toBeVisible();
}

async function authenticate(page, code, admin = false) {
  await openLogin(page, admin);
  await page.locator('form#login input[name="code"]').fill(code);
  await page.locator('form#login button[type="submit"], form#login button:not([type])').first().click();
  await expect(page.locator('form#identity'), 'Code refusé ou serveur indisponible').toBeVisible({timeout:90000});
  await page.locator('form#identity input[name="first"]').fill('Test');
  await page.locator('form#identity input[name="last"]').fill(admin ? 'Playwright Admin' : 'Playwright Controleur');
  await page.locator('form#identity button').click();
  await expect(page.locator('#account')).toContainText('Test', {timeout:90000});
}

test.describe('Authentification contrôleur', () => {
  test('affiche le formulaire de connexion', async ({page}) => {
    await openLogin(page);
    await expect(page.locator('form#login input[name="code"]')).toHaveAttribute('type','password');
  });
  test('refuse un code incorrect sans ouvrir de session', async ({page}) => {
    await openLogin(page);
    await page.locator('form#login input[name="code"]').fill('CODE-INVALIDE-PLAYWRIGHT');
    await page.locator('form#login button').first().click();
    await expect(page.locator('form#identity')).toHaveCount(0);
    await expect(page.locator('#account')).toHaveText('Connexion');
  });
  test('connexion puis déconnexion', async ({page}) => {
    test.skip(!process.env.TEST_CONTROLLER_CODE, 'Secret TEST_CONTROLLER_CODE absent');
    await authenticate(page,process.env.TEST_CONTROLLER_CODE);
    page.once('dialog', d => d.accept());
    await page.locator('#account').click();
    await expect(page.locator('#account')).toHaveText('Connexion');
  });
});

test.describe('Authentification administrateur', () => {
  test('connexion et accès aux éditions', async ({page}) => {
    test.skip(!process.env.TEST_ADMIN_CODE, 'Secret TEST_ADMIN_CODE absent');
    await authenticate(page,process.env.TEST_ADMIN_CODE,true);
    await expect(page.getByRole('heading',{name:'Les éditions'})).toBeVisible({timeout:90000});
  });
});
