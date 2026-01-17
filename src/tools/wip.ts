import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

function createHandler({
  actions,
}: {
  actions: { [key: string]: (...args: any[]) => any };
}): { [key: string]: (...args: any[]) => any } {
  return Object.entries(actions).reduce((previous, [key, action]) => {
    return {
      ...previous,
      [key]: async () => {
        try {
          return await action();
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

          const hasDir = existsSync('./dump');

          if (!hasDir) {
            mkdirSync('./dump', { recursive: true });
          }

          const hasFile = existsSync('./dump/error.txt');

          if (!hasFile) {
            writeFileSync('./dump/error.txt', JSON.stringify([]));
          }

          const data = readFileSync('./dump/error.txt', 'utf-8');

          const content: (typeof definition)[] = JSON.parse(data);

          // ...

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

          writeFileSync('./dump/error.txt', JSON.stringify(newData, null, 2));
        }
      },
    };
  }, {});
}

function createActions(): { [key: string]: (...args: any[]) => any } {
  return {};
}

function createApp() {
  const actions = createActions();

  return {
    ...createHandler({ actions }),
  };
}
