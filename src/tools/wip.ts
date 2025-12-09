import fs from 'fs';

export function handleErrors<exportType>(exportFunctions: {
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
          const isError = error instanceof Error;
          const name = isError ? error.name : 'UnknownError';
          const message = isError ? error.message : 'An unknown error occurred';
          const stack =
            isError && error.stack ? error.stack : 'No stack trace available';
          const string = isError ? error.toString() : String(error);
          const date = new Date().toISOString();

          const content = `Name: ${name}\nMessage: ${message}\nStack: ${stack}\nString: ${string}\nDate: ${date}\n\n`;

          const directoryPath = `./dump/errors/`;

          const filePath = `${directoryPath}error_${Date.now()}.log`;

          fs.mkdir(directoryPath, { recursive: true }, (dirError) => {
            if (error) console.error('Error creating directory:', dirError);
          });

          fs.writeFile(filePath, content, (error) => {
            if (error) console.error('Error writing to file:', error);
          });
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

const test = app();

test.test();
