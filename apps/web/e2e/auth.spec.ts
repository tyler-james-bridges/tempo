import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login form validates and shows error for invalid credentials', async ({
    page,
  }) => {
    await page.goto('/login');

    // Form elements visible and functional
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /sign in|log in/i })
    ).toBeVisible();

    // Navigation to signup works
    const signupLink = page.getByRole('link', {
      name: /sign up|create account|register/i,
    });
    await expect(signupLink).toBeVisible();

    // Test invalid credentials show error
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('signup form validates password requirements', async ({ page }) => {
    await page.goto('/signup');

    // Form elements visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();

    // Test password validation
    await page.getByLabel(/email/i).fill('test@example.com');
    const passwordFields = page.getByLabel(/password/i);
    await passwordFields.first().fill('12345');

    const confirmField = page.getByLabel(/confirm/i);
    if (await confirmField.isVisible()) {
      await confirmField.fill('12345');
    }

    await page
      .getByRole('button', { name: /sign up|create|register/i })
      .click();
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('signup');
  });

  test('protected routes redirect to login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('metronome is accessible without authentication', async ({ page }) => {
    await page.goto('/metronome');
    await expect(page).toHaveURL(/metronome/);
    await expect(page.getByText(/BPM/i)).toBeVisible();
  });
});
