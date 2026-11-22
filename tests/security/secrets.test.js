/**
 * Secret Exposure & Credential Leak Scanner
 * Scans all repository source files for accidental exposure of private secrets, service role keys, and OAuth credentials.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');

const SENSITIVE_PATTERNS = [
  { name: 'Supabase Service Role Key', regex: /eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}service_role/i, severity: 'Critical' },
  { name: 'Google OAuth Client Secret', regex: /GOCSPX-[a-zA-Z0-9_-]{20,}/, severity: 'Critical' },
  { name: 'Generic Private Key', regex: /-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/, severity: 'Critical' },
  { name: 'Exposed Supabase Secret String', regex: /sb_secret_[a-zA-Z0-9_-]{10,}/, severity: 'Critical' }
];

const IGNORED_DIRS = ['node_modules', '.git', 'test-results', 'playwright-report', 'reports'];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (IGNORED_DIRS.includes(file)) continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function testSecrets() {
  const files = getAllFiles(ROOT_DIR);
  const results = [];
  let leakedSecretsFound = 0;

  for (const filePath of files) {
    const relPath = path.relative(ROOT_DIR, filePath);
    // Ignore .env files since they are in .gitignore
    if (relPath.startsWith('.env')) continue;

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.regex.test(content)) {
          leakedSecretsFound++;
          results.push({
            testId: 'SEC-LEAK-' + pattern.name.replace(/\s+/g, '-').toUpperCase(),
            name: `Secret Exposure: ${pattern.name}`,
            status: 'FAIL',
            severity: pattern.severity,
            file: relPath,
            message: `CRITICAL DEFECT: ${pattern.name} found in tracked file ${relPath}`,
            recommendation: `Immediately revoke key and move to safe server-side environment variables.`
          });
        }
      }
    } catch (e) {
      // binary file or read error, ignore
    }
  }

  if (leakedSecretsFound === 0) {
    results.push({
      testId: 'SEC-SECRET-SCAN',
      name: 'Repository Secrets Scan',
      status: 'PASS',
      message: `Scanned ${files.length} repository source files. Zero service-role keys, OAuth secrets, or private tokens leaked.`
    });
  }

  return results;
}

if (require.main === module) {
  testSecrets().then(r => console.log(JSON.stringify(r, null, 2)));
}

module.exports = { testSecrets };

