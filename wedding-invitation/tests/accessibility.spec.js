// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { blockExternalMap, revealEverything } = require('./helpers.mjs');

test.describe('accessibility', () => {
  test('full page has no automatically detectable WCAG A/AA violations', async ({ page }) => {
    await blockExternalMap(page);
    await page.goto('/');
    await revealEverything(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('open mobile menu has no violations', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'the menu toggle is display:none from 900px up');
    await blockExternalMap(page);
    await page.goto('/');
    await page.click('.menu-toggle');
    await page.locator('.mobile-menu.is-open').waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
