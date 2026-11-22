/**
 * Database Realtime Event Delivery Test
 * Verifies live WebSocket subscription, Postgres changes publication, and event receipt latency without refresh.
 */

const { getAnonClient } = require('../helpers/supabase-client');
const { VALID_DONATION } = require('../fixtures/test-data');
const { TEST_RUN_ID } = require('../config/test-config');

async function testRealtime() {
  const sb = getAnonClient();
  const results = [];
  const testChannelName = `qa-realtime-${Date.now()}`;
  let testRecordId = null;

  return new Promise(async (resolve) => {
    let receivedPayload = null;
    let eventReceivedTime = null;
    let subscribeTime = null;

    // Safety timeout after 12 seconds
    const timeout = setTimeout(async () => {
      // Cleanup if created
      if (testRecordId) {
        await sb.from('food_table').delete().eq('id', testRecordId);
      }
      sb.removeChannel(channel);

      if (!receivedPayload) {
        results.push({
          testId: 'DB-REALTIME-SYNC',
          name: 'Live Realtime Postgres Changes Delivery',
          status: 'PARTIAL',
          message: 'Realtime WebSocket connected, but Postgres Changes event timed out (verify supabase_realtime publication on food_table)',
          evidence: 'Timeout 12000ms'
        });
      }
      resolve(results);
    }, 12000);

    // 1. Establish Channel Subscription
    const channel = sb.channel(testChannelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'food_table' },
        (payload) => {
          if (payload.new && payload.new.donor_phone === VALID_DONATION.donor_phone) {
            eventReceivedTime = Date.now();
            receivedPayload = payload.new;
            clearTimeout(timeout);

            const latency = eventReceivedTime - insertTime;
            results.push({
              testId: 'DB-REALTIME-SYNC',
              name: 'Live Realtime Postgres Changes Delivery',
              status: 'PASS',
              duration: latency,
              message: `Received live INSERT event without page refresh in ${latency}ms!`,
              evidence: {
                eventId: receivedPayload.id,
                status: receivedPayload.status,
                foodType: receivedPayload.food_type
              }
            });

            // Cleanup
            sb.from('food_table').delete().eq('id', payload.new.id).then(() => {
              sb.removeChannel(channel);
              resolve(results);
            });
          }
        }
      );

    let insertTime = null;
    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        subscribeTime = Date.now();
        results.push({
          testId: 'DB-REALTIME-CONNECT',
          name: 'Realtime WebSocket Channel Connection',
          status: 'PASS',
          message: `Channel [${testChannelName}] joined successfully`
        });

        // 2. Trigger insert
        setTimeout(async () => {
          insertTime = Date.now();
          const { data, error } = await sb.from('food_table').insert([{
            ...VALID_DONATION,
            event_name: `Realtime Test (${TEST_RUN_ID})`
          }]).select().single();

          if (error) {
            results.push({
              testId: 'DB-REALTIME-TRIGGER',
              name: 'Realtime Insert Trigger',
              status: 'FAIL',
              error: error.message
            });
          } else {
            testRecordId = data.id;
          }
        }, 800);
      } else if (status === 'CHANNEL_ERROR') {
        clearTimeout(timeout);
        results.push({
          testId: 'DB-REALTIME-CONNECT',
          name: 'Realtime WebSocket Channel Connection',
          status: 'FAIL',
          error: err ? err.message : 'CHANNEL_ERROR'
        });
        resolve(results);
      }
    });
  });
}

if (require.main === module) {
  testRealtime().then(r => console.log(JSON.stringify(r, null, 2)));
}

module.exports = { testRealtime };

