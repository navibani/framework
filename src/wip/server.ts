// ...existing code...
import { createServer } from 'http';
import { promises as fs } from 'fs';
import { join, resolve, sep, extname } from 'path';

const PORT = Number(process.env.PORT) || 3000;
// serve from current working dir by default (start node in the folder you want to serve)
const ROOT = process.env.SERVE_DIR
  ? resolve(process.env.SERVE_DIR)
  : process.cwd();

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function safeJoin(root: string, requestPath: string) {
  const clean = decodeURIComponent(requestPath).replace(/^\/+/, '');
  const full = resolve(root, clean);
  if (!(full === root || full.startsWith(root + sep)))
    throw new Error('Forbidden');
  return full;
}

const server = createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) throw new Error('Invalid request');

    const parsed = new URL(
      req.url,
      `http://${req.headers.host || 'localhost'}`
    );
    let pathname = parsed.pathname || '/';

    // root -> ./index.html in the working folder
    let filePath: string;
    if (pathname === '/') {
      filePath = join(ROOT, 'index.html');
    } else {
      filePath = safeJoin(ROOT, pathname);
      // if path has no extension, try .html
      if (!extname(filePath)) {
        const tryHtml = `${filePath}.html`;
        try {
          const stat = await fs.stat(tryHtml);
          if (stat.isFile()) filePath = tryHtml;
        } catch {
          /* ignore */
        }
      }
    }

    console.log('Serve:', pathname, '->', filePath);

    const stat = await fs.stat(filePath).catch(() => null);
    if (!stat || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const contentType =
      MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    const data = await fs.readFile(filePath);
    res.end(data);
  } catch (err) {
    console.error('Serve error:', err);
    const code = (err as Error).message === 'Forbidden' ? 403 : 500;
    res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(code === 403 ? 'Forbidden' : 'Internal Server Error');
  }
});

server.listen(PORT, 'localhost', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${ROOT}`);
});
// ...existing code...
