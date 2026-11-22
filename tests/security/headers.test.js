/**
 * HTTP Security Headers Inspection Test
 * Validates Content-Security-Policy, HSTS, X-Content-Type-Options, Frame Protection
 */

const https = require('https');

async function testHeaders(targetUrl = 'https://annadaan.vinaysuhirthan.tech') {
  const results = [];

  return new Promise((resolve) => {
    https.get(targetUrl, (res) => {
      const headers = res.headers;

      // 1. Strict-Transport-Security (HSTS)
      if (headers['strict-transport-security']) {
        results.push({ testId: 'SEC-HEADER-HSTS', name: 'Strict-Transport-Security (HSTS)', status: 'PASS', value: headers['strict-transport-security'] });
      } else {
        results.push({ testId: 'SEC-HEADER-HSTS', name: 'Strict-Transport-Security (HSTS)', status: 'DEFECT', severity: 'Medium', message: 'Missing HSTS header on production domain' });
      }

      // 2. X-Content-Type-Options
      if (headers['x-content-type-options'] === 'nosniff') {
        results.push({ testId: 'SEC-HEADER-NOSNIFF', name: 'X-Content-Type-Options', status: 'PASS', value: 'nosniff' });
      } else {
        results.push({ testId: 'SEC-HEADER-NOSNIFF', name: 'X-Content-Type-Options', status: 'DEFECT', severity: 'Low', message: 'Missing or weak X-Content-Type-Options: nosniff' });
      }

      // 3. X-Frame-Options / Clickjacking Protection
      if (headers['x-frame-options']) {
        results.push({ testId: 'SEC-HEADER-FRAME', name: 'X-Frame-Options', status: 'PASS', value: headers['x-frame-options'] });
      } else {
        results.push({ testId: 'SEC-HEADER-FRAME', name: 'X-Frame-Options', status: 'PARTIAL', severity: 'Low', message: 'Consider adding X-Frame-Options: SAMEORIGIN to prevent framing attacks' });
      }

      // 4. Content-Security-Policy (CSP)
      if (headers['content-security-policy']) {
        results.push({ testId: 'SEC-HEADER-CSP', name: 'Content-Security-Policy (CSP)', status: 'PASS', value: headers['content-security-policy'] });
      } else {
        results.push({ testId: 'SEC-HEADER-CSP', name: 'Content-Security-Policy (CSP)', status: 'DEFECT', severity: 'Medium', message: 'Missing Content-Security-Policy header' });
      }

      resolve(results);
    }).on('error', (err) => {
      results.push({ testId: 'SEC-HEADER-CONN', name: 'Production Headers Connectivity', status: 'FAIL', error: err.message });
      resolve(results);
    });
  });
}

if (require.main === module) {
  testHeaders().then(r => console.log(JSON.stringify(r, null, 2)));
}

module.exports = { testHeaders };

