import { test, expect } from '@playwright/test';

test.describe('datalist-css', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo.html');
  });

  test('should load the page without errors', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('HTML5 datalist styling demonstration');
  });

  test('should show datalist on input focus', async ({ page }) => {
    const input = page.locator('#country');
    const datalist = page.locator('#countrydata');

    await input.focus();
    await expect(datalist).toHaveClass(/datalist--visible/);
  });

  test('should filter options when typing', async ({ page }) => {
    const input = page.locator('#country');
    const datalist = page.locator('#countrydata');

    await input.focus();
    await input.fill('Ger');

    const options = datalist.locator('option');
    const visibleOptions = await options.evaluateAll((opts) => {
      return opts.filter((opt) => opt.style.display !== 'none');
    });

    expect(visibleOptions.length).toBeGreaterThan(0);
    expect(visibleOptions.length).toBeLessThan(240);
  });

  test('should select option with Enter key', async ({ page }) => {
    const input = page.locator('#browser');
    const datalist = page.locator('#browserdata');

    await input.focus();
    await input.fill('Chrome');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const value = await input.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('should close datalist with Escape key', async ({ page }) => {
    const input = page.locator('#country');
    const datalist = page.locator('#countrydata');

    await input.focus();
    await expect(datalist).toHaveClass(/datalist--visible/);

    await page.keyboard.press('Escape');

    await expect(datalist).not.toHaveClass(/datalist--visible/);
  });

  test('should close datalist when clicking outside', async ({ page }) => {
    const input = page.locator('#country');
    const datalist = page.locator('#countrydata');

    await input.focus();
    await expect(datalist).toHaveClass(/datalist--visible/);

    await page.click('body', { position: { x: 10, y: 10 } });

    await expect(datalist).not.toHaveClass(/datalist--visible/);
  });

  test('should preserve native behavior with data-datalist-native', async ({ page }) => {
    const input = page.locator('#os');
    const datalist = page.locator('#osdata');

    await input.focus();

    await expect(datalist).not.toHaveClass(/datalist--visible/);
    await expect(datalist).not.toHaveClass(/datalist/);
  });
});
