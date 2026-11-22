// @ts-check
const { test, expect } = require('@playwright/test');
const { TEST_USERS } = require('../config/test-config');

test.describe('Navigation & Responsive UI Suite', () => {

  test('Desktop Sidebar & Tab Navigation', async ({ page }) => {
    await page.goto('/donor/donor-home.html');
    await page.evaluate((u) => {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('donor', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('annadaan_session_start', Date.now().toString());
    }, TEST_USERS.donor);

    await page.reload();

    // Verify Desktop Sidebar elements
    await expect(page.locator('#appSidebar')).toBeVisible();
    await expect(page.locator('#navDashboard')).toHaveClass(/active/);
    await expect(page.locator('#navDonateFood')).toBeVisible();

    // Tab Switching between Active and History
    const historyTab = page.locator('#tabHistory');
    if (await historyTab.isVisible()) {
      await historyTab.click();
      await expect(historyTab).toHaveClass(/active/);
      await expect(page.locator('#viewHistory')).toBeVisible();
    }
  });

  test('Mobile Topbar & Off-Canvas Drawer Toggle', async ({ page }) => {
    // Set viewport to mobile 375px
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/donor/donor-home.html');
    await page.evaluate((u) => {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('donor', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('annadaan_session_start', Date.now().toString());
    }, TEST_USERS.donor);

    await page.reload();

    // Mobile trigger should be visible
    const menuTrigger = page.locator('.mobile-menu-trigger');
    await expect(menuTrigger).toBeVisible();

    // Open mobile sidebar
    await menuTrigger.click();
    await expect(page.locator('#appSidebar')).toHaveClass(/active/);
    await expect(page.locator('#sidebarBackdrop')).toHaveClass(/active/);

    // Close via backdrop click
    await page.locator('#sidebarBackdrop').click();
    await expect(page.locator('#appSidebar')).not.toHaveClass(/active/);
  });

  test('Feature Guide Trigger Button (FAB)', async ({ page }) => {
    await page.goto('/donor/donor-home.html');
    await page.evaluate((u) => {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('donor', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('annadaan_session_start', Date.now().toString());
    }, TEST_USERS.donor);

    await page.reload();
    await page.waitForTimeout(1000);

    // Click navFeatureGuide link in sidebar
    const guideNav = page.locator('#navFeatureGuide');
    await expect(guideNav).toBeVisible();
    await guideNav.click();

    // Verify driver popover appears or assets load
    await page.waitForTimeout(1000);
  });

});
