import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function loadEnv() {
  const envPath = '.env';
  const cwd = process.cwd();
  const characterEncode = 'utf-8';
  const lineEnd = '\n';
  const localHost = 'http://localhost';
  const objectType = '{}';

  const filePath = path.resolve(cwd, envPath);

  const pathExists = fs.existsSync(filePath);

  if (!pathExists) {
    const message = `File cannot be found at ${envPath}.`;

    throw new Error(message);
  }

  const fileContent = fs.readFileSync(filePath, characterEncode);

  const fileLines = fileContent.split(lineEnd);

  fileLines.forEach((line) => {
    const emptyLine = '';
    const commentDelimiter = '#';
    const keyValueDelimiter = '=';

    const trimmedLine = line.trim();

    const isEmptyLine = trimmedLine === emptyLine;

    const isCommentLine = trimmedLine.startsWith(commentDelimiter);

    const isInvalidLine = isEmptyLine || isCommentLine;

    if (!isInvalidLine) {
      const commentRegex = /^['"]|['"]$/g;

      const [key, ...values] = trimmedLine.split(keyValueDelimiter);
      const trimmedKey = key.trim();
      const value = values.join(keyValueDelimiter);
      const trimmedValue = value.trim();

      const hasKey = trimmedKey !== emptyLine;

      if (hasKey) {
        const cleanedValues = trimmedValue.replace(commentRegex, emptyLine);

        process.env[trimmedKey] = cleanedValues;
      }
    }
  });

  const port = Number(process.env.PORT) || 3000;

  const absoluteUrl = process.env.ABSOLUTE_URL || localHost;

  const mimeTypes: Record<string, string> = JSON.parse(
    process.env.MIME_TYPES || objectType
  );

  return { port, absoluteUrl, mimeTypes };
}

function createServer() {
  const env = loadEnv();

  const { port, absoluteUrl, mimeTypes } = env;

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

  httpServer.listen(port, () => {
    const message = `Server running at ${absoluteUrl}:${port}/`;

    console.log(message);
  });

  return httpServer;
}

export default function createApplication() {
  const server = createServer();

  return {
    server,
  };
}
