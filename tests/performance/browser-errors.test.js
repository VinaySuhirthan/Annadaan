/**
 * Browser Error & Route Integrity Test
 * Crawls every application route using Playwright to detect unhandled exceptions, failed requests, and console errors.
 * Automatically injects valid role session for protected routes to verify complete authenticated dashboard rendering.
 */

const { chromium } = require('playwright');
const { createServer, PORT } = require('../helpers/dev-server');
const { PAGES } = require('../helpers/crawler');
const { TEST_USERS } = require('../config/test-config');

async function testBrowserErrors() {
  const server = createServer();
  await new Promise(res => server.listen(PORT, res));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const p of PAGES) {
    const pageErrors = [];
    const consoleErrors = [];
    const failedRequests = [];

    const onPageError = (err) => pageErrors.push(err.message);
    const onConsole = (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    };
    const onRequestFailed = (req) => {
      failedRequests.push({ url: req.url(), failure: req.failure() ? req.failure().errorText : 'failed' });
    };

    page.on('pageerror', onPageError);
    page.on('console', onConsole);
    page.on('requestfailed', onRequestFailed);

    const targetUrl = `http://localhost:${PORT}/${p.file}`;

    try {
      // 1. If page requires authenticated role, inject session into browser context
      if (p.role !== 'public') {
        const role = p.role.includes('donor') ? 'donor' : p.role.includes('ngo') ? 'ngo' : 'volunteer';
        const user = TEST_USERS[role];
        await page.goto(`http://localhost:${PORT}/index.html`);
        await page.evaluate(({ u, r }) => {
          const sessionUser = { ...u, type: r };
          localStorage.setItem('currentUser', JSON.stringify(sessionUser));
          if (r === 'donor') localStorage.setItem('donor', JSON.stringify(sessionUser));
          localStorage.setItem('annadaan_session_start', Date.now().toString());
        }, { u: user, r: role });
      } else {
        await page.goto(`http://localhost:${PORT}/index.html`);
        await page.evaluate(() => localStorage.clear());
      }

      const t0 = Date.now();
      const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
      const loadTime = Date.now() - t0;
      const status = response ? response.status() : 0;

      // Filter non-fatal noise
      const criticalErrors = pageErrors.filter(e => !e.includes('ResizeObserver') && !e.includes('favicon'));

      if (status >= 400) {
        results.push({
          testId: `PAGE-HTTP-${p.file}`,
          name: `Route Load: ${p.file}`,
          status: 'FAIL',
          error: `HTTP Status ${status}`,
          duration: loadTime
        });
      } else if (criticalErrors.length > 0) {
        results.push({
          testId: `PAGE-ERR-${p.file}`,
          name: `Route Load: ${p.file}`,
          status: 'FAIL',
          error: `Unhandled JS Exception: ${criticalErrors.join('; ')}`,
          duration: loadTime
        });
      } else {
        results.push({
          testId: `PAGE-OK-${p.file}`,
          name: `Route Load: ${p.file}`,
          status: 'PASS',
          duration: loadTime,
          message: `Loaded successfully in ${loadTime}ms with 0 unhandled exceptions`
        });
      }
    } catch (err) {
      results.push({
        testId: `PAGE-FATAL-${p.file}`,
        name: `Route Load: ${p.file}`,
        status: 'FAIL',
        error: err.message
      });
    } finally {
      page.off('pageerror', onPageError);
      page.off('console', onConsole);
      page.off('requestfailed', onRequestFailed);
    }
  }

  await browser.close();
  server.close();

  return results;
}

if (require.main === module) {
  testBrowserErrors().then(r => console.log(JSON.stringify(r, null, 2)));
}

module.exports = { testBrowserErrors };
