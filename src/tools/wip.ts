import fs from 'fs';
import path from 'path';
import { json } from 'stream/consumers';

function findFileData({
  dirPath,
  fileName,
}: {
  dirPath: string;
  fileName: string;
}): string {
  const hasDir = fs.existsSync(dirPath);
  const writeType = 'utf-8';

  if (!hasDir) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, fileName);

  const hasFile = fs.existsSync(filePath);

  if (!hasFile) {
    const defaultFileContent = '';

    fs.writeFileSync(filePath, defaultFileContent, writeType);
  }

  const fileData = fs.readFileSync(filePath, { encoding: writeType });

  return fileData;
}

function defineError({ error }: { error: unknown }) {
  const unknownName = 'Unknown Error';
  const unknownMessage = 'An unknown error occurred';
  const unknownStack = 'No stack trace available';

  const isError = error instanceof Error;
  const name = isError ? error.name : unknownName;
  const message = isError ? error.message : unknownMessage;
  const stack = isError && error.stack ? error.stack : unknownStack;
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

          const errorLogData = findFileData({
            dirPath: errorLogDir,
            fileName: errorLogFileName,
          });

          const parsedErrorLogData = JSON.parse(
            errorLogData
          ) as (typeof definedError)[];

          const duplicateError = parsedErrorLogData.find((entry) => {
            return (
              entry.name === definedError.name &&
              entry.message === definedError.message &&
              entry.stack === definedError.stack
            );
          });

          const newErrorLogData =
            duplicateError !== undefined
              ? {
                  ...duplicateError,
                  date: [...duplicateError.date, new Date()],
                }
              : [...parsedErrorLogData, definedError];

          const writePath = path.join(errorLogDir, errorLogFileName);

          const stringData = JSON.stringify(newErrorLogData, null, 2);

          fs.writeFileSync(writePath, stringData, writeType);
        }
      },
    };
  }, {} as exportType);

  return reducedFn;
}

export default function app() {
  const exportFunctions = {
    test: async () => {
      throw new Error('This is a test error');
    },
  };

  return handleErrors<typeof exportFunctions>(exportFunctions);
}
