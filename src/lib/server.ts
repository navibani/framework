import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export default function createServer(
  clientDir: string,
  mimeTypes: Record<string, string>
) {
  const httpServer = http.createServer((request, response) => {
    const homePath = '/';
    const homeFileName = 'index.html';
    const streamType = 'application/octet-stream';
    const notFoundCode = 404;
    const protectedCode = 403;
    const successCode = 200;
    const emptyChar = '';

    const urlPath =
      request.url === homePath ? homeFileName : request.url || emptyChar;

    const filePath = path.join(clientDir, urlPath);

    const hasPrefix = filePath.startsWith(clientDir);

    if (!hasPrefix) {
      const message = 'Forbidden';

      response.writeHead(protectedCode);
      response.end(message);
      return;
    }

    const extension = path.extname(filePath);
    const isLowerCase = extension.toLowerCase();

    const contentType = mimeTypes[isLowerCase] || streamType;

    fs.readFile(filePath, (err, data) => {
      if (err) {
        const responseConfig = { 'Content-Type': 'text/plain' };
        const message = '404 Not Found';

        response.writeHead(notFoundCode, responseConfig);
        response.end(message);
        return;
      }

      const regularConfig = { 'Content-Type': contentType };

      response.writeHead(successCode, regularConfig);
      response.end(data);
    });
  });

  return httpServer;
}
