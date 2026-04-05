import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';

function getFileList(dirPath: string, fileList: string[] = []) {
  if (!existsSync(dirPath)) {
    console.log(`Error: Path does not exist at ${dirPath}.`);
    return [];
  }

  const fileNames = readdirSync(dirPath);

  fileNames.forEach((fileName) => {
    const absolutePath = join(dirPath, fileName);
    const pathStat = statSync(absolutePath);

    if (pathStat.isDirectory()) {
      getFileList(absolutePath, fileList);
    } else {
      fileList.push(absolutePath);
    }
  });

  return fileList;
}
export default function copyFiles(projectRoot: string) {
  const srcDir = join(projectRoot, 'src');
  const distDir = join(projectRoot, 'dist');

  const htmlExt = '.html';
  const cssExt = '.css';
  const tsExt = '.ts';
  const jsExt = '.js';
  const dirSettings = { recursive: true };

  const srcFiles = getFileList(srcDir);
  srcFiles.forEach((file) => {
    const relativePath = relative(srcDir, file);
    const extension = extname(file);
    const dirName = dirname(relativePath);
    const baseName = basename(file, extension);
    const srcTime = statSync(file).mtime.getTime();

    if (extension === htmlExt || extension === cssExt) {
      const destFile = join(distDir, relativePath);
      let needsUpdate =
        !existsSync(destFile) || srcTime > statSync(destFile).mtime.getTime();

      if (needsUpdate) {
        mkdirSync(dirname(destFile), dirSettings);
        cpSync(file, destFile);
        console.log(`Syncing: ${relativePath}`);
      }
    }

    if (extension === tsExt) {
      const expectedJs = join(distDir, dirName, `${baseName}${jsExt}`);
      if (!existsSync(expectedJs)) {
        console.warn(`Missing JS: ${baseName}${jsExt} (run tsc)`);
      } else if (srcTime > statSync(expectedJs).mtime.getTime()) {
        console.warn(`Outdated JS: ${baseName}${jsExt} (re-run tsc)`);
      }
    }
  });

  if (existsSync(distDir)) {
    const distFiles = getFileList(distDir);

    distFiles.forEach((distFile) => {
      const relativePath = relative(distDir, distFile);
      const extension = extname(distFile);
      const dirName = dirname(relativePath);
      const baseName = basename(distFile, extension);

      let shouldDelete = false;

      if (extension === jsExt) {
        const peerTsFile = join(srcDir, dirName, `${baseName}${tsExt}`);
        if (!existsSync(peerTsFile)) shouldDelete = true;
      } else {
        const peerSrcFile = join(srcDir, relativePath);
        if (!existsSync(peerSrcFile)) shouldDelete = true;
      }

      if (shouldDelete) {
        console.warn(`Deleting orphaned file: ${relativePath}`);
        unlinkSync(distFile);
      }
    });
  }
}
