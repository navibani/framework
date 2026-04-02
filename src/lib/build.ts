import { fileURLToPath } from 'node:url';
import { dirname, join, relative, basename, extname } from 'node:path';
import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!existsSync(dirPath)) return [];
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const absolute = join(dirPath, file);
    if (statSync(absolute).isDirectory()) {
      getAllFiles(absolute, arrayOfFiles);
    } else {
      arrayOfFiles.push(absolute);
    }
  });
  return arrayOfFiles;
}

function syncProject(srcDir: string, distDir: string): void {
  const srcFiles = getAllFiles(srcDir);

  srcFiles.forEach((srcFile) => {
    const relPath = relative(srcDir, srcFile);
    const extension = extname(srcFile);
    const base = basename(srcFile, extension);
    const dir = dirname(relPath);

    if (extension === '.html' || extension === '.css') {
      const destFile = join(distDir, relPath);
      const needsUpdate =
        !existsSync(destFile) ||
        statSync(srcFile).mtime > statSync(destFile).mtime;

      if (needsUpdate) {
        console.log(`[ASSET] Syncing: ${relPath}`);
        mkdirSync(dirname(destFile), { recursive: true });
        cpSync(srcFile, destFile);
      }
    }

    if (extension === '.ts') {
      const expectedJsPath = join(distDir, dir, `${base}.js`);

      if (!existsSync(expectedJsPath)) {
        console.warn(
          `[MISSING] ${relPath} has no compiled JS in dist. Run tsc!`
        );
      } else {
        const tsTime = statSync(srcFile).mtime;
        const jsTime = statSync(expectedJsPath).mtime;

        if (tsTime > jsTime) {
          console.warn(
            `[OUTDATED] ${relPath} is newer than its compiled JS. Run tsc!`
          );
        }
      }
    }
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

const sourceRoot = join(projectRoot, 'src');
const targetRoot = join(projectRoot, 'dist');

console.log('--- Checking Build Integrity ---');
syncProject(sourceRoot, targetRoot);
console.log('--- Check Complete ---');
