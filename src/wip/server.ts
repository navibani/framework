// ...existing code...
import { createServer } from 'http';
import { promises as fs } from 'fs';
import { join } from 'path';

const PORT = 3000;

const server = createServer(async (req, res) => {
  try {
    const { url, method, headers } = req;
    if (!url || !method) throw new Error('Invalid request');

    const parsedUrl = new URL(url, `http://${headers.host}`);
    let pathname = parsedUrl.pathname || '/';

    // serve ./index.html for root
    if (pathname === '/') pathname = '/index.html';

    const filePath = join(__dirname, pathname.replace(/^\//, ''));
    console.log('Request Path:', pathname, '->', filePath);

    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  } catch (err) {
    console.error('Serve error:', err);
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(PORT, 'localhost', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
// ...existing code...
