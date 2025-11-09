import { createServer } from 'http';
import { parse } from 'url';

const PORT = 3000;

const server = createServer((req, res) => {
  try {
    const { url, method, headers } = req;

    if (url === undefined || method === undefined) {
      throw new Error('Invalid request');
    }

    const parsedUrl = new URL(url, `http://${headers.host}`);
    const pathname = parsedUrl.pathname || '/';

    console.log('Request Path:', pathname);

    console.group(url + ' ' + method);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Hello, World!\n');
  } catch (error) {}
});

server.listen(PORT, 'localhost', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
