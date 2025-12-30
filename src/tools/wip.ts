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

function addAction<Actions>(
  actions: Actions,
  action: <Args, Result>(args?: Args) => Result | Promise<Result>
) {
  actions = { ...actions, action };
}

function createApp() {
  let actions = {};

  const wrappedActions = handleActions<typeof actions>(actions);

  return {
    ...wrappedActions,
    addAction: <Action>(key: string, action: Action) => {
      actions = {
        ...actions,
        [key]: action,
      };

      console.log(actions);
    },
  };
}

// test area

function test1() {
  console.log('basic test');
}
function test2(args: string) {
  console.log(args);
  return args;
}
function test3(args: {}) {
  throw new Error('Test');
}

const testApp = createApp();

testApp.addAction<typeof test1>('Test 1', test1);

testApp.addAction<typeof test2>('test 2', test2);
