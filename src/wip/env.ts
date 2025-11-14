import { readFileSync } from 'fs';
import { resolve } from 'path';

export function loadEnv(filePath: string = '.env'): void {
  const absPath = resolve(filePath);

  let content: string;
  try {
    content = readFileSync(absPath, { encoding: 'utf-8' });
  } catch {
    return;
  }

  const lines = content.split('\n');

  for (let line of lines) {
    line = line.trim();

    if (!line || line.startsWith('#')) continue;

    const [key, ...rest] = line.split('=');
    if (!key) continue;

    let value = rest.join('=').trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
