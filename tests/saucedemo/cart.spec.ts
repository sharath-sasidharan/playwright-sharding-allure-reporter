import { test, expect, loginAsStandardUser } from './fixtures';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('adding a product updates the cart badge', async ({ page }) => {
    await expect(page.getByTestId('shopping-cart-badge')).toBeHidden();
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toBeVisible();
  });

  test('removing a product from the inventory clears the badge', async ({ page }) => {
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('remove-sauce-labs-backpack').click();
    await expect(page.getByTestId('shopping-cart-badge')).toBeHidden();
  });

  test('cart page lists every added product', async ({ page }) => {
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('add-to-cart-sauce-labs-bike-light').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
    await page.getByTestId('shopping-cart-link').click();
    await expect(page.getByTestId('title')).toHaveText('Your Cart');
    await expect(page.getByTestId('inventory-item-name')).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
  });

  test('removing from the cart page and continuing shopping', async ({ page }) => {
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('shopping-cart-link').click();
    await page.getByTestId('remove-sauce-labs-backpack').click();
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);
    await page.getByTestId('continue-shopping').click();
    await expect(page.getByTestId('title')).toHaveText('Products');
  });
});
