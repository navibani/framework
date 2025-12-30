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

function createApp<Actions>(actions: Actions) {
  const isObject = typeof actions === 'object';

  if (!isObject) {
    throw new Error('Application actions are not properly formatted.');
  }

  const wrappedActions = handleActions<typeof actions>(actions);

  return { ...wrappedActions };
}

// test area

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

const testApp = createApp<typeof actions>(actions);

testApp.test1();
testApp.test2('test 2');
testApp.test3({});
