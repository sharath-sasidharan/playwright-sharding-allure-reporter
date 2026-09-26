import { test as base, expect, type Page } from '@playwright/test';

export const BASE_URL = 'https://www.saucedemo.com';
export const PASSWORD = 'secret_sauce';

/* Sauce Demo tags elements with data-test, not Playwright's default data-testid. */
export const test = base.extend({ testIdAttribute: 'data-test' });
export { expect };

export async function login(page: Page, username = 'standard_user', password = PASSWORD) {
  await page.goto(BASE_URL);
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);
  await page.getByTestId('login-button').click();
}

export async function loginAsStandardUser(page: Page) {
  await login(page);
  await expect(page).toHaveURL(/inventory\.html/);
}

export function parsePrice(text: string | null): number {
  return Number((text ?? '').replace(/[^0-9.]/g, ''));
}
