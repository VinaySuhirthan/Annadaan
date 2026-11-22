const { test, expect } = require('@playwright/test');

test.describe('Delivery Feedback Page Redesign & Functionality', () => {
  const BASE_URL = '/volunteer/delivery-feedback.html';

  test('1. Empty State: Displays polished empty state and HIDES the form when no delivery exists', async ({ page }) => {
    // Mock user without any active delivery
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('annadaan_session_start', String(Date.now()));
      localStorage.setItem('currentUser', JSON.stringify({
        id: 'vol_test_empty',
        name: 'Arun Kumar',
        phone: '9888877777',
        type: 'volunteer'
      }));
    });

    await page.goto(`${BASE_URL}?demo=1`, { waitUntil: 'networkidle' });

    // Ensure loading card is dismissed
    await page.waitForSelector('#df-loading-card', { state: 'hidden' });

    // Empty state should be visible
    const emptyState = page.locator('#no-delivery-state');
    await expect(emptyState).toBeVisible();

    // Check heading and description
    await expect(emptyState.locator('.df-empty-title')).toHaveText('No completed delivery found');
    await expect(emptyState.locator('.df-empty-desc')).toContainText('Complete or select a delivery before submitting feedback.');

    // Crucial requirement: Feedback form must NOT be active or displayed
    const formCard = page.locator('#feedback-form-card');
    await expect(formCard).toBeHidden();

    const summaryCard = page.locator('#delivery-summary-card');
    await expect(summaryCard).toBeHidden();

    // Verify back to dashboard button
    const backBtn = emptyState.locator('a[href="volunteer-dashboard.html"]');
    await expect(backBtn).toBeVisible();

    // Screenshot empty state
    await page.screenshot({ path: 'test-results/delivery-feedback-empty-state.png', fullPage: true });
  });

  test('2. Active Delivery: Loads delivery record and displays the centered impact tracking form', async ({ page }) => {
    // Setup test delivery in localStorage and user session
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('annadaan_session_start', String(Date.now()));
      localStorage.setItem('currentUser', JSON.stringify({
        id: 'vol_test_active',
        name: 'Priya Sharma',
        phone: '9876543210',
        type: 'volunteer'
      }));
      localStorage.setItem('currentRequest', JSON.stringify({
        id: 'del_test_9988',
        food_type: 'Fresh Cooked Sambar Rice & Poriyal',
        donor_type: 'Annapoorna Caterers',
        donor_phone: '9840123456',
        serves: 60,
        address: '124 Anna Salai, Guindy, Chennai',
        status: 'Delivered',
        delivered_by: 'Priya Sharma',
        delivered_at: new Date().toISOString()
      }));
    });

    await page.goto(`${BASE_URL}?demo=1`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#df-loading-card', { state: 'hidden' });

    // Empty state must be hidden
    await expect(page.locator('#no-delivery-state')).toBeHidden();

    // Delivery summary card must be visible with accurate details
    const summaryCard = page.locator('#delivery-summary-card');
    await expect(summaryCard).toBeVisible();
    await expect(summaryCard).toContainText('Fresh Cooked Sambar Rice & Poriyal');
    await expect(summaryCard).toContainText('Annapoorna Caterers');
    await expect(summaryCard).toContainText('124 Anna Salai, Guindy, Chennai');

    // Impact tracking form must be visible
    const formCard = page.locator('#feedback-form-card');
    await expect(formCard).toBeVisible();
    await expect(formCard.locator('.df-form-title')).toContainText('Impact Tracking');

    // Verify container width is centered and capped (~820px)
    const container = page.locator('.df-page-container');
    const box = await container.boundingBox();
    expect(box.width).toBeLessThanOrEqual(825);

    // Verify Fields
    const locationBtn = page.locator('#captureLocationBtn');
    await expect(locationBtn).toBeVisible();

    const peopleServedInput = page.locator('#people-served');
    await expect(peopleServedInput).toBeVisible();

    const notesInput = page.locator('#notes');
    await expect(notesInput).toBeVisible();

    const submitBtn = page.locator('#submitFeedbackBtn');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toHaveText(/Submit Feedback/);

    // Verify People Served Validation: Fill valid count and notes
    await peopleServedInput.fill('48');
    await notesInput.fill('Distributed to 48 families at the community center in Guindy. Food was warm and hygienically packed.');

    // Save verified desktop screenshot
    await page.screenshot({ path: 'test-results/delivery-feedback-desktop.png', fullPage: true });
  });

  test('3. Mobile Responsive Viewports (360px, 375px, 390px, 430px) without horizontal overflow', async ({ page }) => {
    const viewports = [
      { width: 360, height: 740, name: '360px-galaxy' },
      { width: 375, height: 667, name: '375px-iphone-se' },
      { width: 390, height: 844, name: '390px-iphone-12' },
      { width: 430, height: 932, name: '430px-iphone-14-pro-max' }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem('annadaan_session_start', String(Date.now()));
        localStorage.setItem('currentUser', JSON.stringify({
          id: 'vol_test_mobile',
          name: 'Karthik Raja',
          phone: '9876500000',
          type: 'volunteer'
        }));
        localStorage.setItem('currentRequest', JSON.stringify({
          id: 'del_mobile_101',
          food_type: 'Packed Vegetable Biryani',
          donor_type: 'Weddings',
          donor_phone: '9940012345',
          serves: 35,
          address: 'Kotturpuram Community Hall, Chennai',
          status: 'In Transit',
          delivered_by: 'Karthik Raja',
          delivered_at: new Date().toISOString()
        }));
      });

      await page.goto(`${BASE_URL}?demo=1`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#df-loading-card', { state: 'hidden' });

      // Verify no horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflow).toBe(false);

      // Verify elements remain readable and accessible
      await expect(page.locator('#delivery-summary-card')).toBeVisible();
      await expect(page.locator('#feedback-form-card')).toBeVisible();
      await expect(page.locator('#submitFeedbackBtn')).toBeVisible();

      if (vp.width === 375) {
        await page.screenshot({ path: 'test-results/delivery-feedback-mobile.png', fullPage: true });
      }
    }
  });
});
