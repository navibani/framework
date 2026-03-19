import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import getEnv from './env.js';

function parseUrl(url, absoluteUrl) {
  const fullUrl = new URL(url, absoluteUrl);

  const urlPath = fullUrl.pathname;
  const urlParamaters = fullUrl.searchParams;

  return { urlPath, urlParamaters };
}

function buildFileAccess(urlPath, dirPath) {
  const defaultPath = '/';
  const defaultFileName = 'index.html';

  const isDefaultPath = urlPath === defaultPath;

  const fileName = isDefaultPath ? defaultFileName : urlPath;

  const filePath = path.join(dirPath, fileName);

  return filePath;
}

function findFileExtension(filePath, mimeTypes, plainText) {
  const extname = path.extname(filePath);

  const entension = extname.toLowerCase();

  const contentType = mimeTypes[entension] || plainText;

  return contentType;
}

function metaDataHandling(err, stats, filePath, mimeTypes, res) {
  const plainText = 'text/plain';
  const cannotFindCode = 404;
  const cannotFindMessage = '404 Not Found';

  if (err || stats.isDirectory()) {
    res.writeHead(cannotFindCode, { 'Content-Type': plainText });
    res.end(cannotFindMessage);
    return;
  }

  const contentType = findFileExtension(filePath, mimeTypes, plainText);

  res.writeHead(200, {
    'Content-Type': contentType,
  });

  fs.createReadStream(filePath).pipe(res);
}

function serverHandler(req, res, dirPath, absoluteUrl, mimeTypes) {
  const { urlPath, urlParamaters } = parseUrl(req.url, absoluteUrl);

  const filePath = buildFileAccess(urlPath, dirPath);

  fs.stat(filePath, (err, stats) =>
    metaDataHandling(err, stats, filePath, mimeTypes, res)
  );
}

function startServer() {
  const { dirPath, port, mimeTypes, absoluteUrl } = getEnv();

  const server = http.createServer((req, res) =>
    serverHandler(req, res, dirPath, absoluteUrl, mimeTypes)
  );

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}

startServer();
