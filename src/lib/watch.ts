import {
  watch,
  cpSync,
  mkdirSync,
  statSync,
  existsSync,
  unlinkSync,
} from 'node:fs';
import { join, relative, dirname, extname, basename } from 'node:path';
import { exec } from 'node:child_process';

function handleTypeScript(srcPath: string, srcDir: string, distDir: string) {
  const fileName = basename(srcPath);

  const command =
    `npx tsc ${srcPath} --outDir ${distDir} --rootDir ${srcDir} ` +
    `--module esnext --target esnext --moduleResolution node ` +
    `--esModuleInterop --skipLibCheck --allowSyntheticDefaultImports`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(
        `[TSC ERROR] ${fileName}:\n${stdout || stderr || error.message}`
      );
      return;
    }
    console.log(`[TSC] Compiled: ${fileName}`);
  });
}

function handleStaticAsset(srcPath: string, distPath: string, relPath: string) {
  try {
    mkdirSync(dirname(distPath), { recursive: true });
    cpSync(srcPath, distPath);
    console.log(`[COPY] Synced: ${relPath}`);
  } catch (err) {
    console.error(`[COPY ERROR]: ${relPath}`, err);
  }
}

export default function startWatcher(projectRoot: string) {
  const srcDir = join(projectRoot, 'src');
  const distDir = join(projectRoot, 'dist');

  console.log(`[WATCHER] Monitoring changes in: ${srcDir}...`);

  const debounceMap = new Map<string, number>();

  watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    const fullSrcPath = join(srcDir, filename);
    const extension = extname(filename);
    const relPath = relative(srcDir, fullSrcPath);
    const fullDistPath = join(distDir, relPath);

    if (!existsSync(fullSrcPath)) {
      if (existsSync(fullDistPath)) {
        console.warn(
          `[WATCHER] File deleted in src, removing from dist: ${relPath}`
        );
        unlinkSync(fullDistPath);
      }

      if (extension === '.ts') {
        const jsPath = fullDistPath.replace(/\.ts$/, '.js');
        if (existsSync(jsPath)) unlinkSync(jsPath);
      }
      return;
    }

    const now = Date.now();
    if (
      debounceMap.has(fullSrcPath) &&
      now - debounceMap.get(fullSrcPath)! < 100
    )
      return;
    debounceMap.set(fullSrcPath, now);

    try {
      if (!statSync(fullSrcPath).isFile()) return;
    } catch {
      return;
    }

    if (extension === '.ts') {
      handleTypeScript(fullSrcPath, srcDir, distDir);
    } else if (extension === '.html' || extension === '.css') {
      handleStaticAsset(fullSrcPath, fullDistPath, relPath);
    }
  });
}
