/**
 * Concurrency & Race Condition Simulation Test
 * Simulates two NGOs attempting to claim the same food donation batch simultaneously.
 */

const { getAnonClient } = require('../helpers/supabase-client');
const { VALID_DONATION } = require('../fixtures/test-data');
const { TEST_RUN_ID } = require('../config/test-config');

async function testConcurrency() {
  const sbA = getAnonClient();
  const sbB = getAnonClient();
  const results = [];

  // 1. Create a single test donation batch with status: 'available'
  const { data: food, error: createErr } = await sbA
    .from('food_table')
    .insert([{
      ...VALID_DONATION,
      event_name: `Concurrency Race Test (${TEST_RUN_ID})`,
      serves: 50,
      status: 'available'
    }])
    .select()
    .single();

  if (createErr || !food) {
    const isBlocked = createErr && createErr.message.includes('permission denied');
    results.push({
      testId: 'DB-CONCURRENCY-SETUP',
      name: 'Setup Concurrency Test Batch',
      status: isBlocked ? 'BLOCKED' : 'FAIL',
      error: createErr ? createErr.message : 'Setup failed',
      message: isBlocked ? 'Concurrency simulation blocked by missing table privileges' : 'Setup failed'
    });
    return results;
  }

  const foodId = food.id;

  // 2. Fire simultaneous claim requests from NGO A and NGO B
  const claimNgoA = sbA
    .from('food_table')
    .update({ status: 'NGO Requested', ngo_phone: '9999000002' })
    .eq('id', foodId)
    .eq('status', 'available') // Optimistic concurrency check
    .select();

  const claimNgoB = sbB
    .from('food_table')
    .update({ status: 'NGO Requested', ngo_phone: '9999000099' })
    .eq('id', foodId)
    .eq('status', 'available') // Optimistic concurrency check
    .select();

  const [resA, resB] = await Promise.all([claimNgoA, claimNgoB]);

  // 3. Evaluate results
  const aClaimed = resA.data && resA.data.length > 0;
  const bClaimed = resB.data && resB.data.length > 0;

  // Verify only ONE claim succeeded, preventing double allocation
  if (aClaimed && bClaimed) {
    results.push({
      testId: 'DB-CONCURRENCY-DOUBLE-CLAIM',
      name: 'Simultaneous Dual-Claim Race Condition',
      status: 'FAIL',
      error: 'CRITICAL DEFECT: Both simultaneous claims succeeded. Batch was double-booked.',
      recommendation: 'Enforce atomic conditional update: UPDATE food_table SET status = "NGO Requested" WHERE id = :id AND status = "available"'
    });
  } else if ((aClaimed && !bClaimed) || (!aClaimed && bClaimed)) {
    results.push({
      testId: 'DB-CONCURRENCY-DOUBLE-CLAIM',
      name: 'Simultaneous Dual-Claim Race Condition',
      status: 'PASS',
      message: 'Atomic concurrency check verified: exactly one NGO won the claim, second claim was safely rejected.',
      winner: aClaimed ? 'NGO A' : 'NGO B'
    });
  } else {
    results.push({
      testId: 'DB-CONCURRENCY-DOUBLE-CLAIM',
      name: 'Simultaneous Dual-Claim Race Condition',
      status: 'PARTIAL',
      message: 'Neither claim returned rows, checking final state...'
    });
  }

  // 4. Verify Final State
  const { data: finalRecord } = await sbA.from('food_table').select('*').eq('id', foodId).single();
  results.push({
    testId: 'DB-CONCURRENCY-INTEGRITY',
    name: 'Post-Race Final Record Integrity',
    status: finalRecord && finalRecord.status === 'NGO Requested' ? 'PASS' : 'FAIL',
    message: `Final database status: ${finalRecord ? finalRecord.status : 'None'}, NGO: ${finalRecord ? finalRecord.ngo_phone : 'None'}`
  });

  // Cleanup
  await sbA.from('food_table').delete().eq('id', foodId);

  return results;
}

if (require.main === module) {
  testConcurrency().then(r => console.log(JSON.stringify(r, null, 2)));
}

module.exports = { testConcurrency };
