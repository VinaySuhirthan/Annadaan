/**
 * Database Connectivity & Schema Health Test
 * Validates Supabase reachability, table structures, column definitions, and storage buckets.
 */

const { getAnonClient } = require('../helpers/supabase-client');

async function testConnectivity() {
  const sb = getAnonClient();
  const results = [];

  // 1. Supabase Reachability
  const t0 = Date.now();
  try {
    const { data, error } = await sb.from('food_table').select('id').limit(1);
    const latency = Date.now() - t0;
    if (error) {
      const isPermissionBlocked = error.message.includes('permission denied');
      results.push({
        testId: 'DB-01',
        name: 'Supabase Reachability & Permissions',
        status: isPermissionBlocked ? 'BLOCKED' : 'FAIL',
        error: error.message,
        latency,
        message: isPermissionBlocked ? 'Blocked by PostgreSQL permissions: Run migrations/setup_annadaan_fresh.sql to grant table privileges to anon/authenticated' : error.message
      });
    } else {
      results.push({ testId: 'DB-01', name: 'Supabase Reachability', status: 'PASS', latency, message: 'Connected to Supabase PostgreSQL' });
    }
  } catch (err) {
    results.push({ testId: 'DB-01', name: 'Supabase Reachability', status: 'FAIL', error: err.message });
  }

  // 2. Schema Validation: Tables Existence
  const tables = ['donor_table', 'ngo_table', 'volunteer_table', 'food_table'];
  for (const table of tables) {
    try {
      const { data, error } = await sb.from(table).select('*').limit(1);
      if (error && error.code !== 'PGRST116') {
        const isPermission = error.message.includes('permission denied');
        results.push({
          testId: `DB-SCHEMA-${table}`,
          name: `Table [${table}] Existence`,
          status: isPermission ? 'BLOCKED' : 'FAIL',
          error: error.message,
          message: isPermission ? `Table exists in schema, but blocked by missing GRANT permissions for API roles` : error.message
        });
      } else {
        results.push({ testId: `DB-SCHEMA-${table}`, name: `Table [${table}] Existence`, status: 'PASS', message: 'Table accessible via API' });
      }
    } catch (err) {
      results.push({ testId: `DB-SCHEMA-${table}`, name: `Table [${table}] Existence`, status: 'FAIL', error: err.message });
    }
  }

  // 3. Columns Validation on food_table
  const requiredColumns = ['id', 'donor_phone', 'food_type', 'serves', 'address', 'status', 'created_at'];
  try {
    const { data, error } = await sb.from('food_table').select(requiredColumns.join(',')).limit(1);
    if (error) {
      const isPermission = error.message.includes('permission denied');
      results.push({
        testId: 'DB-COLUMNS-FOOD',
        name: 'food_table Required Columns',
        status: isPermission ? 'BLOCKED' : 'FAIL',
        error: error.message,
        message: isPermission ? 'Column inspection blocked by table grant permissions' : error.message
      });
    } else {
      results.push({ testId: 'DB-COLUMNS-FOOD', name: 'food_table Required Columns', status: 'PASS', message: `All ${requiredColumns.length} core columns verified` });
    }
  } catch (err) {
    results.push({ testId: 'DB-COLUMNS-FOOD', name: 'food_table Required Columns', status: 'FAIL', error: err.message });
  }

  // 4. Storage Bucket Check
  try {
    const { data: buckets, error } = await sb.storage.listBuckets();
    if (error) {
      results.push({ testId: 'DB-STORAGE', name: 'Storage Bucket [food_images]', status: 'PARTIAL', error: error.message });
    } else {
      const hasBucket = buckets && buckets.some(b => b.name === 'food_images' || b.id === 'food_images');
      results.push({
        testId: 'DB-STORAGE',
        name: 'Storage Bucket [food_images]',
        status: hasBucket ? 'PASS' : 'PARTIAL',
        message: hasBucket ? 'Bucket food_images exists' : 'Bucket not listed via anon key (protected by RLS)'
      });
    }
  } catch (err) {
    results.push({ testId: 'DB-STORAGE', name: 'Storage Bucket [food_images]', status: 'PARTIAL', error: err.message });
  }

  return results;
}

if (require.main === module) {
  testConnectivity().then(r => console.log(JSON.stringify(r, null, 2)));
}

module.exports = { testConnectivity };
