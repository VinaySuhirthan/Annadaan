# Annadaan — Autonomous QA, Database Validation & Security Testing Framework

A production-grade, multi-suite automated testing infrastructure built for **Annadaan**. It autonomously validates all three operational roles (Donor, NGO, Volunteer), crawls and tests all interactive elements, validates live Supabase database CRUD & Realtime Postgres Changes, performs OWASP-aligned security scans, and generates actionable HTML and JSON reports.

---

## 1. Test Architecture Overview

```text
Annadaan/
├── tests/
│   ├── e2e/                           # Browser Automation (Playwright)
│   │   ├── authentication.spec.js     # OTP, Google OAuth, Session 6-hr, Logout
│   │   ├── donation-workflow.spec.js  # Full 3-Role Lifecycle (Donor -> NGO -> Courier)
│   │   ├── navigation.spec.js         # Desktop & Mobile Drawer, Tabs, Feature Guide FAB
│   │   └── forms.spec.js              # Boundaries, Phone Regex, Serving Limits
│   │
│   ├── database/                      # Supabase Data Layer
│   │   ├── connectivity.test.js       # Reachability, Schema, Columns, Buckets
│   │   ├── crud.test.js               # Isolated Create, Read, Update, Delete
│   │   ├── concurrency.test.js        # Race Conditions (Dual-Claim Simulation)
│   │   ├── rls.test.js                # Row Level Security Policy Verification
│   │   └── realtime.test.js           # Live WebSocket Postgres Changes Latency
│   │
│   ├── security/                      # Defensive OWASP Probes
│   │   ├── secrets.test.js            # Repository Key Leakage Scanner
│   │   ├── headers.test.js            # HSTS, CSP, X-Frame-Options, NoSniff
│   │   └── authentication.test.js     # 6-Hour Rule, Scope: Local, Route Guards
│   │
│   ├── performance/                   # Performance & Stability
│   │   └── browser-errors.test.js     # 15-Route Zero-Crash Crawler (Exceptions, 404s)
│   │
│   ├── fixtures/                      # Test Payloads & Probes
│   ├── helpers/                       # Crawler, Supabase Admin, Static Dev Server
│   ├── config/                        # Test Environment Configuration
│   └── dashboard/                     # Local Dev Testing Dashboard
│
├── reports/                           # Output HTML & JSON Reports
│   ├── test-report.html               # Interactive Executive Summary & Diagnostics
│   ├── test-report.json               # Structured Machine-Readable Results
│   ├── interaction-inventory.json     # 100+ Crawled Buttons, Links, and Forms
│   └── feature-registry.json          # 15 Implemented Page Feature Matrix
│
├── playwright.config.js               # Playwright Multi-Device Config
└── package.json                       # Test Scripts & Automation Orchestrators
```

---

## 2. Test Accounts & Isolation Safety

### Strict Production Data Safety Rules
- All test food donations use the event prefix: `Automated QA Test Event (TEST_...)`.
- All test accounts use reserved test phone prefixes: `99990xxxxx`.
- **Automatic Cleanup Fixture**: At the end of each test run, `cleanupTestData()` queries only records starting with `99990` or test IDs and removes them. **Real donor or shelter data is never touched or deleted.**

### Configuration
Copy `.env.test.example` to `.env.test`:
```bash
cp .env.test.example .env.test
```

Environment Variables:
```env
TEST_BASE_URL=http://localhost:3000
TEST_SUPABASE_URL=https://ldnvxkvpylygnlnwdepm.supabase.co
TEST_SUPABASE_ANON_KEY=sb_publishable_cs9jlEwA1lFeGV4_kSITyA_R_DA70tQ
```

---

## 3. Execution Commands

### Run Everything with One Command
Executes all database, security, route integrity, and interaction suites:

**npm:**
```bash
npm run test:all
```

**Windows PowerShell:**
```powershell
node tests/helpers/test-runner.js
```

### Run Specific Test Suites

| Test Suite | Command (npm) | PowerShell Equivalent | Description |
| :--- | :--- | :--- | :--- |
| **All Suites** | `npm run test:all` | `node tests/helpers/test-runner.js` | Full autonomous execution + HTML/JSON report generation |
| **Smoke Tests** | `npm run test:smoke` | `node tests/database/connectivity.test.js; node tests/security/secrets.test.js` | Fast health check (Supabase + Secrets) |
| **Browser E2E** | `npm run test:ui` | `npx playwright test` | Headless Playwright multi-role browser automation |
| **Database** | `npm run test:database` | `node tests/database/connectivity.test.js; node tests/database/crud.test.js; node tests/database/concurrency.test.js; node tests/database/rls.test.js` | Schema, CRUD, Race conditions, and RLS checks |
| **Realtime Sync** | `npm run test:realtime` | `node tests/database/realtime.test.js` | WebSocket subscription latency and live event reception |
| **Security** | `npm run test:security` | `node tests/security/secrets.test.js; node tests/security/headers.test.js; node tests/security/authentication.test.js` | OWASP secrets scan, headers, and session boundaries |
| **Performance** | `npm run test:performance` | `node tests/performance/browser-errors.test.js` | 15-Route crawler checking for 0 unhandled JS exceptions |
| **Interactive Dashboard**| `npm run test:dashboard` | `node tests/helpers/dev-server.js` | Launches local dashboard at `http://localhost:3000/tests/dashboard/` |

---

## 4. Reading Test Reports

After running `npm run test:all`, reports are generated in the `reports/` folder:

1. **Interactive HTML Dashboard**:
   Open `reports/test-report.html` in any web browser.
   - Summary stat cards: Total, Passed, Failed, and Partial tests.
   - Detailed breakdown per test ID with millisecond execution latency.
   - Feature Registry table detailing implemented features.
   - Crawled Interactive Element index covering all buttons and form controls.

2. **JSON Output**:
   Inspect `reports/test-report.json` for CI/CD integration and automated pipeline gates.

---

## 5. Troubleshooting Realtime & Security Findings

### Troubleshooting Realtime Event Timeouts
If `tests/database/realtime.test.js` times out:
1. Verify `supabase_realtime` publication includes `food_table` in Supabase SQL editor:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.food_table;
   ```
2. Check Supabase Dashboard -> Database -> Publications -> `supabase_realtime` -> ensure `food_table` toggle is ON.

### Interpreting Security Findings
- **Secret Leaks (`SEC-SECRET-SCAN`)**: Scans git-tracked files for raw secrets. Note that `sb_publishable_...` is public and intended for browser client initialization when Row Level Security is enabled. Private service-role keys must NEVER be committed.
- **Security Headers (`SEC-HEADER-...`)**: Checks production deployment (`annadaan.vinaysuhirthan.tech`). Security headers (HSTS, CSP, X-Frame-Options) can be configured via `vercel.json` headers configuration.

