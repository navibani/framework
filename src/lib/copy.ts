import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs';
import { join, relative, extname, dirname, basename } from 'node:path';

function getMtime(path: string): number {
  const pathExists = existsSync(path);

  if (pathExists) {
    const pathState = statSync(path);
    const mTime = pathState.mtime;
    const actualTime = mTime.getTime();

    return actualTime;
  } else {
    return 0;
  }
}

function isNewer(src: string, dest: string): boolean {
  const srcTime = getMtime(src);
  const destTime = getMtime(dest);

  return srcTime > destTime;
}

function getFileList(dirPath: string, fileList: string[] = []): string[] {
  const dirExists = existsSync(dirPath);

  if (!dirExists) {
    return [];
  }

  const entries = readdirSync(dirPath);

  entries.forEach((entry) => {
    const fullPath = join(dirPath, entry);

    const pathStat = statSync(fullPath);
    const hasDirectory = pathStat.isDirectory();

    if (hasDirectory) {
      getFileList(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  });

  return fileList;
}

function swapExtension(path: string, newExt: string): string {
  const extention = extname(path);

  const extentionLength = extention.length;

  const sliceStart = 0;

  const sliceEnd = sliceStart - extentionLength;

  const newSlice = path.slice(sliceStart, sliceEnd);

  const newFile = newSlice + newExt;

  return newFile;
}

function isWebFile(path: string): boolean {
  const webFiles = ['.html', '.css'];

  const fileExtension = extname(path);

  const hasExtension = webFiles.includes(fileExtension);

  return hasExtension;
}

function isJsFile(path: string): boolean {
  const jsExtension = '.js';

  const fileExtension = extname(path);

  const hasExtension = fileExtension === jsExtension;

  return hasExtension;
}

function isTsFile(path: string): boolean {
  const tsExtension = '.ts';

  const fileExtension = extname(path);

  const hasExtension = fileExtension === tsExtension;

  return hasExtension;
}

function syncWebFile(file: string, srcDir: string, distDir: string) {
  const relPath = relative(srcDir, file);
  const destFile = join(distDir, relPath);

  const distPathExists = existsSync(destFile);
  const isNew = isNewer(file, destFile);

  if (!distPathExists || isNew) {
    const dirName = dirname(destFile);
    const dirConfig = { recursive: true };
    const message = `Syncing: ${relPath}`;

    mkdirSync(dirName, dirConfig);

    cpSync(file, destFile);

    console.log(message);
  }
}

function validateTsCompilation(file: string, srcDir: string, distDir: string) {
  const jsExtension = '.js';
  const relPath = relative(srcDir, file);
  const swappedExtension = swapExtension(relPath, jsExtension);
  const expectedJs = join(distDir, swappedExtension);

  const distPathExists = existsSync(expectedJs);

  const isNew = isNewer(file, expectedJs);

  const baseName = basename(expectedJs);

  if (!distPathExists) {
    const message = `Missing JS: ${baseName} (run tsc)`;

    console.warn(message);
  } else if (isNew) {
    const message = `Outdated JS: ${baseName} (re-run tsc)`;

    console.warn(message);
  }
}

function deleteOrphans(peerPath: string, relPath: string, distFile: string) {
  const pathExists = existsSync(peerPath);

  if (!pathExists) {
    const message = `Deleting orphaned file: ${relPath}`;

    console.warn(message);

    unlinkSync(distFile);
  }
}

function cleanupOrphan(distFile: string, srcDir: string, distDir: string) {
  const relPath = relative(distDir, distFile);

  const hasJsFile = isJsFile(distFile);

  if (hasJsFile) {
    const tsExtension = '.ts';

    const swappedExtension = swapExtension(relPath, tsExtension);

    const peerPath = join(srcDir, swappedExtension);

    deleteOrphans(peerPath, relPath, distFile);
  } else {
    const peerPath = join(srcDir, relPath);

    deleteOrphans(peerPath, relPath, distFile);
  }
}

export default function copyFiles(srcDir: string, distDir: string) {
  const fileList = getFileList(srcDir);

  fileList.forEach((file) => {
    const hasWebFile = isWebFile(file);

    if (hasWebFile) {
      syncWebFile(file, srcDir, distDir);
    }

    const hasTsFile = isTsFile(file);

    if (hasTsFile) {
      validateTsCompilation(file, srcDir, distDir);
    }
  });

  const distPathExists = existsSync(distDir);

  if (distPathExists) {
    getFileList(distDir).forEach((distFile) => {
      cleanupOrphan(distFile, srcDir, distDir);
    });
  }
}
