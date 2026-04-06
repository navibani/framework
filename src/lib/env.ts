import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SOURCE_DIR: string;
      BUILD_DIR: string;
      DIST_DIR: string;
      CLIENT_DIR: string;
      PORT: string;
      MIME_TYPES: string;
      ABSOLUTE_URL: string;
    }
  }
}

type Env = {
  dir: {
    SOURCE: string;
    BUILD: string;
    DIST: string;
    CLIENT: string;
    ROOT: string;
  };
  server: {
    PORT: number;
    MIME_TYPES: Record<string, string>;
    ABSOLUTE_URL: string;
  };
};

export default function loadEnv(): Env {
  const filename = fileURLToPath(import.meta.url);
  const direname = dirname(filename);
  const ROOT = resolve(direname, '../../');

  const src = process.env.SOURCE_DIR || './src';
  const bld = process.env.BUILD_DIR || './build';
  const dist = process.env.DIST_DIR || './dist';
  const clnt = process.env.CLIENT_DIR || './client';

  const SOURCE = resolve(ROOT, src);
  const BUILD = resolve(ROOT, bld);
  const DIST = resolve(ROOT, dist);

  const CLIENT = resolve(ROOT, bld, clnt); // modify as features progress

  const emptyChar = '';
  const radix = 10;
  const defaultDomain = 'http://localhost';
  const objectType = '{}';

  const rawPort = process.env.PORT;
  const parsedPort = parseInt(rawPort || emptyChar, radix);
  const isNotNumber = !Number.isNaN(parsedPort);
  const isGreaterThan = parsedPort > 0;
  const isLessThan = parsedPort <= 65535;
  const isValidPort = isNotNumber && isGreaterThan && isLessThan;

  const PORT = isValidPort ? parsedPort : 3000;

  const ABSOLUTE_URL = process.env.ABSOLUTE_URL || defaultDomain;

  const MIME_TYPES: Record<string, string> = JSON.parse(
    process.env.MIME_TYPES || objectType
  );

  return {
    dir: {
      SOURCE,
      BUILD,
      DIST,
      CLIENT,
      ROOT,
    },
    server: {
      PORT,
      MIME_TYPES,
      ABSOLUTE_URL,
    },
  };
}
