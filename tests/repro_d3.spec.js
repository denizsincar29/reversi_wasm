const { test, expect } = require('@playwright/test');

test('D3 flips D4', async ({ page }) => {
  await page.goto('http://localhost:8000');

  // Wait for board to be ready
  await page.waitForSelector('.cell');

  // Initial state check (D4 should be white)
  const d4 = page.locator('[data-row="3"][data-col="3"] .disk');
  await expect(d4).toHaveClass(/white/);

  // Click D3 (Row 2, Col 3)
  const d3 = page.locator('[data-row="2"][data-col="3"]');
  await d3.click();

  // Wait a bit for animations
  await page.waitForTimeout(1000);

  // D4 should now be black
  await expect(d4).toHaveClass(/black/);

  // Also check D3 itself
  const d3Disk = d3.locator('.disk');
  await expect(d3Disk).toHaveClass(/black/);
  await expect(d3Disk).toBeVisible();

  // Take a screenshot
  await page.screenshot({ path: 'verification/d3_verification.png' });
});
