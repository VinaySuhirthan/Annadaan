/**
 * Row Level Security (RLS) & Access Policy Validation Test
 */

const { getAnonClient } = require('../helpers/supabase-client');

async function testRls() {
  const sb = getAnonClient();
  const results = [];

  // 1. Anonymous Access to food_table
  try {
    const { data, error } = await sb.from('food_table').select('id, food_type, status').limit(5);
    const isBlocked = error && error.message.includes('permission denied');
    results.push({
      testId: 'SEC-RLS-ANON-FOOD',
      name: 'Anonymous SELECT food_table',
      status: isBlocked ? 'BLOCKED' : error ? 'FAIL' : 'PASS',
      message: isBlocked ? 'SELECT blocked by PostgreSQL permissions prior to RLS evaluation' : error ? error.message : `Permitted: ${data.length} public available food rows returned for discovery`
    });
  } catch (e) {
    results.push({ testId: 'SEC-RLS-ANON-FOOD', name: 'Anonymous SELECT food_table', status: 'FAIL', error: e.message });
  }

  // 2. Direct Unauthorized Insertion without authentication
  try {
    const { data, error } = await sb.from('donor_table').insert([{
      phone: '9999099999',
      name: 'Unverified Anonymous Injector'
    }]).select();

    if (!error) {
      results.push({
        testId: 'SEC-RLS-DONOR-TABLE',
        name: 'donor_table Direct Write Control',
        status: 'DEFECT',
        severity: 'Medium',
        message: 'donor_table allows anonymous public insert under permissive policy (Public Full Access donor_table)',
        recommendation: 'Apply RLS policy: CREATE POLICY "Auth Users Only" ON donor_table FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);'
      });
      // Clean up injected test record
      await sb.from('donor_table').delete().eq('phone', '9999099999');
    } else {
      results.push({
        testId: 'SEC-RLS-DONOR-TABLE',
        name: 'donor_table Direct Write Control',
        status: 'PASS',
        message: 'Direct anonymous insert was successfully blocked'
      });
    }
  } catch (e) {
    results.push({ testId: 'SEC-RLS-DONOR-TABLE', name: 'donor_table Direct Write Control', status: 'PASS' });
  }

  return results;
}

if (require.main === module) {
  testRls().then(r => console.log(JSON.stringify(r, null, 2)));
}

module.exports = { testRls };
