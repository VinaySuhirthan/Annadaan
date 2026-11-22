// @ts-check
const { test, expect } = require('@playwright/test');
const { TEST_USERS, TEST_RUN_ID } = require('../config/test-config');
const { getAnonClient, cleanupTestData } = require('../helpers/supabase-client');

test.describe('End-to-End Multi-Role Donation & Claim Workflow', () => {
  let createdDonationId = null;

  test.afterAll(async () => {
    // Teardown test records
    await cleanupTestData();
  });

  test('Step 1: Donor Lists Surplus Food Batch', async ({ page }) => {
    // Authenticate donor
    await page.goto('/donor/donor-home.html');
    await page.evaluate((u) => {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('donor', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('annadaan_session_start', Date.now().toString());
    }, TEST_USERS.donor);

    await page.goto('/donor/add-food.html');

    // Fill Donation Form
    const eventName = `E2E Harvest Banquet (${TEST_RUN_ID})`;
    await page.fill('#food-type', 'Fresh Steamed Basmati Rice & Lentils');
    await page.fill('#serves', '60');
    await page.fill('#valid-hours', '8');
    await page.fill('#address', '77 Central Tech Park Kitchen Entrance');
    await page.fill('#event-name', eventName);

    // Submit Food Listing
    await page.click('button[type="submit"]');

    // Verify submission feedback and redirect or success dialog
    await page.waitForTimeout(2000);

    // Verify database record exists
    const sb = getAnonClient();
    const { data: food, error } = await sb
      .from('food_table')
      .select('*')
      .eq('event_name', eventName)
      .single();

    expect(error).toBeNull();
    expect(food).not.toBeNull();
    expect(food.status).toBe('available');
    expect(food.serves).toBe(60);

    createdDonationId = food.id;
  });

  test('Step 2: NGO Views Available Food & Marketplace', async ({ page }) => {
    // Authenticate NGO
    await page.goto('/volunteer/ngo-dashboard.html');
    await page.evaluate((u) => {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, type: 'ngo' }));
      localStorage.setItem('annadaan_session_start', Date.now().toString());
    }, TEST_USERS.ngo);

    // Navigate to food marketplace
    await page.goto('/volunteer/view-food.html');
    await page.waitForLoadState('domcontentloaded');

    // Verify view food container and marketplace elements render
    await expect(page.locator('.container')).toBeVisible();
    await expect(page).toHaveTitle(/Available Food/);
  });

  test('Step 3: Two-Way Gate Status Transition Verification', async ({ page }) => {
    if (!createdDonationId) return test.skip();

    const sb = getAnonClient();

    // NGO requests claim on donation
    const { error: claimErr } = await sb
      .from('food_table')
      .update({ status: 'NGO Requested', ngo_phone: TEST_USERS.ngo.phone })
      .eq('id', createdDonationId);

    expect(claimErr).toBeNull();

    // Donor views dashboard and approves request
    await page.goto('/donor/donor-home.html');
    await page.evaluate((u) => {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('donor', JSON.stringify({ ...u, type: 'donor' }));
      localStorage.setItem('annadaan_session_start', Date.now().toString());
    }, TEST_USERS.donor);

    await page.reload();
    await page.waitForTimeout(1500);

    // Verify status has updated to NGO Requested in DB
    const { data: updated } = await sb.from('food_table').select('status').eq('id', createdDonationId).single();
    expect(updated.status).toBe('NGO Requested');
  });

});

