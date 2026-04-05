import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export default function createServer(
  projectRoot: string,
  mimeTypes: Record<string, string>
) {
  const clientDir = path.join(projectRoot, 'dist', 'client');

  const httpServer = http.createServer((request, response) => {
    const homePath = '/';
    const homeFileName = 'index.html';
    const streamType = 'application/octet-stream';
    const notFoundCode = 404;
    const successCode = 200;

    const urlPath = request.url === homePath ? homeFileName : request.url || '';
    const filePath = path.join(clientDir, urlPath);

    if (!filePath.startsWith(clientDir)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || streamType;

    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.writeHead(notFoundCode, { 'Content-Type': 'text/plain' });
        response.end('404 Not Found');
        return;
      }
      response.writeHead(successCode, { 'Content-Type': contentType });
      response.end(data);
    });
  });

  return httpServer;
}
