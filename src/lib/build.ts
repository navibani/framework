import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';
import { existsSync, mkdirSync, cpSync } from 'node:fs';

function copyAssets(src: string, dest: string): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  console.log(`Copying assets from ${src} to ${dest}...`);

  cpSync(src, dest, {
    recursive: true,
    filter: (sourcePath: string) => {
      const fileName = basename(sourcePath);

      const isDirectory = !fileName.includes('.');
      const isHtml = fileName.endsWith('.html');
      const isCss = fileName.endsWith('.css');

      return isDirectory || isHtml || isCss;
    },
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const sourceDir = join(projectRoot, 'src');
const targetDir = join(projectRoot, 'dist');

copyAssets(sourceDir, targetDir);
