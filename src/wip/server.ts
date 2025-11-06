import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
// Serve from project src folder (one level up from this file: src/)
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/octet-stream'
};

function safeJoin(root: string, requestPath: string) {
  const normalized = path.normalize(decodeURIComponent(requestPath));
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) throw new Error('Forbidden');
  return full;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Allow': 'GET, HEAD' });
      res.end('Method Not Allowed');
      return;
    }

    const host = req.headers.host ?? `localhost:${PORT}`;
    const url = new URL(req.url, `http://${host}`);
    let pathname = url.pathname;

    // Serve index.html for directory requests
    if (pathname.endsWith('/')) pathname += 'index.html';
    if (pathname === '/') pathname = '/index.html';

    // Map empty extensionless paths that point to an html file (optional)
    const ext = path.extname(pathname);
    let filePath = safeJoin(ROOT_DIR, pathname);

    // If the requested path has no extension, try .html
    if (!ext) {
      const tryHtml = `${filePath}.html`;
      if (fs.existsSync(tryHtml)) filePath = tryHtml;
    }

    const stat = await fs.promises.stat(filePath).catch(() => null);
    if (!stat || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const contentType = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';

    // Basic CORS for iframe/resource loading across origins if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', contentType);

    if (req.method === 'HEAD') {
      res.writeHead(200);
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) res.writeHead(500);
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  } catch (err) {
    console.error('Request handling error:', err);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
  }
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${ROOT_DIR}`);
});