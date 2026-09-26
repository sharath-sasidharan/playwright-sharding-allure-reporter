import { test, expect, loginAsStandardUser, parsePrice } from './fixtures';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('add-to-cart-sauce-labs-onesie').click();
    await page.getByTestId('shopping-cart-link').click();
    await page.getByTestId('checkout').click();
  });

  test('completes a purchase end to end', async ({ page }) => {
    await page.getByTestId('firstName').fill('Jane');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();
    await page.getByTestId('finish').click();
    await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
    await expect(page.getByTestId('shopping-cart-badge')).toBeHidden();
  });

  test('missing first name shows a validation error', async ({ page }) => {
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toContainText('First Name is required');
  });

  test('overview total equals item total plus tax', async ({ page }) => {
    await page.getByTestId('firstName').fill('Jane');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();

    const itemPrices = (await page.getByTestId('inventory-item-price').allTextContents()).map(parsePrice);
    const subtotal = parsePrice(await page.getByTestId('subtotal-label').textContent());
    const tax = parsePrice(await page.getByTestId('tax-label').textContent());
    const total = parsePrice(await page.getByTestId('total-label').textContent());

    expect(subtotal).toBeCloseTo(itemPrices.reduce((a, b) => a + b, 0), 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('cancel on the information step returns to the cart', async ({ page }) => {
    await page.getByTestId('cancel').click();
    await expect(page.getByTestId('title')).toHaveText('Your Cart');
    await expect(page.getByTestId('inventory-item')).toHaveCount(2);
  });
});
