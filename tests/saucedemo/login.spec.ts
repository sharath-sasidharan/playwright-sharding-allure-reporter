import { test, expect, login } from './fixtures';

test.describe('Login', () => {
  test('standard user logs in and lands on Products', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  test('locked out user sees a locked-out error', async ({ page }) => {
    await login(page, 'locked_out_user');
    await expect(page.getByTestId('error')).toContainText('Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('wrong password shows a mismatch error', async ({ page }) => {
    await login(page, 'standard_user', 'wrong_password');
    await expect(page.getByTestId('error')).toContainText('Username and password do not match any user in this service');
  });

  test('empty username shows a required-field error', async ({ page }) => {
    await login(page, '', '');
    await expect(page.getByTestId('error')).toContainText('Username is required');
  });
});
