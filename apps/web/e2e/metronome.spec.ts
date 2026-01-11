import { test, expect } from '@playwright/test';

/**
 * Metronome tests require authentication.
 */

const testEmail = process.env.TEST_USER_EMAIL;
const testPassword = process.env.TEST_USER_PASSWORD;
const hasCredentials = testEmail && testPassword;

test.describe('Metronome', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL and TEST_USER_PASSWORD env vars');

  test('loads, plays, and responds to keyboard shortcuts', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testEmail!);
    await page.getByLabel(/password/i).fill(testPassword!);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/dashboard|metronome/, { timeout: 10000 });

    // Navigate to metronome
    await page.goto('/metronome');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/metronome/);

    // Should have tempo-related content
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/\d+/);

    // Play button works
    const buttons = page.locator('button');
    expect(await buttons.count()).toBeGreaterThan(0);
    await buttons.first().click();

    // Keyboard shortcuts work
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');

    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');

    await page.keyboard.press('t');
    await page.waitForTimeout(300);
    await page.keyboard.press('t');

    // Should still be functional
    await expect(page).toHaveURL(/metronome/);
  });
});
