import { test, expect, loginAsStandardUser, parsePrice } from './fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('lists six products with name and price', async ({ page }) => {
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);
    for (const item of await page.getByTestId('inventory-item').all()) {
      await expect(item.getByTestId('inventory-item-name')).not.toBeEmpty();
      await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
    }
  });

  test('product name opens its detail page and back returns to Products', async ({ page }) => {
    const firstName = await page.getByTestId('inventory-item-name').first().textContent();
    await page.getByTestId('inventory-item-name').first().click();
    await expect(page).toHaveURL(/inventory-item\.html\?id=/);
    await expect(page.getByTestId('back-to-products')).toBeVisible();
    await expect(page.getByTestId('inventory-item-name')).toHaveText(firstName!);
    await page.getByTestId('back-to-products').click();
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  test('sorts products by name Z to A', async ({ page }) => {
    await page.getByTestId('product-sort-container').selectOption('za');
    const names = await page.getByTestId('inventory-item-name').allTextContents();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('sorts products by price low to high', async ({ page }) => {
    await page.getByTestId('product-sort-container').selectOption('lohi');
    const prices = (await page.getByTestId('inventory-item-price').allTextContents()).map(parsePrice);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
