import { test, expect, loginAsStandardUser, BASE_URL } from './fixtures';

test.describe('Session', () => {
  test('logout from the side menu returns to the login page', async ({ page }) => {
    await loginAsStandardUser(page);
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByTestId('logout-sidebar-link').click();
    await expect(page).toHaveURL(BASE_URL + '/');
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('opening the inventory without logging in is blocked', async ({ page }) => {
    await page.goto(BASE_URL + '/inventory.html');
    await expect(page.getByTestId('error')).toContainText('when you are logged in');
    await expect(page.getByTestId('login-button')).toBeVisible();
  });
});
