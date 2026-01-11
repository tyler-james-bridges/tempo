import { test, expect } from '@playwright/test';

/**
 * Dashboard and authenticated tests require credentials.
 * Set TEST_USER_EMAIL and TEST_USER_PASSWORD env vars to run these tests.
 */

const testEmail = process.env.TEST_USER_EMAIL;
const testPassword = process.env.TEST_USER_PASSWORD;
const hasCredentials = testEmail && testPassword;

test.describe('Authenticated Features', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL and TEST_USER_PASSWORD env vars');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testEmail!);
    await page.getByLabel(/password/i).fill(testPassword!);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test('dashboard loads with shows and upload functionality', async ({ page }) => {
    // Dashboard heading visible
    await expect(page.getByRole('heading', { name: /dashboard|shows|my music/i })).toBeVisible();

    // Upload functionality exists
    const uploadArea = page.getByText(/upload|drag|drop|pdf/i).first();
    await expect(uploadArea).toBeVisible();

    // Shows list or empty state loads
    await page.waitForLoadState('networkidle');
    const content = await page.textContent('body');
    const hasShows = content?.includes('show') || content?.includes('Show');
    const hasEmptyState = content?.includes('No shows') || content?.includes('Upload') || content?.includes('Get started');
    expect(hasShows || hasEmptyState).toBe(true);
  });

  test('settings page displays user info and sign out works', async ({ page }) => {
    await page.goto('/settings');

    // User info visible
    await expect(page.getByText(testEmail!)).toBeVisible();

    // Sign out button works
    const signOutButton = page.getByRole('button', { name: /sign out|log out/i });
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();

    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain('/settings');
  });
});
