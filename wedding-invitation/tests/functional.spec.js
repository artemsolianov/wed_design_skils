// @ts-check
const { test, expect } = require('@playwright/test');
const { blockExternalMap } = require('./helpers.mjs');

test.beforeEach(async ({ page }) => {
  await blockExternalMap(page);
});

test('no horizontal overflow at the viewport width', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

test('page has no console errors on load and after scrolling through', async ({ page }) => {
  // The yandex maps script is aborted on purpose (blockExternalMap) so the
  // suite stays deterministic offline — that abort itself logs a resource
  // load error to the console. It's the test's own doing, not a site bug;
  // don't fail on the specific network errors it causes.
  const KNOWN_NOISE = /net::ERR_FAILED|net::ERR_CONNECTION_RESET/;
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !KNOWN_NOISE.test(msg.text())) errors.push(msg.text());
  });

  await page.goto('/');
  await page.mouse.wheel(0, 20000);
  await page.waitForTimeout(500);

  expect(errors).toEqual([]);
});

test('countdown renders real numbers and ticks', async ({ page }) => {
  await page.goto('/');
  const days = page.locator('[data-unit="days"]');
  await expect(days).not.toHaveText('00');

  const seconds = page.locator('[data-unit="seconds"]');
  const first = await seconds.textContent();
  await page.waitForTimeout(1100);
  const second = await seconds.textContent();
  expect(second).not.toBe(first);
});

test('mobile menu opens and closes, and closes on link click', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the menu toggle is display:none from 900px up');
  await page.goto('/');
  const menu = page.locator('.mobile-menu');
  const toggle = page.locator('.menu-toggle');

  await expect(menu).not.toHaveClass(/is-open/);
  await toggle.click();
  await expect(menu).toHaveClass(/is-open/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  await menu.getByRole('link', { name: 'Программа' }).click();
  await expect(menu).not.toHaveClass(/is-open/);
});

test('dresscode palette shows three tone families', async ({ page }) => {
  await page.goto('/');
  await page.locator('#dresscode').scrollIntoViewIfNeeded();

  const swatches = page.locator('.palette-strip .swatch');
  await expect(swatches).toHaveCount(3);
  for (const name of ['Оттенки бежевого', 'Оттенки зелёного', 'Небесно-голубой']) {
    await expect(page.locator('.swatch-name', { hasText: name })).toBeVisible();
  }
});

test('keyboard focus ring is visible on interactive elements', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const active = page.locator(':focus-visible');
  await expect(active).toBeVisible();
});

test('hero CTA buttons are equal width when stacked on narrow phones', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'width-stacking rule only applies below 480px');
  await page.goto('/');
  const primary = page.locator('.hero-actions .btn-primary');
  const outline = page.locator('.hero-actions .btn-outline');
  const [primaryBox, outlineBox] = await Promise.all([primary.boundingBox(), outline.boundingBox()]);
  expect(Math.abs((primaryBox?.width ?? 0) - (outlineBox?.width ?? 0))).toBeLessThan(1);
});
