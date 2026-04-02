import { watch, cpSync, mkdirSync, statSync } from 'node:fs';
import { join, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const srcDir = join(projectRoot, 'src');
const distDir = join(projectRoot, 'dist');

console.log(`Watching for changes in: ${srcDir}...`);

watch(srcDir, { recursive: true }, (eventType, filename) => {
  if (!filename) return;

  const fullSrcPath = join(srcDir, filename);
  const extension = extname(filename);
  const relPath = relative(srcDir, fullSrcPath);
  const fullDistPath = join(distDir, relPath);

  try {
    if (!statSync(fullSrcPath).isFile()) return;
  } catch {
    return;
  }

  if (eventType === 'change') {
    console.log(`File changed: ${relPath}`);

    if (extension === '.ts') {
      handleTypeScript(fullSrcPath);
    } else if (extension === '.html' || extension === '.css') {
      handleStaticAsset(fullSrcPath, fullDistPath, relPath);
    }
  }
});

function handleTypeScript(srcPath: string) {
  console.log(`[TSC] Compiling ${basename(srcPath)}...`);

  exec(
    `npx tsc ${srcPath} --outDir ${distDir} --module esnext --target esnext`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`[TSC ERROR]: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`[TSC STDERR]: ${stderr}`);
        return;
      }
      console.log(`[TSC] Successfully compiled to dist.`);
    }
  );
}

function handleStaticAsset(srcPath: string, distPath: string, relPath: string) {
  try {
    mkdirSync(dirname(distPath), { recursive: true });
    cpSync(srcPath, distPath);
    console.log(`[COPY] Updated ${relPath} in dist.`);
  } catch (err) {
    console.error(`[COPY ERROR]: Could not copy ${relPath}`, err);
  }
}

function basename(path: string) {
  return path.split(/[\\/]/).pop();
}
