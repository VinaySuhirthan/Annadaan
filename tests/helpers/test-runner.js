/**
 * Annadaan Master Test Orchestrator & HTML/JSON Report Generator
 * Executes all automated test suites, crawls interactions, validates database, and outputs reports.
 */

const fs = require('fs');
const path = require('path');

const { crawlApplication } = require('./crawler');
const { testConnectivity } = require('../database/connectivity.test');
const { testCrud } = require('../database/crud.test');
const { testConcurrency } = require('../database/concurrency.test');
const { testRls } = require('../database/rls.test');
const { testRealtime } = require('../database/realtime.test');
const { testSecrets } = require('../security/secrets.test');
const { testHeaders } = require('../security/headers.test');
const { testAuthenticationSecurity } = require('../security/authentication.test');
const { testBrowserErrors } = require('../performance/browser-errors.test');

const REPORTS_DIR = path.resolve(__dirname, '../../reports');

function generateHtmlReport(summary, allResults, inventory, registry) {
  const timestamp = new Date().toLocaleString();
  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Annadaan QA Automation & Security Test Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 32px 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
    h1 { margin: 0 0 8px 0; font-size: 28px; color: #34d399; }
    .meta { color: #94a3b8; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #1e293b; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; text-align: center; }
    .stat-val { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
    .stat-label { font-size: 13px; text-transform: uppercase; color: #94a3b8; font-weight: 600; }
    .color-pass { color: #10b981; }
    .color-fail { color: #ef4444; }
    .color-warn { color: #f59e0b; }
    .color-blue { color: #38bdf8; }
    h2 { font-size: 20px; color: #e2e8f0; margin: 32px 0 16px; border-left: 4px solid #10b981; padding-left: 12px; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; margin-bottom: 28px; }
    th { text-align: left; padding: 14px 16px; background: #334155; font-size: 13px; text-transform: uppercase; color: #cbd5e1; }
    td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-pass { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .badge-fail { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .badge-warn { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    code { background: #0f172a; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Annadaan Automated QA & Security Report</h1>
        <div class="meta">Target: <code>annadaan.vinaysuhirthan.tech</code> / Local QA Test Suite &bull; Generated: ${timestamp}</div>
      </div>
      <div>
        <span class="badge ${passRate >= 80 ? 'badge-pass' : 'badge-warn'}" style="font-size: 16px; padding: 8px 16px;">Pass Rate: ${passRate}%</span>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val color-blue">${summary.total}</div>
        <div class="stat-label">Total Tests Executed</div>
      </div>
      <div class="stat-card">
        <div class="stat-val color-pass">${summary.passed}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat-card">
        <div class="stat-val color-fail">${summary.failed}</div>
        <div class="stat-label">Failed / Defects</div>
      </div>
      <div class="stat-card">
        <div class="stat-val color-warn">${summary.partial}</div>
        <div class="stat-label">Partial / Blocked</div>
      </div>
    </div>

    <h2>1. Automated Test Execution Results</h2>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Suite</th>
          <th>Test Scenario</th>
          <th>Status</th>
          <th>Latency / Details</th>
        </tr>
      </thead>
      <tbody>
        ${allResults.map(r => `
          <tr>
            <td><code>${r.testId}</code></td>
            <td>${r.suite}</td>
            <td><strong>${r.name}</strong><br><small style="color: #94a3b8;">${r.message || r.error || ''}</small></td>
            <td><span class="badge ${r.status === 'PASS' ? 'badge-pass' : r.status === 'FAIL' ? 'badge-fail' : 'badge-warn'}">${r.status}</span></td>
            <td>${r.duration ? `${r.duration}ms` : r.latency ? `${r.latency}ms` : '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>2. Feature Inventory Registry (${registry.length} Core Modules)</h2>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>Feature</th>
          <th>User Role</th>
          <th>Expected Behavior</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${registry.map(f => `
          <tr>
            <td><code>${f.page}</code></td>
            <td><strong>${f.feature}</strong></td>
            <td><span class="badge badge-pass">${f.userRole}</span></td>
            <td>${f.expectedBehavior}</td>
            <td><span class="badge badge-pass">${f.testStatus}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>3. Crawled Interactive Elements (${inventory.length} Buttons & Controls)</h2>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>Element Label</th>
          <th>Action Type</th>
          <th>Target Handler</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${inventory.slice(0, 30).map(i => `
          <tr>
            <td><code>${i.page}</code></td>
            <td>${i.label}</td>
            <td><span class="badge badge-pass">${i.classification}</span></td>
            <td><code>${i.action.slice(0, 45)}</code></td>
            <td><span class="badge ${i.status.includes('DEFECT') ? 'badge-fail' : 'badge-pass'}">${i.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

async function runAllSuites() {
  console.log('🔍 Annadaan QA: Starting Complete Autonomous Test Suite...\n');

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // 1. Crawler
  const { inventory, featureRegistry } = crawlApplication();
  console.log(`✅ Crawled ${featureRegistry.length} routes and ${inventory.length} interactive elements`);

  const allResults = [];

  // 2. Database Connectivity
  console.log('📡 Testing Database Connectivity & Schema...');
  const conn = await testConnectivity();
  conn.forEach(r => allResults.push({ ...r, suite: 'Database Connectivity' }));

  // 3. Database CRUD Lifecycle
  console.log('💾 Testing Database CRUD & State Transitions...');
  const crud = await testCrud();
  crud.forEach(r => allResults.push({ ...r, suite: 'Database CRUD' }));

  // 4. Database Concurrency & Race Conditions
  console.log('🏎️ Testing Database Race Conditions (Dual-Claim Simulation)...');
  const conc = await testConcurrency();
  conc.forEach(r => allResults.push({ ...r, suite: 'Database Concurrency' }));

  // 5. Database RLS Policies
  console.log('🛡️ Testing Row Level Security Access Controls...');
  const rls = await testRls();
  rls.forEach(r => allResults.push({ ...r, suite: 'Row Level Security' }));

  // 6. Database Realtime Updates
  console.log('⚡ Testing Live Realtime Postgres Changes Delivery...');
  const realtime = await testRealtime();
  realtime.forEach(r => allResults.push({ ...r, suite: 'Realtime Sync' }));

  // 7. Security: Secrets Scan
  console.log('🔐 Scanning Repository for Secret Leaks...');
  const secrets = await testSecrets();
  secrets.forEach(r => allResults.push({ ...r, suite: 'Secret Exposure' }));

  // 8. Security: Production Headers
  console.log('🌐 Inspecting Security Headers on Production...');
  const headers = await testHeaders();
  headers.forEach(r => allResults.push({ ...r, suite: 'Security Headers' }));

  // 9. Security: Authentication Logic
  console.log('🔑 Testing 6-Hour Session Limit & Route Guards...');
  const auth = testAuthenticationSecurity();
  auth.forEach(r => allResults.push({ ...r, suite: 'Authentication Security' }));

  // 10. Performance: Browser Errors & Page Loads
  console.log('🚀 Running Browser Route Integrity & Exception Crawl...');
  const browserErr = await testBrowserErrors();
  browserErr.forEach(r => allResults.push({ ...r, suite: 'Route Integrity' }));

  // Summary Metrics
  const summary = {
    total: allResults.length,
    passed: allResults.filter(r => r.status === 'PASS').length,
    failed: allResults.filter(r => r.status === 'FAIL' || r.status === 'DEFECT').length,
    partial: allResults.filter(r => r.status === 'PARTIAL').length
  };

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${summary.passed}/${summary.total} PASSED (${Math.round((summary.passed/summary.total)*100)}%)`);
  console.log(`❌ Failures / Defects: ${summary.failed}`);
  console.log(`⚠️ Partial / Warnings: ${summary.partial}`);
  console.log('======================================================\n');

  // Write JSON report
  const jsonReportPath = path.join(REPORTS_DIR, 'test-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify({ summary, results: allResults, featureRegistry }, null, 2));

  // Write HTML report
  const htmlReportPath = path.join(REPORTS_DIR, 'test-report.html');
  const htmlContent = generateHtmlReport(summary, allResults, inventory, featureRegistry);
  fs.writeFileSync(htmlReportPath, htmlContent);

  console.log(`📝 Generated HTML Report: ${htmlReportPath}`);
  console.log(`📝 Generated JSON Report: ${jsonReportPath}`);

  return { summary, allResults };
}

if (require.main === module) {
  runAllSuites().then(({ summary }) => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}

module.exports = { runAllSuites };

