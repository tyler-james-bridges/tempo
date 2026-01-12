import { test, expect } from '@playwright/test';

test.describe('PWA Configuration', () => {
  test('manifest and icons are valid', async ({ request }) => {
    const response = await request.get('/manifest.json');
    expect(response.ok()).toBe(true);

    const manifest = await response.json();

    // Required PWA manifest fields
    expect(manifest.name).toBeDefined();
    expect(manifest.short_name).toBeDefined();
    expect(manifest.start_url).toBeDefined();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);

    const iconSizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');

    // Verify icons are accessible
    const icon192 = await request.get('/icons/icon-192x192.png');
    expect(icon192.ok()).toBe(true);

    const icon512 = await request.get('/icons/icon-512x512.png');
    expect(icon512.ok()).toBe(true);
  });

  test('has proper PWA meta tags', async ({ page }) => {
    await page.goto('/');

    // Check theme-color meta tag
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeDefined();

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Check apple-touch-icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveCount(1);
  });
});
