import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import loadEnv from './env.js';

function createServer(mimeTypes: Record<string, string>) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const httpServer = http.createServer((request, response) => {
    const homePath = '/';
    const homeFileName = '/index.html';
    const emptyLine = '';
    const streamType = 'application/octet-stream';
    const notFoundCode = 404;
    const plainType = { 'Content-Type': 'text/plain' };
    const notFoundMessage = '404 Not Found';
    const successCode = 200;

    const urlPath =
      request.url === homePath ? homeFileName : request.url || emptyLine;

    const filePath = path.join(__dirname, urlPath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || streamType;
    const contentTypeObject = { 'Content-Type': contentType };

    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.writeHead(notFoundCode, plainType);
        response.end(notFoundMessage);
        return;
      }
      response.writeHead(successCode, contentTypeObject);
      response.end(data);
    });
  });

  return httpServer;
}

export default function createApplication() {
  const env = loadEnv();

  const { port, absoluteUrl, mimeTypes } = env;

  const server = createServer(mimeTypes);

  server.listen(port, () => {
    const message = `Server running at ${absoluteUrl}:${port}/`;

    console.log(message);
  });

  return {
    server,
  };
}
