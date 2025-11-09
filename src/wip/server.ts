import { createServer } from 'http';
import { promises as fs } from 'fs';
import { join, extname, resolve, sep } from 'path';

const PORT = Number(process.env.PORT) || 3000;
const ROOT = resolve(__dirname);

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
  '.map': 'application/octet-stream',
};

function safeResolve(root: string, requestPath: string) {
  const clean = requestPath.replace(/^\/+/, '');
  const full = resolve(root, clean);
  if (!(full === root || full.startsWith(root + sep)))
    throw new Error('Forbidden');
  return full;
}

const server = createServer(async (req, res) => {
  try {
    const { url, method, headers } = req;
    if (!url || !method) throw new Error('Invalid request');

    const parsedUrl = new URL(url, `http://${headers.host || 'localhost'}`);
    let pathname = parsedUrl.pathname || '/';

    console.log(`${method} ${pathname}`);

    if (pathname === '/') pathname = '/index.html';

    const filePath = safeResolve(ROOT, pathname);
    console.log('Request Path:', pathname, '->', filePath);

    const stat = await fs.stat(filePath).catch(() => null);
    if (!stat || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

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
