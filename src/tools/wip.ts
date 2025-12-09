function handleErrors(exportFunctions: { [key: string]: (args?: any) => any }) {
  const keyPair = Object.entries(exportFunctions);

  const reducedFn = keyPair.reduce((acc, [key, fn]) => {
    return {
      ...acc,
      [key]: async (args?: any) => {
        try {
          return await fn(args);
        } catch (error) {
          console.error(`Error in function ${key}:`, error);
          throw error;
        }
      },
    };
  });

  return reducedFn;
}

export default async function app() {
  const exportFunctions = {
    test: () => {
      console.log('Test function executed');
    },
  };

  return handleErrors(exportFunctions);
}
