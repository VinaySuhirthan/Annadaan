/**
 * Database CRUD & State Transition Test
 * Validates create, read, update, and teardown lifecycles on isolated test records.
 */

const { getAnonClient, cleanupTestData } = require('../helpers/supabase-client');
const { VALID_DONATION } = require('../fixtures/test-data');
const { TEST_RUN_ID } = require('../config/test-config');

async function testCrud() {
  const sb = getAnonClient();
  const results = [];
  let createdFoodId = null;

  try {
    // 1. CREATE: Insert isolated test donation
    const testPayload = {
      ...VALID_DONATION,
      event_name: `CRUD Test (${TEST_RUN_ID})`
    };

    const t0 = Date.now();
    const { data: inserted, error: insertError } = await sb
      .from('food_table')
      .insert([testPayload])
      .select()
      .single();

    const insertLatency = Date.now() - t0;

    if (insertError || !inserted) {
      const isBlocked = insertError && insertError.message.includes('permission denied');
      results.push({
        testId: 'DB-CRUD-CREATE',
        name: 'Insert Food Donation',
        status: isBlocked ? 'BLOCKED' : 'FAIL',
        error: insertError ? insertError.message : 'No data returned',
        message: isBlocked ? 'Database mutation blocked by PostgreSQL table privileges (grant required)' : 'Insert failed',
        duration: insertLatency
      });
      return results;
    }

    createdFoodId = inserted.id;
    results.push({
      testId: 'DB-CRUD-CREATE',
      name: 'Insert Food Donation',
      status: 'PASS',
      duration: insertLatency,
      message: `Created donation record ID: ${createdFoodId}`
    });

    // 2. READ: Fetch the inserted record
    const { data: fetched, error: fetchError } = await sb
      .from('food_table')
      .select('*')
      .eq('id', createdFoodId)
      .single();

    if (fetchError || !fetched) {
      results.push({
        testId: 'DB-CRUD-READ',
        name: 'Read Food Donation',
        status: 'FAIL',
        error: fetchError ? fetchError.message : 'Record not found'
      });
    } else {
      const match = fetched.food_type === testPayload.food_type && fetched.serves === testPayload.serves;
      results.push({
        testId: 'DB-CRUD-READ',
        name: 'Read Food Donation',
        status: match ? 'PASS' : 'FAIL',
        message: match ? 'Retrieved record matches original payload' : 'Data mismatch in fetched record'
      });
    }

    // 3. UPDATE: Transition status (available -> NGO Requested -> Accepted)
    const { data: updated, error: updateError } = await sb
      .from('food_table')
      .update({ status: 'NGO Requested', ngo_phone: '9999000002' })
      .eq('id', createdFoodId)
      .select()
      .single();

    if (updateError || !updated) {
      results.push({
        testId: 'DB-CRUD-UPDATE',
        name: 'Update Donation Status (Claim)',
        status: 'FAIL',
        error: updateError ? updateError.message : 'Update failed'
      });
    } else {
      results.push({
        testId: 'DB-CRUD-UPDATE',
        name: 'Update Donation Status (Claim)',
        status: updated.status === 'NGO Requested' ? 'PASS' : 'FAIL',
        message: `Status successfully updated to ${updated.status}`
      });
    }

    // 4. TEARDOWN: Delete only the test-created row
    const { error: deleteError } = await sb
      .from('food_table')
      .delete()
      .eq('id', createdFoodId);

    results.push({
      testId: 'DB-CRUD-DELETE',
      name: 'Teardown Disposable Test Record',
      status: deleteError ? 'FAIL' : 'PASS',
      message: deleteError ? deleteError.message : 'Test record cleaned up successfully'
    });

  } catch (err) {
    results.push({
      testId: 'DB-CRUD-FATAL',
      name: 'CRUD Execution Exception',
      status: 'FAIL',
      error: err.message
    });
  }

  return results;
}

if (require.main === module) {
  testCrud().then(r => console.log(JSON.stringify(r, null, 2)));
}

module.exports = { testCrud };
