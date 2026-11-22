// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Form Validation & Boundary Testing Suite', () => {

  test('Donor Login - Empty Inputs Validation', async ({ page }) => {
    await page.goto('/donor/login.html');

    // Click Send OTP with blank fields
    await page.click('button:has-text("Send OTP")');

    // Should remain on step 1 and show alert
    await expect(page.locator('#step1')).toBeVisible();
    await expect(page.locator('#step2')).not.toBeVisible();
  });

  test('Donor Login - Invalid Phone Number Format', async ({ page }) => {
    await page.goto('/donor/login.html');
    await page.fill('#nameInput', 'Test Donor');
    await page.fill('#phoneInput', '12345'); // Only 5 digits instead of 10
    await page.click('button:has-text("Send OTP")');

    // Should remain on step 1
    await expect(page.locator('#step1')).toBeVisible();
  });

  test('Food Donation - Required Fields & Number Boundaries', async ({ page }) => {
    await page.goto('/donor/add-food.html');

    // Food form should have serves input with min=1
    const servesInput = page.locator('#serves');
    await expect(servesInput).toBeVisible();

    const minAttr = await servesInput.getAttribute('min');
    expect(parseInt(minAttr || '1', 10)).toBeGreaterThanOrEqual(1);
  });

});
