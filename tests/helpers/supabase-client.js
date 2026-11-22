/**
 * Supabase Test Client & Safe Teardown Helper
 * Strict Safety: Only writes/deletes records tagged with test run IDs or test phone prefixes.
 */

const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, TEST_PHONE_PREFIX } = require('../config/test-config');

function getAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function getAdminClient() {
  if (SUPABASE_SERVICE_KEY) {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return getAnonClient();
}

/**
 * Safely clean up only test-generated records.
 * NEVER deletes real donor or food records.
 */
async function cleanupTestData(client = null) {
  const sb = client || getAdminClient();
  try {
    // 1. Delete test food records created by QA
    const { error: foodErr } = await sb
      .from('food_table')
      .delete()
      .like('donor_phone', `${TEST_PHONE_PREFIX}%`);

    if (foodErr) console.warn('Test cleanup note (food_table):', foodErr.message);

    // 2. Delete test donors
    const { error: donorErr } = await sb
      .from('donor_table')
      .delete()
      .like('phone', `${TEST_PHONE_PREFIX}%`);

    if (donorErr) console.warn('Test cleanup note (donor_table):', donorErr.message);

    // 3. Delete test NGOs
    const { error: ngoErr } = await sb
      .from('ngo_table')
      .delete()
      .like('phone', `${TEST_PHONE_PREFIX}%`);

    if (ngoErr) console.warn('Test cleanup note (ngo_table):', ngoErr.message);

    // 4. Delete test Volunteers
    const { error: volErr } = await sb
      .from('volunteer_table')
      .delete()
      .like('phone', `${TEST_PHONE_PREFIX}%`);

    if (volErr) console.warn('Test cleanup note (volunteer_table):', volErr.message);

    return { success: true };
  } catch (err) {
    console.error('Test cleanup exception:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getAnonClient,
  getAdminClient,
  cleanupTestData
};

