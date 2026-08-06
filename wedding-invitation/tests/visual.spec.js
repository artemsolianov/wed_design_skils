// @ts-check
const { test, expect } = require('@playwright/test');
const { blockExternalMap, waitForFonts } = require('./helpers.mjs');

test.beforeEach(async ({ page }) => {
  await blockExternalMap(page);
});

// Каждый снимок — отдельная секция через locator.screenshot(), а не
// figures фулл-пейдж: секции ниже сгиба используют IntersectionObserver
// (.reveal), и полноэкранный снимок без прокрутки поймает их в
// opacity:0 (тот самый ложный "пустой блок", на который уже натыкались
// вручную в этом проекте). Прокручиваем каждую секцию в вид перед
// снимком вместо одной общей прокрутки всего документа.

test('hero', async ({ page }) => {
  await page.goto('/');
  await waitForFonts(page);
  await page.waitForTimeout(1000); // hero-reveal cascade settle
  await expect(page.locator('.hero')).toHaveScreenshot('hero.png');
});

test('program section', async ({ page }) => {
  await page.goto('/');
  await waitForFonts(page);
  const section = page.locator('#program');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await expect(section).toHaveScreenshot('program.png');
});

test('dresscode palette', async ({ page }) => {
  await page.goto('/');
  await waitForFonts(page);
  const section = page.locator('#dresscode');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await expect(section).toHaveScreenshot('dresscode.png');
});

test('rsvp section', async ({ page }) => {
  await page.goto('/');
  await waitForFonts(page);
  const section = page.locator('#rsvp');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await expect(section).toHaveScreenshot('rsvp.png');
});

test('mobile menu open', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the menu toggle only renders below 900px');
  await page.goto('/');
  await waitForFonts(page);
  await page.click('.menu-toggle');
  await page.locator('.mobile-menu.is-open').waitFor();
  await page.waitForTimeout(400);
  await expect(page).toHaveScreenshot('mobile-menu.png');
});
