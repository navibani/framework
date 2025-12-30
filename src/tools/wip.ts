function createApp() {
  const actions = {
    test1: () => {
      console.log('basic test');
    },
    test2: (args: string) => {
      console.log(args);
      return args;
    },
    test3: (args: {}) => {
      throw new Error('Test');
    },
  };

  const wrappedActions = Object.entries(actions).reduce(
    (actions, [key, action]) => {
      return {
        ...actions,
        [key]: async (args: any) => {
          try {
            return await action(args);
          } catch (error) {
            console.log(error);
          }
        },
      };
    },
    {} as typeof actions
  );

  return { ...wrappedActions };
}

const testApp = createApp();

testApp.test3({});
