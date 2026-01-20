import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

function writeFile({
  dir,
  file,
  data,
}: {
  dir: string;
  file: string;
  data: string;
}) {
  const hasDir = existsSync(dir);

  if (!hasDir) {
    mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, file);

  writeFileSync(filePath, data);
}

function readFile({
  dir,
  file,
  defaultData,
}: {
  dir: string;
  file: string;
  defaultData: string;
}) {
  const hasDir = existsSync(dir);

  if (!hasDir) {
    mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, file);

  const hasFile = existsSync(filePath);

  if (!hasFile) {
    writeFileSync(filePath, defaultData);
  }

  return readFileSync(filePath, 'utf-8');
}

function createHandler({
  actions,
}: {
  actions: { [key: string]: (...args: any[]) => any };
}): { [key: string]: (...args: any[]) => any } {
  return Object.entries(actions).reduce((previous, [key, action]) => {
    return {
      ...previous,
      [key]: async (...args: any[]) => {
        try {
          return await action(...args);
        } catch (error) {
          const isError = error instanceof Error;

          const hasState = isError ? error.stack !== undefined : false;

          const definition = {
            name: isError ? error.name : 'Uknown Error Name',
            message: isError ? error.message : 'Unknown error message.',
            stack: hasState
              ? ((error as Error).stack as string)
              : 'Unknown stack trace.',
            cause: String(error),
            reports: 1,
            date: [new Date()],
          };

          const data = readFile({
            dir: './dump',
            file: 'error.txt',
            defaultData: JSON.stringify([]),
          });

          const content: (typeof definition)[] = JSON.parse(data);

          const findDuplicate = content.find((item) => {
            return (
              item.name === definition.name &&
              item.message === definition.message &&
              item.stack === definition.stack &&
              item.cause === definition.cause
            );
          });

          const hasNoDuplicate = findDuplicate === undefined;

          const newData = hasNoDuplicate
            ? [...content, definition]
            : content.map((item) => {
                const isMatch =
                  item.name === definition.name &&
                  item.message === definition.message &&
                  item.stack === definition.stack &&
                  item.cause === definition.cause;

                const newItem = {
                  ...item,
                  reports: isMatch ? item.reports + 1 : item.reports,
                  date: isMatch ? [...item.date, new Date()] : item.date,
                };

                return newItem;
              });

          writeFile({
            dir: './dump/',
            file: 'error.txt',
            data: JSON.stringify(newData, null, 2),
          });
        }
      },
    };
  }, {});
}

function createActions(): { [key: string]: (...args: any[]) => any } {
  return {};
}

function createApp({ config }: { config: {} }) {
  const actions = createActions();

  return {
    ...createHandler({ actions }),
  };
}
