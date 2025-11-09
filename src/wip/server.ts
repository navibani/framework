import {
  createServer,
  IncomingMessage,
  OutgoingMessage,
  ServerResponse,
} from 'http';
import { promises as fs } from 'fs';
import { extname, relative, resolve, sep } from 'path';

const PORT_NUMBER = Number(process.env.PORT) || 3000;

const ROOT_DIR = resolve(__dirname);

const FILE_TYPES: Record<string, string> = {
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

class ExtendedError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'ExtendedError';

    Error.captureStackTrace(this, ExtendedError);
  }
}

function validateRequest(req: IncomingMessage) {
  try {
    const { url, method, headers } = req;

    const hasUrl = url !== undefined;
    const hasMethod = method !== undefined;
    const hasHostHeader = headers.host !== undefined;

    if (!hasUrl) {
      throw new Error('Request URL is missing');
    } else if (!hasMethod) {
      throw new Error('Request method is missing');
    } else if (!hasHostHeader) {
      throw new Error('Host header is missing');
    }

    return { url, method, headers };
  } catch (err) {
    throw new ExtendedError('Invalid request', err);
  }
}

function protectRootDirCheck(root: string, requestPath: string) {
  try {
    const cleanedPath = requestPath.replace(/^\/+/, '');
    const absolutePath = resolve(root, cleanedPath);
    const relativePath = relative(root, absolutePath);

    if (relativePath === '' || !relativePath.startsWith('..')) {
      return absolutePath;
    }
    throw new Error('Forbidden');
  } catch (err) {
    throw new ExtendedError('Root directory protection triggered', err);
  }
}

function getPathname(url: string, headers: IncomingMessage['headers']) {
  try {
    const parsedUrl = new URL(url, `http://${headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname || '/';

    if (pathname === '/') {
      return '/index.html';
    }

    return pathname;
  } catch (err) {
    throw new ExtendedError('Failed to parse URL', err);
  }
}

async function validateFilePath(
  filePath: string,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  }
) {
  try {
    const stats = await fs.stat(filePath).catch(() => null);

    const hasStat = stats !== null;
    const isFile = hasStat && stats!.isFile();

    if (isFile === false) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    }
  } catch (err) {
    throw new ExtendedError('Failed to validate file path', err);
  }
}

function prepareGetHeader(
  filePath: string,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  }
) {
  const ext = extname(filePath).toLowerCase();

  const contentType = FILE_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });
}

async function returnData(
  filePath: string,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  }
) {
  const data = await fs.readFile(filePath);

  res.end(data);
}

const server = createServer(async (req, res) => {
  try {
    const { url, method, headers } = validateRequest(req);

    const isGetMethod = method.toUpperCase() === 'GET';

    if (isGetMethod) {
      const pathname = getPathname(url, headers);

      const filePath = protectRootDirCheck(ROOT_DIR, pathname);

      validateFilePath(filePath, res);

      prepareGetHeader(filePath, res);

      returnData(filePath, res);
    }
  } catch (err) {
    console.error('Serve error:', err);

    const code = (err as Error).message === 'Forbidden' ? 403 : 500;

    res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });

    res.end(code === 403 ? 'Forbidden' : 'Internal Server Error');
  }
});

server.listen(PORT_NUMBER, 'localhost', () => {
  console.log(`Server running at http://localhost:${PORT_NUMBER}/`);
  console.log(`Serving files from ${ROOT_DIR}`);
});
