/**
 * Annadaan QA Test Fixtures & Attack Probe Data
 */

const { TEST_RUN_ID, TEST_USERS } = require('../config/test-config');

const VALID_DONATION = {
  donor_phone: TEST_USERS.donor.phone,
  donor_type: 'Restaurant / Catering',
  event_name: `Automated QA Test Event (${TEST_RUN_ID})`,
  food_type: 'Fresh Nutritious Vegetarian Meals',
  serves: 45,
  valid_hours: 6,
  address: '404 Innovation Hub, Ground Floor Kitchen Entrance',
  photo_url: 'https://images.unsplash.com/photo-1488459711612-97435f0f0980?auto=format&fit=crop&q=80&w=600',
  status: 'available'
};

const BOUNDARY_DONATIONS = [
  { ...VALID_DONATION, serves: 1, food_type: 'Single Portion Meal' },
  { ...VALID_DONATION, serves: 500, food_type: 'Large Banquet Batch' }
];

const INVALID_DONATIONS = [
  { ...VALID_DONATION, serves: 0, test_label: 'Zero Servings' },
  { ...VALID_DONATION, serves: -10, test_label: 'Negative Servings' },
  { ...VALID_DONATION, food_type: '', test_label: 'Empty Food Type' },
  { ...VALID_DONATION, address: '', test_label: 'Missing Location Address' }
];

// OWASP Security Probes
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '"><svg onload=alert(document.cookie)>',
  'javascript:alert("XSS")'
];

const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1 --",
  "admin'--",
  "1; DROP TABLE donor_table; --",
  "' UNION SELECT NULL, NULL, NULL --"
];

module.exports = {
  VALID_DONATION,
  BOUNDARY_DONATIONS,
  INVALID_DONATIONS,
  XSS_PAYLOADS,
  SQLI_PAYLOADS
};
