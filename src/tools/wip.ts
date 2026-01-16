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

          const content: (typeof definition & { reports: number })[] =
            JSON.parse(data);

          const hasDuplicate = content.reduce((previous, item) => {
            return !previous
              ? item.name === definition.name &&
                  item.message === definition.message &&
                  item.stack === definition.stack &&
                  item.cause === definition.cause
              : true;
          }, false);

          const newContent = hasDuplicate
            ? content.reduce((previous, item) => {
                const isMatch =
                  item.name === definition.name &&
                  item.message === definition.message &&
                  item.stack === definition.stack &&
                  item.cause === definition.cause;

                return isMatch ? { ...item, reports: item.reports + 1 } : item;
              }, {})
            : [...content, { ...definition, reports: 1 }];

          writeFileSync(
            './dump/error.txt',
            JSON.stringify(newContent, null, 2)
          );
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
