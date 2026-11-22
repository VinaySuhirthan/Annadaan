// @ts-check
const { test, expect } = require('@playwright/test');
const { TEST_USERS } = require('../config/test-config');

test.describe('Authentication & Session Management Suite', () => {

  test('Donor Login - Valid Phone & Demo OTP Flow', async ({ page }) => {
    await page.goto('/donor/login.html');

    // Verify page title and official brand assets
    await expect(page).toHaveTitle(/Donor Login/);
    await expect(page.locator('.brand-auth-logo')).toBeVisible();

    // Verify official Google Sign-In button is rendered with Google G icon
    const googleBtn = page.locator('#btnGoogleLogin');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Sign in with Google');

    // Step 1: Input Name & Phone
    await page.fill('#nameInput', TEST_USERS.donor.name);
    await page.fill('#phoneInput', TEST_USERS.donor.phone);
    await page.click('button:has-text("Send OTP")');

    // Step 2: Verify Step 2 OTP screen is displayed
    await expect(page.locator('#step2')).toBeVisible();
    await expect(page.locator('.otp-badge')).toContainText('1234');

    // Input Valid OTP
    await page.fill('#otpInput', '1234');
    await page.click('button:has-text("Verify & Continue")');

    // Verify redirection to donor dashboard
    await page.waitForURL('**/donor/donor-home.html', { timeout: 8000 });
    await expect(page).toHaveURL(/donor-home\.html/);

    // Verify session data is stored in localStorage
    const userJson = await page.evaluate(() => localStorage.getItem('currentUser'));
    expect(userJson).not.toBeNull();
    const user = JSON.parse(userJson || '{}');
    expect(user.type).toBe('donor');

    // Verify session start timestamp is recorded
    const sessionStart = await page.evaluate(() => localStorage.getItem('annadaan_session_start'));
    expect(sessionStart).not.toBeNull();
  });

  test('Donor Login - Invalid OTP Handling', async ({ page }) => {
    await page.goto('/donor/login.html');
    await page.fill('#nameInput', 'Test User');
    await page.fill('#phoneInput', '9876543210');
    await page.click('button:has-text("Send OTP")');

    await expect(page.locator('#step2')).toBeVisible();
    await page.fill('#otpInput', '0000'); // Wrong OTP
    await page.click('button:has-text("Verify & Continue")');

    // Should remain on login page and not redirect
    await expect(page).toHaveURL(/login\.html/);
  });

  test('Session Persistence across Page Refresh', async ({ page }) => {
    // Inject active session
    await page.goto('/donor/donor-home.html');
    await page.evaluate((u) => {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('donor', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('annadaan_session_start', Date.now().toString());
    }, TEST_USERS.donor);

    await page.reload();

    // Verify user remains logged in on donor dashboard
    await expect(page).toHaveURL(/donor-home\.html/);
    await expect(page.locator('.app-sidebar')).toBeVisible();
  });

  test('Route Protection - Unauthenticated Access Redirection', async ({ page }) => {
    // Clear storage to simulate logged out user
    await page.goto('/donor/login.html');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Attempt direct navigation to protected dashboard
    await page.goto('/donor/donor-home.html');

    // Should automatically guard route and redirect to login
    await page.waitForURL('**/login.html**', { timeout: 6000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('Safe Local Logout', async ({ page }) => {
    // Initialize session
    await page.goto('/donor/donor-home.html');
    await page.evaluate((u) => {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('donor', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('annadaan_session_start', Date.now().toString());
    }, TEST_USERS.donor);

    await page.reload();
    await page.click('.btn-logout');

    // Verify redirect to login and local session cleared
    await page.waitForURL('**/login.html**', { timeout: 6000 });
    const user = await page.evaluate(() => localStorage.getItem('currentUser'));
    expect(user).toBeNull();
  });

});

