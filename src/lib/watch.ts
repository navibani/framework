import { exec } from 'node:child_process';
import { unlinkSync, existsSync, mkdirSync, cpSync, statSync } from 'node:fs';
import { dirname, basename, join } from 'node:path';
import { watch } from 'node:fs';
import { extname, relative } from 'node:path';

function runTsc(file: string, srcDir: string, distDir: string) {
  const flags = [
    `--outDir ${distDir}`,
    `--rootDir ${srcDir}`,
    `--module esnext`,
    `--target esnext`,
    `--moduleResolution node`,
    `--esModuleInterop`,
    `--skipLibCheck`,
    `--allowSyntheticDefaultImports`,
  ];

  const joined = flags.join(' ');

  const command = `npx tsc ${file} ${joined}`;

  exec(command, (error, stdout, stderr) => {
    const baseName = basename(file);

    if (error) {
      const message = `[TSC ERROR] ${baseName}:\n${
        stdout || stderr || error.message
      }`;

      console.error(message);

      return;
    }

    const message = `[TSC] Compiled: ${baseName}`;

    console.log(message);
  });
}

function removeFile(path: string) {
  const doesExists = existsSync(path);

  if (doesExists) {
    unlinkSync(path);
  }
}

function isDebounced(
  path: string,
  map: Map<string, number>,
  ms = 100
): boolean {
  const now = Date.now();
  const mappedPath = map.get(path);
  const last = mappedPath || 0;

  const current = now - last < ms;

  if (current) return true;

  map.set(path, now);

  return false;
}

function isActualFile(path: string): boolean {
  try {
    const stat = statSync(path);

    const isAFile = stat.isFile();

    return isAFile;
  } catch {
    return false;
  }
}

//

function handleDeletion(relPath: string, fullDistPath: string, isTs: boolean) {
  const message = `[WATCHER] Removing from dist: ${relPath}`;

  console.warn(message);

  removeFile(fullDistPath);

  if (isTs) {
    const tsRegex = /\.ts$/;
    const jsExtension = '.js';

    removeFile(fullDistPath.replace(tsRegex, jsExtension));
  }
}

function handleUpsert(
  fullSrcPath: string,
  fullDistPath: string,
  relPath: string,
  srcDir: string,
  distDir: string,
  isTs: boolean
) {
  const isAFile = isActualFile(fullSrcPath);

  if (!isAFile) return;

  const webExtensions = ['.html', '.css'];

  const fileExtension = extname(fullSrcPath);

  const hasExtension = webExtensions.includes(fileExtension);

  if (isTs) {
    runTsc(fullSrcPath, srcDir, distDir);
  } else if (hasExtension) {
    try {
      const dirName = dirname(fullDistPath);
      const dirConfig = { recursive: true };
      const message = `[COPY] Synced: ${relPath}`;

      mkdirSync(dirName, dirConfig);

      cpSync(fullSrcPath, fullDistPath);

      console.log(message);
    } catch (err) {
      const message = `[COPY ERROR]: ${relPath}`;

      console.error(message, err);
    }
  }
}

export default function startWatcher(srcDir: string, distDir: string) {
  const debounceMap = new Map<string, number>();
  const message = `[WATCHER] Monitoring changes in: ${srcDir}...`;
  const dirConfig = { recursive: true };

  console.log(message);

  watch(srcDir, dirConfig, (eventType, filename) => {
    if (!filename) return;

    const fileExtension = extname(filename);

    const fullSrcPath = join(srcDir, filename);
    const fullDistPath = join(distDir, filename);
    const relPath = relative(srcDir, fullSrcPath);
    const isTs = fileExtension === '.ts';

    const hasPath = existsSync(fullSrcPath);

    if (!hasPath) {
      const detected = handleDeletion(relPath, fullDistPath, isTs);

      return detected;
    }

    const hasBounced = isDebounced(fullSrcPath, debounceMap);

    if (hasBounced) return;

    handleUpsert(fullSrcPath, fullDistPath, relPath, srcDir, distDir, isTs);
  });
}
