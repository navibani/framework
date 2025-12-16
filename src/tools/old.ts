import fs from 'fs';
import path from 'path';

function defineError({ error }: { error: unknown }) {
  const unknown = {
    name: 'Unknown Error',
    message: 'An unknown error occurred',
    stack: 'No stack trace available',
  };

  const isError = error instanceof Error;
  const name = isError ? error.name : unknown.name;
  const message = isError ? error.message : unknown.message;
  const stack = isError && error.stack ? error.stack : unknown.stack;
  const data = isError ? error.toString() : String(error);
  const date = [new Date().toISOString()];

  return {
    name,
    message,
    stack,
    data,
    date,
  };
}

function findFileData({
  dirPath,
  fileName,
}: {
  dirPath: string;
  fileName: string;
}): string {
  const hasDir = fs.existsSync(dirPath);

  if (!hasDir) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, fileName);

  const hasFile = fs.existsSync(filePath);

  if (!hasFile) {
    const defaultFileContent = '';
    const writeType = 'utf-8';
    fs.writeFileSync(filePath, defaultFileContent, writeType);
  }

  const fileData = fs.readFileSync(filePath, { encoding: 'utf-8' });
  return fileData;
}

function handleErrors<exportType>(exportFunctions: {
  [key: string]: (args?: any) => any;
}) {
  const keyPair = Object.entries(exportFunctions);

  const reducedFn = keyPair.reduce((acc, [key, fn]) => {
    return {
      ...acc,
      [key]: async (args?: any) => {
        try {
          return await fn(args);
        } catch (error) {
          const errorLogDir = 'dump/errors';
          const errorLogFileName = 'errorLog.txt';
          const writeType = 'utf-8';

          const definedError = defineError({ error });

          const existingFileData = findFileData({
            dirPath: errorLogDir,
            fileName: errorLogFileName,
          });

          const parsedData = JSON.parse(
            existingFileData
          ) as (typeof definedError)[];

          const duplicateIndex = parsedData.findIndex((entry) => {
            return (
              entry.name === definedError.name &&
              entry.message === definedError.message &&
              entry.stack === definedError.stack
            );
          });

          const hasDuplicate = duplicateIndex !== -1;
        }
      },
    };
  }, {} as exportType);

  return reducedFn;
}

function createActions() {
  return {
    test: async () => {
      throw new Error('This is a test error');
    },
  };
}

export default function app() {
  const actions = createActions();

  return handleErrors<typeof actions>(actions);
}
