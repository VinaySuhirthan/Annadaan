/**
 * Lightweight Built-in Static Server for Annadaan Local QA Testing
 * Serves static HTML, JS, CSS, images with correct MIME types.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const PORT = process.env.TEST_PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function createServer() {
  const server = http.createServer((req, res) => {
    // Strip query parameters
    const safeUrl = req.url.split('?')[0];
    let filePath = path.join(ROOT_DIR, safeUrl === '/' ? 'index.html' : safeUrl);

    // Prevent directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end(`404 Not Found: ${safeUrl}`);
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });
  });

  return server;
}

if (require.main === module) {
  const s = createServer();
  s.listen(PORT, () => {
    console.log(`🚀 Annadaan QA Static Server running at http://localhost:${PORT}`);
  });
}

module.exports = { createServer, PORT };

