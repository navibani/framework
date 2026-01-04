type Fn = (...args: any[]) => any;

type FnList = Record<string, Fn>;

type App<Actions extends FnList> = {
  actions: Actions;
  addAction: <Key extends string, Action extends Fn>(
    name: Key,
    action: Action
  ) => App<Actions & { [P in Key]: Action }>;
};

function handleActions<Actions extends FnList>(actions: Actions) {
  return Object.entries(actions).reduce((previous, [key, action]) => {
    return {
      ...previous,
      [key]: async (...args: any[]) => {
        try {
          return await action(args);
        } catch (error) {
          console.log('Working on ' + error);
        }
      },
    };
  }, {} as Actions);
}

function createApp<Actions extends FnList = {}>(
  actions = {} as Actions
): {
  actions: Actions;
  addAction: <Key extends string, Action extends Fn>(
    name: Key,
    action: Action
  ) => App<Actions & { [P in Key]: Action }>;
} {
  const handledActions: Actions = handleActions(actions);

  return {
    actions: handledActions,
    addAction: (name, action) => createApp({ ...actions, [name]: action }),
  };
}
