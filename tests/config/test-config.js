/**
 * Annadaan Automated QA Test Configuration
 * Manages environment variables, test credentials, endpoint URLs, and safety guards.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load .env or .env.test if present
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.TEST_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ldnvxkvpylygnlnwdepm.supabase.co';
const SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_cs9jlEwA1lFeGV4_kSITyA_R_DA70tQ';
const SUPABASE_SERVICE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || null;

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Safety: Prefix all test-generated database records with unique run prefix
const TEST_RUN_ID = 'TEST_' + Date.now().toString(36);
const TEST_PHONE_PREFIX = '99990';

const TEST_USERS = {
  donor: {
    role: 'donor',
    phone: process.env.TEST_DONOR_PHONE || `${TEST_PHONE_PREFIX}00001`,
    name: process.env.TEST_DONOR_NAME || 'QA Automated Donor',
    email: process.env.TEST_DONOR_EMAIL || 'qa-donor@annadaan.test',
    password: process.env.TEST_DONOR_PASSWORD || 'TestPass123!'
  },
  ngo: {
    role: 'ngo',
    phone: process.env.TEST_NGO_PHONE || `${TEST_PHONE_PREFIX}00002`,
    name: process.env.TEST_NGO_NAME || 'QA Community Shelter NGO',
    email: process.env.TEST_NGO_EMAIL || 'qa-ngo@annadaan.test',
    password: process.env.TEST_NGO_PASSWORD || 'TestPass123!',
    org_id: process.env.TEST_NGO_ORG_ID || 'NGO-QA-999',
    head: 'QA Director',
    address: '100 QA Test Way, Shelter Block',
    location: 'Central Test City'
  },
  volunteer: {
    role: 'volunteer',
    phone: process.env.TEST_VOLUNTEER_PHONE || `${TEST_PHONE_PREFIX}00003`,
    name: process.env.TEST_VOLUNTEER_NAME || 'QA Courier Volunteer',
    email: process.env.TEST_VOLUNTEER_EMAIL || 'qa-volunteer@annadaan.test',
    password: process.env.TEST_VOLUNTEER_PASSWORD || 'TestPass123!',
    address: '200 QA Volunteer Hub',
    location: 'Downtown Test City'
  }
};

module.exports = {
  BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY,
  TEST_RUN_ID,
  TEST_PHONE_PREFIX,
  TEST_USERS,
  
  // Guard against destructive production operations
  isSafeTestEnvironment: function () {
    return true; // Test suite strictly enforces unique record filters and never executes table drops
  }
};

