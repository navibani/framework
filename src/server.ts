import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (!req.url) {
    throw new Error('Request undefined.');
  }
  
  const fileExtension = path.extname(req.url);

  const filePath =
    fileExtension === '.js'
      ? path.join('./dump/', req.url === '/' ? './index.html' : req.url)
      : path.join('./src/', req.url === '/' ? './index.html' : req.url);

  const ext = path.extname(filePath);

  const contentType =
    {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
    }[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
