import test from 'node:test';

function handleActions<Actions>(actions: Actions) {
  const actionsList = Object.entries(actions as object);

  const wrappedActions = actionsList.reduce((actions, [key, action]) => {
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
  }, {} as typeof actions);

  return wrappedActions;
}

function createApp() {
  let actions = {};

  return {
    addAction: <Action>(key: string, action: Action) => {
      const newActions = {
        ...(actions as typeof actions),
        [key]: action as Action,
      };

      actions = newActions as typeof newActions;
    },
  };
}

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

const testApp = createApp();

testApp.addAction<typeof actions.test1>('Test 1', actions.test1);

testApp.test1();
testApp.test2('test 2');
testApp.test3({});
