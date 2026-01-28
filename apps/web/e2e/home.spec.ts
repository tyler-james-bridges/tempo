import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads with all key elements and navigation', async ({ page }) => {
    await page.goto('/');

    // Check page title and hero
    await expect(page).toHaveTitle(/TempoMap/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /get started/i })
    ).toBeVisible();

    // Navigation and footer links work
    const metronomeLink = page
      .getByRole('link', { name: /metronome/i })
      .first();
    await expect(metronomeLink).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible();

    // Content check
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toContain('tempo');
  });
});
